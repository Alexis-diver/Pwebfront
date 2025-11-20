import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';  // FIX: Usa api pa' auto-headers y refresh

const LoginAdmin = () => {
  const [name, setName] = useState('');
  const [pass, setPass] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Sanitizar (similar a backend: quita espacios y chars no alfanuméricos)
    const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '').trim();
    const sanitizedPass = pass; // No sanitizamos pass en frontend, backend lo hashea

    try {
      console.log('🔐 Logueando admin:', sanitizedName);  // DEBUG
      // FIX: Usa api.post pa' interceptor (auto Authorization si hay token viejo)
      const response = await api.post('/auth/admin/login', {
        name: sanitizedName,
        pass: sanitizedPass
      });
      console.log('✅ Response login admin:', response.data);  // DEBUG —checa si tiene admin_id y token

      if (response.data.success && response.data.token) {
        // FIX: Guarda token, adminId y admin (compatible con tu backend)
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminId', response.data.admin_id);  // ¡CRUCIAL: Para verifyAdmin y self-delete check!
        localStorage.setItem('admin', JSON.stringify(response.data.admin));
        
        console.log('💾 Token, adminId y admin guardados OK');  // DEBUG
        navigate('/admin/dashboard'); // Redirige al dashboard
      } else {
        setMessage('Respuesta inesperada del servidor');
      }
    } catch (error) {
      console.error('❌ Error login admin:', error.response?.data);  // DEBUG
      // Maneja mensaje de error como array (estilo de tu backend)
      const errorMsg = error.response?.data?.message;
      setMessage(Array.isArray(errorMsg) ? errorMsg[0] : (errorMsg || 'Error en login'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="form-container">
      <form onSubmit={handleSubmit}>
        <h3>Login Admin</h3>
        <p>Default: username <span>alex</span> & password <span>222</span></p>
        <input
          type="text"
          placeholder="Enter your username"
          maxLength={20}
          value={name}
          onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
          required
          className="box"
        />
        <input
          type="password"
          placeholder="Enter your password"
          maxLength={20}
          value={pass}
          onChange={(e) => setPass(e.target.value.replace(/\s/g, ''))} // Solo quita espacios para pass
          required
          className="box"
        />
        <input type="submit" value={loading ? 'Ingresando...' : 'Login Now'} className="btn" disabled={loading} />
      </form>
      {message && (
        <div className="message">
          <span>{message}</span>
          <i className="fas fa-times" onClick={() => setMessage('')}></i>
        </div>
      )}
      {/* Nota: <style jsx> es para Next.js; para Vite/CRA, importa tu CSS */}
      <style>{`
        /* Estilos básicos, mueve a admin_style.css e importa arriba */
        .form-container { max-width: 400px; margin: 100px auto; padding: 20px; }
        .box { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; }
        .btn { width: 100%; padding: 10px; background: #007bff; color: white; border: none; cursor: pointer; }
        .message { background: #f8d7da; color: #721c24; padding: 10px; margin: 10px 0; border-radius: 4px; }
      `}</style>
    </section>
  );
};

export default LoginAdmin;