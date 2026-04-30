import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as categoryApi from '@/api/categoryApi';

function normalizeCategoriesPayload(response) {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.categories)) return response.data.categories;
  return [];
}

export function useGetCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getCategories().then((res) => normalizeCategoriesPayload(res)),
  });
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoryApi.createCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => categoryApi.updateCategory(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => categoryApi.deleteCategory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
}
