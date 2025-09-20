# 🚀 Deployment Guide: Railway + Vercel

This guide will help you deploy your Task Manager app using Railway for the backend and Vercel for the frontend.

## 🎯 Why This Setup?

- **Railway**: Perfect for Node.js backends with MongoDB, excellent Docker support
- **Vercel**: Best-in-class for React frontends, automatic deployments
- **Cost-effective**: Both have generous free tiers
- **Easy setup**: Minimal configuration needed

## 📋 Prerequisites

1. GitHub repository with your code
2. Railway account (free tier available)
3. Vercel account (free tier available)
4. MongoDB Atlas account (for production database)

## 🔧 Step 1: Deploy Backend to Railway

### 1.1 Create Railway Project
1. Go to [Railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository

### 1.2 Configure Backend Service
1. Railway will detect the `backend/Dockerfile`
2. Set the **Root Directory** to `backend`
3. Add environment variables in Railway dashboard (copy from `backend/env.production`):

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmanager
JWT_SECRET=your-production-jwt-secret
JWT_REFRESH_SECRET=your-production-refresh-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
BCRYPT_SALT_ROUNDS=12
ALLOWED_ORIGINS=https://your-frontend.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
LOG_LEVEL=info
```

### 1.3 MongoDB Atlas Setup
1. Create a MongoDB Atlas account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in Railway environment variables with your Atlas connection string

### 1.4 Deploy
1. Railway will automatically build and deploy
2. Note the generated URL (e.g., `https://your-app.railway.app`)

## 🎨 Step 2: Deploy Frontend to Vercel

### 2.1 Create Vercel Project
1. Go to [Vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your GitHub repository

### 2.2 Configure Frontend
1. Set **Root Directory** to `frontend`
2. Set **Build Command** to `npm run build`
3. Set **Output Directory** to `dist`
4. Add environment variables (copy from `frontend/env.production`):
   ```
   VITE_NODE_ENV=production
   VITE_API_BASE_URL=https://your-backend.railway.app/api
   VITE_APP_NAME=Task Manager
   VITE_APP_VERSION=1.0.0
   VITE_DEBUG=false
   VITE_LOG_LEVEL=error
   ```

### 2.3 Deploy
1. Click "Deploy"
2. Vercel will build and deploy automatically
3. Note the generated URL (e.g., `https://your-app.vercel.app`)

## 🔄 Step 3: Set Up GitHub Actions (Optional)

### 3.1 Add Repository Secrets
In your GitHub repository settings, add these secrets:

```
RAILWAY_TOKEN=your-railway-token
RAILWAY_SERVICE_ID=your-railway-service-id
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id
```

### 3.2 Get Railway Token
1. Go to Railway dashboard
2. Click your profile → "Account Settings"
3. Go to "Tokens" tab
4. Create new token

### 3.3 Get Railway Service ID
1. In Railway dashboard, go to your service
2. Click "Settings" → "General"
3. Copy the "Service ID"

### 3.4 Get Vercel Tokens
1. Go to Vercel dashboard
2. Click "Settings" → "Tokens"
3. Create new token
4. For Org ID and Project ID, check Vercel dashboard URLs

## 🐳 Docker Support

### Railway Docker Support
Railway automatically detects and uses Docker:
- Uses `backend/Dockerfile` for backend
- Supports multi-stage builds
- Optimized for production

### Docker Compose (Local Development)
```bash
# Local development with Docker
docker-compose up -d

# Production build
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Environment Variables

### Backend (Railway)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmanager
JWT_SECRET=your-production-jwt-secret
JWT_REFRESH_SECRET=your-production-refresh-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
BCRYPT_SALT_ROUNDS=12
ALLOWED_ORIGINS=https://your-frontend.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
LOG_LEVEL=info
```

### Frontend (Vercel)
```env
VITE_NODE_ENV=production
VITE_API_BASE_URL=https://your-backend.railway.app/api
VITE_APP_NAME=Task Manager
VITE_APP_VERSION=1.0.0
VITE_DEBUG=false
VITE_LOG_LEVEL=error
```

## 🚀 Deployment Commands

### Manual Deployment
```bash
# Backend to Railway
railway login
railway link
railway up

# Frontend to Vercel
vercel login
vercel --prod
```

### Automatic Deployment
- Push to `master` branch triggers automatic deployment
- GitHub Actions handles the deployment process
- Both Railway and Vercel support GitHub integration

## 📊 Monitoring

### Railway Monitoring
- Built-in metrics and logs
- Health checks at `/api/health`
- Automatic restarts on failure

### Vercel Monitoring
- Built-in analytics
- Performance monitoring
- Error tracking

## 🔒 Security

### Production Security Checklist
- [ ] Use strong JWT secrets
- [ ] Set proper CORS origins
- [ ] Enable HTTPS (automatic on Railway/Vercel)
- [ ] Use MongoDB Atlas for production database
- [ ] Set up proper environment variables
- [ ] Enable rate limiting
- [ ] Use secure headers

## 🆘 Troubleshooting

### Common Issues

#### Backend Issues
```bash
# Check Railway logs
railway logs

# Check health endpoint
curl https://your-backend.railway.app/api/health
```

#### Frontend Issues
```bash
# Check Vercel logs
vercel logs

# Check build locally
cd frontend
npm run build
```

#### Database Issues
- Ensure MongoDB URI is correct
- Check database connection in Railway logs
- Verify database permissions

## 💰 Cost Estimation

### Free Tier Limits
- **Railway**: $5 credit monthly (usually enough for small apps)
- **Vercel**: 100GB bandwidth, unlimited deployments
- **MongoDB Atlas**: 512MB storage

### Paid Plans
- **Railway**: $5/month for hobby plan
- **Vercel**: $20/month for pro plan
- **MongoDB Atlas**: $9/month for M0 cluster

## 🎉 Success!

Once deployed, your app will be available at:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.railway.app`
- **API Health**: `https://your-app.railway.app/api/health`

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas](https://www.mongodb.com/atlas)
- [GitHub Actions](https://docs.github.com/en/actions)
