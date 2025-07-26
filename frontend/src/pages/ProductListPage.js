
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Grid, TextField, Select, MenuItem, FormControl, InputLabel, useTheme, Pagination, Typography
} from '@mui/material';
import ProductCard from '../components/ProductCard';
import { fetchProducts } from '../services/api';
import { grey } from '@mui/material/colors';

const PRODUCTS_PER_PAGE = 20;

const ProductListPage = () => {
  const theme = useTheme();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('none');
  const [filterCategory, setFilterCategory] = useState('Tất cả');
  const [filterPrice, setFilterPrice] = useState('');
  const [page, setPage] = useState(1);
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

  // Danh mục
  const categories = ['Tất cả', ...Array.from(new Set(products.map(p => p.category)))];

  // Lọc & sắp xếp
  const filteredProducts = useMemo(() => {
    let result = products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      (filterCategory === 'Tất cả' || p.category === filterCategory) &&
      (filterPrice === '' || p.price <= Number(filterPrice))
    );
    if (sort === 'priceAsc') result.sort((a, b) => a.price - b.price);
    if (sort === 'priceDesc') result.sort((a, b) => b.price - a.price);
    if (sort === 'nameAsc') result.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'nameDesc') result.sort((a, b) => b.name.localeCompare(a.name));
    return result;
  }, [products, search, sort, filterCategory, filterPrice]);

  // Phân trang
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * PRODUCTS_PER_PAGE,
    page * PRODUCTS_PER_PAGE
  );

  // Khi tìm kiếm hoặc lọc, reset về trang 1
  useEffect(() => {
    setPage(1);
  }, [search, filterCategory, filterPrice]);

  if (loading) return <div>Đang tải sản phẩm...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Box sx={{
      bgcolor: theme.palette.mode === 'dark' ? grey[900] : '#f6f8fa',
      minHeight: '100vh', p: { xs: 1, md: 4 }
    }}>
      <Typography variant="h4" fontWeight={700} mb={3} color="primary">
        Danh sách sản phẩm
      </Typography>
      <Box sx={{
        display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3,
        alignItems: 'center', bgcolor: theme.palette.background.paper, p: 2, borderRadius: 2, boxShadow: 1
      }}>
        <TextField
          label="Tìm kiếm"
          variant="outlined"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ minWidth: 180 }}
        />
        <FormControl sx={{ minWidth: 140 }}>
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
          label="Lọc giá tối đa"
          type="number"
          variant="outlined"
          value={filterPrice}
          onChange={e => setFilterPrice(e.target.value)}
          sx={{ minWidth: 120 }}
        />
        <FormControl sx={{ minWidth: 160 }}>
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
      <Grid container spacing={3}>
        {paginatedProducts.map(product => (
          <Grid item xs={12} sm={6} md={3} key={product._id || product.id}>
            <ProductCard product={product}>
              {product.shortDesc && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {product.shortDesc}
                </Typography>
              )}
            </ProductCard>
          </Grid>
        ))}
      </Grid>
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
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
