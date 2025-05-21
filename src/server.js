const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize, testConnection } = require('./config/database');
const routes = require('./routes');

// Load environment variables
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8585;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to the API - Server is running!');
});

// Health check route that doesn't require database
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running', 
    environment: process.env.NODE_ENV || 'development'
  });
});

// Apply routes only if database connection succeeds
let dbConnected = false;

// Routes
app.use('/api', (req, res, next) => {
  if (!dbConnected && req.path !== '/health') {
    return res.status(503).json({ 
      error: 'Database connection not established', 
      message: 'The API is starting up or the database is unavailable'
    });
  }
  next();
}, routes);

// Sync database and start server
const startServer = async () => {
  // Start server first, regardless of database status
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  
  try {
    // Test database connection
    await testConnection();
    
    // Try to sync database models
    try {
      await sequelize.sync({ alter: false });
      console.log('Database tables synced successfully');
      dbConnected = true;
    } catch (syncError) {
      console.error('Failed to sync database:', syncError.message);
    }
  } catch (error) {
    console.error('Failed to connect to database:', error.message);
    console.log('Server will continue running with limited functionality');
  }
};

startServer();