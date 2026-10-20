import { Link } from 'react-router-dom';
export default function NotFound() {
  return <div className="wrap empty tall"><h1 className="display">404</h1><p className="muted lead">The page you’re looking for can’t be found.</p><Link className="btn" to="/">Go home</Link></div>;
}
