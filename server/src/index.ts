import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mergeRoutes from './routes/merge.js';
import editRoutes from './routes/edit.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from temp directory
app.use('/temp', express.static(path.join(__dirname, '../../temp')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/merge', mergeRoutes);
app.use('/api/edit', editRoutes);

// API routes (to be implemented)
// app.use('/api/to-jpg', toJpgRoutes);
// app.use('/api/compress', compressRoutes);
// app.use('/api/protect', protectRoutes);
// app.use('/api/add-text', addTextRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Temp directory: ${path.join(__dirname, '../../temp')}`);
});
