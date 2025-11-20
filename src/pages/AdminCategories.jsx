import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';  // Si falla, cambia a axios.get abajo

const AdminCategories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...');  // DEBUG: Inicio
      const token = localStorage.getItem('adminToken');
      console.log('Token exists:', !!token);  // DEBUG: Verifica token

      // FIX: Agrega /auth/ para coincidir con backend (/api/auth/categories)
      const res = await api.get('/auth/categories');
      console.log('Response full:', res);  // DEBUG: Todo el response
      console.log('Response data:', res.data);  // DEBUG: Solo data

      if (res.data.success) {
        console.log('Categories loaded:', res.data.categories);  // DEBUG: Array
        setCategories(res.data.categories || []);
        if (res.data.categories.length === 0) {
          console.warn('No categories found in DB');  // DEBUG: Vacío
        }
      } else {
        console.error('Backend success false:', res.data.message);  // DEBUG
        setCategories([]);
        setMessage('Error al cargar categorías: ' + (res.data.message || 'Desconocido'));
      }
    } catch (err) {
      console.error('Error fetching categories:', err);  // DEBUG: Full error
      console.error('Error response:', err.response?.data);  // DEBUG: Si es HTTP error
      console.error('Status:', err.response?.status);  // DEBUG: 401? 500?
      setCategories([]);
      setMessage('Error al cargar categorías: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage('El nombre de la categoría es obligatorio.');
      return;
    }
    try {
      console.log('Adding category:', { name: name.trim(), description: description.trim() || null, parent_category_id: parentCategoryId || null });  // DEBUG
      setLoading(true);
      // FIX: Agrega /auth/ para coincidir con backend (/api/auth/categories)
      const res = await api.post('/auth/categories', { 
        name: name.trim(), 
        description: description.trim() || null, 
        parent_category_id: parentCategoryId || null 
      });
      console.log('Add response:', res.data);  // DEBUG
      if (res.data.success) {
        setMessage(res.data.message);
        setName(''); setDescription(''); setParentCategoryId('');
        fetchCategories();
      } else {
        setMessage(res.data.message || 'Error al añadir categoría.');
      }
    } catch (err) {
      console.error('Error adding category:', err);  // DEBUG
      setMessage('Error al añadir categoría: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('¿Estás seguro?')) return;
    try {
      console.log('Deleting category ID:', id);  // DEBUG
      setDeletingId(id);
      // FIX: Agrega /auth/ para coincidir con backend (/api/auth/categories/:id)
      const res = await api.delete(`/auth/categories/${id}`);
      console.log('Delete response:', res.data);  // DEBUG
      if (res.data.success) {
        setMessage(res.data.message);
        fetchCategories();
      } else {
        setMessage(res.data.message || 'Error al eliminar categoría.');
      }
    } catch (err) {
      console.error('Error deleting category:', err);  // DEBUG
      setMessage('Error al eliminar categoría: ' + (err.response?.data?.message || err.message));
    } finally {
      setDeletingId(null);
    }
  };

  const token = localStorage.getItem('adminToken');
  if (!token) {
    console.warn('No adminToken, redirecting to login');  // DEBUG
    navigate('/admin/login');
    return null;
  }

  if (loading) return <div className="loading-container">Cargando...</div>;

  return (
    <>
      <style>{`
        .admin-categories {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          min-height: 100vh;
        }

        .heading {
          text-align: center;
          color: #2c3e50;
          font-size: 2.5em;
          margin-bottom: 30px;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }

        .form-container {
          background: white;
          border-radius: 15px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }

        .form-container h3 {
          color: #34495e;
          font-size: 1.8em;
          margin-bottom: 20px;
          border-bottom: 2px solid #3498db;
          padding-bottom: 10px;
        }

        .input-group {
          margin-bottom: 20px;
        }

        .input-box {
          width: 100%;
          padding: 12px 15px;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          box-sizing: border-box;
        }

        .input-box:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }

        .input-box[type="textarea"] {
          min-height: 100px;
          resize: vertical;
        }

        .btn {
          background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
          color: white;
          padding: 12px 30px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          width: 100%;
        }

        .btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(52, 152, 219, 0.4);
        }

        .btn:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
          transform: none;
        }

        .message {
          padding: 10px 15px;
          border-radius: 8px;
          margin: 15px 0;
          font-weight: bold;
          text-align: center;
        }

        .message.success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .message.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .category-list {
          background: white;
          border-radius: 15px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .category-list h3 {
          color: #34495e;
          font-size: 1.8em;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .category-list h3::before {
          content: '📂';
          font-size: 1.2em;
        }

        .styled-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          background: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .styled-table th {
          background: linear-gradient(135deg, #34495e 0%, #2c3e50 100%);
          color: white;
          padding: 15px;
          text-align: left;
          font-weight: 600;
          font-size: 14px;
        }

        .styled-table td {
          padding: 15px;
          border-bottom: 1px solid #eee;
          transition: background-color 0.2s ease;
        }

        .styled-table tr:hover {
          background-color: #f8f9fa;
        }

        .styled-table tr:last-child td {
          border-bottom: none;
        }

        .delete-btn {
          background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
          color: white;
          border: none;
          padding: 8px 15px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .delete-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 3px 10px rgba(231, 76, 60, 0.3);
        }

        .delete-btn:disabled {
          background: #95a5a6;
          cursor: not-allowed;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
          font-size: 1.2em;
          color: #7f8c8d;
        }

        .no-categories {
          text-align: center;
          color: #7f8c8d;
          font-style: italic;
          padding: 40px;
        }

        @media (max-width: 768px) {
          .admin-categories {
            padding: 10px;
          }

          .form-container, .category-list {
            padding: 20px;
          }

          .styled-table {
            font-size: 14px;
          }

          .styled-table th, .styled-table td {
            padding: 10px;
          }
        }
      `}</style>
      <section className="admin-categories">
        <h1 className="heading">Administrar Categorías</h1>
        <form onSubmit={handleAddCategory} className="form-container">
          <h3>Añadir Categoría</h3>
          <div className="input-group">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre de la categoría" required className="input-box" />
          </div>
          <div className="input-group">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción (opcional)" className="input-box" />
          </div>
          <div className="input-group">
            <select value={parentCategoryId} onChange={(e) => setParentCategoryId(e.target.value)} className="input-box">
              <option value="">Categoría raíz (sin padre)</option>
              {categories.filter(cat => !cat.parent_category_id).map(cat => (
                <option key={cat.category_id} value={cat.category_id}>└─ {cat.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Agregando...' : 'Agregar Categoría'}
          </button>
        </form>

        {message && <p className={`message ${message.includes('exitosamente') ? 'success' : 'error'}`}>{message}</p>}

        <div className="category-list">
          <h3>Lista de Categorías ({categories.length} total)</h3>
          {categories.length > 0 ? (
            <table className="styled-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Categoría Padre</th>
                  <th>Fecha de Creación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(category => (
                  <tr key={category.category_id}>
                    <td>{category.category_id}</td>
                    <td><strong>{category.name}</strong></td>
                    <td>{category.description || 'N/A'}</td>
                    <td>{category.parent_category_id ? categories.find(c => c.category_id === category.parent_category_id)?.name || 'N/A' : 'Raíz'}</td>
                    <td>{new Date(category.created_at).toLocaleDateString('es-ES')}</td>
                    <td>
                      <button onClick={() => handleDeleteCategory(category.category_id)} className="delete-btn" disabled={deletingId === category.category_id}>
                        {deletingId === category.category_id ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-categories">
              No hay categorías aún. ¡Crea la primera arriba!
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default AdminCategories;