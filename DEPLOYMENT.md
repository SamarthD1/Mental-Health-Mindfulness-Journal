# Render Deployment Guide

## 🚀 Quick Start

This guide will help you deploy the Mental Health & Mindfulness Journal application to Render with separate backend and frontend services.

## Prerequisites

- GitHub account with your code pushed
- Render account (free tier works)
- MongoDB Atlas database (already configured)

## Part 1: Deploy Backend (Web Service)

### Step 1: Create Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `SamarthD1/Mental-Health-Mindfulness-Journal`
4. Configure the service:
   - **Name**: `mental-health-backend` (or your choice)
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### Step 2: Set Environment Variables

Click **"Advanced"** and add these environment variables:

| Key | Value |
|-----|-------|
| `PORT` | `5050` |
| `MONGO_URI` | Your MongoDB connection string |
| `JWT_SECRET` | A random secure string (e.g., `your_super_secret_jwt_key_here`) |
| `CLIENT_URL` | Leave empty for now (will add after frontend deployment) |
| `NODE_ENV` | `production` |

> **Note**: Get your MONGO_URI from MongoDB Atlas. It should look like:
> `mongodb+srv://username:password@cluster.mongodb.net/mental_health_journal`

### Step 3: Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Once deployed, copy your backend URL (e.g., `https://mental-health-backend.onrender.com`)

### Step 4: Test Backend

Visit: `https://your-backend-url.onrender.com/api/health`

You should see: `{"status":"ok","timestamp":"..."}`

---

## Part 2: Deploy Frontend (Static Site)

### Step 1: Create Static Site

1. Go to Render Dashboard
2. Click **"New +"** → **"Static Site"**
3. Connect the same GitHub repository
4. Configure:
   - **Name**: `mental-health-frontend` (or your choice)
   - **Branch**: `main`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

### Step 2: Set Environment Variable

Click **"Advanced"** and add:

| Key | Value |
|-----|-------|
| `VITE_API_BASE` | Your backend URL (e.g., `https://mental-health-backend.onrender.com`) |

### Step 3: Deploy

1. Click **"Create Static Site"**
2. Wait for deployment (3-5 minutes)
3. Copy your frontend URL (e.g., `https://mental-health-frontend.onrender.com`)

---

## Part 3: Update Backend CORS

### Step 1: Update Backend Environment

1. Go to your **backend service** on Render
2. Navigate to **"Environment"** tab
3. Update the `CLIENT_URL` variable:
   - **Key**: `CLIENT_URL`
   - **Value**: Your frontend URL (e.g., `https://mental-health-frontend.onrender.com`)
4. Click **"Save Changes"**
5. Service will automatically redeploy

---

## Part 4: Seed Database (Optional)

If you need to create admin and therapist accounts:

1. Go to your backend service on Render
2. Click **"Shell"** tab
3. Run: `npm run seed`
4. Wait for "Seeding complete!" message

---

## 🧪 Testing Your Deployment

### 1. Test Frontend
- Visit your frontend URL
- You should see the login/register page

### 2. Test Registration
- Click "Register"
- Create a new account
- Verify you can login

### 3. Test Features
- Create a journal entry
- Check if it saves properly
- Test navigation between pages

### 4. Test Admin Account
- Login with: `admin@mindspace.com` / `admin123`
- Verify admin dashboard loads
- Try adding a meditation resource

### 5. Test Therapist Account
- Login with: `therapist@mindspace.com` / `therapist123`
- Verify therapist dashboard loads

---

## 🔧 Troubleshooting

### Backend Issues

**Problem**: "Cannot connect to MongoDB"
- **Solution**: Check MONGO_URI in environment variables
- Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

**Problem**: "CORS error"
- **Solution**: Verify CLIENT_URL matches your frontend URL exactly
- Check backend logs for CORS-related errors

### Frontend Issues

**Problem**: "Network Error" or "Failed to fetch"
- **Solution**: Check VITE_API_BASE environment variable
- Ensure it points to your backend URL (no trailing slash)

**Problem**: "404 on page refresh"
- **Solution**: This is normal for Render Static Sites with React Router
- Render automatically handles this

### General Issues

**Problem**: "Service unavailable" or slow response
- **Solution**: Free tier services sleep after 15 minutes of inactivity
- First request may take 30-60 seconds to wake up

---

## 📝 Important Notes

1. **Free Tier Limitations**:
   - Services sleep after 15 minutes of inactivity
   - 750 hours/month of runtime
   - Slower performance than paid tiers

2. **Database**:
   - Use MongoDB Atlas (free tier available)
   - Ensure network access allows all IPs

3. **Environment Variables**:
   - Never commit `.env` files to GitHub
   - Always use Render's environment variable settings

4. **Updates**:
   - Push to GitHub `main` branch to trigger auto-deploy
   - Or manually deploy from Render dashboard

---

## 🎉 Success!

Your Mental Health & Mindfulness Journal is now live!

- **Frontend**: `https://your-frontend.onrender.com`
- **Backend**: `https://your-backend.onrender.com`

Share your frontend URL with users to access the application!
