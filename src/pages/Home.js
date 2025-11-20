import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import api from '../services/api';

// Función para URL del backend (prioridad)
const getBackendUrl = (filename) => {
  if (!filename) return '/images/placeholder.png';
  return `http://localhost:5000/uploaded_img/${filename}`;
};

// Función para fallback frontend
const getFallbackUrl = (filename) => {
  if (!filename) return '/images/placeholder.png';
  return `/uploaded_img/${filename}`;
};

// Componente para cada producto
const ProductCard = ({ product, onAddToCart }) => {
  const [qty, setQty] = useState(1);
  const [imgSrc, setImgSrc] = useState(getBackendUrl(product.image_01));  // Inicial: backend

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onAddToCart) {
      onAddToCart({ ...product, qty });
    }
  };

  const handleImageError = (e) => {
    console.log('Backend falló para', product.name, 'src:', imgSrc);  // Debug backend
    const fallbackSrc = getFallbackUrl(product.image_01);
    console.log('Cambiando a fallback front:', fallbackSrc);  // Debug fallback
    setImgSrc(fallbackSrc);
    e.target.src = fallbackSrc;
    e.target.onerror = (fallbackErr) => {
      console.log('Fallback front también falló, placeholder:', product.name);  // Debug final
      e.target.src = '/images/placeholder.png';
      e.target.onerror = null;  // Para de loop
    };
  };

  const handleImageLoad = () => {
    console.log('Img cargada OK para', product.name, 'src:', imgSrc);  // Debug éxito
  };

  return (
    <form className="swiper-slide slide" onSubmit={handleSubmit}>
      <input type="hidden" name="pid" value={product.id} />
      <input type="hidden" name="name" value={product.name} />
      <input type="hidden" name="price" value={product.price} />
      <input type="hidden" name="image" value={product.image_01} />
      <Link 
        to={`/product/${product.id}`} 
        className="fas fa-eye" 
        aria-label="Ver detalle del producto"
      />
      <img 
        src={imgSrc} 
        alt={product.name || 'Producto sin imagen'} 
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{ 
          width: '100%', 
          height: '200px',  // Fija anti-parpadeo
          objectFit: 'cover',
          backgroundColor: '#f0f0f0',  // Gris si vacío
          display: 'block'
        }} 
      />
      <div className="name">{product.name}</div>
      <div className="flex">
        <div className="price">
          <span data-original-price={product.price}>{product.price} MXN</span>
        </div>
        <input 
          type="number" 
          className="qty" 
          min="1" 
          max="99" 
          value={qty}
          onChange={(e) => {
            const val = parseInt(e.target.value) || 1;
            setQty(Math.min(Math.max(val, 1), 99));
          }}
        />
      </div>
      <button type="submit" className="btn">Add to Cart</button>
    </form>
  );
};

// NewsSection (mejorado con diseño más cómodo: grid responsive, sombras, hover, tipografía suave)
const NewsSection = ({ news }) => (
  <section className="news-section">
    <h1 className="heading">Últimas Noticias de Fútbol</h1>
    <div className="news-container">
      {news.length > 0 ? (
        news.map((item, index) => (
          <div key={item.id || index} className="news-card">
            {/* Imagen con fallback y diseño mejorado */}
            <div className="news-image-wrapper">
              {item.image ? (
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="news-image"
                />
              ) : (
                <div className="news-image-placeholder">
                  <i className="fas fa-futbol" style={{ fontSize: '3rem', color: '#ddd' }}></i>
                </div>
              )}
            </div>
            <div className="news-content">
              <h3 className="news-title">{item.title}</h3>
              <p className="news-description">{item.description}</p>
              <a href={item.url} className="news-btn" target="_blank" rel="noopener noreferrer">
                Leer Más <i className="fas fa-arrow-right"></i>
              </a>
            </div>
          </div>
        ))
      ) : (
        <div className="empty-state">
          <i className="fas fa-newspaper" style={{ fontSize: '4rem', color: '#ddd', marginBottom: '1rem' }}></i>
          <p className="empty">No hay noticias de fútbol disponibles en este momento. ¡Vuelve pronto!</p>
        </div>
      )}
    </div>
  </section>
);

const Home = () => {
  const [products, setProducts] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Función para fetch de noticias de fútbol desde NewsAPI
  const fetchSoccerNews = async () => {
    const apiKey = process.env.REACT_APP_NEWS_API_KEY;
    if (!apiKey) {
      console.error('Error: No se encontró la API key de NewsAPI. Agrega REACT_APP_NEWS_API_KEY=e6a72efc589b4e49b0c5f517adab6c85 en .env');
      setNews([]);
      return;
    }

    try {
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=fútbol&language=es&sortBy=publishedAt&pageSize=5&sources=marca,as,goal&apiKey=${apiKey}`
      );
      const data = await response.json();
      console.log('News response (fútbol):', data);
      
      if (data.status === 'ok' && data.articles) {
        // Mapea los artículos a formato simple: { title, description, url, image }
        const formattedNews = data.articles.map(article => ({
          id: article.url,  // Usa URL como ID único
          title: article.title,
          description: article.description || 'Sin descripción disponible.',
          url: article.url,
          image: article.urlToImage || null  // Opcional: imagen si existe
        }));
        setNews(formattedNews);
      } else {
        console.error('Error en NewsAPI:', data.message);
        setNews([]);
      }
    } catch (err) {
      console.error('Error fetching noticias de fútbol:', err);
      setNews([]);
    }
  };

  useEffect(() => {
    // Fetch productos (sin cambios)
    api.get('/products?limit=6')
      .then(res => {
        console.log('Products response:', res.data);
        if (res.data.success) {
          setProducts(res.data.products || []);
        } else {
          setProducts([]);
        }
      })
      .catch(err => {
        console.error('Error productos:', err);
        setProducts([]);
      })
      .finally(() => {
        // Cambié el finally para que solo afecte a productos, news es async separado
        // Pero para loading global, puedes ajustarlo
      });

    // Fetch noticias de fútbol (nuevo)
    fetchSoccerNews();

    // Opcional: Refresca noticias cada 5 minutos para "tiempo real"
    const newsInterval = setInterval(fetchSoccerNews, 5 * 60 * 1000);  // 300000 ms = 5 min

    // Limpia el intervalo al desmontar
    return () => clearInterval(newsInterval);
  }, []);

  const handleAddToCart = async (item) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Inicia sesión para agregar al carrito');
      return;
    }

    try {
      const res = await api.post('/auth/cart/add', {
        pid: item.id,
        name: item.name,
        price: item.price,
        image: item.image_01,
        qty: item.qty || 1,
      });

      if (res.data.success) {
        alert(`¡Agregado! ${item.name} x${item.qty}`);
        console.log('Item agregado, cartCount:', res.data.cartCount);
      } else {
        alert(res.data.message || 'Error al agregar');
      }
    } catch (err) {
      console.error('Error add to cart:', err);
      alert('Error al agregar al carrito');
    }
  };

  // Ajusté loading para que solo espere productos, news carga en paralelo
  useEffect(() => {
    if (products.length >= 0) {
      setLoading(false);  // Siempre falso después del primer render, ajusta si quieres esperar news
    }
  }, [products]);

  if (loading) return <div>Cargando...</div>;

  return (
    <>
      <style>{`
        /* ESTILOS MEJORADOS PARA NEWS-SECTION: Más cómodos, responsive y visuales */
        .news-section {
          margin: 40px auto;
          max-width: 1200px;
          padding: 0 20px;
        }
        .news-section .heading {
          text-align: center;
          font-size: 2.5rem;
          margin-bottom: 30px;
          color: #333;
          position: relative;
        }
        .news-section .heading::after {
          content: '';
          display: block;
          width: 60px;
          height: 3px;
          background: linear-gradient(90deg, #ff6b6b, #4ecdc4);
          margin: 10px auto;
          border-radius: 2px;
        }
        .news-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 25px;
          padding: 0;
        }
        .news-card {
          background: #fff;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          border: 1px solid #f0f0f0;
        }
        .news-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
        }
        .news-image-wrapper {
          width: 100%;
          height: 200px;
          overflow: hidden;
          position: relative;
        }
        .news-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .news-card:hover .news-image {
          transform: scale(1.05);
        }
        .news-image-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .news-content {
          padding: 20px;
        }
        .news-title {
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 12px;
          line-height: 1.4;
          color: #2c3e50;
        }
        .news-description {
          font-size: 0.95rem;
          line-height: 1.6;
          color: #7f8c8d;
          margin-bottom: 15px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .news-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          color: #3498db;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s ease;
          border: none;
          background: none;
          cursor: pointer;
        }
        .news-btn:hover {
          color: #2980b9;
        }
        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 40px 20px;
          background: #f8f9fa;
          border-radius: 15px;
          border: 2px dashed #dee2e6;
        }
        .empty {
          font-size: 1.1rem;
          color: #6c757d;
          margin: 0;
        }

        /* Responsive: En mobile, una columna y más espacio */
        @media (max-width: 768px) {
          .news-container {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .news-section .heading {
            font-size: 2rem;
          }
          .news-image-wrapper {
            height: 180px;
          }
        }
      `}</style>
      <div className="home-wrapper">
        <div className="home-bg">
          <section className="home">
            <Swiper
              modules={[Autoplay, Pagination, EffectFade]}
              loop={true}
              spaceBetween={30}
              effect="fade"
              pagination={{ clickable: true }}
              autoplay={{ delay: 7000, disableOnInteraction: false }}
              className="home-slider"
            >
              <SwiperSlide className="slide">
                <div className="image">
                  <img src="/images/icono.gif" alt="" />
                </div>
                <div className="content">
                  <span>Un gusto verte de</span>
                  <h3>Bienvenido</h3>
                </div>
              </SwiperSlide>
            </Swiper>
          </section>
        </div>

        <section className="home-products">
          <h1 className="heading">Lista de productos</h1>
          {products.length > 0 ? (
            <Swiper
              modules={[Autoplay, Pagination, Navigation]}
              loop={products.length > 3}
              spaceBetween={20}
              navigation={{
                nextEl: '.products-slider .swiper-button-next',
                prevEl: '.products-slider .swiper-button-prev'
              }}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              breakpoints={{
                550: { slidesPerView: 2 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 }
              }}
              className="products-slider"
            >
              {products.map(product => (
                <SwiperSlide key={product.id}>
                  <ProductCard 
                    product={product} 
                    onAddToCart={handleAddToCart}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <p className="empty">Aún no hay ningún producto en venta</p>
          )}
        </section>

        <NewsSection news={news} />
      </div>
    </>
  );
};

export default Home;