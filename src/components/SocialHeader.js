import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';  // Para enlaces internos
import api from '../services/api';  // Para fetch profile


const SocialHeader = () => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);  // Para mensajes
  const [profileActive, setProfileActive] = useState(false);
  const [navbarActive, setNavbarActive] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Fetch user profile (equivalente a tu query SELECT * FROM users)
      api.get('/header/profile')  // Usa el endpoint del header anterior
        .then(res => {
          if (res.data.success) setUser(res.data.user);
        })
        .catch(err => console.error('Error profile:', err));
    }
  }, []);

  const handleLogout = () => {
    if (window.confirm('¿Cerrar sesión del sitio web?')) {  // Confirm de tu PHP
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setProfileActive(false);
      window.location.href = '/';  // Redirige a home
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

  // Hide on scroll
  useEffect(() => {
    const hideOnScroll = () => {
      setNavbarActive(false);
      setProfileActive(false);
    };
    window.addEventListener('scroll', hideOnScroll);
    return () => window.removeEventListener('scroll', hideOnScroll);
  }, []);

  // Función para agregar mensajes
  const addMessage = (msg) => {
    setMessages(prev => [...prev, msg]);
  };

  // Limpia mensajes después de 5s
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => setMessages([]), 5000);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  return (
    <>
      {/* Mensajes (loop de tu PHP) */}
      {messages.map((msg, index) => (
        <div key={index} className="message">
          <span>{msg}</span>
          <i className="fas fa-times" onClick={() => setMessages(prev => prev.filter((_, i) => i !== index))} aria-label="Cerrar mensaje"></i>
        </div>
      ))}

      <header className="header">
        <section className="flex">
          {/* Logo */}
          <Link to="/homeSocial" className="logo">SOCIAL<span>.</span></Link>

          {/* Social Navigation */}
          <nav className={`navbar ${navbarActive ? 'active' : ''}`}>
            <Link to="/homeSocial">Inicio</Link>
            <Link to="/new_post">Publicar</Link>
            <Link to="/messages">Mensajes</Link>
            <Link to="/my_posts">Mis publicaciones</Link>
            <Link to="/">Tienda</Link>
          </nav>

          {/* Icons Section */}
          <div className="icons">
            <div id="menu-btn" className="fas fa-bars" onClick={toggleNavbar} aria-label="Menú móvil"></div>
            <Link to="/search_social" aria-label="Buscar"><i className="fas fa-search"></i></Link>
            <div id="user-btn" className="fas fa-user" onClick={toggleProfile} aria-label="Perfil de usuario"></div>
          </div>

          {/* Profile Info */}
          <div className={`profile ${profileActive ? 'active' : ''}`}>
            {user ? (
              <div>
                <p>Hola, {user.name}</p>  // De tu query $fetch_profile["name"]
                <Link to="/update_user" className="btn">Actualizar perfil</Link>
                <Link to="/logout" className="delete-btn" onClick={handleLogout}>Cerrar sesión</Link>  // Con confirm en handleLogout
              </div>
            ) : null}  // Si no hay user, no muestra (o agrega login link si quieres)
          </div>
        </section>
      </header>
    </>
  );
};

export default SocialHeader;