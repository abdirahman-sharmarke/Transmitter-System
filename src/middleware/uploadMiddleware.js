const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Define storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Save avatar images to uploads/avatars directory
    const avatarDir = path.join(uploadDir, 'avatars');
    if (!fs.existsSync(avatarDir)) {
      fs.mkdirSync(avatarDir, { recursive: true });
    }
    cb(null, avatarDir);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  }
});

// File filter to validate image files
const fileFilter = (req, file, cb) => {
  // Accept only image files
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, JPG and GIF files are allowed.'), false);
  }
};

// Configure multer upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
  fileFilter: fileFilter
});

// Middleware to handle avatar upload
exports.uploadAvatar = upload.single('avatar');

// Middleware to process the uploaded avatar and add to the request body
exports.processAvatar = (req, res, next) => {
  try {
    // If a file was uploaded, add its path to the request body
    if (req.file) {
      // Generate the URL path for the avatar
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const relativePath = `/uploads/avatars/${req.file.filename}`;
      
      req.body.avatar = baseUrl + relativePath;
    }
    
    next();
  } catch (error) {
    console.error('Error processing avatar:', error);
    return res.status(500).json({ message: 'Error processing avatar', error: error.message });
  }
}; 