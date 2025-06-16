import axios from 'axios';

const nodeApi = axios.create({
  baseURL: 'http://localhost:5000', // Node backend
});

const pythonApi = axios.create({
  baseURL: 'http://localhost:5001', // Python backend
});

export { nodeApi, pythonApi };
