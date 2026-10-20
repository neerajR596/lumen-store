// Seeds the database with categories, products, home-page banners, settings and an admin user.
// Usage: npm run seed            (adds sample data, keeps existing users & orders)
//        npm run seed -- --fresh (wipes products/categories/banners/settings first)
import mongoose from 'mongoose';
import { config } from '../config.js';
import { connectDB } from '../index.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Banner from '../models/Banner.js';
import Settings from '../models/Settings.js';
import { slugify } from '../utils/asyncHandler.js';

const img = (id, w = 1200) => `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

export const categories = [
  { name: 'Audio', slug: 'audio', tagline: 'Sound, refined.', image: img('1583394838336-acd977736f90', 800), order: 1 },
  { name: 'Wearables', slug: 'wearables', tagline: 'Time, reimagined.', image: img('1637160151663-a410315e4e75', 800), order: 2 },
  { name: 'Computing', slug: 'computing', tagline: 'Power you can carry.', image: img('1525547719571-a2d4ac8945e2', 800), order: 3 },
  { name: 'Camera', slug: 'camera', tagline: 'Every moment, sharper.', image: img('1520549233664-03f65c1d1327', 800), order: 4 },
  { name: 'Home', slug: 'home', tagline: 'Spaces that breathe.', image: img('1555041469-a586c61ea9bc', 800), order: 5 },
  { name: 'Lifestyle', slug: 'lifestyle', tagline: 'Made for the everyday.', image: img('1553062407-98eeb64c6a62', 800), order: 6 },
];

const P = (title, category, price, mrp, imgs, extra = {}) => ({
  title, slug: slugify(title), category, price, mrp, images: imgs.map((i) => img(i)), stock: 25, ...extra,
});

export const products = [
  P('Aura Max Wireless Headphones', 'audio', 24990, 29990, ['1505740420928-5e560c06d30e', '1583394838336-acd977736f90'], {
    featured: true, tagline: 'Silence the world. Hear every detail.',
    description: 'Adaptive noise cancellation, 40-hour battery and a featherlight memory-foam fit. Aura Max tunes itself to your ears and your surroundings, so music always sounds the way it was mixed.',
    highlights: ['Adaptive noise cancellation', '40 hours battery', 'Spatial audio', 'USB-C fast charge: 5 min = 3 hrs'],
    colors: [{ name: 'Sunburst', hex: '#f5c518' }, { name: 'Graphite', hex: '#2c2c2e' }, { name: 'Cloud', hex: '#e5e5ea' }] }),
  P('Aura Studio Headphones', 'audio', 15990, 18990, ['1546435770-a3e426bf472b'], {
    tagline: 'Studio sound. All-day comfort.', description: 'Balanced, reference-grade drivers with plush protein-leather cushions, built for long sessions.',
    highlights: ['50mm drivers', '30 hours battery', 'Multipoint pairing'], colors: [{ name: 'Midnight', hex: '#1c2a44' }, { name: 'Stone', hex: '#8e8e93' }] }),
  P('Pebble Buds', 'audio', 7990, 9990, ['1606220588913-b3aacb4d2f46'], {
    featured: true, tagline: 'Tiny. Mighty. Effortless.', description: 'Pocketable earbuds with crystal-clear calls, sweat resistance and a case that charges wirelessly.',
    highlights: ['ANC with transparency mode', 'IPX4', '28 hours with case'], colors: [{ name: 'White', hex: '#f2f2f7' }] }),
  P('Pulse Sport Buds', 'audio', 5490, 6990, ['1606220945770-b5b6c2c55bf1'], {
    tagline: 'Built to move with you.', description: 'Secure-fit wings, punchy bass and IPX5 protection for every run.',
    highlights: ['Secure-fit wings', 'IPX5', 'Low-latency mode'], colors: [{ name: 'Ink', hex: '#1d1d3f' }] }),
  P('Orbit Smartwatch', 'wearables', 32990, 36990, ['1660844817855-3ecc7ef21f12', '1637160151663-a410315e4e75'], {
    featured: true, tagline: 'Your health. On your wrist.', description: 'Always-on display, heart-rate and SpO₂ tracking, sleep insights and a battery that lasts the whole week.',
    highlights: ['Always-on AMOLED', '7-day battery', 'GPS + 100 workout modes', 'Water resistant to 50m'],
    colors: [{ name: 'Obsidian', hex: '#111' }, { name: 'Silver', hex: '#c7c7cc' }] }),
  P('Meridian Classic Watch', 'wearables', 12990, 15990, ['1523275335684-37898b6baf30'], {
    tagline: 'Timeless, by design.', description: 'A minimal analogue watch with a sapphire-coated face and Italian leather strap.',
    highlights: ['Sapphire-coated glass', 'Japanese movement', '5 ATM'], colors: [{ name: 'Ivory', hex: '#f5f0e6' }] }),
  P('Slate Pro 14 Laptop', 'computing', 129990, 144990, ['1629131726692-1accd0c53ce0', '1531297484001-80022131f5a1'], {
    featured: true, tagline: 'Pro performance. Featherweight.', description: 'A 14-inch Liquid-Retina-class display, 18-hour battery and a 12-core processor in a 1.3 kg aluminium shell.',
    highlights: ['12-core processor', '16 GB RAM / 512 GB SSD', '18-hour battery', '1.3 kg'],
    colors: [{ name: 'Space Grey', hex: '#4a4a4f' }, { name: 'Silver', hex: '#e3e4e5' }] }),
  P('Prism Air 13 Laptop', 'computing', 84990, 94990, ['1525547719571-a2d4ac8945e2', '1496181133206-80ce9b88a853'], {
    tagline: 'Light on weight. Big on colour.', description: 'Thin, fanless and silent, with a vivid 13-inch display for work and play.',
    highlights: ['Fanless design', '8 GB RAM / 256 GB SSD', '15-hour battery'], colors: [{ name: 'Aurora', hex: '#7b5cff' }] }),
  P('Halo Mechanical Keyboard', 'computing', 8990, 10990, ['1618384887929-16ec33fab9ef', '1587829741301-dc798b83add3'], {
    tagline: 'Every keystroke, a pleasure.', description: 'Hot-swappable switches, aluminium frame and wireless tri-mode connectivity.',
    highlights: ['Hot-swap switches', 'Bluetooth + 2.4GHz + USB-C', 'Aluminium body'] }),
  P('Glide Wireless Mouse', 'computing', 3490, 4490, ['1658070429465-848c0796abf3', '1615663245857-ac93bb7c39e7'], {
    tagline: 'Precision in motion.', description: 'Ergonomic sculpted shape, silent clicks and a 70-day battery.', highlights: ['Silent clicks', '4000 DPI', '70-day battery'] }),
  P('Snap Retro Film Camera', 'camera', 9990, 11990, ['1520549233664-03f65c1d1327'], {
    featured: true, tagline: 'Shoot on film. Keep every frame.', description: 'A pocketable 35mm film camera with a sharp glass lens, auto exposure and a built-in flash, wrapped in hand-stitched leather.',
    highlights: ['35mm film', 'Auto exposure', 'Built-in flash', 'Leather wrap'], colors: [{ name: 'Tan', hex: '#a0522d' }, { name: 'Black', hex: '#1d1d1f' }] }),
  P('Prime 50mm f/1.8 Lens', 'camera', 18990, 21990, ['1758109682731-79081e27e673', '1758109683112-de123797b54a'], {
    tagline: 'Creamy bokeh. Razor focus.', description: 'A bright prime lens for portraits and low light, with silent stepping autofocus.', highlights: ['f/1.8 aperture', 'Silent AF motor', '160 g'] }),
  P('Cloud Modular Sofa', 'home', 64990, 79990, ['1555041469-a586c61ea9bc'], {
    featured: true, tagline: 'Sink in. Stay a while.', description: 'Deep, modular seating upholstered in stain-resistant velvet. Rearrange it in minutes.',
    highlights: ['Modular 3-seater', 'Stain-resistant velvet', 'Free assembly'], colors: [{ name: 'Emerald', hex: '#2f5d50' }, { name: 'Sand', hex: '#d8c9b0' }] }),
  P('Arc Lounge Chair', 'home', 18990, 22990, ['1592078615290-033ee584e267', '1598300042247-d088f8ab3a91'], {
    tagline: 'Sculpted for slow mornings.', description: 'A curved shell chair with solid oak legs and a supportive, generous seat.', highlights: ['Solid oak legs', 'Moulded shell', 'Holds 120 kg'] }),
  P('Beam Desk Lamp', 'home', 4990, 5990, ['1507473885765-e6ed057f782c'], {
    tagline: 'Light, exactly where you need it.', description: 'Dimmable warm-to-cool LED with a weighted base and a fully adjustable arm.', highlights: ['3 colour temperatures', 'Touch dimmer', 'USB-C charging port'] }),
  P('Brew One Espresso Machine', 'home', 34990, 39990, ['1583165278997-0250ea5d72e2', '1772134141698-c47b78663c55', '1495474472287-4d71bcdd2085'], {
    tagline: 'Café mornings at home.', description: '15-bar pump, built-in grinder and a steam wand for silky microfoam.', highlights: ['15-bar pump', 'Built-in conical grinder', 'Steam wand'] }),
  P('Stride Runner', 'lifestyle', 8990, 10990, ['1591175359374-12dba73cd4b1'], {
    tagline: 'Light steps. Long miles.', description: 'Responsive foam, breathable knit and a grippy outsole for city runs.', highlights: ['Responsive foam', 'Breathable knit', '240 g'],
    colors: [{ name: 'Fog', hex: '#cfd2d6' }] }),
  P('Verde Suede Loafer', 'lifestyle', 6990, 8490, ['1560343090-f0409e92791a'], {
    tagline: 'Soft suede. Sharp style.', description: 'Hand-finished suede loafers with a cushioned footbed.', highlights: ['Genuine suede', 'Cushioned footbed'] }),
  P('Carry Everyday Backpack', 'lifestyle', 4490, 5490, ['1553062407-98eeb64c6a62'], {
    tagline: 'Everything, in its place.', description: 'Water-resistant, 20L, with a padded 16-inch laptop sleeve.', highlights: ['20 L', 'Water resistant', '16" laptop sleeve'] }),
  P('Flask Insulated Bottle', 'lifestyle', 1490, 1990, ['1602143407151-7111542de6e8'], {
    tagline: 'Cold for 24. Hot for 12.', description: 'Double-wall stainless steel with a powder-coat finish that won’t slip.', highlights: ['750 ml', 'BPA free', 'Leak-proof lid'],
    colors: [{ name: 'Sage', hex: '#5f7f63' }] }),
];

export const banners = [
  { eyebrow: 'New', title: 'Aura Max', subtitle: 'Silence the world. Hear every detail.', image: img('1583394838336-acd977736f90', 1600),
    ctaText: 'Buy', ctaLink: '/product/aura-max-wireless-headphones', secondaryText: 'Learn more', secondaryLink: '/shop?category=audio', theme: 'light', size: 'full', order: 1 },
  { eyebrow: 'Pro', title: 'Slate Pro 14', subtitle: 'Pro performance. Featherweight.', image: img('1531297484001-80022131f5a1', 1600),
    ctaText: 'Buy', ctaLink: '/product/slate-pro-14-laptop', secondaryText: 'Compare', secondaryLink: '/shop?category=computing', theme: 'dark', size: 'full', order: 2 },
  { eyebrow: 'Wearables', title: 'Orbit', subtitle: 'Your health. On your wrist.', image: img('1660844817855-3ecc7ef21f12', 1000),
    ctaText: 'Shop', ctaLink: '/product/orbit-smartwatch', theme: 'dark', size: 'half', order: 3 },
  { eyebrow: 'Home', title: 'Cloud Sofa', subtitle: 'Sink in. Stay a while.', image: img('1555041469-a586c61ea9bc', 1000),
    ctaText: 'Shop', ctaLink: '/product/cloud-modular-sofa', theme: 'light', size: 'half', order: 4 },
];

async function run() {
  await connectDB();
  const fresh = process.argv.includes('--fresh');
  if (fresh) await Promise.all([Product.deleteMany({}), Category.deleteMany({}), Banner.deleteMany({}), Settings.deleteMany({})]);

  for (const c of categories) await Category.updateOne({ slug: c.slug }, { $set: c }, { upsert: true });
  for (const p of products) await Product.updateOne({ slug: p.slug }, { $setOnInsert: { ...p, sold: Math.floor(Math.random() * 60) } }, { upsert: true });
  if (!(await Banner.countDocuments())) await Banner.insertMany(banners);
  await Settings.get();

  const email = (process.env.ADMIN_EMAIL || 'admin@lumen.store').toLowerCase();
  let adminUser = await User.findOne({ email });
  if (!adminUser) {
    adminUser = await User.create({ name: 'Store Admin', email, password: process.env.ADMIN_PASSWORD || 'admin12345', isAdmin: true });
    console.log(`✓ Admin created: ${email}`);
  } else if (!adminUser.isAdmin) { adminUser.isAdmin = true; await adminUser.save(); }

  console.log(`✓ Seeded ${categories.length} categories, ${products.length} products, banners and settings into "${mongoose.connection.name}".`);
  await mongoose.disconnect();
}

if (process.argv[1]?.endsWith('seed.js')) run().catch((e) => { console.error(e); process.exit(1); });
export { run as seed };
void config;
