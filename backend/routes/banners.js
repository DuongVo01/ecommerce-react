const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tạo thư mục uploads/banner nếu chưa có
const bannerDir = path.join(__dirname, '../uploads/banner');
if (!fs.existsSync(bannerDir)) {
  fs.mkdirSync(bannerDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, bannerDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, name);
  }
});
const upload = multer({ storage });

// Lưu danh sách banner vào file JSON
const bannerListPath = path.join(bannerDir, 'banners.json');
function getBannerList() {
  if (!fs.existsSync(bannerListPath)) return [];
  try {
    return JSON.parse(fs.readFileSync(bannerListPath, 'utf8'));
  } catch {
    return [];
  }
}
function saveBannerList(list) {
  fs.writeFileSync(bannerListPath, JSON.stringify(list, null, 2), 'utf8');
}

// GET: Lấy danh sách banner
router.get('/', (req, res) => {
  const banners = getBannerList();
  res.json(banners);
});

// POST: Upload banner mới
router.post('/', upload.single('banner'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = '/uploads/banner/' + req.file.filename;
  const banners = getBannerList();
  banners.push({ url });
  saveBannerList(banners);
  res.json({ success: true, url });
});


// DELETE: Xóa banner theo index
router.delete('/:id', (req, res) => {
  const idx = parseInt(req.params.id, 10);
  let banners = getBannerList();
  if (isNaN(idx) || idx < 0 || idx >= banners.length) {
    return res.status(404).json({ error: 'Banner not found' });
  }
  // Xóa file ảnh vật lý
  const filePath = banners[idx].url ? path.join(bannerDir, path.basename(banners[idx].url)) : null;
  if (filePath && fs.existsSync(filePath)) {
    try { fs.unlinkSync(filePath); } catch {}
  }
  banners.splice(idx, 1);
  saveBannerList(banners);
  res.json({ success: true });
});

// PUT: Cập nhật ảnh banner theo index
router.put('/:id', upload.single('banner'), (req, res) => {
  const idx = parseInt(req.params.id, 10);
  let banners = getBannerList();
  if (isNaN(idx) || idx < 0 || idx >= banners.length) {
    return res.status(404).json({ error: 'Banner not found' });
  }
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  // Xóa file ảnh cũ
  const oldFilePath = banners[idx].url ? path.join(bannerDir, path.basename(banners[idx].url)) : null;
  if (oldFilePath && fs.existsSync(oldFilePath)) {
    try { fs.unlinkSync(oldFilePath); } catch {}
  }
  // Cập nhật url mới
  banners[idx].url = '/uploads/banner/' + req.file.filename;
  saveBannerList(banners);
  res.json({ success: true, url: banners[idx].url });
});

module.exports = router;
