# Shelf — Inventory & Layaway Manager

Built for a one-person secondhand household shop (Germany/UK imports). Runs entirely on
your own computer — no domain, no hosting bill, no monthly cost. Your tablet connects to
it over your home/shop WiFi.

## What it does

- **Categories** with a short code prefix (e.g. Appliances → `APP`)
- **Add items**: pick a category, snap/upload a photo, set cost price + selling price +
  quantity, add a name if it needs one (e.g. "Bosch Kettle 1.7L") — a unique product code
  like `APP-0001` is generated automatically
- **Shelf view**: search by name/code, filter by category/status, see photos and stock at a
  glance
- **Mark Sold**: enter quantity sold, stock decreases automatically, and once it hits 0 the
  item is marked sold out and drops off the active shelf
- **Layaway**: customers paying in installments — record each deposit, see the running
  balance, and once fully paid you mark it "Picked Up" (it leaves inventory) or cancel to
  put the item back on the shelf
- **Dashboard**: revenue today/this month, profit, stock value, low-stock alerts, a 14-day
  revenue chart, and top-selling categories
- **Printable labels**: each item gets a QR code + price label you can print and stick on
  the product
- **Single login**: one admin password protects the whole app, since it's just you

## Tech stack

Next.js + TypeScript, Tailwind CSS, SQLite (via `better-sqlite3` + Drizzle ORM), images
saved to a local `public/uploads` folder. Everything lives in one `data/shop.db` file.

## One-time setup

You need [Node.js](https://nodejs.org) (version 18 or newer) installed on the computer
that will run the shop — this can be a laptop, an old desktop, or even the tablet itself
if it can run Node. Most people run this on a laptop and just *view* it from the tablet's
browser.

1. Unzip this project folder.
2. Open a terminal in the folder and install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment file and set your own password:
   ```bash
   cp .env.local.example .env.local
   ```
   Then open `.env.local` and change `ADMIN_PASSWORD` to something only you know.

4. (Optional) Set your currency symbol — open `.env.local` and add:
   ```
   NEXT_PUBLIC_CURRENCY=KSh
   ```
   Change `KSh` to whatever you use (e.g. `€`, `£`, `KES`). Defaults to `KSh`.

## Running it day-to-day

```bash
npm run dev
```

This starts the app at `http://localhost:3000` on the computer running it. The first time
it runs, it automatically creates the database file and a starter set of categories
(Appliances, Kitchenware, Furniture, Electronics, Toys, Clothing, Home Decor) — edit or
delete these anytime under **Categories**.

### Using it from your tablet

1. Make sure the tablet and the computer running the app are on the **same WiFi network**.
2. On the computer, find its local network IP address:
   - Windows: open Command Prompt, run `ipconfig`, look for "IPv4 Address" (e.g. `192.168.1.42`)
   - Mac: System Settings → Wi-Fi → Details, or run `ipconfig getifaddr en0` in Terminal
3. On the tablet's browser, go to `http://<that-ip>:3000` (e.g. `http://192.168.1.42:3000`).
4. Bookmark it, or "Add to Home Screen" so it opens like an app.

Keep the computer running and awake (disable sleep) while the shop is open, since it's
what actually serves the app to your tablet.

### Keeping it running automatically (optional)

If you want the app to start automatically and stay running without you opening a
terminal every day, you can use a tool like [pm2](https://pm2.keymetrics.io/):
```bash
npm install -g pm2
npm run build
pm2 start npm --name shop -- start
pm2 save
```

## Backing up your data

Everything — products, categories, sales history, layaway orders — lives in
`data/shop.db`. Everything photo-related lives in `public/uploads/`. Periodically copy
both to a USB drive or cloud folder (Google Drive desktop, etc.) as a backup. There is no
automatic cloud sync since there's no server involved — it's all local by design, which is
what keeps it free.

## Daily workflow this was built around

1. New stock arrives → **Add Item**: choose category, photograph it, set prices and
   quantity → code is generated → print a label for it.
2. Customer buys something off the shelf → find it (search or browse) → **Mark Sold** →
   enter quantity → stock and sales figures update instantly.
3. Customer wants to pay in installments → open the item → **Start Layaway** → enter
   their name/phone and the agreed price → the item is marked "Reserved" and taken off
   the active shelf. Each time they pay, open their order and **Add payment**. When the
   balance hits zero, the order is marked "Fully Paid" — once they physically collect it,
   press **Mark Picked Up**.
4. Check the **Dashboard** anytime for how the day/month is going, what's low on stock,
   and what customers still owe you.

## Notes & possible next steps

- Product codes never get reused, even after an item is sold, so history stays accurate.
- "Reserved" items (in an active layaway) are automatically excluded from the sellable
  shelf so you don't double-sell something someone's already paying for.
- If you ever do want to put this online (e.g. to check stock from your phone while out),
  the same codebase deploys to free tiers of services like Railway or Render — just ask
  and it can be adapted; it would need a small persistent-disk plan since SQLite needs a
  real file system (not typical serverless hosting).
# shop-inventory2
