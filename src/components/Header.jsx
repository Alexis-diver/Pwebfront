import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';  // Descomentado: para fetch de user/cart/wishlist

const Header = () => {
  const [user, setUser] = useState(null);
  // const [cartCount, setCartCount] = useState(0);  // Comentado temporal
  // const [wishlistCount, setWishlistCount] = useState(0);  // Comentado temporal
  const [messages, setMessages] = useState([]);
  const [profileActive, setProfileActive] = useState(false);
  const [navbarActive, setNavbarActive] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'local');

  // Fetch datos (descomentado y ajustado para auth/profile)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Carga user desde localStorage inicialmente (para "Hola, {name}")
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      // Fetch fresco desde API
      api.get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => { 
          if (res.data.success) {
            setUser(res.data.user);  // Actualiza con name, email, etc.
            localStorage.setItem('user', JSON.stringify(res.data.user));
          }
        })
        .catch(err => console.error('Error profile:', err));

    }
  }, []);

  // OPCIÓN B: Re-fetch automático cuando cambia localStorage (detecta login en misma pestaña)
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (token && !user) {  // Si token existe pero user no cargado (después de login)
        api.get('/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(res => { 
            if (res.data.success) {
              setUser(res.data.user);
              localStorage.setItem('user', JSON.stringify(res.data.user));
            }
          })
          .catch(err => console.error('Error re-fetch profile:', err));
      } else if (!token) {
        setUser(null);  // Limpia si no hay token
      }
    };

    // Llama inmediatamente y cada 1s (polling ligero para detectar cambios en misma pestaña)
    checkAuth();
    const interval = setInterval(checkAuth, 1000);

    return () => clearInterval(interval);
  }, [user]);  // Dependencia en user para re-trigger si cambia

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleCurrency = useCallback(() => {
    const isUSD = currency === 'usd';
    const prices = document.querySelectorAll('.price span[data-original-price]');
    const exchangeRate = 0.058;

    prices.forEach(price => {
      const originalPrice = parseFloat(price.getAttribute('data-original-price'));
      if (!isNaN(originalPrice)) {
        price.textContent = isUSD 
          ? `$${(originalPrice * exchangeRate).toFixed(2)} USD` 
          : `${originalPrice.toFixed(2)} MXN`;
      }
    });
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('currency', currency);
    toggleCurrency();
  }, [currency, toggleCurrency]);

  const toggleTheme = (e) => {
    setTheme(e.target.checked ? 'dark' : 'light');
  };

  const handleLogout = () => {
    if (window.confirm('¿Cerrar sesión del sitio web?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('user');  // Limpiar user para header
      setUser(null);
      setProfileActive(false);
      window.location.href = '/';
    }
  };

  const toggleProfile = () => {
    setProfileActive(!profileActive);
    setNavbarActive(false);
  };

  const toggleNavbar = () => {
    setNavbarActive(!navbarActive);
    setProfileActive(false);
  };

  useEffect(() => {
    const hideOnScroll = () => {
      setNavbarActive(false);
      setProfileActive(false);
    };
    window.addEventListener('scroll', hideOnScroll);
    return () => window.removeEventListener('scroll', hideOnScroll);
  }, []);

  const renderMessages = messages.map((msg, index) => (
    <div key={index} className="message">
      <span>{msg}</span>
      <i 
        className="fas fa-times" 
        onClick={() => setMessages(prev => prev.filter((_, i) => i !== index))} 
        aria-label="Cerrar"
      />
    </div>
  ));

  return (
    <>
      {renderMessages}
      <style>{`
        /* ESTILOS DE NEWS-SECTION SE MANTIENEN COMO LOS TENÍAS */
        .news-section {
          margin: 20px auto;
          max-width: 800px;
          background: #f9f9f9;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 20px;
          overflow: hidden;
          position: relative;
        }
        .news-container {
          max-height: 200px;
          overflow-y: auto;
          padding: 10px;
        }
        .news-container::-webkit-scrollbar { width: 8px; }
        .news-container::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
        .news-container::-webkit-scrollbar-track { background: rgb(129, 129, 129); }
        .news-card { padding: 10px; border-bottom: 1px solid rgb(204, 204, 204); }
        .news-card:last-child { border-bottom: none; }
        .news-card h3 { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
        .news-card p { font-size: 14px; color: #555; margin-bottom: 10px; }
        .news-card a.btn { font-size: 14px; color: #007bff; text-decoration: none; }
        .news-card a.btn:hover { text-decoration: underline; }

        /* === INICIO: ESTILOS HEADER - FONDO VAPORWAVE MÁS SUTIL === */
        .header {
          background-image: linear-gradient(135deg,
            rgba(251, 243, 255, 0.85) 0%, /* Lavanda suave con opacidad */
            rgba(214, 238, 253, 0.85) 40%, /* Azul cielo claro con opacidad */
            rgba(231, 249, 255, 0.85) 70%, /* Azul pálido/celeste con opacidad */
            rgba(255, 236, 239, 0.85) 100% /* Rosa claro con opacidad */
          );
          padding: 1.5rem 2rem;
          border-bottom: none;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15); /* Sombra más suave */
          position: sticky;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
        }
        .header .flex {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
        }
        /* Estilo general para texto y elementos del header para legibilidad */
        .header .logo,
        .header .navbar a,
        .header .icons i,
        .header .toggles label {
          color: rgb(97, 97, 97); /* Texto blanco */
          /* Sombra muy sutil para ayudar a despegar el texto del fondo si es necesario */
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        }
        .header .logo {
          font-size: 2.5rem;
          font-weight: bold;
          text-transform: uppercase;
        }
        .header .logo span { /* El punto en AMAZING. */
          /* Heredará el color blanco y la sombra. Si quieres un color específico: */
          /* color: rgba(255,255,255,0.8); */ /* Ejemplo: blanco un poco translúcido */
        }
        .header .navbar a {
          font-size: 1.6rem;
          text-transform: capitalize;
          margin: 0 0.5rem;
          transition: color 0.2s ease, opacity 0.2s ease;
        }
        .header .navbar a:hover {
          color: #FFFFFF;
          opacity: 0.8; /* Ligera transparencia al pasar el mouse */
        }
        .header .icons {
          display: flex;
          align-items: center;
          gap: 1.2rem;
        }
        .header .icons i {
          font-size: 1.8rem;
          cursor: pointer;
          transition: color 0.2s ease, opacity 0.2s ease;
        }
        .header .icons i:hover {
          color: #FFFFFF;
          opacity: 0.8;
        }
        /* Contador del carrito y lista de deseos */
        .header .icons a span.cart-count,
      
          color: #333333; /* Texto oscuro para mejor contraste sobre fondo claro */
          background-color: rgba(255,255,255,0.7); /* Fondo blanco semi-transparente */
          border-radius: 10px;
          padding: 0.2em 0.6em;
          font-size: 0.9rem;
          position: relative;
          top: -9px;
          left: -7px;
          font-weight: bold;
          text-shadow: none;
          line-height: 1;
          min-width: 18px;
          text-align: center;
          display: inline-block;
          border: 1px solid rgba(0,0,0,0.1); /* Borde sutil */
        }
        
          display: none;
        }
        .header .profile {
          display: none;
          position: absolute;
          top: 100%;
          right: 2rem;
          background-color: rgba(40, 40, 50, 0.95); /* Un fondo oscuro pero ligeramente translúcido */
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: .5rem;
          box-shadow: 0 .5rem 1rem rgba(0,0,0,.3);
          padding: 1.5rem;
          text-align: center;
          width: 30rem;
          z-index: 1100;
        }
        .header .profile.active {
          display: block;
        }
        .header .profile p {
          color: #E0E0E0;
          margin-bottom: 1rem;
          font-size: 1.6rem;
        }
        .header .profile .btn,
        .header .profile .option-btn,
        .header .profile .delete-btn {
          margin-bottom: .75rem;
        }
        .header .profile .flex-btn {
          display: flex;
          justify-content: space-around;
          gap: 1rem;
          margin-bottom: .75rem;
        }
        .header .profile .flex-btn .option-btn {
          flex: 1;
          margin-bottom: 0;
        }
        .header .profile .delete-btn {
          margin-bottom: 0;
        }
        .header .toggles {
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }
        /* Las etiquetas de los toggles ya tienen color blanco y sombra por la regla general */
        .header .toggles input[type="checkbox"] {
          margin-right: 0.5rem;
          /* Usamos un color de acento más suave para el check del checkbox */
          accent-color: rgb(255, 230, 234); /* Rosa claro del degradado */
          cursor: pointer;
        }
        /* === FIN: ESTILOS HEADER === */

        /* Estilos adicionales para navbar active (asumiendo que ya los tienes, pero agregando compatibilidad) */
        .navbar.active {
          display: block; /* O lo que sea necesario para mobile; ajusta si es necesario */
        }
        .navbar {
          display: flex; /* Para desktop */
        }
        @media (max-width: 768px) {
          .navbar {
            display: none; /* Oculto en mobile por defecto */
          }
          .navbar.active {
            display: flex;
            flex-direction: column; /* Ejemplo para mobile menu */
          }
        }
      `}</style>
      <header className="header">
        <section className="flex">
          <Link to="/" className="logo">AMAZING<span>.</span></Link>

          <nav className={`navbar ${navbarActive ? 'active' : ''}`}>
            <Link to="/">Inicio</Link>
            <Link to="/orders">Pedidos</Link>  {/* CORREGIDO: Ahora va a /orders (minúscula) */}
            <Link to="/shop">Productos</Link>
            
          </nav>

          <div className="icons">
            <div id="menu-btn" className="fas fa-bars" onClick={toggleNavbar} aria-label="Menú" />
            <Link to="/search_page" aria-label="Buscar"><i className="fas fa-search"></i></Link>  {/* YA INTEGRADO: Redirige a SearchPage */}
            <Link to="/cart" aria-label="Carrito">
              <i className="fas fa-shopping-cart"></i>
              {/* <span className="cart-count">({cartCount})</span> */}
            </Link>
            <div id="user-btn" className="fas fa-user" onClick={toggleProfile} aria-label="Perfil" />
          </div>

          <div className={`profile ${profileActive ? 'active' : ''}`}>
            {user ? (
              <>
                <p>Hola, {user.name || 'Usuario'}</p>  {/* Muestra nombre dinámico */}
                <Link to={`/update_user/${user.id}`} className="btn">Actualizar perfil</Link>
                <button className="delete-btn" onClick={handleLogout}>
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <p>¡Por favor inicia sesión o regístrate primero!</p>
                <div className="flex-btn">
                  <Link to="/user_register" className="option-btn">Registrarse</Link>
                  <Link to="/user_login" className="option-btn">Iniciar sesión</Link>
                </div>
              </>
            )}
          </div>

          <div className="toggles">
            <div className="theme-toggle">
              <input type="checkbox" id="toggle-theme" onChange={toggleTheme} checked={theme === 'dark'} />
              <label htmlFor="toggle-theme">Modo Oscuro</label>
            </div>
            <div className="price-toggle">
              <input 
                type="checkbox" 
                id="toggle-price" 
                checked={currency === 'usd'} 
                onChange={(e) => setCurrency(e.target.checked ? 'usd' : 'local')} 
              />
              <label htmlFor="toggle-price">USD</label>
            </div>
          </div>
        </section>
      </header>
    </>
  );
};

export default Header;