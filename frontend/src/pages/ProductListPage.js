
import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { fetchProducts } from '../services/api';
import './ProductListPage.css';

const PRODUCTS_PER_PAGE = 4;

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts()
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Không thể tải sản phẩm');
        setLoading(false);
      });
  }, []);

  // Lấy danh sách danh mục từ sản phẩm thực tế
  const categories = [
    'Tất cả',
    ...Array.from(new Set(products.map(p => p.category)))
  ];

  // Lọc sản phẩm theo từ khóa tìm kiếm và danh mục
  const filteredProducts = products.filter(product => {
    const matchName = product.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === 'Tất cả' || product.category === selectedCategory;
    return matchName && matchCategory;
  });

  // Phân trang
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const startIdx = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIdx = startIdx + PRODUCTS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIdx, endIdx);

  // Khi tìm kiếm hoặc lọc, reset về trang 1
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory]);

  if (loading) return <div>Đang tải sản phẩm...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="product-list-page">
      <h2>Danh sách sản phẩm</h2>
      <div className="filter-bar">
        <input
          className="search-input"
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="category-select"
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
        >
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
      <div className="product-list-grid">
        {paginatedProducts.length > 0 ? (
          paginatedProducts.map(product => (
            <ProductCard key={product._id || product.id} product={product} />
          ))
        ) : (
          <p>Không tìm thấy sản phẩm phù hợp.</p>
        )}
      </div>
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &lt;
          </button>
          {Array.from({ length: totalPages }, (_, idx) => (
            <button
              key={idx + 1}
              className={`pagination-btn${currentPage === idx + 1 ? ' active' : ''}`}
              onClick={() => setCurrentPage(idx + 1)}
            >
              {idx + 1}
            </button>
          ))}
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductListPage;
