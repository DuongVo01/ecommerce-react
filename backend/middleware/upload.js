const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cấu hình lưu file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = path.join(__dirname, '../uploads');
    try {
      if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    } catch {}
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// Chỉ cho phép upload file ảnh
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ được upload file ảnh!'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
