import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CategoryList.css';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/categories')
      .then(res => {
        setCategories(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section className="category-section">
      <h2>Danh mục sản phẩm</h2>
      <div className="category-list">
        {loading ? (
          <div>Đang tải danh mục...</div>
        ) : (
          categories.map(category => (
            <div className="category-item" key={category._id || category.id} onClick={() => navigate(`/category/${encodeURIComponent(category.name)}`)} style={{ cursor: 'pointer' }}>
              <img src={category.image ? (category.image.startsWith('/uploads') ? `http://localhost:5000${category.image}` : category.image) : ''} alt={category.name} className="category-image" />
              <div className="category-name">{category.name}</div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default CategoryList; 