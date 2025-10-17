'use client';

interface BatchRequest {
  id: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: Record<string, unknown>;
  body?: unknown;
}

interface BatchResponse {
  id: string;
  success: boolean;
  data?: unknown;
  error?: string;
  status: number;
}

interface BatchApiResponse {
  success: boolean;
  responses: BatchResponse[];
}

/**
 * Batch API client for reducing round trips
 */
export class BatchApiClient {
  private requests: BatchRequest[] = [];
  private maxBatchSize = 10;

  /**
   * Add a request to the batch
   */
  addRequest(request: BatchRequest): void {
    if (this.requests.length >= this.maxBatchSize) {
      throw new Error(`Batch size limit exceeded. Maximum ${this.maxBatchSize} requests allowed.`);
    }
    this.requests.push(request);
  }

  /**
   * Execute all batched requests
   */
  async execute(): Promise<BatchResponse[]> {
    if (this.requests.length === 0) {
      return [];
    }

    try {
      const response = await fetch('/api/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: this.requests
        })
      });

      if (!response.ok) {
        throw new Error(`Batch request failed: ${response.status}`);
      }

      const result: BatchApiResponse = await response.json();
      return result.responses;
    } catch (error) {
      console.error('Batch API error:', error);
      throw error;
    } finally {
      this.clear();
    }
  }

  /**
   * Clear all batched requests
   */
  clear(): void {
    this.requests = [];
  }

  /**
   * Get current batch size
   */
  get size(): number {
    return this.requests.length;
  }

  /**
   * Check if batch is empty
   */
  get isEmpty(): boolean {
    return this.requests.length === 0;
  }
}

/**
 * Hook for using batch API client
 */
export function useBatchApi() {
  const client = new BatchApiClient();

  const addRequest = (request: BatchRequest) => {
    client.addRequest(request);
  };

  const execute = async () => {
    return await client.execute();
  };

  const clear = () => {
    client.clear();
  };

  return {
    addRequest,
    execute,
    clear,
    size: client.size,
    isEmpty: client.isEmpty
  };
}

/**
 * Predefined batch requests for common operations
 */
export const BatchRequests = {
  /**
   * Get dashboard data for an employee
   */
  getDashboardData: (employeeId: string) => [
    {
      id: 'work-session',
      endpoint: 'active-work-session',
      method: 'GET' as const,
      params: { employeeId }
    },
    {
      id: 'break-session',
      endpoint: 'active-break-session',
      method: 'GET' as const,
      params: { employeeId }
    },
    {
      id: 'daily-summary',
      endpoint: 'daily-summary',
      method: 'GET' as const,
      params: { 
        employeeId, 
        date: new Date().toISOString().split('T')[0] 
      }
    }
  ],

  /**
   * Get employee data
   */
  getEmployeeData: (employeeId: string) => [
    {
      id: 'employee',
      endpoint: 'employee',
      method: 'GET' as const,
      params: { employeeId }
    }
  ]
};

/**
 * Execute a predefined batch request
 */
export async function executeBatchRequest(requests: BatchRequest[]): Promise<BatchResponse[]> {
  const client = new BatchApiClient();
  
  for (const request of requests) {
    client.addRequest(request);
  }
  
  return await client.execute();
}

/**
 * Get dashboard data in a single batch request
 */
export async function getDashboardDataBatch(employeeId: string): Promise<{
  workSession: unknown;
  breakSession: unknown;
  dailySummary: unknown;
  errors: {
    workSession?: string;
    breakSession?: string;
    dailySummary?: string;
  };
}> {
  try {
    const response = await fetch(`/api/batch?employeeId=${employeeId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard data: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching dashboard data batch:', error);
    throw error;
  }
}
