import React, { useState } from 'react';
import { nodeApi, pythonApi } from '../utils/api';
import styles from './UploadConvert.module.css';

const UploadConvert = () => {
  const [file, setFile] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
const handleUpload = async (endpoint, isPython = false) => {
  if (!file) return alert('Please select a file');

  const formData = new FormData();
  formData.append('file', file);

  try {
    const api = isPython ? pythonApi : nodeApi;
    const response = await api.post(endpoint, formData, {
      responseType: 'blob'
    });

    // Get content-disposition header to extract filename
    const disposition = response.headers['content-disposition'];
    const match = disposition && disposition.match(/filename="?(.+)"?/);
    const filename = match ? match[1] : 'converted_file';

    // Create blob and download link
    const blob = new Blob([response.data], { type: response.headers['content-type'] });
    const url = window.URL.createObjectURL(blob);

    // Optional: If you're using setDownloadUrl for preview or something, still use it
    setDownloadUrl(url);

    // Trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    link.remove();

    // Optional cleanup
    window.URL.revokeObjectURL(url);

  } catch (err) {
    console.error('Upload error:', err);
    alert('Conversion failed');
  }
};

  return (
    <div style={{ padding: 20 }}>
      <h2>Upload File</h2>
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <div style={{ margin: '20px 0' }}>
        <button onClick={() => handleUpload('/api/files/compress')}>Compress</button>
        <button onClick={() => handleUpload('/api/files/decompress')}>Decompress</button>
        <button onClick={() => handleUpload('/api/files/convert/pdf-to-doc', true)}>PDF → DOCX </button>
        <button onClick={() => handleUpload('/api/files/convert/pdf-to-ppt', true)}>PDF → PPTX </button>
      </div>
      {downloadUrl && (
        <a className={styles['download-link']} href={downloadUrl} download="converted_output">
          Download Result
        </a>
      )}
    </div>
  );
};

export default UploadConvert;
