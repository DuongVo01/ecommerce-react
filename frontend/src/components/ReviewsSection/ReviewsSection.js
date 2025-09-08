import React, { useState, useContext } from 'react';
import { Rating, TextField, Button, Typography, Divider, IconButton } from '@mui/material';
import { Edit, Delete, Image as ImageIcon, ThumbUp, ThumbUpOutlined } from '@mui/icons-material';
import { UserContext } from '../../UserContext';
import './ReviewsSection.css';

const ReviewsSection = ({ 
  productId, 
  reviews = [], 
  onAddReview,
  onUpdateReview,
  onDeleteReview,
  onLikeReview,
  isLoading = false
}) => {
  const { user } = useContext(UserContext);
  const [newReview, setNewReview] = useState('');
  const [rating, setRating] = useState(0);
  const [selectedImages, setSelectedImages] = useState([]);
  const [editingReview, setEditingReview] = useState(null);
  const [error, setError] = useState('');

  const hasReviewed = user && reviews.some(review => 
    review.user === user.username && (!editingReview || review._id !== editingReview._id)
  );

  const resetForm = () => {
    setNewReview('');
    setRating(0);
    setSelectedImages([]);
    setEditingReview(null);
    setError('');
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    console.log('Selected files:', files);
    
    if (files.length > 5) {
      setError('Chỉ được chọn tối đa 5 ảnh');
      return;
    }

    if (files.length === 0) {
      setSelectedImages([]);
      return;
    }

    setSelectedImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Vui lòng đăng nhập để đánh giá sản phẩm');
      return;
    }
    if (!newReview || rating === 0) {
      setError('Vui lòng nhập đánh giá và chọn số sao');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('rating', rating);
      formData.append('comment', newReview);
      formData.append('user', user.username);

      let totalSize = 0;
      for (const image of selectedImages) {
        totalSize += image.size;
        if (image.size > 5 * 1024 * 1024) {
          setError('Mỗi ảnh phải có kích thước nhỏ hơn 5MB');
          return;
        }
      }

      if (totalSize > 20 * 1024 * 1024) {
        setError('Tổng kích thước các ảnh phải nhỏ hơn 20MB');
        return;
      }

      formData.delete('images');
      
      if (selectedImages.length > 0) {
        console.log('Appending selected images:', selectedImages);
        selectedImages.forEach((image, index) => {
          console.log(`Appending image ${index}:`, image.name);
          formData.append('images', image);
        });
      }

      if (editingReview) {
        await onUpdateReview(editingReview._id, formData);
      } else {
        await onAddReview(formData);
      }
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá');
      console.error('Error submitting review:', err);
    }
  };

  return (
    <div className="reviews-section">
      {error && (
        <Typography color="error" className="error-message">
          {error}
        </Typography>
      )}

      {!user ? (
        <Typography color="textSecondary">
          Vui lòng đăng nhập để đánh giá sản phẩm
        </Typography>
      ) : hasReviewed && !editingReview ? (
        <Typography color="textSecondary">
          Bạn đã đánh giá sản phẩm này
        </Typography>
      ) : (
        <form onSubmit={handleSubmit} className="review-form">
          <Rating
            value={rating}
            onChange={(_, value) => setRating(value)}
            size="large"
            className="review-rating"
          />
          <TextField
            label="Viết đánh giá của bạn..."
            multiline
            rows={3}
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            className="review-input"
            error={!!error && !newReview}
            helperText={error && !newReview ? 'Vui lòng nhập nội dung đánh giá' : ''}
          />
          
          <div className="image-upload">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              id="review-images"
              style={{ display: 'none' }}
            />
            <label htmlFor="review-images">
              <Button
                component="span"
                startIcon={<ImageIcon />}
                variant="outlined"
                className="upload-button"
              >
                Thêm ảnh ({selectedImages.length}/5)
              </Button>
            </label>
          </div>

          {selectedImages.length > 0 && (
            <div className="image-preview">
              {selectedImages.map((file, index) => (
                <div key={index} className="preview-item">
                  <img src={URL.createObjectURL(file)} alt={`Preview ${index + 1}`} />
                  <IconButton
                    size="small"
                    onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== index))}
                    className="remove-image"
                  >
                    <Delete />
                  </IconButton>
                </div>
              ))}
            </div>
          )}

          <Button 
            type="submit" 
            variant="contained" 
            className="btn-submit"
            disabled={isLoading}
          >
            {isLoading ? 'Đang gửi...' : editingReview ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
          </Button>
        </form>
      )}

      <div className="reviews-list">
        {reviews.map((review) => (
          <div key={review._id} className="review-item">
            <div className="review-header">
              <div className="review-user-info">
                <div className="user-avatar-container">
                  {review.avatar ? (
                    <img 
                      src={`http://localhost:5000${review.avatar}`} 
                      alt={review.user} 
                      className="user-avatar"
                    />
                  ) : (
                    <div className="default-avatar">
                      {review.user.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="user-details">
                  <Typography variant="subtitle1" className="review-username">
                    {review.user}
                  </Typography>
                  <div className="rating-date">
                    <Rating value={review.rating} readOnly size="small" />
                    <Typography variant="caption" className="review-date" sx={{ marginLeft: 1 }}>
                      {review.date ? new Date(review.date).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Không có ngày'}
                    </Typography>
                  </div>
                </div>
              </div>
              
              {user && user.username === review.user && (
                <div className="review-actions">
                  <IconButton 
                    size="small" 
                    onClick={() => {
                      setEditingReview(review);
                      setNewReview(review.comment);
                      setRating(review.rating);
                      setSelectedImages([]);
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton 
                    size="small"
                    onClick={() => {
                      if (window.confirm('Bạn có chắc muốn xóa đánh giá này?')) {
                        onDeleteReview(review._id);
                      }
                    }}
                  >
                    <Delete />
                  </IconButton>
                </div>
              )}
            </div>
            
            <Typography className="review-content">
              {review.comment}
            </Typography>

            {review.images && review.images.length > 0 && (
              <div className="review-images">
                {review.images.map((image, index) => (
                  <div key={index} className="review-image">
                    <img 
                      src={`http://localhost:5000${image}`}
                      alt={`Review image ${index + 1}`}
                      onClick={() => {
                        window.open(`http://localhost:5000${image}`, '_blank');
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="review-footer">
              <div className="like-section">
                {user && user.username !== review.user && (
                  <IconButton 
                    onClick={() => onLikeReview(review._id)}
                    color={review.likes?.includes(user?.username) ? 'primary' : 'default'}
                    size="small"
                    className="like-button"
                    title="Thích đánh giá này"
                  >
                    {review.likes?.includes(user?.username) ? <ThumbUp /> : <ThumbUpOutlined />}
                  </IconButton>
                )}
                <Typography 
                  variant="body2" 
                  className="like-count"
                  title={review.likes?.length > 0 ? `${review.likes?.length} người đã thích` : ''}
                >
                  {review.likes?.length || 0} lượt thích
                </Typography>
              </div>
            </div>

            <Divider sx={{ margin: '10px 0' }} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsSection;