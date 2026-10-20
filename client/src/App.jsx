import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Nav from './components/Nav.jsx';
import Footer from './components/Footer.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import ProductPage from './pages/Product.jsx';
import Bag from './pages/Bag.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderPage from './pages/Order.jsx';
import Orders from './pages/Orders.jsx';
import { Login, Register } from './pages/Auth.jsx';
import Account from './pages/Account.jsx';
import NotFound from './pages/NotFound.jsx';
import AdminLayout from './admin/AdminLayout.jsx';
import Dashboard from './admin/Dashboard.jsx';
import AdminProducts from './admin/Products.jsx';
import ProductEditor from './admin/ProductEditor.jsx';
import AdminCategories from './admin/Categories.jsx';
import AdminBanners from './admin/Banners.jsx';
import Storefront from './admin/Storefront.jsx';
import AdminOrders from './admin/Orders.jsx';
import AdminUsers from './admin/Users.jsx';
import { useAuth } from './context/AuthContext.jsx';

function RequireAuth({ children, admin }) {
  const { user, ready } = useAuth();
  const loc = useLocation();
  if (!ready) return <div className="page-loading"><span className="spinner" /></div>;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname)}`} replace />;
  if (admin && !user.isAdmin) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  const isAdmin = pathname.startsWith('/admin');

  return (
    <>
      {!isAdmin && <Nav />}
      {!isAdmin && <CartDrawer />}
      <main className={isAdmin ? '' : 'store'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/bag" element={<Bag />} />
          <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
          <Route path="/orders" element={<RequireAuth><Orders /></RequireAuth>} />
          <Route path="/orders/:id" element={<RequireAuth><OrderPage /></RequireAuth>} />
          <Route path="/account" element={<RequireAuth><Account /></RequireAuth>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<RequireAuth admin><AdminLayout /></RequireAuth>}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<ProductEditor />} />
            <Route path="products/:id" element={<ProductEditor />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="storefront" element={<Storefront />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
    </>
  );
}
