const multer = require('multer');
const path = require('path');

// Set storage engine to hold file locally in 'uploads' folder briefly
// In a highly parallel production environment, we should stream to S3, but per requirements we'll hold it locally or in memory
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const fs = require('fs');
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)){
        fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

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
