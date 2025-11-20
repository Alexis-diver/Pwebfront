// src/pages/AdminAccounts.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Usa api pa' auto-headers

const AdminAccounts = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); // FIX: Para mostrar error sin rebote
  const [success, setSuccess] = useState(''); // Para mensaje de éxito al agregar
  const navigate = useNavigate();

  const currentAdminId = localStorage.getItem('adminId'); // Para check self-delete

  // Estados para el formulario inline
  const [newAdmin, setNewAdmin] = useState({ name: '', pass: '', cpass: '' });

  const fetchAdmins = useCallback(async () => {
    try {
      console.log('🔍 Fetch admins iniciado...'); // DEBUG
      const token = localStorage.getItem('adminToken');
      console.log('Token en fetch:', token ? 'Presente' : 'AUSENTE — falla aquí'); // DEBUG clave
      const response = await api.get('/auth/admin/admins');
      console.log('✅ Response admins:', response.data); // DEBUG response
      console.log('Admins length:', response.data.admins?.length || 0);
      if (response.data.success) {
        setAdmins(response.data.admins);
        setError(''); // Limpia error si OK
      } else {
        throw new Error(response.data.message?.[0] || 'Error en fetch');
      }
    } catch (error) {
      console.error('❌ Error fetching admins:', error); // DEBUG full error
      console.log('Status:', error.response?.status); // 401? Token malo
      console.log('Data error:', error.response?.data); // Detalle backend
      // FIX: NO remuevas token aquí —deja interceptor manejar 401 global
      // if (error.response?.status === 401) { // COMENTADO: No rebote auto
      //   localStorage.removeItem('adminToken');
      //   localStorage.removeItem('adminId');
      //   navigate('/admin/login');
      // }
      setError('Error al cargar admins: ' + (error.response?.data?.message?.[0] || 'Inténtalo de nuevo')); // Muestra error sin rebote
    } finally {
      setLoading(false);
      console.log('Fetch admins terminado.'); // DEBUG
    }
  }, []); // FIX: Deps vacío —'navigate' es stable y no cambia, ESLint callado

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('¿Eliminar esta cuenta?')) return;
    if (id === parseInt(currentAdminId)) {
      alert('¡No puedes eliminar tu propia cuenta!');
      return;
    }
    try {
      console.log('Borrando admin ID:', id); // DEBUG
      await api.delete(`/auth/admin/admins/${id}`);
      fetchAdmins();
      alert('¡Admin eliminado exitosamente!');
    } catch (error) {
      console.error('Error deleting admin:', error);
      alert('Error al eliminar: ' + (error.response?.data?.message?.[0] || 'Desconocido'));
    }
  }, [fetchAdmins, currentAdminId]);

  // Handler para agregar nuevo admin inline
  const handleAddAdmin = useCallback(async (e) => {
    e.preventDefault();
    const { name, pass, cpass } = newAdmin;

    if (!name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    if (pass.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (pass !== cpass) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      console.log('Agregando nuevo admin:', name); // DEBUG
      const response = await api.post('/auth/admin/admins', { name, pass, cpass });
      console.log('✅ Response add admin:', response.data); // DEBUG
      if (response.data.success) {
        setSuccess('¡Nuevo admin agregado exitosamente!');
        setNewAdmin({ name: '', pass: '', cpass: '' }); // Limpia form
        setError(''); // Limpia error
        fetchAdmins(); // Refetch lista
      } else {
        throw new Error(response.data.message?.[0] || 'Error al agregar');
      }
    } catch (error) {
      console.error('❌ Error adding admin:', error); // DEBUG
      setError('Error al agregar admin: ' + (error.response?.data?.message?.[0] || 'Inténtalo de nuevo'));
      setSuccess(''); // Limpia éxito si falla
    }
  }, [newAdmin, fetchAdmins]);

  // Update form state
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAdmin(prev => ({ ...prev, [name]: value }));
    if (error) setError(''); // Limpia error al tipear
  };

  useEffect(() => {
    console.log('🛡️ useEffect AdminAccounts: Chequeando token...'); // DEBUG
    const token = localStorage.getItem('adminToken');
    console.log('Token en useEffect:', token ? 'Presente' : 'AUSENTE — rebota a login'); // DEBUG clave
    if (!token || !currentAdminId) {
      console.log('🚫 Token o adminId faltan — navegando a login'); // DEBUG
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminId');
      navigate('/admin/login');
      return;
    }
    console.log('✅ Token OK — cargando admins'); // DEBUG
    fetchAdmins();
  }, [fetchAdmins, navigate, currentAdminId]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando admins...</div>;
  }

  return (
    <section className="accounts" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 className="heading" style={{ textAlign: 'center', fontSize: '2.5rem', color: '#333', marginBottom: '2rem' }}>Cuentas admins</h1>
      {error && <p style={{ textAlign: 'center', color: 'red', padding: '1rem' }}>{error}</p>}
      {success && <p style={{ textAlign: 'center', color: 'green', padding: '1rem' }}>{success}</p>}
      <div className="box-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Box para agregar nuevo — ahora con formulario inline */}
        <div className="box" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', borderLeft: '4px solid #28a745' }}>
          <p style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Agrega un nuevo admin</p>
          <form onSubmit={handleAddAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="text"
              name="name"
              placeholder="Nombre"
              value={newAdmin.name}
              onChange={handleInputChange}
              required
              style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem' }}
            />
            <input
              type="password"
              name="pass"
              placeholder="Contraseña"
              value={newAdmin.pass}
              onChange={handleInputChange}
              required
              minLength="8"
              style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem' }}
            />
            <input
              type="password"
              name="cpass"
              placeholder="Confirmar contraseña"
              value={newAdmin.cpass}
              onChange={handleInputChange}
              required
              style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem' }}
            />
            <button
              type="submit"
              className="option-btn"
              style={{
                background: '#28a745', color: 'white', padding: '0.5rem 1rem', textDecoration: 'none', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '1rem', alignSelf: 'flex-start'
              }}
            >
              Agregar admin
            </button>
          </form>
        </div>
        {admins.length > 0 ? (
          admins.map((admin) => (
            <div key={admin.id} className="box" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', borderLeft: '4px solid #007bff' }}>
              <p style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
                admin id: <span style={{ fontWeight: 'bold', color: '#007bff' }}>{admin.id}</span>
              </p>
              <p style={{ fontSize: '1.1rem' }}>
                Nombre: <span style={{ fontWeight: 'bold', color: '#007bff' }}>{admin.name}</span>
              </p>
              <div className="flex-btn" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  onClick={() => handleDelete(admin.id)}
                  className="delete-btn"
                  style={{
                    background: '#dc3545', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', textDecoration: 'none', display: 'inline-block'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#c82333'}
                  onMouseOut={(e) => e.target.style.background = '#dc3545'}
                >
                  delete
                </button>
                {parseInt(admin.id) === parseInt(currentAdminId) && (
                  <button
                    onClick={() => navigate('/admin/update_profile')}
                    className="option-btn"
                    style={{
                      background: '#007bff', color: 'white', padding: '0.5rem 1rem', textDecoration: 'none', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '1rem', display: 'inline-block'
                    }}
                  >
                    update
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: 'center', fontSize: '1.2rem', color: '#666', gridColumn: '1 / -1', padding: '2rem' }}>no accounts available!</p>
        )}
      </div>
    </section>
  );
};

export default AdminAccounts;