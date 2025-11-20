import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// Estilos inline (inspirados en CSS original para .box-container y .box)
const styles = {
  ordersContainer: {
    padding: '20px',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    backgroundColor: '#fff',
    color: '#0f1111',
  },
  heading: {
    fontSize: '2em',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: '30px',
    color: '#0f1111',
  },
  boxContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  orderBox: {
    background: '#f9f9f9',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  orderDetail: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #ddd',
    fontSize: '0.95em',
  },
  orderLabel: {
    fontWeight: '500',
    color: '#555',
  },
  orderValue: {
    color: '#333',
  },
  paymentStatus: {
    fontWeight: 'bold',
    textAlign: 'center',
    padding: '5px 10px',
    borderRadius: '4px',
  },
  statusPending: {
    backgroundColor: '#ffebee',
    color: '#c62828',
  },
  statusCompleted: {
    backgroundColor: '#e8f5e8',
    color: '#2e7d32',
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    padding: '40px',
    background: '#f7f7f7',
    borderRadius: '8px',
    fontSize: '1.1em',
  },
  loading: {
    textAlign: 'center',
    fontSize: '1.2em',
    padding: '60px',
    color: '#555',
  },
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const res = await api.get('/auth/orders');  // Nuevo endpoint

        if (res.data.success) {
          setOrders(res.data.orders || []);
          if (res.data.orders.length === 0) {
            setMessage('¡No hay pedidos colocados todavía!');
          }
        } else {
          setMessage(res.data.message || 'Error al cargar pedidos');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setMessage('Error al cargar pedidos');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  if (loading) return <div style={styles.loading}>Cargando pedidos...</div>;

  return (
    <div style={styles.ordersContainer}>
      <h1 style={styles.heading}>Tu Lista de Pedidos</h1>
      <div style={styles.boxContainer}>
        {orders.length > 0 ? (
          orders.map((order, index) => (
            <div key={order.id || index} style={styles.orderBox}>
              <div style={styles.orderDetail}>
                <span style={styles.orderLabel}>Fecha de colocación:</span>
                <span style={styles.orderValue}>{order.placed_on}</span>
              </div>
              <div style={styles.orderDetail}>
                <span style={styles.orderLabel}>Nombre:</span>
                <span style={styles.orderValue}>{order.name}</span>
              </div>
              <div style={styles.orderDetail}>
                <span style={styles.orderLabel}>Email:</span>
                <span style={styles.orderValue}>{order.email}</span>
              </div>
              <div style={styles.orderDetail}>
                <span style={styles.orderLabel}>Número:</span>
                <span style={styles.orderValue}>{order.number}</span>
              </div>
              <div style={styles.orderDetail}>
                <span style={styles.orderLabel}>Dirección:</span>
                <span style={styles.orderValue}>{order.address}</span>
              </div>
              <div style={styles.orderDetail}>
                <span style={styles.orderLabel}>Método de pago:</span>
                <span style={styles.orderValue}>{order.method}</span>
              </div>
              <div style={styles.orderDetail}>
                <span style={styles.orderLabel}>Tus pedidos:</span>
                <span style={styles.orderValue}>{order.total_products}</span>
              </div>
              <div style={styles.orderDetail}>
                <span style={styles.orderLabel}>Total precio:</span>
                <span style={styles.orderValue}>${order.total_price} MXN</span>
              </div>
              <div style={styles.orderDetail}>
                <span style={styles.orderLabel}>Estado de pago:</span>
                <span style={{
                  ...styles.paymentStatus,
                  ...(order.payment_status === 'pending' ? styles.statusPending : styles.statusCompleted),
                }}>
                  {order.payment_status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p style={styles.empty}>{message || '¡No hay pedidos colocados todavía!'}</p>
        )}
      </div>
    </div>
  );
};

export default Orders;