// // Test setup for frontend
// import '@testing-library/jest-dom';
// import { configure } from '@testing-library/react';
// import { setupServer } from 'msw/node';
// import { http, HttpResponse } from 'msw';

// // Configure testing library
// configure({ testIdAttribute: 'data-testid' });

// // Mock API server
// export const server = setupServer(
//   // Auth endpoints
//   http.post('/api/auth/register', () => {
//     return HttpResponse.json({
//       success: true,
//       message: 'User registered successfully',
//       data: {
//         user: { _id: '1', name: 'Test User', email: 'test@example.com' },
//         accessToken: 'mock-access-token',
//         refreshToken: 'mock-refresh-token'
//       }
//     }, { status: 201 });
//   }),

//   http.post('/api/auth/login', () => {
//     return HttpResponse.json({
//       success: true,
//       message: 'Login successful',
//       data: {
//         user: { _id: '1', name: 'Test User', email: 'test@example.com' },
//         accessToken: 'mock-access-token',
//         refreshToken: 'mock-refresh-token'
//       }
//     }, { status: 200 });
//   }),

//   // Task endpoints
//   http.get('/api/tasks', () => {
//     return HttpResponse.json({
//       success: true,
//       data: {
//         tasks: [
//           {
//             _id: '1',
//             title: 'Test Task 1',
//             description: 'Test Description 1',
//             priority: 'high',
//             status: 'pending',
//             dueDate: '2024-12-31T00:00:00.000Z',
//             userId: '1',
//             createdAt: '2024-01-01T00:00:00.000Z',
//             updatedAt: '2024-01-01T00:00:00.000Z'
//           },
//           {
//             _id: '2',
//             title: 'Test Task 2',
//             description: 'Test Description 2',
//             priority: 'medium',
//             status: 'in_progress',
//             dueDate: '2024-12-30T00:00:00.000Z',
//             userId: '1',
//             createdAt: '2024-01-01T00:00:00.000Z',
//             updatedAt: '2024-01-01T00:00:00.000Z'
//           }
//         ],
//         pagination: {
//           page: 1,
//           limit: 10,
//           totalPages: 1,
//           totalTasks: 2
//         }
//       }
//     }, { status: 200 });
//   }),

//   http.post('/api/tasks', () => {
//     return HttpResponse.json({
//       success: true,
//       message: 'Task created successfully',
//       data: {
//         _id: '3',
//         title: 'New Task',
//         description: 'New Description',
//         priority: 'low',
//         status: 'pending',
//         dueDate: '2024-12-31T00:00:00.000Z',
//         userId: '1',
//         createdAt: '2024-01-01T00:00:00.000Z',
//         updatedAt: '2024-01-01T00:00:00.000Z'
//       }
//     }, { status: 201 });
//   }),

//   http.get('/api/tasks/stats', () => {
//     return HttpResponse.json({
//       success: true,
//       data: {
//         totalTasks: 2,
//         pendingTasks: 1,
//         inProgressTasks: 1,
//         completedTasks: 0,
//         highPriorityTasks: 1,
//         mediumPriorityTasks: 1,
//         lowPriorityTasks: 0
//       }
//     }, { status: 200 });
//   })
// );

// // Setup and teardown
// beforeAll(() => server.listen());
// afterEach(() => server.resetHandlers());
// afterAll(() => server.close());

// // Mock window.matchMedia
// Object.defineProperty(window, 'matchMedia', {
//   writable: true,
//   value: jest.fn().mockImplementation(query => ({
//     matches: false,
//     media: query,
//     onchange: null,
//     addListener: jest.fn(),
//     removeListener: jest.fn(),
//     addEventListener: jest.fn(),
//     removeEventListener: jest.fn(),
//     dispatchEvent: jest.fn(),
//   })),
// });

// // Mock IntersectionObserver
// global.IntersectionObserver = class IntersectionObserver {
//   constructor() {}
//   disconnect() {}
//   observe() {}
//   unobserve() {}
//   takeRecords() { return [] }
// } as any;



// Test setup for frontend
/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/__tests__/**/*.tsx',
    '**/?(*.)+(spec|test).ts',
    '**/?(*.)+(spec|test).tsx'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!msw)'
  ],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'jest-transform-stub'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
    '!src/__tests__/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 10000,
  verbose: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};