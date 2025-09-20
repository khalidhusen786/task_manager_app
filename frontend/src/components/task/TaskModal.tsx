// ===== TASK MODAL (Create & Edit) =====
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { createTask, updateTask } from '../../store/slices/taskSlice';
import { TASK_STATUS, TASK_PRIORITY, VALIDATION_RULES } from '../../constants';
import { X, Calendar } from 'lucide-react';
import type { Task } from '../../types';
import { useToast } from '../ui/ToastProvider';

type Mode = 'create' | 'edit';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: Mode;
  task?: Task;
  onSaved: () => void;
}

const schema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(VALIDATION_RULES.TITLE_MAX_LENGTH, `Title must be less than ${VALIDATION_RULES.TITLE_MAX_LENGTH} characters`),
  description: z
    .string()
    .max(VALIDATION_RULES.DESCRIPTION_MAX_LENGTH, `Description must be less than ${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} characters`)
    .optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().optional(),
});

type TaskFormData = z.infer<typeof schema>;

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, mode, task, onSaved }) => {
  const dispatch = useAppDispatch();
  const { addToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TaskFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      status: task?.status ?? 'pending',
      priority: task?.priority ?? 'medium',
      dueDate: task?.dueDate ? task.dueDate.slice(0, 16) : undefined,
    },
  });

  React.useEffect(() => {
    reset({
      title: task?.title ?? '',
      description: task?.description ?? '',
      status: task?.status ?? 'pending',
      priority: task?.priority ?? 'medium',
      dueDate: task?.dueDate ? task.dueDate.slice(0, 16) : undefined,
    });
  }, [task, reset, mode]);

  const onSubmit = async (data: TaskFormData) => {
    try {
      if (mode === 'create') {
        await dispatch(
          createTask({
            title: data.title,
            description: data.description || undefined,
            status: (data.status as any) ?? 'pending',
            priority: (data.priority as any) ?? 'medium',
            dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
          })
        ).unwrap();
        addToast({ type: 'success', message: 'Task created successfully.' });
      } else if (mode === 'edit' && task) {
        await dispatch(
          updateTask({
            id: task._id,
            data: {
              title: data.title,
              description: data.description || undefined,
              status: data.status as any,
              priority: data.priority as any,
              dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
            },
          })
        ).unwrap();
        addToast({ type: 'success', message: 'Task updated.' });
      }

      onSaved();
      onClose();
      if (mode === 'create') reset({ title: '', description: '', status: 'pending', priority: 'medium', dueDate: undefined });
    } catch (error) {
      addToast({ type: 'error', message: mode === 'create' ? 'Failed to create task.' : 'Failed to update task.' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        {/* Panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Header */}
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {mode === 'create' ? 'Create New Task' : 'Edit Task'}
                </h3>
                <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="bg-white px-4 pb-4 sm:p-6 space-y-4">
              <div>
                <label htmlFor="title" className="label">Title *</label>
                <input {...register('title')} type="text" className="input" placeholder="Enter task title" />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
              </div>
              <div>
                <label htmlFor="description" className="label">Description</label>
                <textarea {...register('description')} rows={3} className="input resize-none" placeholder="Enter task description (optional)" />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="status" className="label">Status</label>
                  <select {...register('status')} className="input">
                    {Object.entries(TASK_STATUS).map(([key, value]) => (
                      <option key={key} value={value}>{value.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="priority" className="label">Priority</label>
                  <select {...register('priority')} className="input">
                    {Object.entries(TASK_PRIORITY).map(([key, value]) => (
                      <option key={key} value={value}>{value}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="dueDate" className="label">Due Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input {...register('dueDate')} type="datetime-local" className="input pl-10" />
                </div>
                {errors.dueDate && <p className="mt-1 text-sm text-red-600">{errors.dueDate.message}</p>}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full sm:w-auto sm:ml-3">
                {isSubmitting ? (mode === 'create' ? 'Creating...' : 'Saving...') : mode === 'create' ? 'Create Task' : 'Save Changes'}
              </button>
              <button type="button" onClick={onClose} className="btn-outline w-full sm:w-auto mt-3 sm:mt-0">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;




