import type {
  AuthResponse,
  Book,
  Order,
  PaymentInitiateRequest,
  PaymentInitiateResponse,
  PaymentStatusResponse,
} from "@/types";

import axios, { AxiosInstance, AxiosError } from "axios";

import { API_CONFIG } from "@/config/api";

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => Promise.reject(error),
    );

    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }

        return Promise.reject(error);
      },
    );
  }

  async register(data: {
    name: string;
    email: string;
    regNumber: string;
    password: string;
    accommodation: string;
  }): Promise<AuthResponse> {
    const response = await this.api.post<{ data: AuthResponse }>(
      "/auth/register",
      data,
    );

    return response.data.data;
  }

  async login(
    emailOrRegNumber: string,
    password: string,
  ): Promise<AuthResponse> {
    const response = await this.api.post<{ data: AuthResponse }>(
      "/auth/login",
      {
        emailOrRegNumber,
        password,
      },
    );

    return response.data.data;
  }

  async getBooks(): Promise<Book[]> {
    const response = await this.api.get<{ data: Book[] }>("/books");

    return response.data.data;
  }

  async getBookById(id: string): Promise<Book> {
    const response = await this.api.get<{ data: Book }>(`/books/${id}`);

    return response.data.data;
  }

  async createBook(data: FormData): Promise<Book> {
    const response = await this.api.post<{ data: Book }>("/books", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data;
  }

  async updateBook(id: string, data: FormData): Promise<Book> {
    const response = await this.api.put<{ data: Book }>(`/books/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data;
  }

  async deleteBook(id: string): Promise<void> {
    await this.api.delete(`/books/${id}`);
  }

  async createOrder(data: {
    items: { bookId: string; quantity: number }[];
    deliveryAddress: string;
    deliveryMethod: "pickup" | "delivery";
  }): Promise<Order> {
    const response = await this.api.post<{ data: Order }>("/orders", data);

    return response.data.data;
  }

  async getOrders(): Promise<Order[]> {
    const response = await this.api.get<{ data: Order[] }>("/orders");

    return response.data.data;
  }

  async getOrderById(id: string): Promise<Order> {
    const response = await this.api.get<{ data: Order }>(`/orders/${id}`);

    return response.data.data;
  }

  async initiatePayment(
    data: PaymentInitiateRequest,
  ): Promise<PaymentInitiateResponse> {
    const response = await this.api.post<{ data: PaymentInitiateResponse }>(
      "/payments/initiate",
      data,
    );

    return response.data.data;
  }

  async initiateCashierPayment(
    orderId: string,
  ): Promise<PaymentInitiateResponse> {
    const response = await this.api.post<{ data: PaymentInitiateResponse }>(
      "/payments/initiate-cashier",
      { orderId },
    );

    return response.data.data;
  }

  async getPaymentStatus(reference: string): Promise<PaymentStatusResponse> {
    const response = await this.api.get<{ data: PaymentStatusResponse }>(
      `/payments/status/${reference}`,
    );

    return response.data.data;
  }

  async getAdminOrders(): Promise<Order[]> {
    const response = await this.api.get<{ data: Order[] }>("/admin/orders");

    return response.data.data;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const response = await this.api.put<{ data: Order }>(
      `/admin/orders/${id}/status`,
      { orderStatus: status },
    );

    return response.data.data;
  }

  async cancelOrder(id: string): Promise<Order> {
    const response = await this.api.delete<{ data: Order }>(`/orders/${id}`);

    return response.data.data;
  }
}

export const apiService = new ApiService();
