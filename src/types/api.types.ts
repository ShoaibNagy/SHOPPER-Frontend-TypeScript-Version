// ─────────────────────────────────────────────────────────────
// api.types.ts
// Shared envelope, pagination, and error shapes that wrap
// every response from the SHOPPER backend.
// ─────────────────────────────────────────────────────────────

// ── Backend response envelope ─────────────────────────────────
// Every successful response is: { success: true, data: T }
// Every error response is:      { success: false, message: string, errors?: FieldError[] }

export interface ApiResponse<T> {
    success: true;
    data: T;
    message?: string;
  }
  
  export interface ApiErrorResponse {
    success: false;
    message: string;
    errors?: FieldError[];
    statusCode?: number;
  }
  
  export interface FieldError {
    field: string;
    message: string;
  }
  
  // ── Pagination ────────────────────────────────────────────────
  export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }
  
  export interface PaginatedResponse<T> {
    items: T[];
    pagination: PaginationMeta;
  }
  
  export interface PaginationParams {
    page?: number;
    limit?: number;
  }
  
  // ── Sorting ───────────────────────────────────────────────────
  export type SortOrder = 'asc' | 'desc';
  
  export interface SortParams {
    sortBy?: string;
    sortOrder?: SortOrder;
  }
  
  // ── MongoDB ObjectId (serialized as string) ───────────────────
  export type MongoId = string;
  
  // ── Timestamps added by Mongoose ─────────────────────────────
  export interface Timestamps {
    createdAt: string; // ISO 8601
    updatedAt: string; // ISO 8601
  }