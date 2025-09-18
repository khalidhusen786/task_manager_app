import { z } from "zod";

// Align enums with model values (TaskStatus.IN_PROGRESS = 'in_progress')
export const createTaskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  dueDate: z.coerce.date().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

// Include optional query helpers used by controller (search, sorting, pagination)
export const taskFiltersSchema = z.object({
  status: z.enum(["pending", "in_progress", "completed"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  search: z.string().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const bulkIdsSchema = z.object({
  taskIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ID'))
    .min(1, 'At least one task ID is required')
    .max(50, 'Cannot operate on more than 50 tasks at once')
});

export const bulkUpdateSchema = z.object({
  taskIds: bulkIdsSchema.shape.taskIds,
  updates: updateTaskSchema.pick({ status: true, priority: true })
});
