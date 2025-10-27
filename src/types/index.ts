// API Types
export interface Student {
  bagNo: string;
  name: string;
  email: string;
  enrollmentNo: string;
  phoneNo: string;
  residencyNo: string;
  createdAt: string;
  updatedAt: string;
}

export interface Washerman {
  id: number;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'PENDING' | 'INPROGRESS' | 'COMPLETE';

export interface Order {
  id: number;
  bagNo: string;
  studentName?: string; // Optional, might not be included in backend response
  numberOfClothes: number; // Backend uses numberOfClothes
  noOfClothes?: number; // Alias for backward compatibility
  status: OrderStatus;
  submissionDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalWashermen: number;
  totalOrders: number;
  pendingOrders: number;
  inProgressOrders: number;
  completedOrders: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    username?: string;
    bagNo?: string;
    name?: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface LoginCredentials {
  username: string;
  password: string;
}
