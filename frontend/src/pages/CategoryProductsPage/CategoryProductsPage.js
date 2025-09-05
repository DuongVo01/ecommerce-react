import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Box,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Typography,
  Skeleton,
} from "@mui/material";
import ProductCard from "../../components/ProductCard/ProductCard";
import { fetchProducts } from "../../services/api";
import "./CategoryProductsPage.css";

const PRODUCTS_PER_PAGE = 20;

const CategoryProductsPage = () => {
  const { name } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("none");
  const [filterPriceMin, setFilterPriceMin] = useState("");
  const [filterPriceMax, setFilterPriceMax] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch sản phẩm
  useEffect(() => {
    setLoading(true);
    fetchProducts()
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Không thể tải sản phẩm");
        setLoading(false);
      });
  }, []);

  // Lọc theo danh mục từ URL
  const filteredProducts = useMemo(() => {
    let result = products.filter(
      (p) =>
        p.category === name &&
        p.name.toLowerCase().includes(search.toLowerCase()) &&
        (filterPriceMin === "" || p.price >= Number(filterPriceMin)) &&
        (filterPriceMax === "" || p.price <= Number(filterPriceMax))
    );

    if (sort === "priceAsc") result.sort((a, b) => a.price - b.price);
    if (sort === "priceDesc") result.sort((a, b) => b.price - a.price);
    if (sort === "nameAsc") result.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "nameDesc") result.sort((a, b) => b.name.localeCompare(a.name));

    return result;
  }, [products, name, search, sort, filterPriceMin, filterPriceMax]);

  // Phân trang
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * PRODUCTS_PER_PAGE,
    page * PRODUCTS_PER_PAGE
  );

  // Reset page khi filter thay đổi
  useEffect(() => {
    setPage(1);
  }, [search, filterPriceMin, filterPriceMax, sort, name]);

  // Click sản phẩm
  const handleProductClick = useCallback(
    (productId) => {
      navigate(`/products/${productId}`);
    },
    [navigate]
  );

  return (
    <Box className="category-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/">Trang chủ</Link> › <span>{name}</span>
      </div>

      {/* Header */}
      <Typography variant="h4" className="page-title">
        Danh mục: {name}
      </Typography>

      {/* Filter */}
      <Box className="filter-container">
        <TextField
          label="Tìm kiếm sản phẩm"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="filter-input"
        />
        <TextField
          label="Giá tối thiểu"
          type="number"
          variant="outlined"
          value={filterPriceMin}
          onChange={(e) => setFilterPriceMin(e.target.value)}
          className="filter-input"
        />
        <TextField
          label="Giá tối đa"
          type="number"
          variant="outlined"
          value={filterPriceMax}
          onChange={(e) => setFilterPriceMax(e.target.value)}
          className="filter-input"
        />
        <FormControl className="filter-input">
          <InputLabel>Sắp xếp</InputLabel>
          <Select
            value={sort}
            label="Sắp xếp"
            onChange={(e) => setSort(e.target.value)}
          >
            <MenuItem value="none">Mặc định</MenuItem>
            <MenuItem value="priceAsc">Giá thấp đến cao</MenuItem>
            <MenuItem value="priceDesc">Giá cao đến thấp</MenuItem>
            <MenuItem value="nameAsc">Tên A-Z</MenuItem>
            <MenuItem value="nameDesc">Tên Z-A</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Product Grid */}
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
          {paginatedProducts.map((product) => (
            <Grid
              item
              xs={1}
              sm={1}
              md={1}
              key={product._id || product.id}
              className="product-item"
            >
              <ProductCard
                product={product}
                onClick={() => handleProductClick(product._id || product.id)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
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

export default CategoryProductsPage;
