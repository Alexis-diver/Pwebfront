        import React, { useState, useEffect } from 'react';
        import { useParams, useNavigate } from 'react-router-dom';
        import api from '../services/api';  // Tu axios instance para backend

        const UpdateUser = () => {
        const { id } = useParams();  // Captura el ID de la URL: /update_user/:id
        const navigate = useNavigate();
        const [user, setUser] = useState({ name: '', email: '' });
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState('');
        const [success, setSuccess] = useState('');

        // Fetch perfil del usuario al cargar
        useEffect(() => {
            const token = localStorage.getItem('token');
            if (!token) {
            navigate('/user_login');  // Redirige si no está logueado
            return;
            }

            api.get(`/auth/profile/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
            })
            .then(res => {
                console.log('Respuesta fetch profile:', res.data);  // DEBUG: Mira en consola del navegador
                if (res.data.success) {
                setUser({ name: res.data.user.name || '', email: res.data.user.email || '' });
                } else {
                setError(res.data.message || 'Error al cargar perfil');
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Error completo fetch profile:', err.response?.data || err);  // DEBUG: Detalle del error
                setError('Error al cargar perfil: ' + (err.response?.data?.message || err.message));
                setLoading(false);
            });
        }, [id, navigate]);

        // Handle submit: Actualiza perfil (CORREGIDO: endpoint /update)
        const handleSubmit = async (e) => {
            e.preventDefault();
            const token = localStorage.getItem('token');
            if (!token) {
            setError('No hay token: inicia sesión de nuevo');
            return;
            }

            try {
            console.log('Enviando update con datos:', user);  // DEBUG: Qué se envía
            const res = await api.put('/auth/update', user, {  // CAMBIO: /auth/update
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log('Respuesta update:', res.data);  // DEBUG
            if (res.data.success) {
                setSuccess(res.data.message || 'Perfil actualizado exitosamente');
                setError('');
                // Actualiza localStorage y user en Header (opcional, para sync)
                localStorage.setItem('user', JSON.stringify({ ...user, id: parseInt(id) }));
                // Redirige después de 2s
                setTimeout(() => navigate('/'), 2000);
            } else {
                setError(res.data.message || 'Error al actualizar');
            }
            } catch (err) {
            console.error('Error completo update:', err.response?.data || err);  // DEBUG: Detalle
            setError('Error al actualizar perfil: ' + (err.response?.data?.message || err.message || 'Revisa consola'));
            }
        };

        if (loading) return <div className="loading">Cargando perfil...</div>;

        return (
            <section className="form-container">
            <style>{`
                .form-container {
                max-width: 500px;
                margin: 50px auto;
                padding: 30px;
                background: #fff;
                border-radius: 10px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }
                .form-container h3 {
                text-align: center;
                margin-bottom: 20px;
                color: #333;
                font-size: 2rem;
                }
                .box {
                width: 100%;
                padding: 12px;
                margin-bottom: 15px;
                border: 1px solid #ddd;
                border-radius: 5px;
                font-size: 1rem;
                box-sizing: border-box;
                }
                .box:focus {
                outline: none;
                border-color: #007bff;
                box-shadow: 0 0 5px rgba(0,123,255,0.3);
                }
                .btn {
                width: 100%;
                padding: 12px;
                background: #007bff;
                color: #fff;
                border: none;
                border-radius: 5px;
                font-size: 1rem;
                cursor: pointer;
                transition: background 0.3s;
                }
                .btn:hover {
                background: #0056b3;
                }
                .error { color: #dc3545; text-align: center; margin: 10px 0; }
                .success { color: #28a745; text-align: center; margin: 10px 0; }
                .loading { text-align: center; padding: 50px; font-size: 1.2rem; }
            `}</style>
            <form onSubmit={handleSubmit}>
                <h3>Perfil</h3>
                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}
                <input
                type="text"
                name="name"
                required
                placeholder="Ingresa tu nombre"
                maxLength="50"
                className="box"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                />
                <input
                type="email"
                name="email"
                required
                placeholder="Ingresa tu email"
                maxLength="50"
                className="box"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                />
                <button type="submit" className="btn">Actualizar Perfil</button>
            </form>
            </section>
        );
        };

        export default UpdateUser;