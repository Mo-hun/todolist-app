import { Spinner } from '@/components/common';
import { useDeleteTodoMutation, useToggleTodoMutation, useUpdateTodoMutation } from '@/hooks/useTodos';
import TodoItem from './TodoItem';

export default function TodoList({ todos = [], isLoading, emptyMessage }) {
  const { mutate: updateTodo, isPending: isUpdating } = useUpdateTodoMutation();
  const { mutate: deleteTodo, isPending: isDeleting } = useDeleteTodoMutation();
  const { mutate: toggleTodo, isPending: isToggling } = useToggleTodoMutation();

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border-grid bg-[#FAFAFA] px-6 py-10 text-center">
        <p className="text-sm text-text-secondary">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={toggleTodo}
          onUpdate={updateTodo}
          onDelete={deleteTodo}
          isToggling={isToggling}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  );
}
