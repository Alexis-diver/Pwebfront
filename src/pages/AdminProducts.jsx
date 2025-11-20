import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminProducts = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    details: '',
    price: '',
    quantity: '',
    category: ''
  });
  const [showPrice, setShowPrice] = useState(false);  // Inicial false, muestra si se cotiza
  const [quotePrice, setQuotePrice] = useState(false);  // Estado para checkbox
  const navigate = useNavigate();

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch categories
        const catRes = await axios.get('http://localhost:5000/api/auth/categories', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCategories(catRes.data.categories || []);

        // Fetch products
        const prodRes = await axios.get('http://localhost:5000/api/auth/admin/products', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProducts(prodRes.data.products || []);
      } catch (err) {
        setError(err.response?.data?.message?.[0] || 'Error al cargar datos');
        if (err.response?.status === 401) {
          localStorage.removeItem('adminToken');
          navigate('/admin/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setQuotePrice(checked);
    setShowPrice(checked);  // Corrige: muestra si checked (si se cotiza)
    if (!checked) {
      setFormData({ ...formData, price: '' });  // Limpia price
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('details', formData.details);
    submitData.append('price', formData.price);
    submitData.append('quantity', formData.quantity);
    submitData.append('category', formData.category);
    // Append files
    if (e.target.image_01.files[0]) submitData.append('image_01', e.target.image_01.files[0]);
    if (e.target.image_02.files[0]) submitData.append('image_02', e.target.image_02.files[0]);
    if (e.target.image_03.files[0]) submitData.append('image_03', e.target.image_03.files[0]);
    if (e.target.video.files[0]) submitData.append('video', e.target.video.files[0]);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/admin/products', submitData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setMessage(res.data.message);
        setFormData({ name: '', details: '', price: '', quantity: '', category: '' });
        setShowPrice(false);
        setQuotePrice(false);
        e.target.reset();
        // Refresh products
        const prodRes = await axios.get('http://localhost:5000/api/auth/admin/products', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProducts(prodRes.data.products || []);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message?.[0] || 'Error al agregar producto');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;

    try {
      const res = await axios.delete(`http://localhost:5000/api/auth/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setProducts(products.filter(p => p.id !== id));
        setMessage(res.data.message);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message?.[0] || 'Error al eliminar');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Función para URL de imagen con fallback
  const getImageUrl = (filename) => {
    if (!filename) return '/images/placeholder.png';
    return `http://localhost:5000/uploaded_img/${filename}`;
  };

  const handleImageError = (e, filename) => {
    if (filename) {
      e.target.src = `/uploaded_img/${filename}`;
    } else {
      e.target.src = '/images/placeholder.png';
    }
  };

  if (loading) return <div>Cargando productos...</div>;
  if (error) return <div className="message">{error}</div>;

  return (
    <>
      <section className="add-products">
        <h1 className="heading">Agrega un producto</h1>
        {message && <p className="message">{message}</p>}
        <form onSubmit={handleSubmit}>
          <div className="flex">
            <div className="inputBox">
              <span>Nombre del producto (requisito)</span>
              <input type="text" className="box" required maxLength="100" placeholder="Nombre del producto" name="name" value={formData.name} onChange={handleInputChange} />
            </div>
            <div className="inputBox">
              <span>Categoría (requisito)</span>
              <select name="category" className="box" required value={formData.category} onChange={handleInputChange}>
                <option value="">Seleccionar categoría</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="inputBox">
              <span>Precio (opcional):</span>
              <input type="checkbox" id="priceCheckbox" checked={quotePrice} onChange={handleCheckboxChange} />
              <label htmlFor="priceCheckbox">Marcar casilla si se cotizara</label>
              <input
                type="number"
                id="priceInput"
                min="0"
                className="box"
                max="9999999999"
                placeholder="Precio"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                style={{ display: showPrice ? 'block' : 'none' }}
                required={showPrice}
              />
            </div>
            <div className="inputBox">
              <span>Cantidad en stock (requisito)</span>
              <input type="number" min="0" className="box" required max="9999999999" placeholder="Cantidad" name="quantity" value={formData.quantity} onChange={handleInputChange} />
            </div>
            <div className="inputBox">
              <span>Imagen 01 (requisito)</span>
              <input type="file" name="image_01" accept="image/jpg, image/jpeg, image/png, image/webp" className="box" required />
            </div>
            <div className="inputBox">
              <span>Imagen 02 (requisito)</span>
              <input type="file" name="image_02" accept="image/jpg, image/jpeg, image/png, image/webp" className="box" required />
            </div>
            <div className="inputBox">
              <span>Imagen 03 (requisito)</span>
              <input type="file" name="image_03" accept="image/jpg, image/jpeg, image/png, image/webp" className="box" required />
            </div>
            <div className="inputBox">
              <span>Video (requisito)</span>
              <input type="file" name="video" accept="video/mp4, video/webm, video/ogg" className="box" required />
            </div>
            <div className="inputBox">
              <span>Detalles del producto (requisitos)</span>
              <textarea name="details" placeholder="Detalles del producto" className="box" required maxLength="500" cols="30" rows="10" value={formData.details} onChange={handleInputChange} />
            </div>
          </div>
          <input type="submit" value="Agregar productos" className="btn" />
        </form>
      </section>

      <section className="show-products">
        <h1 className="heading">Lista de productos</h1>
        <div className="box-container">
          {products.length > 0 ? (
            products.map(product => (
              <div className="box" key={product.id}>
                <img 
                  src={getImageUrl(product.image_01)} 
                  alt={product.name} 
                  onError={(e) => handleImageError(e, product.image_01)}
                />
                <div className="name">{product.name}</div>
                <div className="price">$<span>{product.price || 'N/A'}</span>/-</div>
                {product.category_name && (
                  <div className="category">Categoría: <span>{product.category_name}</span></div>
                )}
                <div className="quantity">Stock: <span>{product.quantity}</span></div>
                <div className="details"><span>{product.details}</span></div>
                <div className="flex-btn">
                  <Link to={`/admin/update_product/${product.id}`} className="option-btn">update</Link>
                  <button onClick={() => handleDelete(product.id)} className="delete-btn">delete</button>
                </div>
              </div>
            ))
          ) : (
            <p className="empty">Ningún producto agregado</p>
          )}
        </div>
      </section>

      {/* Imports CSS/JS - Mantenidos como en original, pero mueve a public/index.html para mejor práctica */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css" />
      <link rel="stylesheet" href="/css/admin_style.css" />
      <script src="/js/admin_script.js"></script>
    </>
  );
};

export default AdminProducts;