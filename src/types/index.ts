export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  createdAt: string;
}

export interface Booking {
  id: string;
  clientId: string;
  client?: Client;
  serviceId: string;
  service?: Service;
  date: string;
  time?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalClients: number;
  totalServices: number;
  totalBookings: number;
  todayBookings: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}
