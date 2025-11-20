import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';  // Tu axios instance
import debounce from 'lodash/debounce';  // npm i lodash si no lo tienes (para búsqueda en tiempo real)

// Estilos inline mejorados (más dinámicos y lindos: gradientes, transiciones, responsive, animaciones suaves)
const boxStyle = {
  background: 'white',
  borderRadius: '15px',
  overflow: 'hidden',
  padding: '1.5rem',
  textAlign: 'center',
  boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease',
  position: 'relative',
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  },
  searchSection: {
    padding: '2rem 1rem',
    textAlign: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  searchForm: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: '600px',
    margin: '0 auto',
    position: 'relative',
  },
  searchInput: {
    flex: 1,
    padding: '1rem 1rem 1rem 2rem',
    border: 'none',
    borderRadius: '50px',
    fontSize: '1.1rem',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    outline: 'none',
    transition: 'all 0.3s ease',
  },
  searchInputFocus: {
    transform: 'scale(1.02)',
    boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
  },
  searchBtn: {
    position: 'absolute',
    right: '1rem',
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    color: 'white',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  },
  searchBtnHover: {
    transform: 'scale(1.1)',
  },
  categoriesSection: {
    padding: '1rem 2rem',
    background: 'white',
    margin: '1rem',
    borderRadius: '15px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  categoriesTitle: {
    textAlign: 'center',
    marginBottom: '1.5rem',
    color: '#333',
    fontSize: '1.5rem',
    fontWeight: '600',
  },
  categoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
    maxWidth: '800px',
    margin: '0 auto',
  },
  categoryLabel: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.8rem',
    background: '#f8f9fa',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: '2px solid transparent',
  },
  categoryLabelHover: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
  },
  categoryRadio: {
    marginRight: '0.5rem',
    accentColor: '#667eea',
  },
  resultsSection: {
    padding: '2rem 1rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  resultsTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '1rem',
    textAlign: 'center',
  },
  boxContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2rem',
    animation: 'fadeIn 0.5s ease-in',
  },
  box: boxStyle,  // Referencia al estilo base
  boxHover: {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  },
  productImg: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '10px',
    marginBottom: '1rem',
    transition: 'transform 0.3s ease',
  },
  productImgHover: {
    transform: 'scale(1.05)',
  },
  productName: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '0.5rem',
    height: '2.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  price: {
    color: '#e74c3c',
    fontSize: '1.2rem',
    fontWeight: 'bold',
  },
  qtyInput: {
    width: '60px',
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '5px',
    textAlign: 'center',
    outline: 'none',
    transition: 'border-color 0.3s ease',
  },
  qtyInputFocus: {
    borderColor: '#667eea',
  },
  addBtn: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    padding: '0.8rem 1.5rem',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    width: '100%',
    transition: 'all 0.3s ease',
  },
  addBtnHover: {
    transform: 'scale(1.05)',
    boxShadow: '0 5px 15px rgba(102, 126, 234, 0.4)',
  },
  empty: {
    textAlign: 'center',
    padding: '4rem',
    color: '#999',
    fontStyle: 'italic',
    fontSize: '1.1rem',
  },
  eyeIcon: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    color: '#3498db',
    fontSize: '1.2rem',
    cursor: 'pointer',
    background: 'rgba(255,255,255,0.9)',
    padding: '0.5rem',
    borderRadius: '50%',
    transition: 'all 0.3s ease',
  },
  eyeIconHover: {
    background: '#3498db',
    color: 'white',
    transform: 'scale(1.1)',
  },
  loading: {
    textAlign: 'center',
    padding: '4rem',
    fontSize: '1.2rem',
    color: '#667eea',
  },
  noResults: {
    textAlign: 'center',
    padding: '2rem',
    background: 'white',
    borderRadius: '15px',
    margin: '2rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
};

// Componente para animación de fade-in (simple CSS-in-JS)
const fadeInKeyframes = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);  // NUEVO: Loading para fetch inicial

  // Debounced search para tiempo real (ahora usa /products con params, como en Home)
  const debouncedSearch = useMemo(
    () => debounce((query) => {
      setIsSearching(true);
      const paramsObj = { 
        search: query || '',  // Si vacío, trae todos
        category: category || '', 
        limit: 20  // Límite para no cargar miles
      };
      // Limpia params vacíos para no enviarlos al backend
      const cleanParams = Object.fromEntries(
        Object.entries(paramsObj).filter(([_, v]) => v !== '')
      );
      api.get('/products', { params: cleanParams })  // CAMBIADO: Usa /products como en Home
        .then(res => {
          console.log('Respuesta del API en Search:', res.data);  // DEBUG: Mira esto en Console (F12)
          if (res.data.success) {
            setProducts(res.data.products || []);
          } else {
            setProducts([]);
            console.warn('API dijo no success en Search:', res.data);
          }
        })
        .catch(err => {
          console.error('Error en /products API:', err);  // DEBUG: Errores aquí
          setProducts([]);
        })
        .finally(() => {
          setIsSearching(false);
          setIsLoadingInitial(false);  // Termina loading inicial
        });
    }, 500),
    [category]
  );

  // Fetch categorías una vez (ajusta endpoint si es /auth/categories o /categories)
  useEffect(() => {
    api.get('/auth/categories')  // Mantengo /auth/ si funciona, o cambia a /categories si no
      .then(res => {
        console.log('Categorías cargadas:', res.data);  // DEBUG
        if (res.data.success) setCategories(res.data.categories || []);
      })
      .catch(err => console.error('Error categories:', err));
  }, []);

  // Fetch inicial: Todos los productos al cargar (o con params)
  useEffect(() => {
    const initialSearch = searchParams.get('search') || '';
    const initialCategory = searchParams.get('category') || '';
    setSearch(initialSearch);
    setCategory(initialCategory);
    debouncedSearch(initialSearch);  // Llama debounce con initial (vacío = todos)
  }, [searchParams, debouncedSearch]);

  // Handle input change (tiempo real)
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    debouncedSearch(value);
    // Actualiza URL en tiempo real
    const params = new URLSearchParams(searchParams);
    if (value) params.set('search', value);
    else params.delete('search');
    setSearchParams(params);
  };

  const handleCategoryChange = (catId) => {
    setCategory(catId);
    const params = new URLSearchParams(searchParams);
    if (catId) params.set('category', catId);
    else params.delete('category');
    setSearchParams(params);
    // Re-fetch con nueva categoría
    debouncedSearch(search);
  };

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('¡Inicia sesión para agregar al carrito!');
      navigate('/user_login');
      return;
    }

    const qty = parseInt(e.target.qty.value) || 1;
    try {
      await api.post('/auth/cart/add', {
        pid: product.id,
        name: product.name,
        price: product.price,
        image: product.image_01,
        qty,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('¡Producto agregado al carrito!');
    } catch (err) {
      console.error('Error add to cart:', err);
      alert('Error al agregar al carrito');
    }
  };

  // Si loading inicial, muestra spinner
  if (isLoadingInitial) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Cargando productos...</div>
      </div>
    );
  }

  return (
    <>
      <style>{fadeInKeyframes}</style>  {/* Animación CSS */}
      <div style={styles.container}>
        {/* Sección de Búsqueda Dinámica */}
        <section style={styles.searchSection}>
          <div style={styles.searchForm}>
            <input
              type="text"
              placeholder="Busca un producto... (tiempo real)"
              maxLength="100"
              className="box"
              value={search}
              onChange={handleInputChange}
              style={{
                ...styles.searchInput,
                ...(search ? styles.searchInputFocus : {}),
              }}
            />
            <button
              type="button"
              style={{
                ...styles.searchBtn,
                ...(!search ? styles.searchBtnHover : {}),
              }}
              onClick={() => handleInputChange({ target: { value: '' } })}  // Limpiar búsqueda
            >
              <i className="fas fa-times" style={{ display: search ? 'block' : 'none' }}></i>
              <i className="fas fa-search" style={{ display: !search ? 'block' : 'none' }}></i>
            </button>
          </div>
          {isSearching && <p style={{ marginTop: '1rem', fontStyle: 'italic' }}>Buscando...</p>}
        </section>

        {/* Filtros de Categorías (Grid Responsive) */}
        <section style={styles.categoriesSection}>
          <h2 style={styles.categoriesTitle}>Filtrar por Categorías</h2>
          <div style={styles.categoryGrid}>
            <label 
              style={styles.categoryLabel} 
              onMouseEnter={(e) => Object.assign(e.target.style, styles.categoryLabelHover)}
              onMouseLeave={(e) => Object.assign(e.target.style, styles.categoryLabel)}
            >
              <input
                type="radio"
                name="category"
                value=""
                checked={!category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                style={styles.categoryRadio}
              />
              Todas
            </label>
            {categories.map((cat) => (
              <label 
                key={cat.id} 
                style={styles.categoryLabel} 
                onMouseEnter={(e) => Object.assign(e.target.style, styles.categoryLabelHover)}
                onMouseLeave={(e) => Object.assign(e.target.style, styles.categoryLabel)}
              >
                <input
                  type="radio"
                  name="category"
                  value={cat.id}
                  checked={category === (cat.id ? cat.id.toString() : '')}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  style={styles.categoryRadio}
                />
                {cat.name}
              </label>
            ))}
          </div>
        </section>

        {/* Resultados de Productos */}
        <section style={styles.resultsSection}>
          <h2 style={styles.resultsTitle}>
            {search ? `Resultados para "${search}" (${products.length})` : `Todos los Productos (${products.length})`}  {/* CAMBIADO: Muestra count siempre */}
          </h2>
          <div style={styles.boxContainer}>
            {products.length > 0 ? (
              products.map((product, index) => (
                <form
                  key={product.id}
                  onSubmit={(e) => handleAddToCart(e, product)}
                  className="box"
                  style={{ ...styles.box, animationDelay: `${index * 0.1}s` }}
                  onMouseEnter={(e) => {
                    Object.assign(e.currentTarget.style, styles.boxHover);
                    const img = e.currentTarget.querySelector('img');
                    if (img) Object.assign(img.style, styles.productImgHover);
                    const eye = e.currentTarget.querySelector('.eye-icon');
                    if (eye) Object.assign(eye.style, styles.eyeIconHover);
                    const btn = e.currentTarget.querySelector('.addBtn');
                    if (btn) Object.assign(btn.style, styles.addBtnHover);
                  }}
                  onMouseLeave={(e) => {
                    Object.assign(e.currentTarget.style, styles.box);
                    const img = e.currentTarget.querySelector('img');
                    if (img) Object.assign(img.style, styles.productImg);
                    const eye = e.currentTarget.querySelector('.eye-icon');
                    if (eye) Object.assign(eye.style, styles.eyeIcon);
                    const btn = e.currentTarget.querySelector('.addBtn');
                    if (btn) Object.assign(btn.style, styles.addBtn);
                  }}
                >
                  <a href={`/product/${product.id}`} className="eye-icon" style={styles.eyeIcon}>
                    <i className="fas fa-eye"></i>
                  </a>
                  <img src={`/uploaded_img/${product.image_01}`} alt={product.name} style={styles.productImg} />
                  <div style={styles.productName}>{product.name}</div>
                  <div style={styles.priceSection}>
                    <div style={styles.price}>${product.price}</div>
                    <input
                      type="number"
                      name="qty"
                      min="1"
                      max="99"
                      defaultValue="1"
                      style={styles.qtyInput}
                      onFocus={(e) => Object.assign(e.target.style, styles.qtyInputFocus)}
                      onBlur={(e) => e.target.style.borderColor = '#ddd'}
                    />
                  </div>
                  <button type="submit" className="addBtn" style={styles.addBtn}>
                    Agregar al Carrito
                  </button>
                </form>
              ))
            ) : (
              <div style={styles.noResults}>
                <p style={styles.empty}>
                  {isSearching ? 'Buscando...' : (search ? `No se encontraron productos para "${search}". Intenta otra palabra.` : 'No hay productos disponibles.')}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default SearchPage;