require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { verifyGoogleToken } = require('./googleAuth');
const supabase = require('./supabaseClient');
const User = require('./models/User');
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Enable gzip compression for all responses > 1KB
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6  // Balance between compression speed and ratio
}));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                     // 10 requests per IP per windowMs
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: (req) => req.path === '/api/health'
});

app.use('/api/', apiLimiter);
// Secret for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/prepai';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware to verify JWT
const verifyJWT = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Routes
app.post('/api/auth/google', authLimiter, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const payload = await verifyGoogleToken(token);
    
    // Find or create user in database
    let user = await User.findOne({ googleId: payload.sub });
    
    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture
      });
      await user.save();
      console.log('New user created:', user.email);
    } else {
      // Update existing user
      user.updatedAt = new Date();
      await user.save();
    }
    
    // Generate JWT token for session
    const sessionToken = jwt.sign(
      {
        id: user._id,
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        provider: 'google'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      sessionToken,
      user: {
        id: user._id,
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        picture: user.picture,
        interviewsCompleted: user.interviewsCompleted,
        averageScore: user.averageScore
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Authorization Error: Invalid token' });
  }
});

// Get user profile
app.get('/api/user/profile', verifyJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        picture: user.picture,
        interviewsCompleted: user.interviewsCompleted,
        averageScore: user.averageScore,
        totalScore: user.totalScore,
        lastInterviewDate: user.lastInterviewDate,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Verify token endpoint
app.post('/api/auth/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required', valid: false });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found', valid: false });
    }

    res.json({
      success: true,
      valid: true,
      user: {
        id: user._id,
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        picture: user.picture,
        interviewsCompleted: user.interviewsCompleted,
        averageScore: user.averageScore
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid or expired token', valid: false });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Supabase token exchange: accept Supabase access token, verify with Supabase, create/find local user, return server JWT
app.post('/api/auth/supabase', authLimiter, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      console.error('Supabase verify error:', error);
      return res.status(401).json({ error: 'Invalid Supabase token' });
    }

    const sbUser = data.user;

    // Find or create user in database
    let user = await User.findOne({ supabaseId: sbUser.id });

    if (!user) {
      user = new User({
        supabaseId: sbUser.id,
        email: sbUser.email,
        name: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || sbUser.email,
        picture: sbUser.user_metadata?.avatar_url || null
      });
      await user.save();
      console.log('New user created from Supabase:', user.email);
    } else {
      user.updatedAt = new Date();
      await user.save();
    }

    // Generate server JWT token
    const sessionToken = jwt.sign(
      {
        id: user._id,
        supabaseId: user.supabaseId,
        email: user.email,
        name: user.name,
        provider: 'supabase'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      sessionToken,
      user: {
        id: user._id,
        supabaseId: user.supabaseId,
        email: user.email,
        name: user.name,
        picture: user.picture,
        interviewsCompleted: user.interviewsCompleted,
        averageScore: user.averageScore
      }
    });
  } catch (error) {
    console.error('Supabase auth error:', error);
    res.status(500).json({ error: 'Supabase authentication failed' });
  }
});