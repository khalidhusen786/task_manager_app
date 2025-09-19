# Task Manager Frontend

A modern, responsive React frontend for the Task Manager application built with TypeScript, Redux Toolkit, and Tailwind CSS.

## 🚀 Features

- **Modern UI/UX**: Clean, responsive design with Tailwind CSS
- **State Management**: Redux Toolkit for predictable state management
- **Type Safety**: Full TypeScript support
- **Authentication**: Secure login/register with JWT tokens
- **Task Management**: Create, read, update, delete tasks
- **Advanced Filtering**: Search, filter by status/priority, and sort tasks
- **Real-time Updates**: Optimistic updates and error handling
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🛠️ Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Vite** - Build tool

## 📦 Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update environment variables in `.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Task Manager
```

## 🚀 Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🧪 Testing

Run tests:
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## 🏗️ Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Header, Sidebar, etc.)
│   ├── task/           # Task-specific components
│   └── ui/             # Generic UI components
├── hooks/              # Custom React hooks
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   └── dashboard/      # Dashboard pages
├── services/           # API services
├── store/              # Redux store configuration
│   ├── slices/         # Redux slices
│   └── middleware/     # Custom middleware
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── constants/          # Application constants
```

## 🎨 Components

### Layout Components
- **Header**: Navigation and user menu
- **Sidebar**: Navigation sidebar
- **DashboardLayout**: Main layout wrapper

### Task Components
- **TaskList**: Display list of tasks
- **TaskModal**: Create/edit task modal
- **TaskFilters**: Search and filter controls
- **TaskStats**: Task statistics dashboard

### UI Components
- **Button**: Reusable button component
- **Input**: Form input component
- **Modal**: Modal dialog component
- **LoadingSpinner**: Loading indicator
- **ToastProvider**: Toast notifications

## 🔧 State Management

The application uses Redux Toolkit for state management with the following slices:

### Auth Slice
- User authentication state
- Token management
- Login/logout actions

### Task Slice
- Task CRUD operations
- Filtering and pagination
- Task statistics
- Loading and error states

## 🎯 Key Features

### Authentication
- Secure JWT-based authentication
- Automatic token refresh
- Protected routes
- User profile management

### Task Management
- Create, read, update, delete tasks
- Task status management (pending, in progress, completed)
- Priority levels (low, medium, high)
- Due date tracking
- Task descriptions and notes

### Advanced Filtering
- Search by title and description
- Filter by status and priority
- Sort by various criteria
- Pagination support

### Real-time Updates
- Optimistic updates for better UX
- Error handling and rollback
- Loading states
- Toast notifications

## 🧪 Testing Strategy

### Unit Tests
- Component testing with React Testing Library
- Redux slice testing
- Service layer testing
- Utility function testing

### Integration Tests
- API integration testing
- Component interaction testing
- User flow testing

### Test Coverage
- Aim for 80%+ code coverage
- Critical path testing
- Edge case handling

## 🚀 Performance Optimizations

- **Code Splitting**: Lazy loading of routes
- **Memoization**: React.memo and useMemo for expensive operations
- **Virtual Scrolling**: For large task lists
- **Debounced Search**: Optimized search input
- **Caching**: Redux state caching

## 🔒 Security

- **XSS Protection**: Input sanitization
- **CSRF Protection**: Token-based requests
- **Secure Storage**: JWT token management
- **Input Validation**: Zod schema validation

## 📱 Responsive Design

- **Mobile First**: Responsive design approach
- **Breakpoints**: Tailwind CSS breakpoints
- **Touch Friendly**: Mobile-optimized interactions
- **Progressive Enhancement**: Works without JavaScript

## 🎨 Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Custom Components**: Reusable styled components
- **Dark Mode**: Theme switching support
- **Accessibility**: WCAG 2.1 compliance

## 🔧 Development Tools

- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Vite**: Fast development server
- **Hot Reload**: Instant updates

## 📚 API Integration

The frontend integrates with the backend API through:

- **Axios**: HTTP client with interceptors
- **Error Handling**: Centralized error management
- **Request/Response**: Type-safe API calls
- **Authentication**: Automatic token handling

## 🚀 Deployment

### Build Process
1. TypeScript compilation
2. Vite bundling
3. Asset optimization
4. Environment variable injection

### Deployment Options
- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **CDN**: CloudFront, Cloudflare
- **Container**: Docker deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the test cases for examples

## 🔄 Version History

- **v1.0.0**: Initial release with core features
- **v1.1.0**: Added advanced filtering and search
- **v1.2.0**: Performance optimizations and caching
- **v1.3.0**: Enhanced UI/UX and accessibility

---

Built with ❤️ using React, TypeScript, and modern web technologies.