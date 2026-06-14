const { ingestDocument, analyzeDocument } = require("../services/ragProxyService");
const Document = require("../models/Document"); // Using Mongoose Model directly here to simplify updates later
const {
  getDocumentHistoryByUser,
  getDocumentById,
} = require("../repositories/documentRepository");
const { formatResponse } = require("../utils/responseFormatter");
const logger = require("../utils/logger");
const cloudinary = require("../config/cloudinary");
const PDFDocument = require("pdfkit");
const Chat = require("../models/Chat");

/**
 * Upload a PDF/DOCX, ingest it into the RAG microservice, save a record to MongoDB.
 */
const uploadDocument = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!req.file) {
      return res
        .status(400)
        .json(
          formatResponse(
            false,
            null,
            "No file provided. Please upload a PDF or DOCX.",
          ),
        );
    }

    const { buffer: fileBuffer, originalname } = req.file;
    const { v4: uuidv4 } = require("uuid");
    // Pre-generate document ID
    const documentId = `doc_${uuidv4().replace(/-/g, "").substring(0, 12)}`;

    // 1. Instantly create a pending document in Mongo and return to frontend
    const docRecord = new Document({
      userId,
      fileUrl: "pending",
      originalName: originalname,
      documentId: documentId,
      status: "processing",
      statusMessage: "Initializing upload to server...",
      progress: 5,
    });

    await docRecord.save();

    logger.info(`Starting background processing for document: ${documentId}`);
    res.status(202).json(
      formatResponse(true, {
        documentId,
        filename: originalname,
        message: "Processing started in the background",
      }),
    );

    // 2. Perform long-running operations in the background
    (async () => {
      try {
        // Step A: Ingest into RAG Service
        await Document.updateOne(
          { documentId },
          { progress: 20, statusMessage: "Parsing document and extracting text..." }
        );
        const ragResult = await ingestDocument(fileBuffer, originalname, documentId);

        // Step B: Cloudinary Upload
        await Document.updateOne(
          { documentId },
          { progress: 45, statusMessage: "Uploading original file to secure cloud storage..." }
        );
        
        const cloudRes = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "livelegalai/documents",
              public_id: documentId,
              resource_type: "auto",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(fileBuffer);
        });

        // Step C: Run analysis immediately in the background
        await Document.updateOne(
          { documentId },
          { progress: 70, statusMessage: "Analyzing document clauses and risk scoring..." }
        );
        const analysisResult = await analyzeDocument(documentId);

        // Step D: Mark complete and save results
        await Document.updateOne(
          { documentId },
          {
            fileUrl: cloudRes.secure_url,
            cloudinaryPublicId: cloudRes.public_id || "",
            numChunks: ragResult.num_chunks,
            documentType: analysisResult.document_type || "Legal File",
            summary: analysisResult.summary || "",
            explanation: analysisResult.explanation || "",
            suggestedReply: analysisResult.suggested_reply || "",
            severityScore: analysisResult.severity_score || 0,
            riskLevel: analysisResult.risk_level || "Unknown",
            riskFactors: analysisResult.risk_factors || [],
            analyzed: true,
            status: "completed",
            progress: 100,
            statusMessage: "Document processed successfully",
          }
        );
        logger.info(`Background document processing completed successfully: ${documentId}`);
      } catch (err) {
        logger.error(`Background document processing failed for ${documentId}: ${err.message}`);
        await Document.updateOne(
          { documentId },
          {
            status: "failed",
            statusMessage: `Error: ${err.message}`,
            progress: 0,
            error: err.message,
          }
        );
      }
    })();

  } catch (error) {
    next(error);
  }
};

/**
 * Get the real-time processing status of a document
 */
const getDocumentStatus = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { documentId } = req.params;
    const doc = await Document.findOne({ documentId, userId });

    if (!doc) {
      return res
        .status(404)
        .json(formatResponse(false, null, "Document not found."));
    }

    return res.status(200).json(
      formatResponse(true, {
        documentId: doc.documentId,
        status: doc.status,
        statusMessage: doc.statusMessage,
        progress: doc.progress,
        error: doc.error,
        originalName: doc.originalName,
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a document and its related resources (Cloudinary file, chats, Mongo record)
 */
const deleteDocument = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { id } = req.params; // Mongo _id
    const doc = await Document.findOne({ _id: id, userId });
    if (!doc)
      return res
        .status(404)
        .json(formatResponse(false, null, "Document not found"));

    // Delete Cloudinary resource if present
    if (doc.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(doc.cloudinaryPublicId, {
          resource_type: "auto",
        });
      } catch (err) {
        logger.warn(
          `Failed to delete Cloudinary resource ${doc.cloudinaryPublicId}: ${err.message}`,
        );
      }
    }

    // Remove associated chats
    try {
      await Chat.deleteMany({ userId, documentId: doc.documentId });
    } catch (err) {
      logger.warn(
        `Failed to delete chat records for doc ${doc.documentId}: ${err.message}`,
      );
    }

    // Remove MongoDB doc
    await Document.deleteOne({ _id: id });

    return res
      .status(200)
      .json(formatResponse(true, { message: "Document deleted" }));
  } catch (error) {
    next(error);
  }
};

/**
 * Generate a PDF analysis report on-the-fly and stream it to the client
 */
const downloadReport = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { id } = req.params; // Mongo _id
    const doc = await Document.findOne({ _id: id, userId });
    if (!doc)
      return res
        .status(404)
        .json(formatResponse(false, null, "Document not found"));

    const pdf = new PDFDocument({ size: "A4", margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${doc.originalName || "analysis"}.pdf"`,
    );

    pdf
      .font("Times-Roman")
      .fontSize(20)
      .text("Legal Analysis Report", { align: "center" });
    pdf.moveDown();
    pdf.fontSize(12).text(`Document: ${doc.originalName}`);
    pdf.text(`Uploaded: ${doc.createdAt.toISOString()}`);
    pdf.text(`Severity Score: ${doc.severityScore || "N/A"}`);
    pdf.text(`Risk Level: ${doc.riskLevel || "Unknown"}`);
    pdf.moveDown();
    pdf.fontSize(14).text("Summary", { underline: true });
    pdf.fontSize(11).text(doc.summary || "No summary available");
    pdf.moveDown();
    pdf.fontSize(14).text("Explanation", { underline: true });
    pdf.fontSize(11).text(doc.explanation || "No explanation available");
    pdf.moveDown();
    pdf.fontSize(14).text("Suggested Reply", { underline: true });
    pdf.fontSize(11).text(doc.suggestedReply || "No suggested reply available");

    pdf.end();
    pdf.pipe(res);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all document upload history for the authenticated user
 */
const getHistory = async (req, res, next) => {
  try {
    const userId = req.userId;
    const history = await getDocumentHistoryByUser(userId);
    return res.status(200).json(formatResponse(true, history));
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single document record
 */
const getDocument = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const doc = await getDocumentById(id, userId);

    if (!doc) {
      return res
        .status(404)
        .json(formatResponse(false, null, "Document not found."));
    }

    return res.status(200).json(formatResponse(true, doc));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadDocument,
  getHistory,
  getDocument,
  deleteDocument,
  downloadReport,
  getDocumentStatus,
};
