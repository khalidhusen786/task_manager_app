# Task Manager Application

A full-stack task management application built with modern web technologies. This application provides a comprehensive solution for managing tasks with user authentication, real-time updates, and advanced filtering capabilities.

Live demo: https://task-manager-app-khalid.vercel.app/

## 🚀 Features

### Core Features
- **User Authentication**: Secure JWT-based authentication with refresh tokens and persistent sessions
- **Task Management**: Create, read, update, delete tasks with full CRUD operations
- **Advanced Filtering**: Search, filter by status/priority, and sort tasks with client-side optimization
- **Real-time Updates**: Optimistic updates with comprehensive error handling and rollback
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Task Statistics**: Dashboard with task analytics and insights
- **Persistent Sessions**: Redux Persist for maintaining authentication across browser sessions

### Technical Features
- **Type Safety**: Full TypeScript support across frontend and backend
- **State Management**: Redux Toolkit with Redux Persist for state persistence
- **API Design**: RESTful API with comprehensive error handling and user-friendly messages
- **Database**: MongoDB with Mongoose ODM
- **Security**: JWT authentication, input validation, rate limiting, and secure token refresh
- **Testing**: Comprehensive test suite with unit, integration, and e2e tests
- **Performance**: Optimized queries, client-side filtering, and debounced search
- **Error Handling**: Intelligent error messages based on API responses and status codes

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
cd frontend
npm install
```

3. **Environment Setup**:
```bash
# Backend environment (Development)
cd backend
cp env.example .env.development
# Edit .env.development with your MongoDB URI and JWT secrets
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmanager
JWT_SECRET=your-development-jwt-secret
JWT_REFRESH_SECRET=your-development-refresh-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
COOKIE_SECRET=your-development-cookie-secret
BCRYPT_SALT_ROUNDS=12
ALLOWED_ORIGINS=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
LOG_LEVEL=debug

Note (to test the backend application please create a .env.test file and replace the NODE_ENV=test)
# Backend environment (Production)
cp env.example .env.production
# Edit .env.production with production values

# Frontend environment (Development)
cd frontend
cp .env .env.development

VITE_NODE_ENV=development
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Task Manager
VITE_APP_VERSION=1.0.0
VITE_DEBUG=true
VITE_LOG_LEVEL=debug

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
npm run test

### Frontend Development
```bash
cd frontend

# Start development server
npm run dev

# Run tests
npm run test


## 📁 Project Structure (Layered architecture)

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
│   ├── env.development     # Development environment
│   ├── env.production      # Production environment
│   ├── env.example         # Environment template
│   ├── Dockerfile          # Docker configuration
│   ├── railway.toml        # Railway deployment config
│   └── package.json
├── frontend/               # Frontend React app
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── layout/     # Layout components
│   │   │   ├── task/       # Task-related components
│   │   │   └── ui/         # Reusable UI components
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── store/          # Redux store with persistence
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   ├── __tests__/          # Test files
│   ├── env.development     # Development environment
│   ├── env.production      # Production environment
│   ├── env.example         # Environment template
│   ├── Dockerfile          # Docker configuration
│   ├── vercel.json         # Vercel deployment config
│   └── package.json
├── .github/workflows/      # GitHub Actions
│   └── deploy.yml          # Main deployment workflow
├── docker-compose.yml      # Docker Compose configuration
├── railway.json            # Railway project configuration
├── vercel.json             # Vercel project configuration
└── README.md
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Input Validation**: Joi schemas for request validation
- **Rate Limiting**: Protection against brute force attacks
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers
- **XSS Protection**: Input sanitization

## 🎯 API Endpoints

### Authentication
POST /api/auth/register - User registration
POST /api/auth/login - User login
POST /api/auth/refresh-token - Refresh access token
POST /api/auth/logout - User logout
GET /api/auth/profile - Get user profile

### Tasks
GET /api/tasks - Get tasks with filtering and pagination
POST /api/tasks - Create new task
GET /api/tasks/:id - Get single task
PUT /api/tasks/:id - Update task (supports partial updates)
DELETE /api/tasks/:id - Delete task
DELETE /api/tasks - Delete multiple tasks
GET /api/tasks/stats - Get task statistics

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

### Automated Deployment (Recommended)
The application uses GitHub Actions for simple automated deployment:

- **Backend**: Deployed to Railway
- **Frontend**: Deployed to Vercel
- **Database**: MongoDB Atlas (shared across environments)

**Deployment Process:**
1. Push to `master` branch triggers deployment
2. Backend builds and deploys to Railway
3. Frontend builds and deploys to Vercel
4. Both services use the same MongoDB Atlas database


### Environment Variables for Production
Set these in your deployment platform:

#### Railway (Backend)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmanager
JWT_SECRET=your-production-jwt-secret
JWT_REFRESH_SECRET=your-production-refresh-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
COOKIE_SECRET=your-production-cookie-secret
BCRYPT_SALT_ROUNDS=12
ALLOWED_ORIGINS=your-vercel-deployed-url
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
LOG_LEVEL=info
```

#### Vercel (Frontend)
```env
VITE_API_BASE_URL=https://your-backend.railway.app/api
VITE_NODE_ENV=production
VITE_APP_NAME=Task Manager
VITE_APP_VERSION=1.0.0
VITE_DEBUG=false
VITE_LOG_LEVEL=error
```


## 🔄 CI/CD Pipeline

### GitHub Actions
The repository includes a simple GitHub Actions workflow for:
- **Build Validation**: Ensures both frontend and backend build successfully
- **Type Checking**: TypeScript compilation validation
- **Deployment**: Automated deployment to Railway (backend) and Vercel (frontend)

### Workflow Files
- `.github/workflows/deploy.yml` - Simple build and deploy pipeline

### Required Secrets
Set these in your GitHub repository settings:

#### Railway (Backend)
- `RAILWAY_TOKEN` - Railway deployment token
- `RAILWAY_SERVICE_ID` - Railway service ID for backend
- `RAILWAY_PROJECT_ID` - Railway Project ID for backend

#### Vercel (Frontend)
- `VERCEL_TOKEN` - Vercel deployment token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID
- `VITE_API_BASE_URL` - Frontend API base URL for builds ("railway backend url")

