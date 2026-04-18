// ─────────────────────────────────────────────────────────────
// hooks/useProducts.ts
// ─────────────────────────────────────────────────────────────

import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
  } from '@tanstack/react-query';
  import toast from 'react-hot-toast';
  import * as productsApi from '@api/products.api';
  import { queryKeys } from '@utils/queryKeys';
  import type {
    CreateProductPayload,
    ProductFilters,
    UpdateProductPayload,
  } from '@types';
  
  // ── Paginated product list ────────────────────────────────────
  export function useProducts(filters: ProductFilters = {}) {
    return useQuery({
      queryKey: queryKeys.products.list(filters),
      queryFn: () => productsApi.getProducts(filters),
      staleTime: 2 * 60 * 1000,
      placeholderData: (prev) => prev, // keep previous data while fetching (no loading flash on filter change)
    });
  }
  
  // ── Infinite-scroll product list ──────────────────────────────
  export function useInfiniteProducts(filters: Omit<ProductFilters, 'page'> = {}) {
    return useInfiniteQuery({
      queryKey: queryKeys.products.list({ ...filters, page: 'infinite' } as unknown as ProductFilters),
      queryFn: ({ pageParam }) =>
        productsApi.getProducts({ ...filters, page: pageParam as number }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.pagination.hasNextPage ? lastPage.pagination.page + 1 : undefined,
      staleTime: 2 * 60 * 1000,
    });
  }
  
  // ── Single product by slug ────────────────────────────────────
  export function useProduct(slug: string) {
    return useQuery({
      queryKey: queryKeys.products.detail(slug),
      queryFn: () => productsApi.getProductBySlug(slug),
      enabled: Boolean(slug),
      staleTime: 5 * 60 * 1000,
    });
  }
  
  // ── Featured products ─────────────────────────────────────────
  export function useFeaturedProducts(limit = 8) {
    return useQuery({
      queryKey: queryKeys.products.featured(limit),
      queryFn: () => productsApi.getFeaturedProducts(limit),
      staleTime: 10 * 60 * 1000,
    });
  }
  
  // ── New arrivals ──────────────────────────────────────────────
  export function useNewArrivals(limit = 8) {
    return useQuery({
      queryKey: queryKeys.products.newArrivals(limit),
      queryFn: () => productsApi.getNewArrivals(limit),
      staleTime: 10 * 60 * 1000,
    });
  }
  
  // ── Product search ────────────────────────────────────────────
  export function useProductSearch(
    query: string,
    filters: Omit<ProductFilters, 'search'> = {},
  ) {
    return useQuery({
      queryKey: queryKeys.products.search(query, filters),
      queryFn: () => productsApi.searchProducts(query, filters),
      enabled: query.length >= 2, // don't fire on empty/single-char input
      staleTime: 60 * 1000,
    });
  }
  
  // ── Related products ──────────────────────────────────────────
  export function useRelatedProducts(productId: string, limit = 4) {
    return useQuery({
      queryKey: queryKeys.products.related(productId, limit),
      queryFn: () => productsApi.getRelatedProducts(productId, limit),
      enabled: Boolean(productId),
      staleTime: 10 * 60 * 1000,
    });
  }
  
  // ── Product review stats ──────────────────────────────────────
  export function useProductReviewStats(productId: string) {
    return useQuery({
      queryKey: queryKeys.products.reviewStats(productId),
      queryFn: () => productsApi.getProductReviewStats(productId),
      enabled: Boolean(productId),
      staleTime: 5 * 60 * 1000,
    });
  }
  
  // ── All categories ────────────────────────────────────────────
  export function useCategories() {
    return useQuery({
      queryKey: queryKeys.categories.list(),
      queryFn: productsApi.getCategories,
      staleTime: 30 * 60 * 1000, // categories rarely change
    });
  }
  
  // ── Single category ───────────────────────────────────────────
  export function useCategoryBySlug(slug: string) {
    return useQuery({
      queryKey: queryKeys.categories.detail(slug),
      queryFn: () => productsApi.getCategoryBySlug(slug),
      enabled: Boolean(slug),
      staleTime: 30 * 60 * 1000,
    });
  }
  
  // ─────────────────────────────────────────────────────────────
  // Admin mutations
  // ─────────────────────────────────────────────────────────────
  
  export function useCreateProduct() {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: (payload: CreateProductPayload) => productsApi.createProduct(payload),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        toast.success('Product created.');
      },
      onError: (error: Error) => toast.error(error.message),
    });
  }
  
  export function useUpdateProduct() {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: UpdateProductPayload }) =>
        productsApi.updateProduct(id, payload),
      onSuccess: (updated) => {
        queryClient.setQueryData(queryKeys.products.detail(updated.slug), updated);
        void queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
        toast.success('Product updated.');
      },
      onError: (error: Error) => toast.error(error.message),
    });
  }
  
  export function useDeleteProduct() {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: (productId: string) => productsApi.deleteProduct(productId),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        toast.success('Product deleted.');
      },
      onError: (error: Error) => toast.error(error.message),
    });
  }