const express = require('express');
const Category = require('../models/Category');
const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const upload = require('../middleware/upload');

// Upload category image
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ imageUrl: `/uploads/${req.file.filename}` });
});

// Create new category
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const newCategory = new Category({
      ...req.body,
      image: req.file ? `/uploads/${req.file.filename}` : req.body.image
    });
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update category
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const updateData = {
      ...req.body
    };
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!updatedCategory) return res.status(404).json({ error: 'Category not found' });
    res.json(updatedCategory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete category
router.delete('/:id', async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    if (!deletedCategory) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
