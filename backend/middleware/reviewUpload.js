const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cấu hình lưu file cho review images
const reviewStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = path.join(__dirname, '../uploads/reviews');
    try {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      console.log('Saving file to:', dest);
    } catch (err) {
      console.error('Error creating directory:', err);
    }
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + '-' + file.originalname;
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

// Kiểm tra file type
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh: jpg, jpeg, png, gif, webp'), false);
  }
};

// Cấu hình multer cho review images
const reviewUpload = multer({
  storage: reviewStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5 // tối đa 5 files
  }
});

module.exports = reviewUpload;
