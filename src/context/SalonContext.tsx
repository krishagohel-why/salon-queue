import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Customer, Barber, Service, SalonState, CustomerStatus } from '../types';
import { initialSalonState } from '../data/initialData';
import { translations, Language } from '../translations';
import { findActiveCustomerByPhone, findNextCustomerForBarber, formatToken } from '../utils/queueRules';
import { playChimeSound, triggerVibration } from '../utils/audio';
import { getBarberAvatar } from '../data/avatars';

const STORAGE_KEY = 'salon_queue_state_v2';
const LANG_STORAGE_KEY = 'salon_queue_lang_v1';
const CHANNEL_NAME = 'salon_queue_sync_channel';
const API_URL = ((import.meta as any).env?.VITE_API_URL as string) || '';

// Helper for backend communication with silent offline resilience
async function apiPost(endpoint: string, body: any) {
  if (!API_URL) return null;
  try {
    const res = await fetch(`${API_URL.replace(/\/$/, '')}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch (err) {
    console.warn(`[Backend API] Endpoint ${endpoint} offline or unreachable, using client state fallback.`);
    return null;
  }
}

interface SalonContextType {
  state: SalonState;
  language: Language;
  toggleLanguage: () => void;
  t: (key: keyof typeof translations.en) => string;
  joinQueue: (data: {
    name: string;
    phone: string;
    serviceIds: string[];
    barberPreference: string;
  }) => { success: boolean; customer: Customer; isExisting?: boolean };
  addWalkIn: (data: {
    name: string;
    phone: string;
    serviceIds: string[];
    barberPreference: string;
  }) => Customer;
  callNext: (barberId: string) => Customer | null;
  startService: (barberId: string, customerId: string) => void;
  completeService: (barberId: string, customerId: string) => void;
  markNoShow: (customerId: string) => void;
  cancelCustomer: (customerId: string) => void;
  toggleBarberBreak: (barberId: string) => void;
  toggleBarberDuty: (barberId: string) => void;
  toggleOnlineQueue: () => void;
  updateService: (serviceId: string, updates: Partial<Service>) => void;
  resetToDemo: () => void;
}

const SalonContext = createContext<SalonContextType | undefined>(undefined);

export const SalonProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from localStorage if available, otherwise initial state
  const [state, setState] = useState<SalonState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('salon_queue_state_v1');
        if (saved) {
          const parsed = JSON.parse(saved) as SalonState;
          // Ensure all barbers use reliable offline avatars
          if (parsed.barbers) {
            parsed.barbers = parsed.barbers.map(b => ({
              ...b,
              avatar: getBarberAvatar(b.id),
            }));
          }
          return parsed;
        }
      } catch (e) {
        console.error("Failed to load salon state from storage:", e);
      }
    }
    return initialSalonState;
  });

  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem(LANG_STORAGE_KEY) as Language;
      if (savedLang === 'en' || savedLang === 'gu') return savedLang;
    }
    return 'en';
  });

  // Cross-Tab Broadcast Channel & Backend WebSocket setup
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    let ws: WebSocket | null = null;

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel(CHANNEL_NAME);
        channel.onmessage = (event) => {
          if (event.data && event.data.type === 'SYNC_STATE') {
            setState(event.data.payload);
            if (event.data.hasChime) {
              playChimeSound();
              triggerVibration();
            }
          }
        };
      }
    } catch (err) {
      console.warn("BroadcastChannel not supported or restricted:", err);
    }

    // Connect to Backend WebSocket if API_URL is configured
    if (API_URL) {
      try {
        const wsUrl = API_URL.replace(/^http/, 'ws');
        ws = new WebSocket(wsUrl);

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data && data.type === 'SYNC_STATE' && data.payload) {
              const serverState = data.payload;
              if (serverState.barbers) {
                serverState.barbers = serverState.barbers.map((b: Barber) => ({
                  ...b,
                  avatar: getBarberAvatar(b.id),
                }));
              }
              setState(serverState);
              if (data.hasChime) {
                playChimeSound();
                triggerVibration();
              }
            }
          } catch (e) {
            // ignore parse error
          }
        };
      } catch (e) {
        console.warn("WebSocket could not connect to backend, running in offline mode:", e);
      }

      // Initial state fetch from backend REST API
      fetch(`${API_URL.replace(/\/$/, '')}/api/state`)
        .then(res => res.json())
        .then(serverState => {
          if (serverState && serverState.queue) {
            if (serverState.barbers) {
              serverState.barbers = serverState.barbers.map((b: Barber) => ({
                ...b,
                avatar: getBarberAvatar(b.id),
              }));
            }
            setState(serverState);
          }
        })
        .catch(() => {
          // fallback to localStorage/initial state silently
        });
    }

    // Storage event fallback for older browsers or cross-origin isolated contexts
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setState(parsed);
        } catch {
          // ignore parse error
        }
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      if (channel) channel.close();
      if (ws) ws.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Sync to localStorage and broadcast to other tabs
  const broadcastState = useCallback((newState: SalonState, playAlert: boolean = false) => {
    setState(newState);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        if ('BroadcastChannel' in window) {
          const channel = new BroadcastChannel(CHANNEL_NAME);
          channel.postMessage({ type: 'SYNC_STATE', payload: newState, hasChime: playAlert });
          channel.close();
        }
      } catch (err) {
        console.error("Error broadcasting salon state:", err);
      }
    }
    if (playAlert) {
      playChimeSound();
      triggerVibration();
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => {
      const next = prev === 'en' ? 'gu' : 'en';
      if (typeof window !== 'undefined') {
        localStorage.setItem(LANG_STORAGE_KEY, next);
      }
      return next;
    });
  }, []);

  const t = useCallback((key: keyof typeof translations.en): string => {
    return translations[language][key] || translations.en[key] || key;
  }, [language]);

  // Join Queue action (remote phone customer)
  const joinQueue = useCallback((data: {
    name: string;
    phone: string;
    serviceIds: string[];
    barberPreference: string;
  }) => {
    // Check if phone number is already active in queue (Test checklist #2)
    const existing = findActiveCustomerByPhone(state.queue, data.phone);
    if (existing) {
      return { success: false, customer: existing, isExisting: true };
    }

    const services = state.services.filter(s => data.serviceIds.includes(s.id));
    const totalDuration = services.reduce((acc, s) => acc + s.durationMinutes, 0);
    const totalPrice = services.reduce((acc, s) => acc + s.price, 0);

    const tokenNumber = state.nextSequentialToken;
    const token = formatToken(tokenNumber);

    const newCustomer: Customer = {
      id: 'cust-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      token,
      tokenNumber,
      name: data.name.trim(),
      phone: data.phone.trim(),
      serviceIds: data.serviceIds,
      totalDuration,
      totalPrice,
      barberPreference: data.barberPreference,
      status: 'waiting',
      createdAt: Date.now(),
      calledAt: null,
      startedAt: null,
      completedAt: null,
      assignedBarberId: null,
      isWalkIn: false,
    };

    const newState: SalonState = {
      ...state,
      queue: [...state.queue, newCustomer],
      nextSequentialToken: state.nextSequentialToken + 1,
    };

    broadcastState(newState, false);
    apiPost('/api/join', data);
    return { success: true, customer: newCustomer };
  }, [state, broadcastState]);

  // Add Walk-in customer from Reception
  const addWalkIn = useCallback((data: {
    name: string;
    phone: string;
    serviceIds: string[];
    barberPreference: string;
  }) => {
    const services = state.services.filter(s => data.serviceIds.includes(s.id));
    const totalDuration = services.reduce((acc, s) => acc + s.durationMinutes, 0);
    const totalPrice = services.reduce((acc, s) => acc + s.price, 0);

    const tokenNumber = state.nextSequentialToken;
    const token = formatToken(tokenNumber);

    const newCustomer: Customer = {
      id: 'cust-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      token,
      tokenNumber,
      name: data.name.trim(),
      phone: data.phone.trim(),
      serviceIds: data.serviceIds,
      totalDuration,
      totalPrice,
      barberPreference: data.barberPreference,
      status: 'waiting',
      createdAt: Date.now(),
      calledAt: null,
      startedAt: null,
      completedAt: null,
      assignedBarberId: null,
      isWalkIn: true,
    };

    const newState: SalonState = {
      ...state,
      queue: [...state.queue, newCustomer],
      nextSequentialToken: state.nextSequentialToken + 1,
    };

    broadcastState(newState, false);
    apiPost('/api/walk-in', data);
    return newCustomer;
  }, [state, broadcastState]);

  // Call Next customer for a specific barber (Test checklist #3 & #4)
  const callNext = useCallback((barberId: string): Customer | null => {
    const customer = findNextCustomerForBarber(state.queue, barberId);
    if (!customer) return null;

    const updatedQueue = state.queue.map(c => {
      if (c.id === customer.id) {
        return {
          ...c,
          status: 'called' as CustomerStatus,
          calledAt: Date.now(),
          assignedBarberId: barberId,
        };
      }
      return c;
    });

    const newState: SalonState = {
      ...state,
      queue: updatedQueue,
      lastCalledToken: customer.token,
      lastCalledTimestamp: Date.now(),
    };

    // Broadcast with chime = true so TV display and phones alert
    broadcastState(newState, true);
    apiPost('/api/call-next', { barberId });
    return { ...customer, status: 'called', assignedBarberId: barberId };
  }, [state, broadcastState]);

  // Barber starts service (Test checklist #5)
  const startService = useCallback((barberId: string, customerId: string) => {
    const updatedQueue = state.queue.map(c => {
      if (c.id === customerId) {
        return {
          ...c,
          status: 'in_chair' as CustomerStatus,
          startedAt: Date.now(),
          assignedBarberId: barberId,
        };
      }
      return c;
    });

    const updatedBarbers = state.barbers.map(b => {
      if (b.id === barberId) {
        return {
          ...b,
          currentCustomerId: customerId,
          serviceStartTime: Date.now(),
        };
      }
      return b;
    });

    const newState: SalonState = {
      ...state,
      queue: updatedQueue,
      barbers: updatedBarbers,
    };

    broadcastState(newState, false);
    apiPost('/api/service/start', { barberId, customerId });
  }, [state, broadcastState]);

  // Barber completes service (Test checklist #5 & #9)
  const completeService = useCallback((barberId: string, customerId: string) => {
    const updatedQueue = state.queue.map(c => {
      if (c.id === customerId) {
        return {
          ...c,
          status: 'done' as CustomerStatus,
          completedAt: Date.now(),
        };
      }
      return c;
    });

    const updatedBarbers = state.barbers.map(b => {
      if (b.id === barberId) {
        return {
          ...b,
          currentCustomerId: null,
          serviceStartTime: null,
        };
      }
      return b;
    });

    const newState: SalonState = {
      ...state,
      queue: updatedQueue,
      barbers: updatedBarbers,
    };

    broadcastState(newState, false);
    apiPost('/api/service/done', { barberId, customerId });
  }, [state, broadcastState]);

  // Reception marks customer No-Show (Test checklist #6)
  const markNoShow = useCallback((customerId: string) => {
    const target = state.queue.find(c => c.id === customerId);
    if (!target) return;

    const updatedQueue = state.queue.map(c => {
      if (c.id === customerId) {
        return {
          ...c,
          status: 'no_show' as CustomerStatus,
        };
      }
      return c;
    });

    // If assigned to a barber chair, free the barber
    const updatedBarbers = state.barbers.map(b => {
      if (b.currentCustomerId === customerId) {
        return {
          ...b,
          currentCustomerId: null,
          serviceStartTime: null,
        };
      }
      return b;
    });

    const newState: SalonState = {
      ...state,
      queue: updatedQueue,
      barbers: updatedBarbers,
    };

    broadcastState(newState, false);
    apiPost('/api/customer/no-show', { customerId });
  }, [state, broadcastState]);

  // Cancel Customer spot
  const cancelCustomer = useCallback((customerId: string) => {
    const updatedQueue = state.queue.map(c => {
      if (c.id === customerId) {
        return {
          ...c,
          status: 'cancelled' as CustomerStatus,
        };
      }
      return c;
    });

    const updatedBarbers = state.barbers.map(b => {
      if (b.currentCustomerId === customerId) {
        return {
          ...b,
          currentCustomerId: null,
          serviceStartTime: null,
        };
      }
      return b;
    });

    const newState: SalonState = {
      ...state,
      queue: updatedQueue,
      barbers: updatedBarbers,
    };

    broadcastState(newState, false);
    apiPost('/api/customer/cancel', { customerId });
  }, [state, broadcastState]);

  // Barber breaks toggle
  const toggleBarberBreak = useCallback((barberId: string) => {
    const updatedBarbers = state.barbers.map(b => {
      if (b.id === barberId) {
        return {
          ...b,
          isOnBreak: !b.isOnBreak,
        };
      }
      return b;
    });

    const newState: SalonState = {
      ...state,
      barbers: updatedBarbers,
    };

    broadcastState(newState, false);
    apiPost('/api/barber/break', { barberId });
  }, [state, broadcastState]);

  // Barber duty toggle
  const toggleBarberDuty = useCallback((barberId: string) => {
    const updatedBarbers = state.barbers.map(b => {
      if (b.id === barberId) {
        return {
          ...b,
          isOnDuty: !b.isOnDuty,
        };
      }
      return b;
    });

    const newState: SalonState = {
      ...state,
      barbers: updatedBarbers,
    };

    broadcastState(newState, false);
    apiPost('/api/barber/duty', { barberId });
  }, [state, broadcastState]);

  // Toggle online queue (Test checklist #7)
  const toggleOnlineQueue = useCallback(() => {
    const newState: SalonState = {
      ...state,
      isOnlineQueueOpen: !state.isOnlineQueueOpen,
    };

    broadcastState(newState, false);
    apiPost('/api/queue/toggle', {});
  }, [state, broadcastState]);

  // Update service in catalog
  const updateService = useCallback((serviceId: string, updates: Partial<Service>) => {
    const updatedServices = state.services.map(s => {
      if (s.id === serviceId) {
        return { ...s, ...updates };
      }
      return s;
    });

    const newState: SalonState = {
      ...state,
      services: updatedServices,
    };

    broadcastState(newState, false);
    apiPost('/api/services/update', { serviceId, updates });
  }, [state, broadcastState]);

  // Reset to initial demo state
  const resetToDemo = useCallback(() => {
    broadcastState(initialSalonState, false);
    apiPost('/api/reset', {});
  }, [broadcastState]);

  return (
    <SalonContext.Provider
      value={{
        state,
        language,
        toggleLanguage,
        t,
        joinQueue,
        addWalkIn,
        callNext,
        startService,
        completeService,
        markNoShow,
        cancelCustomer,
        toggleBarberBreak,
        toggleBarberDuty,
        toggleOnlineQueue,
        updateService,
        resetToDemo,
      }}
    >
      {children}
    </SalonContext.Provider>
  );
};

export const useSalon = () => {
  const context = useContext(SalonContext);
  if (!context) {
    throw new Error('useSalon must be used within a SalonProvider');
  }
  return context;
};
