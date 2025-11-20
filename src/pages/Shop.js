import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'local');
  const exchangeRate = 18;  // 1 USD ≈ 18 MXN

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('Fetching products...');  // Debug: ve en consola F12
        const res = await api.get('/products');
        console.log('Full response:', res.data);  // Debug: ve el response completo

        if (res.data.success && res.data.products) {
          console.log('Products loaded:', res.data.products.length);  // Debug: cantidad
          setProducts(res.data.products);
          if (res.data.products.length === 0) {
            setMessage('Compra algo primero');
          }
        } else {
          console.error('No success in response:', res.data);
          setMessage('Error al cargar productos: ' + (res.data.message || 'Respuesta inválida'));
        }
      } catch (err) {
        console.error('Full error fetching products:', err.response || err);  // Debug: error detallado
        setMessage('Error al cargar productos: ' + (err.message || 'Conexión fallida'));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'currency') {
        setCurrency(e.newValue || 'local');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Versión actualizada como en home.js: usa alert para feedback, sin headers extras (api maneja token)
  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    const qty = e.target.querySelector('.qty')?.value || 1;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Inicia sesión para agregar al carrito');
      return;
    }

    try {
      const res = await api.post('/auth/cart/add', { 
        pid: product.id, 
        name: product.name, 
        price: product.price, 
        image: product.image_01, 
        qty 
      });  // Sin headers: api los maneja automáticamente

      if (res.data.success) {
        alert(`¡Agregado! ${product.name} x${qty}`);
        console.log('Item agregado, cartCount:', res.data.cartCount);  // Debug como en home
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: res.data.cartCount || 0 } }));
      } else {
        alert(res.data.message || 'Error al agregar al carrito');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Error al agregar al carrito');
    }
  };

  const toggleCurrency = () => {
    const newCurrency = currency === 'local' ? 'usd' : 'local';
    setCurrency(newCurrency);
    localStorage.setItem('currency', newCurrency);
  };

  if (loading) {
    return <div className="loading">Cargando productos...</div>;
  }

  return (
    <>
      <section className="products">
        <h1 className="heading">Tu lista</h1>
        <div className="box-container">
          {products.length > 0 ? (
            products.map((product) => (
              <form key={product.id} className="box" onSubmit={(e) => handleAddToCart(e, product)}>
                <input type="hidden" name="pid" value={product.id} />
                <input type="hidden" name="name" value={product.name} />
                <input type="hidden" name="price" value={product.price} />
                <input type="hidden" name="image" value={product.image_01} />
                
                {/* Ícono de ojo enlaza a detalles */}
                <Link to={`/product/${product.id}`} className="fas fa-eye" title="Ver detalles" />
                
                {/* Imagen clickable para detalles */}
                <Link to={`/product/${product.id}`}>
                  <img src={`uploaded_img/${product.image_01}`} alt={product.name} />
                </Link>
                
                {/* Nombre clickable para detalles */}
                <Link to={`/product/${product.id}`} className="name-link">
                  <div className="name">{product.name}</div>
                </Link>
                
                <div className="flex price-container" data-mxn={product.price}>
                  <div className="price-mxn">
                    <span>$</span>{product.price}<span> MXN</span>
                  </div>
                  <div className="price-usd" style={{ display: currency === 'usd' ? 'inline' : 'none' }}>
                    <span>$</span>{(product.price / exchangeRate).toFixed(2)}<span> USD</span>
                  </div>
                </div>
                <input 
                  type="number" 
                  name="qty" 
                  className="qty" 
                  min="1" 
                  max="99" 
                  defaultValue="1"
                  onKeyPress={(e) => e.target.value.length >= 2 && e.preventDefault()}
                />
                <input type="submit" value="add to cart" className="btn" name="add_to_cart" />
              </form>
            ))
          ) : (
            <p className="empty">{message}</p>
          )}
        </div>
      </section>

      {/* Toggle Currency */}
      <div className="toggles">
        <input 
          type="checkbox" 
          id="toggle-price" 
          checked={currency === 'usd'} 
          onChange={toggleCurrency}
        />
        <label htmlFor="toggle-price">USD</label>
      </div>

      {/* Mensaje solo para errores de carga (no para cart, que usa alert) */}
      {message && !loading && (
        <div className="message">
          {message}
          <button onClick={() => setMessage('')}>Cerrar</button>
        </div>
      )}

      {/* {/* Comentario en JSX */} 
    </>
  );
};

export default Shop;