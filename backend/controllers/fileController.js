const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const libre = require('libreoffice-convert');
const { compressBinary, decompressBinary } = require('../utils/huffman');
const FormData = require('form-data');
const axios = require('axios');



// 📦 Compress File
exports.compressFile = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const inputPath = req.file.path;
  const originalName = req.file.originalname;
  const ext = path.extname(originalName).toLowerCase();

  try {
    const fileBuffer = fs.readFileSync(inputPath);
    let outputPath;
    let finalBuffer;

    if (ext === '.txt' || ext === '.json') {
      const { buffer, tree, padding } = compressBinary(fileBuffer);
      const meta = { tree, padding };
      const metaBuffer = Buffer.from(JSON.stringify(meta) + '\nEND_META\n');
      finalBuffer = Buffer.concat([metaBuffer, buffer]);
      outputPath = path.join(__dirname, '../outputs', `${originalName}.huff`);
    } else if (ext === '.pdf') {
      finalBuffer = zlib.deflateSync(fileBuffer);
      outputPath = path.join(__dirname, '../outputs', `${originalName}.zip`);
    } else {
      return res.status(400).json({ error: 'Unsupported file type for compression' });
    }

    fs.writeFileSync(outputPath, finalBuffer);
    res.download(outputPath);
  } catch (error) {
    console.error('Compression error:', error);
    res.status(500).json({ error: 'Compression failed' });
  }
};

// 🔓 Decompress File
exports.decompressFile = (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const inputPath = req.file.path;
  const filename = req.file.originalname;

  try {
    const ext = path.extname(filename);
    const fileBuffer = fs.readFileSync(inputPath);

    let outputName;
    let outputBuffer;

    if (ext === '.huff') {
      const separator = Buffer.from('\nEND_META\n');
      const sepIndex = fileBuffer.indexOf(separator);
      const metaBuffer = fileBuffer.slice(0, sepIndex).toString();
      const compressedBuffer = fileBuffer.slice(sepIndex + separator.length);
      const { tree, padding } = JSON.parse(metaBuffer);

      outputBuffer = decompressBinary(compressedBuffer, tree, padding);
      outputName = filename.replace(/\.huff$/, '');
    } else if (ext === '.zip') {
      outputBuffer = zlib.inflateSync(fileBuffer);
      outputName = filename.replace(/\.zip$/, '');
    } else {
      return res.status(400).json({ error: 'Unsupported compressed file type' });
    }

    const outputPath = path.join(__dirname, '../outputs', outputName);
    fs.writeFileSync(outputPath, outputBuffer);
    res.download(outputPath);
  } catch (error) {
    console.error('Decompression error:', error);
    res.status(500).json({ error: 'Decompression failed' });
  }
};

// 📄 Convert PDF to DOCX

exports.convertPdfToDoc = async (req, res) => {
  const file = req.file;
  const form = new FormData();
  form.append('file', fs.createReadStream(file.path));

  try {
    const response = await axios.post('http://localhost:5001/convert/pdf-to-doc', form, {
      headers: form.getHeaders(),
      responseType: 'stream'
    });
    response.data.pipe(res);
  } catch (err) {
    console.error('PDF to DOC error:', err.message);
    res.status(500).send('Conversion failed');
  }
};

exports.convertPdfToPpt = async (req, res) => {
  const file = req.file;
  const form = new FormData();
  form.append('file', fs.createReadStream(file.path));

  try {
    const response = await axios.post('http://localhost:5001/convert/pdf-to-ppt', form, {
      headers: form.getHeaders(),
      responseType: 'stream'
    });
    response.data.pipe(res);
  } catch (err) {
    console.error('PDF to PPT error:', err.message);
    res.status(500).send('Conversion failed');
  }
};