import { Customer, Barber, Service } from '../types';

/**
 * Calculates the estimated wait time in minutes for a customer in the queue
 * Rule from docs/03-flows-rules.md:
 * Waiting time ≈ total minutes of services ahead ÷ barbers working
 */
export function calculateEstimatedWaitTime(
  queue: Customer[],
  targetCustomerId: string | null,
  barbers: Barber[]
): number {
  // Active barbers are on duty and not on break
  const activeBarbers = barbers.filter(b => b.isOnDuty && !b.isOnBreak);
  const barberCount = Math.max(1, activeBarbers.length);

  // If targetCustomerId is null, calculate the estimated wait for a new person joining now
  if (!targetCustomerId) {
    const waitingAhead = queue.filter(c => c.status === 'waiting');
    const totalMinutes = waitingAhead.reduce((acc, c) => acc + c.totalDuration, 0);
    return Math.max(0, Math.round(totalMinutes / barberCount));
  }

  const targetIndex = queue.findIndex(c => c.id === targetCustomerId);
  if (targetIndex === -1) return 0;

  const targetCustomer = queue[targetIndex];
  if (targetCustomer.status === 'called' || targetCustomer.status === 'in_chair') {
    return 0;
  }
  if (targetCustomer.status === 'done' || targetCustomer.status === 'no_show' || targetCustomer.status === 'cancelled') {
    return 0;
  }

  // Get waiting customers ahead of target in the queue
  const waitingAhead = queue.slice(0, targetIndex).filter(c => c.status === 'waiting');

  if (targetCustomer.barberPreference !== 'any') {
    // If client picked a specific barber, wait time is determined by customers ahead choosing that barber or 'any'
    const relevantAhead = waitingAhead.filter(
      c => c.barberPreference === 'any' || c.barberPreference === targetCustomer.barberPreference
    );
    const totalMinutes = relevantAhead.reduce((acc, c) => acc + c.totalDuration, 0);
    return Math.max(5, totalMinutes);
  } else {
    // For 'any barber', workload is shared across active barbers
    const totalMinutes = waitingAhead.reduce((acc, c) => acc + c.totalDuration, 0);
    return Math.max(0, Math.round(totalMinutes / barberCount));
  }
}

/**
 * Finds the position in line (1-based index among active 'waiting' customers)
 */
export function getQueuePosition(queue: Customer[], customerId: string): number {
  const waitingCustomers = queue.filter(c => c.status === 'waiting');
  const index = waitingCustomers.findIndex(c => c.id === customerId);
  return index === -1 ? 0 : index + 1;
}

/**
 * Core matching rule:
 * When Barber X clicks "Call next":
 * Finds the earliest customer who chose X or 'Any'.
 * A customer who chose another specific barber is NEVER matched with Barber X.
 */
export function findNextCustomerForBarber(
  queue: Customer[],
  barberId: string
): Customer | null {
  const waitingCustomers = queue.filter(c => c.status === 'waiting');
  
  for (const customer of waitingCustomers) {
    if (customer.barberPreference === 'any' || customer.barberPreference === barberId) {
      return customer;
    }
  }

  return null;
}

/**
 * Check if a phone number already has an active ticket in the queue
 * Statuses considered active: 'waiting', 'called', 'in_chair'
 */
export function findActiveCustomerByPhone(
  queue: Customer[],
  phone: string
): Customer | null {
  const cleanPhone = phone.trim().replace(/\D/g, '');
  return queue.find(
    c => c.phone.trim().replace(/\D/g, '') === cleanPhone &&
         (c.status === 'waiting' || c.status === 'called' || c.status === 'in_chair')
  ) || null;
}

/**
 * Check whether the online queue is allowed to accept new bookings
 * Rule: Online joining closes 30 min before closing, or when closed in admin
 */
export function isOnlineQueueAccepting(
  isOpenSwitch: boolean,
  closingTimeStr: string // e.g. "21:00"
): { allowed: boolean; reason?: string } {
  if (!isOpenSwitch) {
    return { allowed: false, reason: "onlineQueueClosed" };
  }

  // Check 30 minutes before closing time
  try {
    const [closeHour, closeMinute] = closingTimeStr.split(':').map(Number);
    const now = new Date();
    const closeTime = new Date();
    closeTime.setHours(closeHour, closeMinute, 0, 0);

    const diffMinutes = (closeTime.getTime() - now.getTime()) / (1000 * 60);
    if (diffMinutes <= 30 && diffMinutes > -60) {
      return { allowed: false, reason: "closingSoon" };
    }
  } catch {
    // If date parse fails, fallback to switch state
  }

  return { allowed: true };
}

/**
 * Validates 10-digit Indian mobile number
 */
export function isValidPhoneNumber(phone: string): boolean {
  const cleaned = phone.trim().replace(/\D/g, '');
  return cleaned.length === 10;
}

/**
 * Formats token string from integer (e.g. 14 -> "S-14")
 */
export function formatToken(tokenNumber: number): string {
  return `S-${tokenNumber}`;
}
