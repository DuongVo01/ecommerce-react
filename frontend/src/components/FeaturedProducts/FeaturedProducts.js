import React, { useEffect, useState } from 'react';
import { fetchProducts } from '../../services/api';
import ProductCard from '../ProductCard/ProductCard';
import './FeaturedProducts.css';

const FeaturedProducts = () => {
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

  if (loading) return <div>Đang tải sản phẩm...</div>;
  if (error) return <div>{error}</div>;
  return (
    <section className="featured-products-section">
      <h2>Sản phẩm nổi bật</h2>
      <div className="featured-products-list">
        {products.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default FeaturedProducts;