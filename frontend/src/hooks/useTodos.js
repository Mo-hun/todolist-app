import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as todoApi from '@/api/todoApi';

export function useGetTodos({ filter = 'all', sortBy = 'created_at', categoryId = null } = {}) {
  return useQuery({
    queryKey: ['todos', { filter, sortBy, categoryId }],
    queryFn: () => {
      const params = { sort_by: sortBy };

      if (categoryId && categoryId !== 'uncategorized') {
        params.category_id = categoryId;
      }

      return todoApi.getTodos(params).then((response) => ({
        todos: response.data ?? [],
        pagination: response.pagination ?? { page: 1, limit: 20, total: 0 },
      }));
    },
    select: ({ todos, pagination }) => {
      let filteredTodos = todos;

      if (categoryId === 'uncategorized') {
        filteredTodos = filteredTodos.filter((todo) => !todo.category_id);
      }

      if (filter === 'completed') {
        filteredTodos = filteredTodos.filter((todo) => todo.is_completed);
      } else if (filter === 'in_progress') {
        filteredTodos = filteredTodos.filter((todo) => !todo.is_completed);
      }

      return {
        todos: filteredTodos,
        pagination: {
          ...pagination,
          total: filteredTodos.length,
        },
      };
    },
  });
}

function invalidateTodos(queryClient) {
  return queryClient.invalidateQueries({ queryKey: ['todos'] });
}

export function useCreateTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: todoApi.createTodo,
    onSuccess: () => invalidateTodos(queryClient),
  });
}

export function useUpdateTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => todoApi.updateTodo(id, data),
    onSuccess: () => invalidateTodos(queryClient),
  });
}

export function useDeleteTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => todoApi.deleteTodo(id),
    onSuccess: () => invalidateTodos(queryClient),
  });
}

export function useToggleTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => todoApi.toggleTodo(id),
    onSuccess: () => invalidateTodos(queryClient),
  });
}
