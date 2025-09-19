// Test setup for frontend
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

// Configure testing library
configure({ testIdAttribute: 'data-testid' });

// Mock API server
export const server = setupServer(
  // Auth endpoints
  rest.post('/api/auth/register', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: { _id: '1', name: 'Test User', email: 'test@example.com' },
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token'
        }
      })
    );
  }),

  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Login successful',
        data: {
          user: { _id: '1', name: 'Test User', email: 'test@example.com' },
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token'
        }
      })
    );
  }),

  // Task endpoints
  rest.get('/api/tasks', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          tasks: [
            {
              _id: '1',
              title: 'Test Task 1',
              description: 'Test Description 1',
              priority: 'high',
              status: 'pending',
              dueDate: '2024-12-31T00:00:00.000Z',
              userId: '1',
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z'
            },
            {
              _id: '2',
              title: 'Test Task 2',
              description: 'Test Description 2',
              priority: 'medium',
              status: 'in_progress',
              dueDate: '2024-12-30T00:00:00.000Z',
              userId: '1',
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z'
            }
          ],
          pagination: {
            page: 1,
            limit: 10,
            totalPages: 1,
            totalTasks: 2
          }
        }
      })
    );
  }),

  rest.post('/api/tasks', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        message: 'Task created successfully',
        data: {
          _id: '3',
          title: 'New Task',
          description: 'New Description',
          priority: 'low',
          status: 'pending',
          dueDate: '2024-12-31T00:00:00.000Z',
          userId: '1',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      })
    );
  }),

  rest.get('/api/tasks/stats', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          totalTasks: 2,
          pendingTasks: 1,
          inProgressTasks: 1,
          completedTasks: 0,
          highPriorityTasks: 1,
          mediumPriorityTasks: 1,
          lowPriorityTasks: 0
        }
      })
    );
  })
);

// Setup and teardown
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};
