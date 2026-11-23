export type CustomerStatus = 'waiting' | 'called' | 'in_chair' | 'done' | 'no_show' | 'cancelled';

export interface Service {
  id: string;
  name: {
    en: string;
    gu: string;
  };
  durationMinutes: number;
  price: number;
  isActive: boolean;
}

export interface Barber {
  id: string;
  name: string;
  avatar: string;
  isOnDuty: boolean;
  isOnBreak: boolean;
  currentCustomerId: string | null;
  serviceStartTime: number | null;
}

export interface Customer {
  id: string;
  token: string;
  tokenNumber: number;
  name: string;
  phone: string;
  serviceIds: string[];
  totalDuration: number;
  totalPrice: number;
  barberPreference: string; // 'any' or barber.id
  status: CustomerStatus;
  createdAt: number;
  calledAt: number | null;
  startedAt: number | null;
  completedAt: number | null;
  assignedBarberId: string | null;
  isWalkIn: boolean;
}

export interface SalonState {
  isOnlineQueueOpen: boolean;
  closingTime: string; // '21:00'
  barbers: Barber[];
  services: Service[];
  queue: Customer[];
  nextSequentialToken: number;
  lastCalledToken: string | null;
  lastCalledTimestamp: number | null;
}
