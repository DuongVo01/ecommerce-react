import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, TextField, Select, MenuItem, FormControl, InputLabel, Pagination, Typography, Skeleton
} from '@mui/material';
import ProductCard from '../../components/ProductCard/ProductCard';
import { fetchProducts } from '../../services/api';
import './ProductListPage.css';

const PRODUCTS_PER_PAGE = 20;

const ProductListPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('none');
  const [filterCategory, setFilterCategory] = useState('Tất cả');
  const [filterPriceMin, setFilterPriceMin] = useState('');
  const [filterPriceMax, setFilterPriceMax] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch sản phẩm
  useEffect(() => {
    setLoading(true);
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

  // Danh mục
  const categories = useMemo(() => ['Tất cả', ...Array.from(new Set(products.map(p => p.category)))], [products]);

  // Xử lý lọc và sắp xếp
  const filteredProducts = useMemo(() => {
    let result = products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      (filterCategory === 'Tất cả' || p.category === filterCategory) &&
      (filterPriceMin === '' || p.price >= Number(filterPriceMin)) &&
      (filterPriceMax === '' || p.price <= Number(filterPriceMax))
    );
    if (sort === 'priceAsc') result.sort((a, b) => a.price - b.price);
    if (sort === 'priceDesc') result.sort((a, b) => b.price - a.price);
    if (sort === 'nameAsc') result.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'nameDesc') result.sort((a, b) => b.name.localeCompare(b.name));
    return result;
  }, [products, search, sort, filterCategory, filterPriceMin, filterPriceMax]);

  // Phân trang
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * PRODUCTS_PER_PAGE,
    page * PRODUCTS_PER_PAGE
  );

  // Reset trang khi thay đổi bộ lọc
  useEffect(() => {
    setPage(1);
  }, [search, filterCategory, filterPriceMin, filterPriceMax]);

  // Xử lý điều hướng đến trang chi tiết sản phẩm
  const handleProductClick = useCallback((productId) => {
    navigate(`/products/${productId}`);
  }, [navigate]);

  return (
    <Box className="product-list-page">
      <Typography variant="h4" className="page-title">
        Danh sách sản phẩm
      </Typography>
      <Box className="filter-container">
        <TextField
          label="Tìm kiếm sản phẩm"
          variant="outlined"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="filter-input"
        />
        <FormControl className="filter-input">
          <InputLabel>Danh mục</InputLabel>
          <Select
            value={filterCategory}
            label="Danh mục"
            onChange={e => setFilterCategory(e.target.value)}
          >
            {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField
          label="Giá tối thiểu"
          type="number"
          variant="outlined"
          value={filterPriceMin}
          onChange={e => setFilterPriceMin(e.target.value)}
          className="filter-input"
        />
        <TextField
          label="Giá tối đa"
          type="number"
          variant="outlined"
          value={filterPriceMax}
          onChange={e => setFilterPriceMax(e.target.value)}
          className="filter-input"
        />
        <FormControl className="filter-input">
          <InputLabel>Sắp xếp</InputLabel>
          <Select
            value={sort}
            label="Sắp xếp"
            onChange={e => setSort(e.target.value)}
          >
            <MenuItem value="none">Mặc định</MenuItem>
            <MenuItem value="priceAsc">Giá thấp đến cao</MenuItem>
            <MenuItem value="priceDesc">Giá cao đến thấp</MenuItem>
            <MenuItem value="nameAsc">Tên A-Z</MenuItem>
            <MenuItem value="nameDesc">Tên Z-A</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {loading ? (
        <Grid container spacing={3} columns={{ xs: 1, sm: 2, md: 4 }}>
          {[...Array(PRODUCTS_PER_PAGE)].map((_, index) => (
            <Grid item xs={1} sm={1} md={1} key={index}>
              <Skeleton variant="rectangular" height={300} />
              <Skeleton variant="text" />
              <Skeleton variant="text" width="60%" />
            </Grid>
          ))}
        </Grid>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : filteredProducts.length === 0 ? (
        <Typography>Không tìm thấy sản phẩm phù hợp</Typography>
      ) : (
        <Grid container spacing={3} columns={{ xs: 1, sm: 2, md: 4 }}>
          {paginatedProducts.map(product => (
            <Grid item xs={1} sm={1} md={1} key={product._id || product.id} className="product-item">
              <ProductCard 
                product={product}
                onClick={() => handleProductClick(product._id || product.id)}
              >
                {product.shortDesc && (
                  <Typography variant="body2" color="text.secondary" className="product-desc">
                    {product.shortDesc}
                  </Typography>
                )}
              </ProductCard>
            </Grid>
          ))}
        </Grid>
      )}
      {totalPages > 1 && (
        <Box className="pagination-container">
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Box>
  );
};

export default ProductListPage;