export class PaginationResult<T> {
  data: T[];
  page: number;
  limit: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
