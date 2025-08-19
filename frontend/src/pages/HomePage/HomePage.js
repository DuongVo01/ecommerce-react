import BannerSlider from '../../components/BannerSlider';
import HeroBanner from '../../components/HeroBanner';
import CategoryList from '../../components/CategoryList';
import PromotionBanner from '../../components/PromotionBanner';
import FeaturedProducts from '../../components/FeaturedProducts';

const HomePage = () => {
  return (
    <div style={{ background: 'linear-gradient(135deg,#e3eafc 0%,#f6f8fa 100%)', minHeight: '100vh' }}>

      <BannerSlider />
      <HeroBanner />


      {/* Icon dịch vụ nổi bật */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', margin: '32px 0' }}>
        <div style={{ textAlign: 'center' }}>
          <img src="https://cdn-icons-png.flaticon.com/512/1041/1041916.png" alt="Chất lượng" style={{ width: 48, marginBottom: 8 }} />
          <div style={{ fontWeight: 500, color: '#1976d2' }}>Chất lượng đảm bảo</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <img src="https://cdn-icons-png.flaticon.com/512/3523/3523887.png" alt="Giao hàng" style={{ width: 48, marginBottom: 8 }} />
          <div style={{ fontWeight: 500, color: '#1976d2' }}>Giao hàng nhanh</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <img src="https://cdn-icons-png.flaticon.com/512/929/929426.png" alt="Hỗ trợ" style={{ width: 48, marginBottom: 8 }} />
          <div style={{ fontWeight: 500, color: '#1976d2' }}>Hỗ trợ 24/7</div>
        </div>
      </div>

      <CategoryList />
      <PromotionBanner />

      {/* Sản phẩm nổi bật dạng lưới, nút mua ngay */}
      <FeaturedProducts />

      <style>{`
        .featured-products-list {
          gap: 2.5rem !important;
        }
        @media (max-width: 900px) {
          .featured-products-list {
            gap: 1.2rem !important;
          }
        }
        @media (max-width: 600px) {
          .featured-products-list {
            gap: 0.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};


export default HomePage;
