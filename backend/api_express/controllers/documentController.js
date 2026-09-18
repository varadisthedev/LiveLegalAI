const PDFDocument = require("pdfkit");
const documentService = require("../services/documentService");
const { formatResponse } = require("../utils/responseFormatter");

/**
 * Upload a PDF/DOCX. Returns immediately; ingestion, cloud storage, and
 * analysis continue in the background (see services/documentService.js).
 */
const uploadDocument = async (req, res, next) => {
  try {
    const result = await documentService.uploadDocument(req.userId, req.file);
    return res.status(202).json(formatResponse(true, result));
  } catch (error) {
    next(error);
  }
};

/**
 * Get the real-time processing status of a document
 */
const getDocumentStatus = async (req, res, next) => {
  try {
    const status = await documentService.getDocumentStatus(req.userId, req.params.documentId);
    return res.status(200).json(formatResponse(true, status));
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a document and its related resources (Cloudinary file, chats, Mongo record)
 */
const deleteDocument = async (req, res, next) => {
  try {
    const result = await documentService.deleteDocument(req.userId, req.params.id);
    return res.status(200).json(formatResponse(true, result));
  } catch (error) {
    next(error);
  }
};

/**
 * Generate a PDF analysis report on-the-fly and stream it to the client
 */
const downloadReport = async (req, res, next) => {
  try {
    const doc = await documentService.getReportDocument(req.userId, req.params.id);

    const pdf = new PDFDocument({ size: "A4", margin: 50 });
    // originalName is the client-supplied upload filename — strip quotes/control
    // characters before it goes into a header value so it can't break out of the
    // quoted filename parameter or smuggle in extra Content-Disposition parameters.
    const safeFilename = (doc.originalName || "analysis").replace(/["\r\n]/g, "");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeFilename}.pdf"`,
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
    const history = await documentService.getHistory(req.userId);
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
    const doc = await documentService.getDocument(req.userId, req.params.id);
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
