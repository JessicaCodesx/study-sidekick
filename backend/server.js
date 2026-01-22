import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Routes
import usersRoutes from './routes/users.js';
import coursesRoutes from './routes/courses.js';
import unitsRoutes from './routes/units.js';
import notesRoutes from './routes/notes.js';
import flashcardsRoutes from './routes/flashcards.js';
import tasksRoutes from './routes/tasks.js';
import academicRecordsRoutes from './routes/academicRecords.js';
import syncRoutes from './routes/sync.js'; // Added sync route

dotenv.config();

// Initialize Express
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ extended: false }));

// Define Routes
app.use('/api/users', usersRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/units', unitsRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/flashcards', flashcardsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/academic-records', academicRecordsRoutes);
app.use('/api/sync', syncRoutes); // Added sync route

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: Date.now() });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Get the directory name of the current module
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  app.use(express.static('client/build'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app; // For testing purposes