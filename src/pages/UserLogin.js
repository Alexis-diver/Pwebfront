import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';  // Asumiendo que tienes este servicio configurado para tu backend Node.js

const UserLogin = () => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [message, setMessage] = useState([]);  // Array para errores o mensajes
  const navigate = useNavigate();

  // Validación simple del formulario (opcional, ya que el backend también valida)
  const validateForm = () => {
    const errors = [];

    // Email formato básico
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      errors.push('¡Formato de correo electrónico inválido!');
    }

    // Password longitud mínima
    if (pass.length < 8) {
      errors.push('¡La contraseña debe tener al menos 8 caracteres!');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (errors.length > 0) {
      setMessage(errors);
      return;
    }

    // Envía datos al backend (Node.js endpoint /auth/login)
    // Nota: Envía pass en plano; el backend debe manejar hashing (ej. bcrypt) y JWT
    try {
      const res = await api.post('/auth/login', { email, pass });
      if (res.data.success) {
        // Almacena token y user en localStorage (ajusta según tu backend)
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setMessage([res.data.message || '¡Inicio de sesión exitoso!']);
        
        // OPCIÓN A: Emite evento global para notificar a Header (actualiza UI automáticamente)
        window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: res.data.user }));
        
        setTimeout(() => navigate('/'), 2000);  // Redirige a home después de 2s
      }
    } catch (err) {
      // Maneja errores del backend (ajusta según tu respuesta de error)
      const errorMsg = err.response?.data?.message || '¡Correo o contraseña incorrectos!';
      setMessage(Array.isArray(errorMsg) ? errorMsg : [errorMsg]);
    }
  };

  // Limpia mensajes después de 5s (opcional para UX)
  useEffect(() => {
    if (message.length > 0) {
      const timer = setTimeout(() => setMessage([]), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <section className="form-container">
      <form action="" method="post" onSubmit={handleSubmit}>
        <h1>Debes crear una cuenta primero</h1>
        <h3>Inicia sesion</h3>
        <input
          type="email"
          name="email"
          required
          placeholder="Ingresa tu correo"
          maxLength="50"
          className="box"
          value={email}
          onChange={(e) => setEmail(e.target.value.replace(/\s/g, ''))}  // Remueve espacios
        />
        <input
          type="password"
          name="pass"
          required
          placeholder="Ingresa tu contrasna"
          maxLength="20"
          className="box"
          value={pass}
          onChange={(e) => setPass(e.target.value.replace(/\s/g, ''))}  // Remueve espacios
        />
        <input type="submit" value="Inicia sesion" className="btn" name="submit" />
        {message.length > 0 && (
          <div className="message">
            {message.map((msg, index) => (
              <p key={index}>{msg}</p>
            ))}
          </div>
        )}
        <p>No tines una cuenta?</p>
        <Link to="/user_register" className="option-btn">Crear cuenta</Link>  {/* Corregido: ruta consistente */}
      </form>
    </section>
  );
};

export default UserLogin;