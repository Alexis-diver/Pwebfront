import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';  // useNavigate para redirects
import api from '../services/api';
import '../assets/css/style.css';  // Tu CSS (form-container, box)

const UserProfile = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState([]);  // Para éxito/error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);  // Toggle edit/read-only
  const navigate = useNavigate();

  // Fetch user data al cargar (usa token para current user, no ID público)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/user_login');  // Redirige si no hay sesión
          return;
        }

        const res = await api.get('/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },  // Envía token
        });

        if (res.data.success && res.data.user) {
          setName(res.data.user.name);
          setEmail(res.data.user.email);
        } else {
          setError(res.data.message || 'Error al cargar perfil');
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Error al cargar perfil. Verifica tu sesión.');
        setTimeout(() => navigate('/user_login'), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  // Manejo de submit para actualizar
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = [];

    // Validaciones
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      errors.push('¡El nombre solo puede contener letras y espacios!');
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      errors.push('¡Formato de email inválido!');
    }

    if (errors.length > 0) {
      setMessage(errors);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await api.put('/auth/update', { name, email }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setMessage([res.data.message || '¡Perfil actualizado!']);
        setIsEditing(false);  // Vuelve a read-only
        localStorage.setItem('user', JSON.stringify({ name, email }));  // Actualiza header
      } else {
        setMessage(res.data.message || ['Error al actualizar.']);
      }
    } catch (err) {
      console.error('Error updating:', err);
      const errorMsg = err.response?.data?.message || ['Error al actualizar.'];
      setMessage(Array.isArray(errorMsg) ? errorMsg : [errorMsg]);
    }
  };

  // Limpia mensajes
  useEffect(() => {
    if (message.length > 0) {
      const timer = setTimeout(() => setMessage([]), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (loading) return <div className="loading">Cargando perfil...</div>;
  if (error) return <div className="message error">{error}</div>;

  return (
    <section className="form-container">
      <form onSubmit={handleSubmit}>
        <h3>Perfil</h3>
        <input
          type="text"
          name="name"
          required
          placeholder="Nombre"
          maxLength="50"
          className="box"
          value={name}
          onChange={(e) => setName(e.target.value.replace(/\s{2,}/g, ' ').trim())}
          readOnly={!isEditing}  // Read-only si no editando
        />
        <input
          type="email"
          name="email"
          required
          placeholder="Email"
          maxLength="50"
          className="box"
          value={email}
          onChange={(e) => setEmail(e.target.value.replace(/\s/g, ''))}
          readOnly={!isEditing}
        />
        {isEditing ? (
          <>
            <input type="submit" value="Guardar Cambios" className="btn" />
            <button type="button" onClick={() => setIsEditing(false)} className="btn">Cancelar</button>
          </>
        ) : (
          <button type="button" onClick={() => setIsEditing(true)} className="btn">Editar Perfil</button>
        )}
        {message.length > 0 && (
          <div className="message">
            {message.map((msg, index) => (
              <p key={index}>{msg}</p>
            ))}
          </div>
        )}
      </form>
      <p>¿Quieres cerrar sesión?</p>
      <Link to="/" className="option-btn" onClick={() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('user_id');
        navigate('/');
      }}>Cerrar Sesión</Link>
    </section>
  );
};

export default UserProfile;