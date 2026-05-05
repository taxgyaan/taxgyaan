# TaxGyaan.in — India's Free CA Finance Portal

Free tax calculators, GST invoice generator, and investment tools for India.

## Features
- 🧾 Income Tax Calculator (Old vs New Regime)
- 📋 TDS / TCS Interest Calculator
- 📈 Capital Gains Tax Calculator
- 💹 SIP Returns vs FD Calculator
- 🧾 GST Tax Invoice Generator (with inline editing)
- 📊 MIS & Product Costing Tools
- 📝 CA Blog
- 🏛️ Government Portal Links

## Local Development

```bash
npm install
npm run dev
```

Opens at http://localhost:5173

## Build for Production

```bash
npm run build
```

Output goes to `/dist` folder.

## Deploy to Vercel

### Option 1 — Via GitHub (Recommended)
1. Push this repo to GitHub
2. Go to vercel.com → Import Project → Select repo
3. Click Deploy — done!

### Option 2 — Via Vercel CLI
```bash
npm install -g vercel
vercel
```

## Update Blog Posts
Edit the `BLOG_POSTS` array in `src/App.jsx` and push to GitHub.
Vercel auto-deploys within 30 seconds.

## Connect Custom Domain (taxgyaan.in)
1. Vercel Dashboard → Project → Settings → Domains
2. Add `taxgyaan.in` and `www.taxgyaan.in`
3. Copy the DNS records Vercel shows you
4. Paste them in GoDaddy → DNS → Manage
5. Wait 10–30 mins → live!
