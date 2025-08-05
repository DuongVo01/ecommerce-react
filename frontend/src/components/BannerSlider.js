import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const BannerSlider = () => {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef();

  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:5000/api/banners')
      .then(res => setBanners(res.data))
      .catch(() => setBanners([]))
      .finally(() => setLoading(false));
  }, []);

  // Auto slide
  useEffect(() => {
    if (banners.length <= 1) return;
    timeoutRef.current = setTimeout(() => {
      setCurrent(c => (c + 1) % banners.length);
    }, 4000);
    return () => clearTimeout(timeoutRef.current);
  }, [banners, current]);


  // Responsive height (must be before any return)
  const getHeight = () => {
    if (window.innerWidth < 600) return 140;
    if (window.innerWidth < 900) return 180;
    return 260;
  };
  const [height, setHeight] = useState(getHeight());
  useEffect(() => {
    const onResize = () => setHeight(getHeight());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (loading) {
    // Skeleton loading
    return (
      <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', height: 220, borderRadius: 16, background: 'linear-gradient(90deg,#f3f4f6 25%,#e5e7eb 50%,#f3f4f6 75%)', animation: 'pulse 1.5s infinite', marginBottom: 32 }} />
    );
  }
  if (banners.length === 0) return null;

  // Next/Prev
  const goNext = () => setCurrent(c => (c + 1) % banners.length);
  const goPrev = () => setCurrent(c => (c - 1 + banners.length) % banners.length);

  return (
    <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', position: 'relative', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 16px #0001', marginBottom: 32, background: '#f1f5f9' }}>
      {banners.map((b, i) => (
        <div
          key={i}
          style={{
            width: '100%',
            height,
            position: i === current ? 'relative' : 'absolute',
            top: 0,
            left: 0,
            opacity: i === current ? 1 : 0,
            zIndex: i === current ? 2 : 1,
            transition: 'opacity 0.7s cubic-bezier(.4,0,.2,1)',
            pointerEvents: i === current ? 'auto' : 'none',
            background: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img
            src={`http://localhost:5000${b.url || b}`}
            alt={`Banner ${i + 1}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: 16,
              boxShadow: '0 2px 16px #0001',
              filter: i === current ? 'none' : 'blur(2px)',
              transition: 'filter 0.5s'
            }}
          />
          {/* Overlay gradient for text/caption */}
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '38%',
            background: 'linear-gradient(0deg,rgba(0,0,0,0.38),rgba(0,0,0,0.08) 70%,transparent)',
            pointerEvents: 'none',
            borderRadius: '0 0 16px 16px'
          }} />
          {/* Caption nếu có */}
          {b.caption && (
            <div style={{
              position: 'absolute',
              left: 32,
              bottom: 32,
              color: '#fff',
              fontSize: 24,
              fontWeight: 700,
              textShadow: '0 2px 8px #0008',
              maxWidth: '60%'
            }}>{b.caption}</div>
          )}
        </div>
      ))}
      {/* Prev/Next buttons */}
      {banners.length > 1 && (
        <>
          <button onClick={goPrev} aria-label="Trước" style={{position:'absolute',top:'50%',left:12,transform:'translateY(-50%)',background:'#fff8',border:'none',borderRadius:'50%',width:38,height:38,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,cursor:'pointer',boxShadow:'0 2px 8px #0002',zIndex:10}}>&lt;</button>
          <button onClick={goNext} aria-label="Sau" style={{position:'absolute',top:'50%',right:12,transform:'translateY(-50%)',background:'#fff8',border:'none',borderRadius:'50%',width:38,height:38,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,cursor:'pointer',boxShadow:'0 2px 8px #0002',zIndex:10}}>&gt;</button>
        </>
      )}
      {/* Dots */}
      <div style={{ position: 'absolute', bottom: 18, left: 0, right: 0, textAlign: 'center', zIndex: 11 }}>
        {banners.map((_, i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              width: i === current ? 18 : 12,
              height: i === current ? 18 : 12,
              borderRadius: '50%',
              background: i === current ? '#1976d2' : '#e0e7ef',
              margin: '0 6px',
              cursor: 'pointer',
              border: i === current ? '3px solid #fff' : 'none',
              boxShadow: i === current ? '0 0 8px #1976d2' : 'none',
              transition: 'all 0.2s'
            }}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerSlider;
