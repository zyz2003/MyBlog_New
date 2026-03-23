// API mock utilities for testing

export function createMockResponse<T>(data: T, success = true): { data: T; success: boolean } {
  return {
    data,
    success,
  }
}

export function createMockError(message: string, status = 400) {
  return {
    message,
    status,
  }
}

export const mockApiResponse = {
  success: true,
  data: {},
  message: 'Success',
}

export const mockPaginatedResponse = <T>(items: T[], total: number, page = 1, pageSize = 10) => ({
  success: true,
  data: {
    items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  },
})
