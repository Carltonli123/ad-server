const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('MONGO_URI is missing. Add it to the project root .env file or Vercel project settings.');
}

app.use(cors());
app.use(express.json());

console.log('Server is starting...');

// Cache the MongoDB connection across serverless invocations
let isConnected = false;
const connectDB = async () => {
  if (isConnected) {
    console.log('MongoDB already connected');
    return;
  }

  if (!mongoUri) {
    throw new Error('MONGO_URI is undefined');
  }

  console.log('Attempting MongoDB connection...');

  try {
    const db = await mongoose.connect(mongoUri);
    isConnected = db.connections[0].readyState;

    if (isConnected) {
      console.log('MongoDB connection successful');
    } else {
      console.log('MongoDB connection state not ready');
    }
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    throw err;
  }
};

// Middleware to ensure DB connection on every API request
app.use(async (req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.originalUrl}`);

  try {
    await connectDB();
    console.log(`Database ready for request: ${req.method} ${req.originalUrl}`);
    next();
  } catch (err) {
    console.error(`Request failed before DB connection: ${req.method} ${req.originalUrl}`, err.message);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Ad Schema & Model
const AdSchema = new mongoose.Schema({
  adName: String,
  targetUrl: String,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now }
});
const Ad = mongoose.models.Ad || mongoose.model('Ad', AdSchema);

// API Routes
app.post('/api/ads', async (req, res) => {
  console.log('POST /api/ads received:', req.body);

  try {
    const { adName, targetUrl, imageUrl } = req.body;
    const newAd = new Ad({ adName, targetUrl, imageUrl });
    await newAd.save();
    console.log('Ad created successfully:', newAd._id);
    res.status(201).json({ success: true, adId: newAd._id });
  } catch (err) {
    console.error('Error creating ad:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/ads/:id', async (req, res) => {
  console.log(`GET /api/ads/${req.params.id} request received`);

  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) {
      console.log(`Ad not found for ID: ${req.params.id}`);
      return res.status(404).json({ error: 'Ad not found' });
    }

    console.log('Ad fetched successfully:', ad._id);
    res.json(ad);
  } catch (err) {
    console.error(`Error fetching ad ${req.params.id}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// Export the Express app for Vercel Serverless Functions
module.exports = app;