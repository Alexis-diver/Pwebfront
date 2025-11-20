import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';  // Agregué useNavigate para redirigir si no auth
import api from '../services/api';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [grandTotal, setGrandTotal] = useState(0);
  const [tempQty, setTempQty] = useState({});
  const navigate = useNavigate();  // Para redirigir a login si no auth

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setMessage('Inicia sesión para ver carrito');
          setLoading(false);
          return;
        }

        const res = await api.get('/auth/cart');  // Sin headers: api.js los maneja

        if (res.data.success) {
          setCartItems(res.data.cart || []);
          if (res.data.cart.length === 0) {
            setMessage('Tu carrito está vacío');
          }
          // Opcional: dispatch event para actualizar navbar count
          window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: res.data.cart?.length || 0 } }));
        } else {
          setMessage(res.data.message || 'Error al cargar carrito');
        }
      } catch (err) {
        console.error('Error fetching cart:', err);
        setMessage('Error al cargar carrito');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  useEffect(() => {
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setGrandTotal(total);
  }, [cartItems]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleUpdateQty = useCallback(async (cartId, newQty) => {
    if (newQty < 1 || newQty > 99) return;

    try {
      const res = await api.put('/auth/cart/update', { cartId, qty: newQty });

      if (res.data.success) {
        setMessage('Cantidad actualizada');
        // Refresh cart
        const refreshRes = await api.get('/auth/cart');
        setCartItems(refreshRes.data.cart || []);
      } else {
        setMessage('Error al actualizar cantidad');
      }
    } catch (err) {
      console.error('Error updating qty:', err);
      setMessage('Error al actualizar cantidad');
    }
  }, []);

  const handleDeleteItem = async (cartId) => {
    if (!window.confirm('¿Eliminar este item del carrito?')) return;

    try {
      const res = await api.delete(`/auth/cart/${cartId}`);

      if (res.data.success) {
        setMessage('Item eliminado');
        const refreshRes = await api.get('/auth/cart');
        setCartItems(refreshRes.data.cart || []);
      } else {
        setMessage('Error al eliminar item');
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      setMessage('Error al eliminar item');
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('¿Borrar todo el carrito?')) return;

    try {
      const res = await api.delete('/auth/cart/delete_all');

      if (res.data.success) {
        setCartItems([]);
        setGrandTotal(0);
        setMessage('Carrito borrado');
      } else {
        setMessage('Error al borrar carrito');
      }
    } catch (err) {
      console.error('Error deleting all:', err);
      setMessage('Error al borrar carrito');
    }
  };

  const handleProceedToCheckout = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Inicia sesión para proceder al pago');
      navigate('/login');
      return;
    }
    if (grandTotal === 0) {
      setMessage('Tu carrito está vacío');
      return;
    }
    navigate('/checkout');  // Redirige a Checkout (sin quotation_id por ahora)
  };

  if (loading) return <div>Cargando carrito...</div>;

  return (
    <section className="products shopping-cart">
      <h3 className="heading">Carrito</h3>
      {cartItems.length > 0 ? (
        <>
          <div className="box-container">
            {cartItems.map((item) => (
              <div key={item.id} className="box">
                <Link to={`/product/${item.pid}`} className="fas fa-eye" aria-label="Ver detalle">
                  <span className="sr-only">Ver detalle del producto</span>
                </Link>
                <img src={`/uploaded_img/${item.image}`} alt={item.name} />
                <div className="name">{item.name}</div>
                <div className="flex">
                  <div className="price">{item.price} MXN</div>
                  <input 
                    type="number" 
                    className="qty" 
                    min="1" 
                    max="99" 
                    value={tempQty[item.id] !== undefined ? tempQty[item.id] : item.quantity}
                    onChange={(e) => setTempQty(prev => ({ ...prev, [item.id]: parseInt(e.target.value) || 1 }))}
                    onBlur={() => {
                      const newQty = tempQty[item.id] || item.quantity;
                      handleUpdateQty(item.id, newQty);
                      setTempQty(prev => ({ ...prev, [item.id]: undefined }));
                    }}
                  />
                  <button 
                    type="button" 
                    className="fas fa-edit" 
                    onClick={() => handleUpdateQty(item.id, item.quantity)} 
                    aria-label="Actualizar cantidad"
                  >
                    <span className="sr-only">Actualizar</span>
                  </button>
                </div>
                <div className="sub-total">
                  Sub total: <span>{(item.price * item.quantity)} MXN</span>
                </div>
                <button 
                  type="button" 
                  className="delete-btn" 
                  onClick={() => handleDeleteItem(item.id)}
                >
                  Eliminar item
                </button>
              </div>
            ))}
          </div>

          <div className="cart-total">
            <p>Gran total: <span>{grandTotal} MXN</span></p>
            <Link to="/shop" className="option-btn">Continuar comprando</Link>
            <button onClick={handleDeleteAll} className="delete-btn" disabled={grandTotal === 0}>
              Borrar todo
            </button>
            <button 
              onClick={handleProceedToCheckout} 
              className="btn" 
              disabled={grandTotal === 0}
            >
              Proceder al pago
            </button>
          </div>
        </>
      ) : (
        <p className="empty">{message || 'Tu carrito está vacío'}</p>
      )}
      {message && <div className="message alert">{message}</div>}
    </section>
  );
};

export default Cart;