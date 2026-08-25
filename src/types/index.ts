export interface User {
  id: number;
  email: string;
  salonName: string;
  ownerName: string;
  phone: string;
  role: "OWNER" | "CUSTOMER";
  createdAt: string;
}

export interface SalonBrief {
  id: number;
  salonName: string;
  ownerName: string;
  phone: string;
}

export interface SalonService {
  id: number;
  name: string;
  price: number;
  durationMins: number;
}

export interface MyBooking {
  id: number;
  salonName: string;
  serviceName: string;
  date: string;
  status: "PENDING" | "CONFIRMED" | "DONE" | "CANCELLED";
  notes?: string;
  price: number;
  createdAt: string;
}

export interface Client {
  id: number;
  fullName: string;
  phone: string;
  notes?: string;
  lastVisit?: string | null;
  createdAt: string;
}

export interface Service {
  id: number;
  name: string;
  price: number;
  durationMins: number;
  createdAt: string;
}

export interface Booking {
  id: number;
  clientId: number;
  client?: Client;
  serviceId: number;
  service?: Service;
  date: string;
  status: "PENDING" | "CONFIRMED" | "DONE" | "CANCELLED";
  notes?: string;
  price: number;
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