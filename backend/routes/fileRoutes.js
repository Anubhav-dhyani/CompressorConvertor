const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fileController = require('../controllers/fileController');
const {
  convertPdfToDoc,
  convertPdfToPpt
} = require('../controllers/fileController');

// ✅ Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

// ✅ Routes

// File upload (for testing)
router.post('/upload', upload.single('file'), (req, res) => {
  res.json({ message: 'File uploaded successfully', filename: req.file.originalname });
});

// Compression & Decompression routes – need file upload
router.post('/compress', upload.single('file'), fileController.compressFile);
router.post('/decompress', upload.single('file'), fileController.decompressFile);

// PDF Conversions
router.post('/convert/pdf-to-doc', upload.single('file'), convertPdfToDoc);
router.post('/convert/pdf-to-ppt', upload.single('file'), convertPdfToPpt);

module.exports = router;
