const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

console.log('Server is starting...');       

// Cache the MongoDB connection across serverless invocations
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  const db = await mongoose.connect(process.env.MONGO_URI);
  isConnected = db.connections[0].readyState;
  if (isConnected) {
    console.log('MongoDB connection successful');
  }
};

// Middleware to ensure DB connection on every API request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
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
  try {
    const { adName, targetUrl, imageUrl } = req.body;
    const newAd = new Ad({ adName, targetUrl, imageUrl });
    await newAd.save();
    res.status(201).json({ success: true, adId: newAd._id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/ads/:id', async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).json({ error: 'Ad not found' });
    res.json(ad);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export the Express app for Vercel Serverless Functions
module.exports = app;