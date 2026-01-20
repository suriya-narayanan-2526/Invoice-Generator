# Deploying Invoice Generator to Vercel

This guide will walk you through deploying both the frontend and backend to Vercel.

## Overview

- **Frontend**: React/Vite app → Deploy to Vercel
- **Backend**: Express.js API → Deploy to Vercel (Serverless Functions)
- **Database**: Already hosted on Supabase ✓
- **Email**: Already configured with Resend ✓

---

## Part 1: Prepare Backend for Vercel

### Step 1: Create `vercel.json` for Backend

Create a file at `d:\window\Invoice\backend\vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Step 2: Update `package.json` in Backend

Make sure your `backend/package.json` has:

```json
{
  "engines": {
    "node": "18.x"
  }
}
```

---

## Part 2: Deploy Backend to Vercel

### Option A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy Backend:**
   ```bash
   cd backend
   vercel
   ```

4. **Follow the prompts:**
   - Link to existing project? No
   - Project name? `invoice-generator-api`
   - Directory? `./` (current directory)

5. **Set up Environment Variables:**
   After deployment, go to your Vercel dashboard:
   - Select your backend project
   - Go to **Settings** → **Environment Variables**
   - Add all variables from your `.env` file:
     ```
     NODE_ENV=production
     JWT_SECRET=your-secret-key
     DATABASE_URL=postgresql://postgres.cazmhywurqrsrjwxccqb:...
     EMAIL_MODE=resend
     RESEND_API_KEY=re_hic9j83z_HZ93EmH24mfCsgVmHpiKx14A
     EMAIL_FROM=noreply@suriyainvoicegenerator.in
     EMAIL_FROM_NAME=Invoice Generator
     FRONTEND_URL=https://your-frontend-url.vercel.app
     PAYMENT_MODE=razorpay
     RAZORPAY_KEY_ID=rzp_test_S4yPJipGevNmkP
     RAZORPAY_KEY_SECRET=zfFtLnBG6WRg5pQrwzv73u53
     STORAGE_MODE=supabase
     SUPABASE_URL=https://cazmhywurqrsrjwxccqb.supabase.co
     SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```

6. **Redeploy after adding environment variables:**
   ```bash
   vercel --prod
   ```

### Option B: Using GitHub (Alternative)

1. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare backend for Vercel"
   git push origin main
   ```

2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click **"Add New Project"**
   - Import your GitHub repository
   - Select the `backend` folder as root directory
   - Add all environment variables
   - Click **Deploy**

---

## Part 3: Deploy Frontend to Vercel

### Step 1: Create `vercel.json` for Frontend

Create a file at `d:\window\Invoice\frontend\vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Step 2: Update Frontend Environment Variables

Create/update `frontend/.env.production`:

```bash
VITE_API_URL=https://your-backend-url.vercel.app
```

### Step 3: Deploy Frontend

Using Vercel CLI:

```bash
cd frontend
vercel
```

Follow the prompts:
- Project name? `invoice-generator`
- Directory? `./`

Then deploy to production:

```bash
vercel --prod
```

---

## Part 4: Update Configuration

### Update CORS in Backend

Edit `backend/src/app.js` to include your Vercel frontend URL:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-frontend-url.vercel.app'
  ],
  credentials: true
}));
```

Redeploy backend:
```bash
cd backend
vercel --prod
```

### Update Frontend API URL

Make sure `frontend/.env.production` has:
```bash
VITE_API_URL=https://your-backend-url.vercel.app
```

Redeploy frontend:
```bash
cd frontend
vercel --prod
```

---

## Part 5: Post-Deployment Checklist

- [ ] Backend deployed to Vercel
- [ ] Frontend deployed to Vercel
- [ ] All environment variables set in Vercel dashboard
- [ ] CORS updated with production URLs
- [ ] FRONTEND_URL in backend env points to production frontend
- [ ] Test user registration (check email delivery)
- [ ] Test invoice creation
- [ ] Test PDF generation
- [ ] Test payment flow
- [ ] Update Razorpay webhook URL (if using webhooks)

---

## Your Deployment URLs

After deployment, you'll have:

**Frontend:** `https://invoice-generator-xyz123.vercel.app`
**Backend:** `https://invoice-generator-api-xyz123.vercel.app`

**Important:** Replace these in:
1. Backend environment variables (`FRONTEND_URL`)
2. Frontend environment variables (`VITE_API_URL`)
3. Backend CORS configuration
4. Resend email templates (already using `FRONTEND_URL`)

---

## Troubleshooting

### Issue: Backend returns 404

- Check that `vercel.json` is in the correct location
- Verify the `src` path matches your `server.js` location

### Issue: Database connection fails

- Check that `DATABASE_URL` is set correctly in Vercel environment variables
- Make sure Supabase allows connections from Vercel IPs

### Issue: Emails not sending

- Verify `RESEND_API_KEY` is set in Vercel
- Check that `EMAIL_FROM` uses your verified domain
- Update `FRONTEND_URL` to your production frontend URL

### Issue: CORS errors

- Update `backend/src/app.js` CORS configuration
- Add your production frontend URL to allowed origins
- Redeploy backend

---

## Alternative: Deploy to Vercel via Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your repository
4. Deploy frontend:
   - Root Directory: `frontend`
   - Framework Preset: Vite
   - Add environment variables
5. Deploy backend (create another project):
   - Root Directory: `backend`
   - Framework Preset: Other
   - Add environment variables

---

## Monitoring

After deployment:
- Check **Vercel Dashboard** → **Deployments** for build logs
- Check **Functions** tab for serverless function logs
- Monitor **Analytics** for traffic and errors

---

## Updating Your Deployment

Whenever you make changes:

```bash
# Backend
cd backend
vercel --prod

# Frontend  
cd frontend
vercel --prod
```

Or push to GitHub if using automatic deployments.
