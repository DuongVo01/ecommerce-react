const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Lưu báo cáo vào file JSON
const reportDir = path.join(__dirname, '../uploads/reports');
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}
const reportListPath = path.join(reportDir, 'reports.json');
function getReportList() {
  if (!fs.existsSync(reportListPath)) return [];
  try {
    return JSON.parse(fs.readFileSync(reportListPath, 'utf8'));
  } catch {
    return [];
  }
}
function saveReportList(list) {
  fs.writeFileSync(reportListPath, JSON.stringify(list, null, 2), 'utf8');
}

// POST: Nhận báo cáo comment
router.post('/', (req, res) => {
  const { commentId, reason, productId, user } = req.body;
  if (!commentId || !reason) {
    return res.status(400).json({ error: 'Thiếu thông tin báo cáo' });
  }
  const reports = getReportList();
  const newReport = {
    id: Date.now() + '-' + Math.round(Math.random() * 1e9),
    commentId,
    reason,
    productId,
    user,
    date: new Date().toISOString()
  };
  reports.push(newReport);
  saveReportList(reports);
  res.json({ success: true });
});

// GET: Lấy danh sách báo cáo (dành cho admin)
router.get('/', (req, res) => {
  const reports = getReportList();
  res.json(reports);
});

module.exports = router;
