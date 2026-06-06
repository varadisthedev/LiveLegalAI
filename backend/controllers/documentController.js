const { ingestDocument } = require("../services/ragProxyService");
const Document = require("../models/Document"); // Using Mongoose Model directly here to simplify updates later
const {
  getDocumentHistoryByUser,
  getDocumentById,
} = require("../repositories/documentRepository");
const { formatResponse } = require("../utils/responseFormatter");
const logger = require("../utils/logger");
const fs = require("fs");
const cloudinary = require("../config/cloudinary");
const PDFDocument = require("pdfkit");
const Chat = require("../models/Chat");

/**
 * Upload a PDF/DOCX, ingest it into the RAG microservice, save a record to MongoDB.
 * Note: Full Analytics to Snowflake happens later when /analyze is called.
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

    const { path: filePath, originalname, filename } = req.file;

    // 1. Send file to external RAG FastAPI service for ingestion
    const ragResult = await ingestDocument(filePath, originalname);

    // 2. Upload the original file to Cloudinary and save the secure URL
    let cloudRes = null;
    try {
      cloudRes = await cloudinary.uploader.upload(filePath, {
        folder: "livelegalai/documents",
        public_id: ragResult.document_id,
        resource_type: "auto",
      });
    } catch (err) {
      logger.warn(`Cloudinary upload failed: ${err.message}`);
    }

    const docRecord = new Document({
      userId,
      fileUrl: cloudRes?.secure_url || filename,
      cloudinaryPublicId: cloudRes?.public_id || "",
      originalName: originalname,
      documentId: ragResult.document_id, // RAG microservice ID
      numChunks: ragResult.num_chunks,
      documentType: "Pending Analysis",
      analyzed: false,
    });

    const savedDoc = await docRecord.save();

    logger.info(
      `Document uploaded and ingested: ${ragResult.document_id} for user ${userId}`,
    );

    return res.status(200).json(
      formatResponse(true, {
        id: savedDoc._id,
        documentId: ragResult.document_id,
        filename: originalname,
        numChunks: ragResult.num_chunks,
        message: ragResult.message,
      }),
    );
  } catch (error) {
    next(error);
  } finally {
    // Attempt to clean up the local temp upload since RAG has processed it
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, (err) => {
        if (err)
          logger.warn(`Could not delete temp file ${req.file.path}: ${err}`);
      });
    }
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
};
