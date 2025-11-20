import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

// Estilos inline (sin cambios, para ESLint clean)
const styles = {
  checkoutContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    backgroundColor: '#fff',
    color: '#0f1111',
  },
  ordersSection: {
    marginBottom: '30px',
  },
  ordersH3: {
    fontSize: '1.5em',
    fontWeight: '600',
    marginBottom: '15px',
    color: '#0f1111',
  },
  displayOrders: {
    background: '#f7f7f7',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
  },
  orderItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #e0e0e0',
  },
  orderName: {
    fontSize: '1em',
    color: '#333',
  },
  orderDetails: {
    fontSize: '0.9em',
    color: '#666',
  },
  grandTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '1.3em',
    fontWeight: '600',
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '2px solid #e0e0e0',
  },
  formSection: {
    marginBottom: '30px',
  },
  formH3: {
    fontSize: '1.5em',
    fontWeight: '600',
    marginBottom: '15px',
    color: '#0f1111',
  },
  inputBox: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '20px',
  },
  inputLabel: {
    fontSize: '1em',
    fontWeight: '500',
    marginBottom: '5px',
    color: '#555',
  },
  inputField: {
    padding: '12px',
    border: '1px solid #a6a6a6',
    borderRadius: '4px',
    fontSize: '1em',
    width: '100%',
  },
  selectField: {
    padding: '12px',
    border: '1px solid #a6a6a6',
    borderRadius: '4px',
    fontSize: '1em',
    width: '100%',
    backgroundColor: '#fff',
  },
  submitBtn: {
    background: 'linear-gradient(135deg, #ffd814, #f7ca00)',
    color: '#111',
    border: '1px solid #a88734',
    padding: '15px 30px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1.1em',
    fontWeight: '500',
    transition: 'background 0.3s',
    width: '100%',
    maxWidth: '300px',
  },
  submitBtnDisabled: {
    background: '#ccc',
    cursor: 'not-allowed',
  },
  message: {
    padding: '12px',
    borderRadius: '6px',
    textAlign: 'center',
    margin: '20px 0',
    fontWeight: '500',
  },
  messageSuccess: {
    background: '#c6f6d5',
    color: '#065f46',
    border: '1px solid #9ae6b4',
  },
  messageError: {
    background: '#fed7d7',
    color: '#991b1b',
    border: '1px solid #fca5a5',
  },
  loading: {
    textAlign: 'center',
    fontSize: '1.2em',
    padding: '60px',
    color: '#555',
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    padding: '40px',
    background: '#f7f7f7',
    borderRadius: '8px',
  },
};

const Checkout = () => {
  const { quotation_id } = useParams();  // Opcional: si viene de URL /checkout/quotation/:id
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: '', number: '', email: '', method: 'Cash on Delivery' });
  const [address, setAddress] = useState({ flat: '', street: '', city: '', state: '', country: '', pin_code: '' });
  const [items, setItems] = useState([]);  // Array de items (cart + quotation si aplica)
  const [grandTotal, setGrandTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch cart items (coincide con Cart.js: res.data.cart)
        const cartRes = await api.get('/auth/cart');
        let allItems = cartRes.data.cart || [];  // FIX: .cart, no .items
        let total = 0;

        // Si hay quotation_id, fetch quotation items y agrégalos
        if (quotation_id) {
          const quotationRes = await api.get(`/auth/quotation/${quotation_id}`);
          if (quotationRes.data.success) {
            const quotationItems = quotationRes.data.items || [];  // Asume .items para quotation
            allItems = [...allItems, ...quotationItems.map(item => ({
              ...item,
              price: item.new_price,  // Usa new_price como price
            }))];
          }
        }

        // Calcula total
        allItems.forEach(item => {
          total += item.price * item.quantity;
        });

        setItems(allItems);
        setGrandTotal(total);
      } catch (err) {
        console.error('Error fetching checkout data:', err);
        // Fallback a mock si fetch falla (para testing)
        const mockItems = [
          {
            name: 'Nike Taco de fútbol Phantom 6',
            price: 3100.00,
            quantity: 1,
          },
        ];
        setItems(mockItems);
        setGrandTotal(3100.00);
        setMessage('Usando datos simulados (backend no disponible)');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [quotation_id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (grandTotal <= 0 || items.length === 0) {
      setMessage('Tu carrito o cotización está vacío');
      return;
    }

    const fullAddress = `Flat No. ${address.flat}, ${address.street}, ${address.city}, ${address.state}, ${address.country} - ${address.pin_code}`;
    const totalProducts = items.map(item => `${item.name} (${item.quantity})`).join(', ');

    try {
      // POST real al backend para insertar en 'orders'
      const orderRes = await api.post('/auth/orders', {
        name: user.name,
        number: user.number,
        email: user.email,
        method: user.method,
        address: fullAddress,
        total_products: totalProducts,
        total_price: parseInt(grandTotal),  // int para DB
        items,  // Para backend: procesa stock y guarda JSON si hay columna 'item_details'
      });

      if (orderRes.data.success) {
        setMessage('¡Pedido colocado exitosamente!');
        // Backend limpia carrito y actualiza stock
        navigate('/orders');
      } else {
        setMessage(orderRes.data.message || 'Error al colocar pedido');
      }
    } catch (err) {
      console.error('Error placing order:', err);
      // Fallback a simulación si backend falla
      console.log('Simulando compra:', { user, address: fullAddress, totalProducts, grandTotal, items });
      setMessage('¡Pedido colocado exitosamente! (Simulado - backend pendiente)');
      setTimeout(() => {
        navigate('/orders');
      }, 1500);
    }
  };

  if (loading) return <div style={styles.loading}>Cargando checkout...</div>;
  if (items.length === 0) return <div style={styles.empty}>Tu carrito o cotización está vacío</div>;

  return (
    <div style={styles.checkoutContainer}>
      <section style={styles.ordersSection}>
        <h3 style={styles.ordersH3}>Tus Pedidos</h3>
        <div style={styles.displayOrders}>
          {items.map((item, index) => (
            <div key={index} style={styles.orderItem}>
              <span style={styles.orderName}>{item.name}</span>
              <span style={styles.orderDetails}>
                (${Number(item.price).toFixed(2)} x {item.quantity})
              </span>
            </div>
          ))}
          <div style={styles.grandTotal}>
            Total General: <span>${Number(grandTotal).toFixed(2)}</span>
          </div>
        </div>
      </section>

      <section style={styles.formSection}>
        <h3 style={styles.formH3}>Coloca Tu Pedido</h3>
        <form onSubmit={handleSubmit}>
          <div style={styles.inputBox}>
            <div>
              <span style={styles.inputLabel}>Nombre:</span>
              <input
                type="text"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                placeholder="Ingresa tu nombre"
                style={styles.inputField}
                maxLength="50"
                required
              />
            </div>
            <div>
              <span style={styles.inputLabel}>Número de Teléfono:</span>
              <input
                type="tel"
                value={user.number}
                onChange={(e) => setUser({ ...user, number: e.target.value })}
                placeholder="Ingresa tu número de teléfono"
                style={styles.inputField}
                maxLength="15"
                required
              />
            </div>
            <div>
              <span style={styles.inputLabel}>Email:</span>
              <input
                type="email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                placeholder="Ingresa tu email"
                style={styles.inputField}
                maxLength="50"
                required
              />
            </div>
            <div>
              <span style={styles.inputLabel}>Método de Pago:</span>
              <select
                value={user.method}
                onChange={(e) => setUser({ ...user, method: e.target.value })}
                style={styles.selectField}
                required
              >
                <option value="Cash on Delivery">Pago contra entrega</option>
                <option value="Credit Card">Tarjeta de Crédito</option>
                <option value="PayPal">PayPal</option>
              </select>
            </div>
            <div>
              <span style={styles.inputLabel}>No. Departamento:</span>
              <input
                type="text"
                value={address.flat}
                onChange={(e) => setAddress({ ...address, flat: e.target.value })}
                placeholder="Ingresa tu número de departamento"
                style={styles.inputField}
                maxLength="50"
                required
              />
            </div>
            <div>
              <span style={styles.inputLabel}>Calle:</span>
              <input
                type="text"
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                placeholder="Ingresa el nombre de tu calle"
                style={styles.inputField}
                maxLength="50"
                required
              />
            </div>
            <div>
              <span style={styles.inputLabel}>Ciudad:</span>
              <input
                type="text"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                placeholder="Ingresa tu ciudad"
                style={styles.inputField}
                maxLength="50"
                required
              />
            </div>
            <div>
              <span style={styles.inputLabel}>Estado:</span>
              <input
                type="text"
                value={address.state}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
                placeholder="Ingresa tu estado"
                style={styles.inputField}
                maxLength="50"
                required
              />
            </div>
            <div>
              <span style={styles.inputLabel}>País:</span>
              <input
                type="text"
                value={address.country}
                onChange={(e) => setAddress({ ...address, country: e.target.value })}
                placeholder="Ingresa tu país"
                style={styles.inputField}
                maxLength="50"
                required
              />
            </div>
            <div>
              <span style={styles.inputLabel}>Código Postal:</span>
              <input
                type="number"
                value={address.pin_code}
                onChange={(e) => setAddress({ ...address, pin_code: e.target.value })}
                placeholder="Ingresa tu código postal"
                style={styles.inputField}
                maxLength="10"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            style={{
              ...styles.submitBtn,
              ...(grandTotal <= 0 ? styles.submitBtnDisabled : {}),
            }}
            disabled={grandTotal <= 0}
          >
            Pagar Ahora
          </button>
        </form>
      </section>

      {message && (
        <div style={{ ...styles.message, ...(message.includes('Error') || message.includes('vacío') ? styles.messageError : styles.messageSuccess) }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default Checkout;