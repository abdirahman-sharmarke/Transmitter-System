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

// Routes
app.use('/api', routes);

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to the API');
});

// Sync database and start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Sync database models WITHOUT force:true to preserve data
    console.log('Syncing database...');
    // Use alter:true but with a try-catch to handle validation errors
    try {
      // First try altering the tables
      await sequelize.sync({ alter: true });
      console.log('Database tables synced successfully with alter:true');
    } catch (alterError) {
      console.error('Error with alter sync:', alterError.message);
      
      // If altering fails, try syncing without altering
      try {
        console.log('Trying to sync without altering tables...');
        await sequelize.sync();
        console.log('Database tables synced successfully');
      } catch (syncError) {
        console.error('Failed to sync database:', syncError.message);
        process.exit(1);
      }
    }
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    if (error.parent) {
      console.error('Database error:', error.parent.message);
    }
    
    try {
      console.log('Trying to sync without altering tables...');
      await sequelize.sync();
      console.log('Database tables synced successfully');
      
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    } catch (syncError) {
      console.error('Failed to sync database:', syncError.message);
      process.exit(1);
    }
  }
};

startServer(); 