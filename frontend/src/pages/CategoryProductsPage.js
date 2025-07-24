import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { fetchProducts } from '../services/api';
import './ProductListPage.css';

const CategoryProductsPage = () => {
  const { name } = useParams();
  const [products, setProducts] = useState([]);
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

  const filteredProducts = products.filter(product => product.category === name);

  if (loading) return <div>Đang tải sản phẩm...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="product-list-page">
      <h2>Danh mục: {name}</h2>
      <div className="product-list-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <ProductCard key={product._id || product.id} product={product} />
          ))
        ) : (
          <p>Không có sản phẩm nào trong danh mục này.</p>
        )}
      </div>
    </div>
  );
};

export default CategoryProductsPage;
