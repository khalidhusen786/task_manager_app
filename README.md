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
# Backend environment
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secrets

# Frontend environment
cd ../frontend
cp .env.example .env
# Edit .env with your API base URL
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
```env
# Database
MONGODB_URI=mongodb://localhost:27017/task-manager

# JWT Secrets
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret

# Server
PORT=5000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend Configuration
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Task Manager
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

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 🔧 Development Tools

- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Jest**: Testing framework
- **MSW**: API mocking for tests
- **Nodemon**: Development server auto-restart

## 📚 Documentation

- **API Documentation**: Comprehensive API endpoint documentation
- **Component Documentation**: React component documentation
- **Database Schema**: MongoDB collection schemas
- **Deployment Guide**: Step-by-step deployment instructions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow the existing code style
- Ensure all tests pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the test cases for examples
- Contact the development team

## 🔄 Version History

- **v1.0.0**: Initial release with core features
- **v1.1.0**: Added advanced filtering and search
- **v1.2.0**: Performance optimizations and caching
- **v1.3.0**: Enhanced UI/UX and accessibility
- **v1.4.0**: Comprehensive testing suite
- **v1.5.0**: Client-side filtering optimization

## 🎯 Roadmap

- [ ] Real-time collaboration
- [ ] Task templates
- [ ] Advanced reporting
- [ ] Mobile app
- [ ] Third-party integrations
- [ ] Advanced analytics
- [ ] Team management
- [ ] File attachments

---

Built with ❤️ using modern web technologies and best practices.
