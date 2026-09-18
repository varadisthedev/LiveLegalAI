const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

// Check File Type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|pdf|docx/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype) || file.mimetype.includes('openxmlformats-officedocument.wordprocessingml.document');

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Images, PDFs, or DOCX Only!'));
  }
}

// Init Upload
const maxUploadSize = parseInt(process.env.MAX_UPLOAD_SIZE || '10') * 1024 * 1024;

const upload = multer({
  storage: storage,
  limits: { fileSize: maxUploadSize }, 
  fileFilter: function (_req, file, cb) {
    checkFileType(file, cb);
  }
});

module.exports = upload;
