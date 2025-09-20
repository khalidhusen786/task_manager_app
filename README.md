# Task Manager Application

A full-stack task management application built with modern web technologies. This application provides a comprehensive solution for managing tasks with user authentication, real-time updates, and advanced filtering capabilities.

## 🚀 Features

### Core Features
- **User Authentication**: Secure JWT-based authentication with refresh tokens
- **Task Management**: Create, read, update, delete tasks with full CRUD operations
- **Advanced Filtering**: Search, filter by status/priority, and sort tasks
- **Real-time Updates**: Optimistic updates with error handling and rollback
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Task Statistics**: Dashboard with task analytics and insights

### Technical Features
- **Type Safety**: Full TypeScript support across frontend and backend
- **State Management**: Redux Toolkit for predictable state management
- **API Design**: RESTful API with comprehensive error handling
- **Database**: MongoDB with Mongoose ODM
- **Security**: JWT authentication, input validation, rate limiting
- **Testing**: Comprehensive test suite with unit, integration, and e2e tests
- **Performance**: Optimized queries, caching, and client-side filtering

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI library
- **TypeScript** - Type safety and better developer experience
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Vite** - Fast build tool

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Joi** - Input validation
- **Winston** - Logging
- **Jest** - Testing framework

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

### Quick Start

1. **Clone the repository**:
```bash
git clone <repository-url>
cd task-manager-app
```

2. **Install dependencies**:
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. **Environment Setup**:
```bash
# Backend environment (Development)
cd backend
cp env.example .env.development
# Edit .env.development with your MongoDB URI and JWT secrets

# Backend environment (Production)
cp env.example .env.production
# Edit .env.production with production values

# Frontend environment (Development)
cd ../frontend
cp env.example .env.development
# Edit .env.development with your API base URL

# Frontend environment (Production)
cp env.example .env.production
# Edit .env.production with production API URL
```

4. **Start the application**:
```bash
# Start backend (from backend directory)
npm run dev

# Start frontend (from frontend directory)
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

## 🚀 Development

### Backend Development
```bash
cd backend

# Start development server
npm run dev

# Run tests
npm test
npm run test:watch
npm run test:coverage

# Build for production
npm run build
npm start
```

### Frontend Development
```bash
cd frontend

# Start development server
npm run dev

# Run tests
npm test
npm run test:watch
npm run test:coverage

# Build for production
npm run build
npm run preview
```

## 🧪 Testing

### Backend Tests
- **Unit Tests**: Service layer and utility functions
- **Integration Tests**: API endpoints and database operations
- **Test Coverage**: Comprehensive coverage reporting

```bash
cd backend
npm run test:coverage
```

### Frontend Tests
- **Unit Tests**: Component and hook testing
- **Integration Tests**: Redux store and API integration
- **E2E Tests**: User flow testing

```bash
cd frontend
npm run test:coverage
```

## 📁 Project Structure

```
task-manager-app/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middlewares/    # Express middlewares
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── schemas/        # Validation schemas
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   ├── tests/              # Test files
│   └── package.json
├── frontend/               # Frontend React app
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── store/          # Redux store
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   ├── __tests__/          # Test files
│   └── package.json
└── README.md
```

## 🔧 Configuration

### Backend Configuration

#### Development (.env.development)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmanager
JWT_SECRET=your-development-jwt-secret
JWT_REFRESH_SECRET=your-development-refresh-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
BCRYPT_SALT_ROUNDS=12
ALLOWED_ORIGINS=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
LOG_LEVEL=debug
```

#### Production (.env.production)
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

### Frontend Configuration

#### Development (.env.development)
```env
VITE_NODE_ENV=development
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Task Manager
VITE_APP_VERSION=1.0.0
VITE_DEBUG=true
VITE_LOG_LEVEL=debug
```

#### Production (.env.production)
```env
VITE_NODE_ENV=production
VITE_API_BASE_URL=https://your-backend.railway.app/api
VITE_APP_NAME=Task Manager
VITE_APP_VERSION=1.0.0
VITE_DEBUG=false
VITE_LOG_LEVEL=error
```

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Tasks
- `GET /api/tasks` - Get tasks with filtering and pagination
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get single task
- `PUT /api/tasks/:id` - Update task (supports partial updates)
- `DELETE /api/tasks/:id` - Delete task
- `DELETE /api/tasks` - Delete multiple tasks
- `GET /api/tasks/stats` - Get task statistics

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Input Validation**: Joi schemas for request validation
- **Rate Limiting**: Protection against brute force attacks
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers
- **XSS Protection**: Input sanitization

## 🚀 Performance Optimizations

### Backend
- **Database Indexing**: Optimized MongoDB queries
- **Connection Pooling**: Efficient database connections
- **Caching**: Redis for session storage
- **Compression**: Gzip compression for responses

### Frontend
- **Code Splitting**: Lazy loading of routes
- **Memoization**: React.memo and useMemo
- **Virtual Scrolling**: For large task lists
- **Debounced Search**: Optimized search input
- **Client-side Filtering**: Reduced API calls

## 📱 Responsive Design

- **Mobile First**: Responsive design approach
- **Breakpoints**: Tailwind CSS responsive breakpoints
- **Touch Friendly**: Mobile-optimized interactions
- **Progressive Enhancement**: Works without JavaScript

## 🧪 Testing Strategy

### Backend Testing
- **Unit Tests**: Service layer and utility functions
- **Integration Tests**: API endpoints with database
- **Test Database**: MongoDB Memory Server for testing
- **Coverage**: Comprehensive test coverage reporting

### Frontend Testing
- **Component Tests**: React Testing Library
- **Redux Tests**: Store and slice testing
- **API Tests**: Mock Service Worker (MSW)
- **E2E Tests**: User flow testing

## 🚀 Deployment

### Backend Deployment
```bash
# Build
npm run build

# Start production server
npm start
```

### Frontend Deployment
```bash
# Build
npm run build

# Deploy dist/ folder to your hosting service
```

## 🐳 Docker Deployment

### Prerequisites
- Docker and Docker Compose installed
- Git (to clone the repository)

### Quick Start with Docker Compose
1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd task-manager-app
   ```

2. **Create environment file**:
   ```bash
   cp .env.example .env
   # Edit .env with your production values
   ```

3. **Start all services**:
   ```bash
   docker-compose up -d
   ```

4. **Check service health**:
   ```bash
   docker-compose ps
   docker-compose logs -f
   ```

### Individual Docker Builds
```bash
# Backend
cd backend
docker build -t task-manager-backend .
docker run -p 5000:5000 \
  -e MONGODB_URI=mongodb://localhost:27017/taskmanager \
  -e JWT_SECRET=your-secret \
  task-manager-backend

# Frontend
cd frontend
docker build -t task-manager-frontend .
docker run -p 3000:3000 task-manager-frontend
```

### Docker Compose Services
- **Frontend**: React app served by Nginx (Port 3000)
- **Backend**: Node.js API server (Port 5000)
- **MongoDB**: Database with authentication (Port 27017)

## 🚀 Production Deployment

### Cloud Platform Deployment

#### Railway
1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push to main branch

#### Heroku
1. Create Heroku apps for frontend and backend
2. Add MongoDB Atlas addon
3. Set environment variables
4. Deploy using Heroku CLI or GitHub integration

#### Vercel (Frontend) + Railway (Backend)
1. Deploy frontend to Vercel
2. Deploy backend to Railway
3. Update frontend environment variables

### Environment Variables for Production
```env
# Backend
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmanager
JWT_SECRET=your-super-secure-jwt-secret
JWT_REFRESH_SECRET=your-super-secure-refresh-secret
ALLOWED_ORIGINS=https://your-frontend-domain.com

# Frontend
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_NODE_ENV=production
```

## 🔄 CI/CD Pipeline

### GitHub Actions
The repository includes GitHub Actions workflows for:
- **Automated Testing**: Runs on every push and PR
- **Docker Build**: Builds and pushes Docker images
- **Security Scanning**: Vulnerability scanning with Trivy
- **Deployment**: Automated deployment to production

### Workflow Files
- `.github/workflows/ci-cd.yml` - Main CI/CD pipeline
- `.github/workflows/docker-deploy.yml` - Docker deployment

### Required Secrets
Set these in your GitHub repository settings:
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - JWT refresh secret
- `RAILWAY_TOKEN` - Railway deployment token (if using Railway)

## 📊 Monitoring and Health Checks

### Health Endpoints
- Backend: `GET /api/health`
- Frontend: `GET /health`

### Docker Health Checks
All services include health checks for monitoring:
```bash
# Check container health
docker-compose ps
docker inspect <container-name> | grep Health -A 10
```

### Logging
- Backend: Winston logger with structured logging
- Frontend: Console logging with error boundaries
- Docker: Centralized logging with docker-compose logs
