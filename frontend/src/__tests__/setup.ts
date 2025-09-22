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



import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Polyfill TextEncoder/TextDecoder if missing
// Ensure TextEncoder/TextDecoder exist
if (!(globalThis as any).TextEncoder) {
  (globalThis as any).TextEncoder = class {
    encode(input: string) {
      const arr = new Uint8Array(input.length);
      for (let i = 0; i < input.length; i++) arr[i] = input.charCodeAt(i) & 0xff;
      return arr;
    }
  } as any;
}
if (!(globalThis as any).TextDecoder) {
  (globalThis as any).TextDecoder = class {
    decode(input: Uint8Array) {
      return Array.from(input).map((b) => String.fromCharCode(b)).join('');
    }
  } as any;
}

// Note: MSW server is configured in individual test suites that need it

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
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
(globalThis as any).IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() { return [] }
} as any;

// Polyfill BroadcastChannel for libraries expecting it
if (!(globalThis as any).BroadcastChannel) {
  (globalThis as any).BroadcastChannel = class {
    name: string;
    onmessage: any;
    constructor(name: string) { this.name = name; }
    postMessage() {}
    close() {}
  } as any;
}