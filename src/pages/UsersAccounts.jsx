// src/pages/UsersAccounts.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';  // Path correcto —desde pages/ a services/

const UsersAccounts = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUsers = useCallback(async () => {  // Sin token param —api lo maneja auto
    try {
      console.log('Fetching users...');  // Debug: Verás esto en console del browser
      console.log('Token usado:', localStorage.getItem('adminToken') ? 'Presente (válido)' : 'Ausente');  // NUEVO: Chequea token
      const response = await api.get('/auth/admin/users');  // Usa api.get (interceptor agrega header)
      console.log('Response users:', response.data);  // Debug: Mira esto en console
      console.log('Users array length:', response.data.users?.length || 0);  // NUEVO: Longitud exacta
      if (response.data.users && response.data.users.length === 0) {
        console.log('AVISO: Array vacío — checa logs del server o DB');  // NUEVO: Alerta específica
      }
      if (response.data.success) {
        setUsers(response.data.users);
      } else {
        throw new Error(response.data.message?.[0] || 'Error en fetch');
      }
    } catch (error) {
      console.error('Error fetching users:', error);  // Debug: Si hay error, lo ves aquí
      console.log('Error status:', error.response?.status);  // NUEVO: Código de error
      console.log('Error data:', error.response?.data);  // NUEVO: Detalle del backend
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);  // Incluye 'navigate' pa' ESLint (se usa en catch)

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('¿Eliminar esta cuenta? ¡La información relacionada del usuario también se eliminará!')) {
      return;
    }
    try {
      await api.delete(`/auth/admin/users/${id}`);  // Usa api.delete (auto header)
      fetchUsers();  // Refresh auto
      alert('¡Usuario eliminado exitosamente!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error al eliminar: ' + (error.response?.data?.message?.[0] || 'Desconocido'));
    }
  }, [fetchUsers]);  // FIX: Solo 'fetchUsers' —'navigate' no se usa aquí, ESLint feliz

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    console.log('useEffect: Token al inicio:', token ? 'Presente' : 'Ausente');  // NUEVO: Chequea al cargar
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetchUsers();
  }, [fetchUsers, navigate]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem', fontSize: '1.2rem' }}>Cargando usuarios...</div>;
  }

  return (
    <section className="accounts" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 className="heading" style={{ textAlign: 'center', fontSize: '2.5rem', color: '#333', marginBottom: '2rem' }}>Cuentas</h1>
      <div className="box-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {users.length > 0 ? (
          users.map((user) => (
            <div key={user.id} className="box" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', borderLeft: '4px solid #007bff' }}>
              <p style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
                id usuario: <span style={{ fontWeight: 'bold', color: '#007bff' }}>{user.id}</span>
              </p>
              <p style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
                Nombre: <span style={{ fontWeight: 'bold', color: '#007bff' }}>{user.name}</span>
              </p>
              <p style={{ fontSize: '1.1rem' }}>
                Email: <span style={{ fontWeight: 'bold', color: '#007bff' }}>{user.email}</span>
              </p>
              <button
                onClick={() => handleDelete(user.id)}
                className="delete-btn"
                style={{ 
                  background: '#dc3545', 
                  color: 'white', 
                  border: 'none', 
                  padding: '0.5rem 1rem', 
                  borderRadius: '4px', 
                  cursor: 'pointer', 
                  fontSize: '1rem',
                  marginTop: '1rem'
                }}
                onMouseOver={(e) => e.target.style.background = '#c82333'}
                onMouseOut={(e) => e.target.style.background = '#dc3545'}
              >
                Eliminar
              </button>
            </div>
          ))
        ) : (
          <p style={{ textAlign: 'center', fontSize: '1.2rem', color: '#666', gridColumn: '1 / -1', padding: '2rem' }}>¡No hay cuentas disponibles!</p>
        )}
      </div>
    </section>
  );
};

export default UsersAccounts;