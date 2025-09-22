// Unit tests for TaskFilters component
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
// Mock constants to avoid import.meta usage in Jest
jest.mock('../../constants', () => ({
  TASK_STATUS: { PENDING: 'pending', IN_PROGRESS: 'in_progress', COMPLETED: 'completed' },
  TASK_PRIORITY: { LOW: 'low', MEDIUM: 'medium', HIGH: 'high' }
}));
import TaskFilters from '../../components/task/TaskFilters';
type TaskFiltersType = any;

// Mock props
const mockFilters: TaskFiltersType = {
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc'
};

const mockOnFilterChange = jest.fn();

describe('TaskFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all filter inputs correctly', () => {
    render(
      <TaskFilters 
        filters={mockFilters} 
        onFilterChange={mockOnFilterChange} 
      />
    );

    expect(screen.getByPlaceholderText(/search by title/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/all statuses/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/all priorities/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/created/i)).toBeInTheDocument();
  });

  it('calls onFilterChange when search input changes', () => {
    jest.useFakeTimers();
    render(
      <TaskFilters 
        filters={mockFilters} 
        onFilterChange={mockOnFilterChange} 
      />
    );

    const searchInput = screen.getByPlaceholderText(/search by title/i);
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    act(() => {
      jest.advanceTimersByTime(350);
    });
    jest.useRealTimers();
    expect(mockOnFilterChange).toHaveBeenCalledWith({ search: 'test search' });
  });

  it('calls onFilterChange when status filter changes', () => {
    render(
      <TaskFilters 
        filters={mockFilters} 
        onFilterChange={mockOnFilterChange} 
      />
    );

    const statusSelect = screen.getByDisplayValue(/all statuses/i);
    fireEvent.change(statusSelect, { target: { value: 'pending' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith({ status: 'pending' });
  });

  it('calls onFilterChange when priority filter changes', () => {
    render(
      <TaskFilters 
        filters={mockFilters} 
        onFilterChange={mockOnFilterChange} 
      />
    );

    const prioritySelect = screen.getByDisplayValue(/all priorities/i);
    fireEvent.change(prioritySelect, { target: { value: 'high' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith({ priority: 'high' });
  });

  it('calls onFilterChange when sort by changes', () => {
    render(
      <TaskFilters 
        filters={mockFilters} 
        onFilterChange={mockOnFilterChange} 
      />
    );

    const sortSelect = screen.getByDisplayValue(/created/i);
    fireEvent.change(sortSelect, { target: { value: 'title' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith({ sortBy: 'title' });
  });

  it('displays current filter values correctly', () => {
    const filtersWithValues: TaskFiltersType = {
      ...mockFilters,
      search: 'test search',
      status: 'pending',
      priority: 'high',
      sortBy: 'title'
    };

    render(
      <TaskFilters 
        filters={filtersWithValues} 
        onFilterChange={mockOnFilterChange} 
      />
    );

    expect(screen.getByDisplayValue('test search')).toBeInTheDocument();
    const selects = screen.getAllByRole('combobox') as HTMLSelectElement[];
    expect(selects[0].value).toBe('pending');
    expect(selects[1].value).toBe('high');
    expect(selects[2].value).toBe('title');
  });

  it('handles empty filter values correctly', () => {
    const filtersWithEmptyValues: TaskFiltersType = {
      ...mockFilters,
      search: '',
      status: undefined,
      priority: undefined
    };

    render(
      <TaskFilters 
        filters={filtersWithEmptyValues} 
        onFilterChange={mockOnFilterChange} 
      />
    );

    expect(screen.getByDisplayValue('')).toBeInTheDocument();
    expect(screen.getByDisplayValue(/all statuses/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/all priorities/i)).toBeInTheDocument();
  });

  it('has correct option values for status filter', () => {
    render(
      <TaskFilters 
        filters={mockFilters} 
        onFilterChange={mockOnFilterChange} 
      />
    );

    const statusSelect = screen.getByDisplayValue(/all statuses/i);
    const options = Array.from(statusSelect.querySelectorAll('option')).map(option => option.value);

    expect(options).toContain('');
    expect(options).toContain('pending');
    expect(options).toContain('in_progress');
    expect(options).toContain('completed');
  });

  it('has correct option values for priority filter', () => {
    render(
      <TaskFilters 
        filters={mockFilters} 
        onFilterChange={mockOnFilterChange} 
      />
    );

    const prioritySelect = screen.getByDisplayValue(/all priorities/i);
    const options = Array.from(prioritySelect.querySelectorAll('option')).map(option => option.value);

    expect(options).toContain('');
    expect(options).toContain('low');
    expect(options).toContain('medium');
    expect(options).toContain('high');
  });

  it('has correct option values for sort by filter', () => {
    render(
      <TaskFilters 
        filters={mockFilters} 
        onFilterChange={mockOnFilterChange} 
      />
    );

    const sortSelect = screen.getByDisplayValue(/created/i);
    const options = Array.from(sortSelect.querySelectorAll('option')).map(option => option.value);

    expect(options).toContain('createdAt');
    expect(options).toContain('updatedAt');
    expect(options).toContain('title');
    expect(options).toContain('dueDate');
    expect(options).toContain('priority');
    expect(options).toContain('status');
  });

  it('applies correct CSS classes', () => {
    render(
      <TaskFilters 
        filters={mockFilters} 
        onFilterChange={mockOnFilterChange} 
      />
    );

    const card = document.querySelector('.card') as HTMLElement;
    expect(card).toBeTruthy();

    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input).toHaveClass('input');
    });

    const selects = screen.getAllByRole('combobox');
    selects.forEach(select => {
      expect(select).toHaveClass('input');
    });
  });
});
