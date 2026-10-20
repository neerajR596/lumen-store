# Lumen: Step-by-step guide

This guide walks you through the whole project from scratch:

1. [Set up MongoDB Atlas](#1-set-up-mongodb-atlas) (the database)
2. [Run the project](#2-run-the-project)
3. [Use the admin dashboard](#3-use-the-admin-dashboard) (manage products, banners and the storefront without code)
4. [Work on the frontend](#4-work-on-the-frontend) (change the design and add pages)
5. [Work on the backend](#5-work-on-the-backend) (add fields and API endpoints)
6. [Turn on Razorpay payments](#6-turn-on-razorpay-payments)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Set up MongoDB Atlas

MongoDB Atlas is MongoDB's cloud database, and its free **M0** tier is enough for this project.

### 1.1 Create an account and a project
1. Go to **https://cloud.mongodb.com** and sign up, or sign in.
2. Open the **Project** dropdown at the top left, choose **View all projects**, then **New Project**.
3. Name it (for example `Lumen Store`), click **Next**, then **Create Project**.

### 1.2 Create a free cluster
1. On the project overview, click **Create** under "Create a cluster".
2. Choose **Free** (M0). Make sure you don't pick the paid M10, which is selected by default.
3. **Provider:** AWS. **Region:** the one closest to you (for India, **Mumbai (ap-south-1)**).
4. Name it (for example `LumenCluster`) and click **Create Deployment**.

### 1.3 Create a database user
Atlas asks for this right after you create the cluster. If you skipped it, go to **Security → Database & Network Access → Database Users**.
1. Click **Add New Database User**.
2. Choose **Password**, enter a username, and click **Autogenerate Secure Password**.
3. **Copy the password and keep it somewhere safe.** You'll need it in a moment.
4. Role: **Read and write to any database**, then click **Add User**.

### 1.4 Allow your computer to connect
1. Go to **Security → Database & Network Access → IP Access List**.
2. Click **Add IP Address**, then **Add Current IP Address**, then **Confirm**.
3. When you deploy to a host such as Render, add that host's outgoing IP addresses too, or `0.0.0.0/0` (allow from anywhere, which is less secure).

> Your home IP address can change. If the app suddenly can't connect, add your current IP again.

### 1.5 Get your connection string
1. Go to **Database → Clusters** and click **Connect** on your cluster.
2. Choose **Drivers**, then **Node.js**.
3. Copy the string. It looks like this:
   ```
   mongodb+srv://<db_user>:<db_password>@yourcluster.abcde.mongodb.net/
   ```
4. Replace `<db_password>` with your password, and add a database name (`lumen`) after the `/`:
   ```
   mongodb+srv://myuser:MyPass123@yourcluster.abcde.mongodb.net/lumen?retryWrites=true&w=majority
   ```
   If your password contains special characters such as `@ : / ? #`, [URL-encode them](https://www.urlencoder.org/) (for example, `@` becomes `%40`).

### 1.6 Put it in the project
```bash
cp server/.env.example server/.env
```
Open `server/.env` and paste the string into `MONGO_URI=`. **Never commit `.env`**. It's already listed in `.gitignore`.

### 1.7 Load the sample data
```bash
npm run seed
```
You should see:
```
✓ MongoDB connected: ...
✓ Admin created: admin@lumen.store
✓ Seeded 6 categories, 20 products, banners and settings into "lumen".
```
To check, open **Atlas → Database → Browse Collections**. You'll see `products`, `categories`, `banners`, `settings` and `users`. Orders appear in `orders` once someone checks out.

### What's stored in each collection

| Collection | What's in it | Edited from |
|---|---|---|
| `products` | Title, price, MRP, stock, images, colours, highlights, reviews, rating | Admin → Products |
| `categories` | Name, slug, tagline, image, order | Admin → Categories |
| `banners` | Home page showcase tiles | Admin → Home banners |
| `settings` | A single document: store name, hero, announcement, accent colour, delivery and GST | Admin → Storefront |
| `orders` | Items, address, payment details, status, totals | Placed at checkout; Admin → Orders |
| `users` | Name, email, hashed password, admin flag, saved address | Sign-up page; Admin → Customers |

---

## 2. Run the project

```bash
npm run install-all     # first time only
npm run dev             # backend on :5050, frontend on :5173 with live reload
```
Open **http://localhost:5173**.

To run it as a single production-style server: `npm run build && npm start`, then open **http://localhost:5050**.

On macOS you can also just double-click **`start-lumen.command`**.

---

## 3. Use the admin dashboard

### 3.1 Sign in
Go to **/login** and sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `server/.env` (default `admin@lumen.store` / `admin12345`). Admins land on **/admin**. You can also reach it from the account icon → **Dashboard**.

> **Change the admin password** before going live: open **Account** in the store and set a new password.
> To make another account an admin, go to **Admin → Customers** and switch on **Admin** for that person.

### 3.2 Overview
Shows revenue (paid orders), number of orders, customers and products, a 14-day revenue chart (hover a bar for details), top sellers, low-stock alerts (5 or fewer left) and recent orders.

### 3.3 Products
- **Add:** click **+ New product** and fill in the title, tagline, description and highlights (one per line). Then choose a category, set the price, the MRP (a higher MRP shows a "Save X%" label) and the stock.
- **Images:** paste an image URL, or click **Upload** to choose a file from your computer (up to 5 MB). Use **+ Add image** for more photos. The first image is the main one.
- **Colours:** click **+ Add colour**, pick the colour and give it a name. Customers choose from these on the product page.
- **Featured on home page:** puts the product in the "The latest" shelf.
- **Visible in store:** switch it off to hide a product without deleting it.
- The **Live preview** card shows exactly how the product will look in the store.
- In the product list you can search, switch **Featured** and **Visible** on or off with one click, **Edit**, or **Delete**.

### 3.4 Categories
Add or edit a category's name, tagline, display order and image. Categories appear in the top navigation, the shop filter chips and the home page category circles. A category can't be deleted while it still has products, so move or delete those first.

### 3.5 Home banners
These are the large showcase tiles under the hero section.
- **+ New banner:** set the eyebrow (a small coloured label such as "New"), title, subtitle, image, button text and link, and an optional second link.
- **Theme:** Light (grey background) or Dark (black background).
- **Size:** Full width (stacked) or Half width (two side by side).
- The right side of the form shows a **live preview**.
- In the list: switch **Live** to show or hide a banner, use **↑ / ↓** to reorder, and **Edit** or **Delete**.
- Link examples: `/product/orbit-smartwatch`, `/shop?category=audio`, `/shop?sort=newest`.

### 3.6 Storefront
Change the content and settings of the whole store, then click **Publish changes**. Changes go live straight away.
- **Store name** (shown in the header, footer and browser tab)
- **Accent colour** (buttons, links and highlights everywhere)
- **Announcement bar** (switch it on or off and set the message)
- **Hero:** eyebrow, headline (press Enter for a second line), sub-headline, button, and an optional hero image (it defaults to your first featured product)
- **Delivery and tax:** free-delivery limit, delivery fee and GST rate (`0.18` means 18%)
- **Footer note**

### 3.7 Orders
Filter by status (Pending payment, Processing, Shipped, Delivered, Cancelled). Click a row to see its items, delivery address and Razorpay payment ID. Change the status with the dropdown. Marking a **Cash on Delivery** order as **Delivered** also marks it **Paid**.

### 3.8 Customers
See everyone who has signed up. You can make someone an admin or remove admin access, or delete an account. You can't remove your own admin access.

---

## 4. Work on the frontend

The frontend is **React 18 + Vite** in `client/`, styled with plain CSS (no UI library).

### 4.1 Where things are
| You want to change… | Edit |
|---|---|
| Colours, fonts, spacing, corner rounding, shadows | `client/src/styles/global.css` → the `:root { ... }` variables at the top |
| The admin's look | `client/src/styles/admin.css` |
| The home page layout | `client/src/pages/Home.jsx` |
| The product card | `client/src/components/ProductCard.jsx` |
| The top navigation and search | `client/src/components/Nav.jsx` |
| The bag drawer | `client/src/components/CartDrawer.jsx` |
| Checkout and payment | `client/src/pages/Checkout.jsx`, `client/src/razorpay.js` |
| Page routes | `client/src/App.jsx` |
| API calls | `client/src/api.js` (the `api()` helper adds the sign-in token automatically) |

### 4.2 Change the theme
Everything uses CSS variables, so editing them changes the whole site:
```css
:root {
  --accent: #0071e3;   /* also editable from Admin → Storefront */
  --ink: #1d1d1f;      /* main text */
  --bg-2: #f5f5f7;     /* section backgrounds */
  --r-lg: 28px;        /* card corner rounding */
  --font: 'Inter', -apple-system, ...;
}
```
To change the font, update the Google Fonts `<link>` in `client/index.html` and the `--font` variable.

### 4.3 Scroll-in animations
Wrap any element in `<Reveal>` to make it fade up as it scrolls into view:
```jsx
import Reveal from '../components/Reveal.jsx';
<Reveal delay={100}><h2>Hello</h2></Reveal>
```
Animations are switched off automatically for people who have reduced motion turned on.

### 4.4 Add a new page
1. Create `client/src/pages/About.jsx`:
   ```jsx
   export default function About() {
     return <div className="wrap"><h1 className="page-title">About us.</h1></div>;
   }
   ```
2. Register it in `client/src/App.jsx`:
   ```jsx
   import About from './pages/About.jsx';
   <Route path="/about" element={<About />} />
   ```
3. Add a link in `Nav.jsx` or `Footer.jsx`: `<Link to="/about">About</Link>`.

### 4.5 Fetch data from the API
```jsx
import { useEffect, useState } from 'react';
import { api } from '../api.js';

const [items, setItems] = useState([]);
useEffect(() => { api('/products?featured=true').then((d) => setItems(d.items)); }, []);
```
For signed-in requests, nothing extra is needed: `api()` sends the token for you.

### 4.6 Add a new admin page
1. Create `client/src/admin/Coupons.jsx`, using the `admin-page`, `admin-head` and `panel` classes for the standard layout.
2. Add a route inside the `/admin` route in `App.jsx`: `<Route path="coupons" element={<Coupons />} />`
3. Add it to the `LINKS` array in `client/src/admin/AdminLayout.jsx` so it appears in the sidebar.

### 4.7 Build for production
```bash
npm run build      # outputs client/dist
npm start          # Express serves client/dist and the API together on :5050
```
If you host the frontend separately (Vercel or Netlify), set `VITE_API_URL=https://your-api.example.com` when building.

---

## 5. Work on the backend

Express + Mongoose in `server/src/`.

### 5.1 Add a field to products (example: `warranty`)
1. `server/src/models/Product.js`: add `warranty: { type: String, default: '1 year' },`
2. `server/src/routes/products.js`: add `'warranty'` to the `fields` list in `pick()`. Admin updates only save fields on this list, which is deliberate.
3. Frontend: add an input in `client/src/admin/ProductEditor.jsx` and show it in `client/src/pages/Product.jsx`.

### 5.2 Add a new API endpoint
```js
// server/src/routes/products.js
r.get('/:id/stock', asyncHandler(async (req, res) => {
  const p = await Product.findById(req.params.id).select('stock');
  if (!p) throw new HttpError(404, 'Product not found');
  res.json({ stock: p.stock });
}));
```
- Wrap handlers in `asyncHandler`, and `throw new HttpError(status, message)` for errors. The error middleware turns these into clean JSON responses.
- Protect a route with `protect` (signed-in users) and `admin` (admins only): `r.post('/', protect, admin, handler)`.
- A new router file also needs `app.use('/api/xyz', xyzRoutes)` in `server/src/index.js`.

### 5.3 Security rules to keep
- Always work out order prices on the server (see `priceItems()` in `routes/orders.js`). Never trust prices sent from the browser.
- Only mark an order paid after `/payments/razorpay/verify` has checked the signature.
- Keep secrets in `server/.env`, never in code.

---

## 6. Turn on Razorpay payments
1. Sign up at **https://dashboard.razorpay.com** and stay in **Test Mode** (toggle at the top).
2. Go to **Settings → API Keys → Generate Test Key**.
3. Paste them into `server/.env`:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxx
   ```
4. Restart the server. **Pay online** is now available at checkout.
5. Test with UPI `success@razorpay`, or card `4111 1111 1111 1111` with any future date and any CVV.
6. Paid orders show the Razorpay payment ID in **Admin → Orders**, and in your Razorpay dashboard under **Transactions**.

To go live: complete Razorpay's account activation (KYC), generate **Live** keys, and put them in your production environment variables.

---

## 7. Troubleshooting

| Problem | Fix |
|---|---|
| `Could not connect to MongoDB` | Check the password in `MONGO_URI`, add your IP in Atlas → IP Access List, and make sure the cluster isn't paused (Atlas pauses free clusters after long inactivity; click **Resume**). |
| `bad auth : authentication failed` | Wrong username or password, or a special character in the password that isn't URL-encoded. |
| `EADDRINUSE :5000` on macOS | The Mac's AirPlay Receiver uses port 5000. This project uses **5050** by default (`PORT` in `.env`). |
| "Pay online" is greyed out | Razorpay keys are missing from `server/.env`. Restart after adding them. |
| Admin page sends you back to the home page | That account isn't an admin. Sign in as the seeded admin, or give the account admin access under Admin → Customers. |
| Uploaded images disappear after deploying | Many hosts wipe their disk on every redeploy. Use image URLs, or add cloud storage (for example Cloudinary or S3). |
| Changes in `server/` don't show up | `npm run dev` restarts the server automatically; with `npm start`, restart it yourself. |
| Changes in `client/` don't show up on :5050 | Run `npm run build` again, or use the dev server on :5173. |
