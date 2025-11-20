import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:5000/api';

const PlacedOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const navigate = useNavigate();
  const adminToken = localStorage.getItem('adminToken');

  const fetchOrders = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/auth/admin/orders`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        setMessage('Error en respuesta del servidor');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
      setMessage(error.response?.data?.message?.[0] || 'Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  }, [adminToken, navigate]);

  useEffect(() => {
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }
    fetchOrders();
  }, [adminToken, navigate, fetchOrders]);

  const handleUpdatePayment = async (orderId, newStatus) => {
    if (newStatus === orders.find(o => o.id === orderId)?.payment_status) {
      setMessage('No hay cambios');
      return;
    }
    setUpdatingOrderId(orderId);
    setMessage('');
    try {
      const response = await axios.put(
        `${API_BASE}/auth/admin/orders/${orderId}`,
        { payment_status: newStatus },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      if (response.data.success) {
        setMessage(response.data.message);
        fetchOrders();
      } else {
        setMessage('Error en respuesta del servidor');
      }
    } catch (error) {
      console.error('Error updating:', error);
      setMessage(error.response?.data?.message?.[0] || 'Error al actualizar');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm('¿Eliminar esta orden?')) return;
    try {
      const response = await axios.delete(`${API_BASE}/auth/admin/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (response.data.success) {
        setMessage(response.data.message);
        fetchOrders();
      } else {
        setMessage('Error en respuesta del servidor');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      setMessage(error.response?.data?.message?.[0] || 'Error al eliminar');
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (loading) return <div className="loading">Cargando órdenes...</div>;

  return (
    <section className="orders">
      <div className="heading">
        <h1>Todas las Órdenes</h1>
        {message && <p><span className={`message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</span></p>}
      </div>
      <div className="box-container">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div key={order.id} className="box">
              <p>
                placed on: <span>{new Date(order.placed_on).toLocaleDateString('es-ES')}</span>
              </p>
              <p>
                name: <span>{order.name}</span>
              </p>
              <p>
                number: <span>{order.number}</span>
              </p>
              <p>
                email: <span>{order.email}</span>
              </p>
              <p>
                address: <span>{order.address}</span>
              </p>
              <p>
                total products: <span>{order.total_products}</span>
              </p>
              <p>
                total price: <span>${order.total_price}/-</span>
              </p>
              <p>
                payment method: <span>{order.method}</span>
              </p>
              <p>
                payment status: <span className={`status ${order.payment_status}`}>{order.payment_status === 'pending' ? 'Pendiente' : 'Completado'}</span>
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const select = e.target.querySelector('select');
                  handleUpdatePayment(order.id, select.value);
                }}
              >
                <input type="hidden" name="order_id" value={order.id} />
                <select
                  name="payment_status"
                  className="select"
                  defaultValue={order.payment_status}
                  disabled={updatingOrderId === order.id}
                >
                  <option value="" disabled>Seleccionar estado</option>
                  <option value="pending">Pendiente</option>
                  <option value="completed">Completado</option>
                </select>
                <div className="flex-btn">
                  <button
                    type="submit"
                    className="option-btn"
                    disabled={updatingOrderId === order.id}
                  >
                    {updatingOrderId === order.id ? 'Actualizando...' : 'Actualizar'}
                  </button>
                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() => handleDelete(order.id)}
                  >
                    Borrar
                  </button>
                </div>
              </form>
            </div>
          ))
        ) : (
          <p className="empty">No hay órdenes en el sistema aún.</p>
        )}
      </div>
      <style jsx>{`
        .orders {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .heading h1 {
          text-align: center;
          color: #333;
          margin-bottom: 1rem;
        }
        .message {
          display: block;
          padding: 0.5rem;
          border-radius: 4px;
          text-align: center;
          margin-bottom: 1rem;
        }
        .message.success {
          background: #d4edda;
          color: #155724;
        }
        .message.error {
          background: #f8d7da;
          color: #721c24;
        }
        .box-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        .box {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          border: 1px solid #ddd;
        }
        .box p {
          margin: 0.5rem 0;
          font-size: 0.95rem;
        }
        .box span {
          font-weight: bold;
          color: #555;
        }
        .status {
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-weight: bold;
        }
        .status.pending {
          background: #fff3cd;
          color: #856404;
        }
        .status.completed {
          background: #d1ecf1;
          color: #0c5460;
        }
        .select {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 1rem;
        }
        .flex-btn {
          display: flex;
          gap: 0.5rem;
          justify-content: space-between;
        }
        .option-btn, .delete-btn {
          flex: 1;
          padding: 0.5rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }
        .option-btn {
          background: #007bff;
          color: white;
        }
        .option-btn:hover {
          background: #0056b3;
        }
        .option-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }
        .delete-btn {
          background: #dc3545;
          color: white;
        }
        .delete-btn:hover {
          background: #c82333;
        }
        .empty {
          text-align: center;
          font-size: 1.2rem;
          color: #666;
          grid-column: 1 / -1;
        }
        .loading {
          text-align: center;
          font-size: 1.2rem;
          color: #666;
          grid-column: 1 / -1;
        }
      `}</style>
    </section>
  );
};

export default PlacedOrders;