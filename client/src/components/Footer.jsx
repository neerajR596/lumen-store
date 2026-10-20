import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
export default function Footer() {
  const { settings, categories } = useStore();
  const name = settings?.storeName || 'Lumen';
  return (
    <footer className="footer">
      <div className="wrap">
        <p className="footnote">{settings?.footerNote}</p>
        <div className="footer-cols">
          <div><h4>Shop</h4>{categories.map((c) => <Link key={c.slug} to={`/shop?category=${c.slug}`}>{c.name}</Link>)}</div>
          <div><h4>Account</h4><Link to="/account">Manage account</Link><Link to="/orders">Your orders</Link><Link to="/bag">Bag</Link></div>
          <div><h4>Help</h4><span>Delivery in 2–5 days</span><span>10-day easy returns</span><span>Secure payments by Razorpay</span></div>
          <div><h4>{name}</h4><span>Made with MongoDB, Express, React & Node.</span></div>
        </div>
        <div className="footer-base"><span>Copyright © {new Date().getFullYear()} {name}. All rights reserved.</span><span>India</span></div>
      </div>
    </footer>
  );
}
