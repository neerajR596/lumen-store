#!/bin/bash
# Double-click to install, seed and run Lumen on macOS.
cd "$(dirname "$0")"
echo "✨ Starting Lumen…"

if ! command -v node >/dev/null 2>&1; then
  echo "✗ Node.js is not installed. Download the LTS version from https://nodejs.org, install it, then double-click this file again."
  open "https://nodejs.org/en/download"
  read -p "Press Enter to close"; exit 1
fi
echo "✓ Node $(node -v)"

if [ ! -f server/.env ]; then cp server/.env.example server/.env; fi
if grep -q "^MONGO_URI=.*<db_password>" server/.env; then
  echo ""
  echo "→ One step needed: put your MongoDB Atlas database password into server/.env"
  echo "  Replace <db_password> in the MONGO_URI line, save the file, then come back here."
  open -e server/.env
  read -p "Press Enter after you've saved server/.env… "
fi

if [ ! -d server/node_modules ] || [ ! -d client/node_modules ]; then
  echo "→ Installing packages (first run only, takes a minute)…"
  npm run install-all || { read -p "Install failed. Press Enter to close"; exit 1; }
fi

if [ ! -f .seeded ]; then
  echo "→ Adding sample products, banners and the admin account to your database…"
  npm run seed && touch .seeded || { echo "✗ Could not reach MongoDB. Check the password in server/.env and Atlas → Network Access."; read -p "Press Enter to close"; exit 1; }
fi

echo "→ Building the storefront…"
npm run build >/dev/null || { read -p "Build failed. Press Enter to close"; exit 1; }

(sleep 3 && open "http://localhost:5050") &
echo ""
echo "✓ Lumen is running at http://localhost:5050"
echo "  Admin dashboard: http://localhost:5050/admin  (admin@lumen.store / see ADMIN_PASSWORD in server/.env)"
echo "  Keep this window open. Press Ctrl+C to stop."
npm start
