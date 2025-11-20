import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';  // Nueva import para detalle de producto
import Checkout from './pages/Checkout';  // Nueva import para checkout
import Header from './components/Header';  // Ya unificado
import Footer from './components/Footer';  
import UserRegister from './pages/UserRegister';  // Para registro
import UserLogin from './pages/UserLogin';  // Para login
import Shop from './pages/Shop';  // Para shop (import único)
import Cart from './pages/Cart';  // Para cart
import Orders from './pages/Orders';  // NUEVO: Import para pedidos
import SearchPage from './pages/SearchPage';  // NUEVO: Import para búsqueda (crea el archivo primero)

// NUEVO: Import para admin login (crea LoginAdmin.jsx en pages)
import LoginAdmin from './pages/LoginAdmin';

// NUEVO: Import para admin dashboard (crea AdminDashboard.jsx en pages)
import AdminDashboard from './pages/AdminDashboard';

// NUEVO: Import para admin products (crea AdminProducts.jsx en pages)
import AdminProducts from './pages/AdminProducts';

// NUEVO: Import para admin categories (ya migrado)
import AdminCategories from './pages/AdminCategories';
import PlacedOrders from './pages/PlacedOrders';  // Ya importado, lo usamos aquí

// NUEVO: Import para actualizar perfil (migrado de update_user.php)
import UpdateUser from './pages/UpdateUser';

// NUEVO: Import para users accounts (crea UsersAccounts.jsx en pages, como te di antes)
import UsersAccounts from './pages/UsersAccounts';  // <-- NUEVO: Import agregado

// NUEVO: Import para admin accounts (migrado de admin_accounts.php)
import AdminAccounts from './pages/AdminAccounts';  // <-- NUEVO: Import agregado

// Componente privado para rutas protegidas de USUARIOS (ej. orders)
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/user_login" replace />;
};

// NUEVO: Componente privado para rutas protegidas de ADMIN (chequea adminToken)
const PrivateAdminRoute = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');
  console.log('PrivateAdminRoute check para ruta:', window.location.pathname, '- adminToken:', adminToken ? 'Presente' : 'Ausente');  // DEBUG temporal —quita después
  return adminToken ? children : <Navigate to="/admin/login" replace />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Ruta para register: coincide con el Link en Header */}
          <Route path="/user_register" element={<UserRegister />} />
          
          {/* Ruta para login: ahora usa el componente real */}
          <Route path="/user_login" element={<UserLogin />} />
          
          {/* FIX: Ruta única para shop (quita duplicate placeholder) */}
          <Route path="/shop" element={<Shop />} />
          
          {/* FIX: Ruta única para cart (quita duplicate placeholder) */}
          <Route path="/cart" element={<Cart />} />
          
          {/* Nueva ruta para detalle de producto (de quick_view.php) */}
          <Route path="/product/:id" element={<ProductDetail />} />
          
          {/* FIX: Ruta para checkout (simplificada: /checkout para cart normal, /checkout/quotation/:id para cotizaciones) */}
          <Route path="/checkout/:type?/:id?" element={<Checkout />} />
          
          {/* ACTUALIZADO: Ruta protegida para actualizar perfil (migrado de update_user.php) */}
          <Route path="/update_user/:id" element={
            <PrivateRoute>
              <UpdateUser />
            </PrivateRoute>
          } />
          
          {/* NUEVO: Ruta protegida para pedidos */}
          <Route path="/orders" element={
            <PrivateRoute>
              <Orders />
            </PrivateRoute>
          } />
          
          <Route path="/pendings" element={<div><h1>Mensajes</h1></div>} />
          <Route path="/homeSocial" element={<div><h1>Social</h1></div>} />
          <Route path="/lists" element={<div><h1>Wishlist</h1></div>} />
          
          {/* NUEVO: Ruta para búsqueda (reemplaza placeholder con componente real) */}
          <Route path="/search_page" element={<SearchPage />} />
          
          {/* NUEVAS RUTAS PARA ADMIN */}
          <Route path="/admin/login" element={<LoginAdmin />} />
          <Route path="/admin/dashboard" element={
            <PrivateAdminRoute>
              <AdminDashboard />
            </PrivateAdminRoute>
          } />
          
          {/* NUEVO: Ruta protegida para categorías (ya migrada) */}
          <Route path="/admin/categories" element={
            <PrivateAdminRoute>
              <AdminCategories />
            </PrivateAdminRoute>
          } />
          
          {/* ACTUALIZADO: Ruta protegida para placed orders (usa el componente real) */}
          <Route path="/admin/placed_orders" element={
            <PrivateAdminRoute>
              <PlacedOrders />
            </PrivateAdminRoute>
          } />
          
          <Route path="/admin/products" element={
            <PrivateAdminRoute>
              <AdminProducts />
            </PrivateAdminRoute>
          } />
          
          {/* ACTUALIZADO: Ruta protegida para users accounts (usa el componente real) */}
          <Route path="/admin/users_accounts" element={
            <PrivateAdminRoute>
              <UsersAccounts />
            </PrivateAdminRoute>
          } />  {/* <-- CAMBIO: Reemplazado placeholder por componente protegido */}
          
          {/* NUEVO: Ruta protegida para admin accounts (migrado de admin_accounts.php) */}
          <Route path="/admin/admin_accounts" element={
            <PrivateAdminRoute>
              <AdminAccounts />
            </PrivateAdminRoute>
          } />  {/* <-- FIX: Reemplazado placeholder por componente protegido */}
          
          {/* Ruta catch-all para 404 */}
          <Route path="*" element={<div><h1>Página no encontrada</h1></div>} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;