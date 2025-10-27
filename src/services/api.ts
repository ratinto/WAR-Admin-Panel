import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';
import type { 
  Student, 
  Washerman, 
  Order, 
  DashboardStats, 
  AuthResponse, 
  ApiResponse,
  LoginCredentials 
} from '@/types';

const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('adminToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear auth and redirect to login
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async adminLogin(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // For now, use washerman login endpoint until we create admin endpoint
      const response = await this.api.post<AuthResponse>('/auth/washerman/login', credentials);
      console.log('Login response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Fetch all data in parallel
      const [orders, students, washermen] = await Promise.all([
        this.getAllOrders(),
        this.getAllStudents(),
        this.getAllWashermen(),
      ]);

      const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
      const inProgressOrders = orders.filter(o => o.status === 'INPROGRESS').length;
      const completedOrders = orders.filter(o => o.status === 'COMPLETE').length;

      return {
        totalStudents: students.length,
        totalWashermen: washermen.length,
        totalOrders: orders.length,
        pendingOrders,
        inProgressOrders,
        completedOrders,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return zeros if API fails
      return {
        totalStudents: 0,
        totalWashermen: 0,
        totalOrders: 0,
        pendingOrders: 0,
        inProgressOrders: 0,
        completedOrders: 0,
      };
    }
  }

  // Students
  async getAllStudents(): Promise<Student[]> {
    try {
      const response = await this.api.get<ApiResponse<Student[]>>('/admin/students');
      console.log('getAllStudents response:', response.data);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  }

  async createStudent(student: Omit<Student, 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Student>> {
    const response = await this.api.post<ApiResponse<Student>>('/auth/student/signup', student);
    return response.data;
  }

  async updateStudent(bagNo: string, student: Partial<Student>): Promise<ApiResponse<Student>> {
    // Endpoint needs to be created
    const response = await this.api.put<ApiResponse<Student>>(`/admin/students/${bagNo}`, student);
    return response.data;
  }

  async deleteStudent(bagNo: string): Promise<ApiResponse> {
    // Endpoint needs to be created
    const response = await this.api.delete<ApiResponse>(`/admin/students/${bagNo}`);
    return response.data;
  }

  // Washermen
  async getAllWashermen(): Promise<Washerman[]> {
    try {
      const response = await this.api.get<ApiResponse<Washerman[]>>('/admin/washermen');
      console.log('getAllWashermen response:', response.data);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching washermen:', error);
      return [];
    }
  }

  async createWasherman(washerman: { username: string; password: string }): Promise<ApiResponse<Washerman>> {
    const response = await this.api.post<ApiResponse<Washerman>>('/auth/washerman/signup', washerman);
    return response.data;
  }

  async updateWasherman(id: number, washerman: Partial<Washerman>): Promise<ApiResponse<Washerman>> {
    // Endpoint needs to be created
    const response = await this.api.put<ApiResponse<Washerman>>(`/admin/washermen/${id}`, washerman);
    return response.data;
  }

  async deleteWasherman(id: number): Promise<ApiResponse> {
    // Endpoint needs to be created
    const response = await this.api.delete<ApiResponse>(`/admin/washermen/${id}`);
    return response.data;
  }

  // Orders
  async getAllOrders(): Promise<Order[]> {
    try {
      const response = await this.api.get<ApiResponse<Order[]>>('/orders/all');
      console.log('getAllOrders response:', response.data);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  async getPendingOrders(): Promise<Order[]> {
    const response = await this.api.get<ApiResponse<Order[]>>('/orders/pending');
    return response.data.data || [];
  }

  async getStudentOrders(bagNo: string): Promise<Order[]> {
    const response = await this.api.get<ApiResponse<Order[]>>(`/orders/student/${bagNo}`);
    return response.data.data || [];
  }

  async createOrder(order: { bagNo: string; noOfClothes: number }): Promise<ApiResponse<Order>> {
    // Backend expects numberOfClothes, not noOfClothes
    const response = await this.api.post<ApiResponse<Order>>('/orders/create', {
      bagNo: order.bagNo,
      numberOfClothes: order.noOfClothes
    });
    return response.data;
  }

  async updateOrderStatus(id: number, status: string): Promise<ApiResponse<Order>> {
    // Backend expects lowercase status values
    const response = await this.api.put<ApiResponse<Order>>(`/orders/${id}/status`, { 
      status: status.toLowerCase() 
    });
    return response.data;
  }

  async updateOrderCount(id: number, noOfClothes: number): Promise<ApiResponse<Order>> {
    const response = await this.api.put<ApiResponse<Order>>(`/orders/${id}/count`, { noOfClothes });
    return response.data;
  }

  async deleteOrder(id: number): Promise<ApiResponse> {
    // Endpoint needs to be created
    const response = await this.api.delete<ApiResponse>(`/admin/orders/${id}`);
    return response.data;
  }
}

export const api = new ApiService();
export default api;
