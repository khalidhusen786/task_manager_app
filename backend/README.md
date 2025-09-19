# Task Manager Backend API

A robust, secure, and scalable Node.js backend API for a task management application built with TypeScript, Express, MongoDB, and JWT authentication.

## 🚀 Features

- **Secure Authentication**: HTTP-only cookie-based JWT authentication
- **Task Management**: Full CRUD operations with filtering, pagination, and bulk operations
- **User Management**: Registration, login, profile management
- **Security**: Rate limiting, CORS, Helmet, input validation, and sanitization
- **Error Handling**: Comprehensive error handling with proper HTTP status codes
- **Logging**: Structured logging with Winston
- **Type Safety**: Full TypeScript implementation
- **Database**: MongoDB with Mongoose ODM

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB
- **ODM**: Mongoose
- **Authentication**: JWT with HTTP-only cookies
- **Validation**: Zod
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston
- **Development**: Nodemon, ts-node

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task-manager-app/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the backend directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/task-manager-app

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-here-different-from-jwt-secret

   # Cookie Configuration
   COOKIE_SECRET=your-super-secret-cookie-key-here-for-signing-cookies

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX=100

   # CORS Configuration
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

   # Security Configuration
   BCRYPT_SALT_ROUNDS=12
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## 📚 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register a new user | No |
| POST | `/login` | Login user | No |
| POST | `/refresh` | Refresh access token | No |
| POST | `/logout` | Logout user | Yes |
| GET | `/profile` | Get user profile | Yes |

### Task Routes (`/api/tasks`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all tasks (with filtering/pagination) | Yes |
| GET | `/stats` | Get task statistics | Yes |
| GET | `/:id` | Get single task | Yes |
| POST | `/` | Create new task | Yes |
| PUT | `/:id` | Update task | Yes |
| PATCH | `/:id/status` | Update task status | Yes |
| PATCH | `/:id/priority` | Update task priority | Yes |
| DELETE | `/:id` | Delete task | Yes |
| DELETE | `/` | Delete multiple tasks | Yes |
| PATCH | `/bulk-update` | Bulk update tasks | Yes |

## 🔐 Authentication

The API uses **HTTP-only cookies** for secure token storage:

- **Access Token**: 15 minutes expiry, stored in `accessToken` cookie
- **Refresh Token**: 7 days expiry, stored in `refreshToken` cookie
- **Security**: Cookies are HTTP-only, secure (in production), and SameSite=strict

### Frontend Integration

The frontend should:
1. **Not store tokens** in localStorage/sessionStorage
2. **Include credentials** in requests: `credentials: 'include'`
3. **Handle cookie-based authentication** automatically

Example fetch request:
```javascript
fetch('/api/tasks', {
  method: 'GET',
  credentials: 'include', // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});
```

## 🛡️ Security Features

- **HTTP-only Cookies**: Prevents XSS attacks
- **CSRF Protection**: SameSite cookie attribute
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: Zod schema validation
- **Input Sanitization**: XSS prevention
- **Helmet**: Security headers
- **CORS**: Controlled cross-origin requests
- **Password Hashing**: bcrypt with configurable salt rounds

## 📊 Database Schema

### User Model
```typescript
{
  _id: ObjectId,
  name: string,
  email: string (unique),
  password: string (hashed),
  isActive: boolean,
  refreshTokens: string[],
  createdAt: Date,
  updatedAt: Date
}
```

### Task Model
```typescript
{
  _id: ObjectId,
  title: string,
  description?: string,
  status: 'pending' | 'in_progress' | 'completed',
  priority: 'low' | 'medium' | 'high',
  dueDate?: Date,
  completedAt?: Date,
  userId: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔍 Error Handling

The API provides comprehensive error handling:

- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found (resource not found)
- **409**: Conflict (duplicate resources)
- **429**: Too Many Requests (rate limit exceeded)
- **500**: Internal Server Error

Error response format:
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "type": "ErrorType",
    "details": "Additional error details"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 📝 Logging

Structured logging with Winston:
- **Info**: General application flow
- **Warn**: Authentication failures, validation errors
- **Error**: System errors, exceptions
- **Debug**: Detailed debugging information

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-db-url
JWT_SECRET=your-production-jwt-secret
JWT_REFRESH_SECRET=your-production-refresh-secret
COOKIE_SECRET=your-production-cookie-secret
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 5000
CMD ["node", "dist/server.js"]
```

## 📈 Performance Considerations

- **Database Indexing**: Compound indexes on frequently queried fields
- **Pagination**: Built-in pagination for large datasets
- **Rate Limiting**: Prevents abuse and ensures fair usage
- **Connection Pooling**: MongoDB connection pooling
- **Compression**: Response compression for large payloads

## 🔧 Development

### Code Structure
```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middlewares/     # Express middlewares
├── models/          # Database models
├── routes/          # API routes
├── schemas/         # Validation schemas
├── services/        # Business logic
├── utils/           # Utility functions
└── server.ts        # Application entry point
```

### Adding New Features

1. **Create Model**: Define database schema
2. **Create Schema**: Add validation schema
3. **Create Service**: Implement business logic
4. **Create Controller**: Handle HTTP requests
5. **Create Routes**: Define API endpoints
6. **Add Tests**: Write comprehensive tests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the error logs

---

**Built with ❤️ using modern Node.js best practices**

