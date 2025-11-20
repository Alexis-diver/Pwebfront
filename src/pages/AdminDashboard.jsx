import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';  // Temporal: usa axios directo para debug (instala con npm i axios si no lo tienes)
// import api from '../services/api';  // Comenta si falla – usa axios abajo

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    adminName: 'Admin',
    totalPendings: 0,
    totalCompletes: 0,
    numOrders: 0,
    numProducts: 0,
    numUsers: 0,
    numAdmins: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    const fetchStats = async () => {
      try {
        console.log('Intentando fetch stats con token:', token.substring(0, 10) + '...');  // Debug token
        // Temporal: usa axios directo para evitar error de api
        const response = await axios.get('http://localhost:5000/api/auth/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Response de dashboard:', response.data);  // Debug response
        if (response.data.success) {
          setStats({
            ...response.data,
            totalPendings: Number(response.data.totalPendings) || 0,
            totalCompletes: Number(response.data.totalCompletes) || 0
          });
        } else {
          console.log('No success:', response.data.message);  // Debug
          setError('Error en stats: ' + (response.data.message?.[0] || 'Desconocido'));
          localStorage.removeItem('adminToken');
          navigate('/admin/login');
        }
      } catch (err) {
        console.error('Error completo:', err.response || err);  // Debug full error
        setError(err.response?.data?.message?.[0] || 'Error al cargar dashboard. Ver console para detalles.');
        if (err.response?.status === 401) {
          localStorage.removeItem('adminToken');
          navigate('/admin/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  if (loading) return <div>Cargando dashboard...</div>;
  if (error) return <div className="message error">{error}</div>;

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    navigate('/admin/login');
  };

  return (
    <section className="dashboard" style={{ padding: '20px', background: '#f4f4f4' }}>
      <h1 className="heading" style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>AMAZING</h1>
      <div className="box-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div className="box" style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h3 style={{ color: '#007bff', fontSize: '2em', marginBottom: '10px' }}>Bienvenido</h3>
          <p style={{ fontSize: '1.2em', marginBottom: '15px' }}>{stats.adminName}</p>
          <Link to="/admin/categories" style={{ background: '#007bff', color: 'white', padding: '10px 20px', textDecoration: 'none', borderRadius: '4px', display: 'inline-block' }}>Crear categorias</Link>
        </div>

        <div className="box" style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h3 style={{ color: '#007bff', fontSize: '2em', marginBottom: '10px' }}><span>$</span>{Number(stats.totalPendings).toFixed(2)}<span>/-</span></h3>
          <p style={{ fontSize: '1.2em', marginBottom: '15px' }}>Pagos pendientes</p>
          <Link to="/admin/placed_orders" style={{ background: '#007bff', color: 'white', padding: '10px 20px', textDecoration: 'none', borderRadius: '4px', display: 'inline-block' }}>Ver mis pedidos</Link>
        </div>

        <div className="box" style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h3 style={{ color: '#007bff', fontSize: '2em', marginBottom: '10px' }}><span>$</span>{Number(stats.totalCompletes).toFixed(2)}<span>/-</span></h3>
          <p style={{ fontSize: '1.2em', marginBottom: '15px' }}>Pagos completados</p>
          <Link to="/admin/placed_orders" style={{ background: '#007bff', color: 'white', padding: '10px 20px', textDecoration: 'none', borderRadius: '4px', display: 'inline-block' }}>Ver pedidos</Link>
        </div>

        <div className="box" style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h3 style={{ color: '#007bff', fontSize: '2em', marginBottom: '10px' }}>{stats.numOrders}</h3>
          <p style={{ fontSize: '1.2em', marginBottom: '15px' }}>Historial de productos</p>
          <Link to="/admin/placed_orders" style={{ background: '#007bff', color: 'white', padding: '10px 20px', textDecoration: 'none', borderRadius: '4px', display: 'inline-block' }}>Ver mi historial</Link>
        </div>

        <div className="box" style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h3 style={{ color: '#007bff', fontSize: '2em', marginBottom: '10px' }}>{stats.numProducts}</h3>
          <p style={{ fontSize: '1.2em', marginBottom: '15px' }}>Productos</p>
          <Link to="/admin/products" style={{ background: '#007bff', color: 'white', padding: '10px 20px', textDecoration: 'none', borderRadius: '4px', display: 'inline-block' }}>Crear nuevo producto</Link>
        </div>

        <div className="box" style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h3 style={{ color: '#007bff', fontSize: '2em', marginBottom: '10px' }}>{stats.numUsers}</h3>
          <p style={{ fontSize: '1.2em', marginBottom: '15px' }}>Usuarios</p>
          <Link to="/admin/users_accounts" style={{ background: '#007bff', color: 'white', padding: '10px 20px', textDecoration: 'none', borderRadius: '4px', display: 'inline-block' }}>Ver Usuarios</Link>
        </div>

        <div className="box" style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h3 style={{ color: '#007bff', fontSize: '2em', marginBottom: '10px' }}>{stats.numAdmins}</h3>
          <p style={{ fontSize: '1.2em', marginBottom: '15px' }}>Admins</p>
          <Link to="/admin/admin_accounts" style={{ background: '#007bff', color: 'white', padding: '10px 20px', textDecoration: 'none', borderRadius: '4px', display: 'inline-block' }}>Ver admins</Link>
        </div>
      </div>

      {/* Logout */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button onClick={handleLogout} style={{ background: '#007bff', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
      </div>
    </section>
  );
};

export default AdminDashboard;