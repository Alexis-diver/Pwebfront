import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const UserRegister = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [cpass, setCpass] = useState('');
  const [message, setMessage] = useState([]);  // Array para errores
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = [];

    // Nombre solo letras y espacios
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      errors.push('¡El nombre de usuario solo puede contener letras y espacios!');
    }

    // Email formato y dominios
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      errors.push('¡Formato de correo electrónico inválido!');
    } else {
      const allowedDomains = ['hotmail.com', 'gmail.com', 'outlook.com'];
      const emailDomain = email.split('@')[1];
      if (!allowedDomains.includes(emailDomain)) {
        errors.push('¡El correo electrónico debe ser de los dominios hotmail, gmail u outlook!');
      }
    }

    // Password validaciones
    if (pass.length < 8) {
      errors.push('¡La contraseña debe tener al menos 8 caracteres!');
    }
    if (!/[A-Z]/.test(pass)) {
      errors.push('¡La contraseña debe tener al menos una mayúscula!');
    }
    if (!/[a-z]/.test(pass)) {
      errors.push('¡La contraseña debe tener al menos una minúscula!');
    }
    if (!/[0-9]/.test(pass)) {
      errors.push('¡La contraseña debe tener al menos un número!');
    }
    if (!/[!@#$%^&*()_+{}[\]|\\:;"'<>,.?/~`]/.test(pass)) {
      errors.push('¡La contraseña debe tener al menos un carácter especial!');
    }

    if (pass !== cpass) {
      errors.push('¡Las contraseñas no coinciden!');
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

    try {
      console.log('Enviando registro...');  // Debug: ve en consola
      const res = await api.post('/auth/register', { name, email, pass, cpass });
      
      // Verifica si res existe antes de leer data
      if (!res || !res.data) {
        throw new Error('Respuesta inválida del servidor');
      }
      
      if (res.data.success) {
        setMessage([res.data.message || '¡Registro exitoso! Redirigiendo...']);
        setTimeout(() => navigate('/user_login'), 2000);  // Redirect a login
      } else {
        setMessage(res.data.message || ['Error desconocido en registro']);
      }
    } catch (err) {
      console.error('Error en registro:', err);  // Debug: ve detalles en consola
      let errorMsg = ['Error en registro'];
      
      // Manejo robusto de errores
      if (err.response) {
        // Error del servidor (4xx/5xx)
        errorMsg = err.response.data?.message || [err.response.statusText];
      } else if (err.request) {
        // Error de red (backend no accesible)
        errorMsg = ['No se pudo conectar al servidor. Verifica que esté corriendo.'];
      } else {
        // Error en el código
        errorMsg = [err.message];
      }
      
      setMessage(Array.isArray(errorMsg) ? errorMsg : [errorMsg]);
    }
  };

  // Limpia mensajes después de 5s (opcional)
  useEffect(() => {
    if (message.length > 0) {
      const timer = setTimeout(() => setMessage([]), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <section className="form-container">
      <form action="" method="post" onSubmit={handleSubmit}>
        <h3>regístrate ahora</h3>
        <input
          type="text"
          name="name"
          required
          placeholder="ingresa tu nombre de usuario"
          maxLength="20"
          className="box"
          value={name}
          onChange={(e) => setName(e.target.value.replace(/\s{2,}/g, ' ').trim())}  // Sanitize espacios
        />
        <input
          type="email"
          name="email"
          required
          placeholder="ingresa tu email"
          maxLength="50"
          className="box"
          value={email}
          onChange={(e) => setEmail(e.target.value.replace(/\s/g, ''))}
        />
        <input
          type="password"
          name="pass"
          required
          placeholder="ingresa tu contraseña"
          maxLength="20"
          className="box"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />
        <input
          type="password"
          name="cpass"
          required
          placeholder="confirma tu contraseña"
          maxLength="20"
          className="box"
          value={cpass}
          onChange={(e) => setCpass(e.target.value)}
        />
        <input type="submit" value="regístrate ahora" className="btn" name="submit" />
        {message.length > 0 && (
          <div className="message">
            {message.map((msg, index) => (
              <p key={index}>{msg}</p>
            ))}
          </div>
        )}
        <p>¿ya tienes una cuenta?</p>
        <Link to="/user_login" className="option-btn">inicia sesión ahora</Link>
      </form>
    </section>
  );
};

export default UserRegister;