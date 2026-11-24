import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { 
  createInitialState, 
  findNextCustomerForBarber, 
  findActiveCustomerByPhone 
} from './queueLogic.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// In-memory salon state
let salonState = createInitialState();

// Create HTTP and WebSocket server
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Broadcast state update to all connected WebSocket clients
function broadcastState(hasChime = false) {
  const payload = JSON.stringify({
    type: 'SYNC_STATE',
    payload: salonState,
    hasChime,
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

// Handle WebSocket connections
wss.on('connection', (ws) => {
  // Send current state immediately on connection
  ws.send(JSON.stringify({
    type: 'SYNC_STATE',
    payload: salonState,
    hasChime: false,
  }));
});

// REST Endpoints
// Health check for Render / Railway / Uptime monitors
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Salon Queue API',
    timestamp: Date.now(),
    waitingCount: salonState.queue.filter(c => c.status === 'waiting').length,
    activeBarbers: salonState.barbers.filter(b => b.isOnDuty && !b.isOnBreak).length,
  });
});

// Get current state
app.get('/api/state', (req, res) => {
  res.json(salonState);
});

// Join queue (Customer Phone)
app.post('/api/join', (req, res) => {
  const { name, phone, serviceIds, barberPreference } = req.body;

  if (!name || !phone || !serviceIds || !serviceIds.length) {
    return res.status(400).json({ error: 'Missing required customer details' });
  }

  // Check for existing active ticket
  const existing = findActiveCustomerByPhone(salonState.queue, phone);
  if (existing) {
    return res.json({ success: false, customer: existing, isExisting: true });
  }

  const services = salonState.services.filter(s => serviceIds.includes(s.id));
  const totalDuration = services.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalPrice = services.reduce((acc, s) => acc + s.price, 0);

  const tokenNumber = salonState.nextSequentialToken;
  const token = `S-${tokenNumber}`;

  const newCustomer = {
    id: 'cust-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    token,
    tokenNumber,
    name: name.trim(),
    phone: phone.trim(),
    serviceIds,
    totalDuration,
    totalPrice,
    barberPreference: barberPreference || 'any',
    status: 'waiting',
    createdAt: Date.now(),
    calledAt: null,
    startedAt: null,
    completedAt: null,
    assignedBarberId: null,
    isWalkIn: false,
  };

  salonState.queue.push(newCustomer);
  salonState.nextSequentialToken += 1;

  broadcastState(false);
  res.json({ success: true, customer: newCustomer });
});

// Add Walk-in (Reception Desk)
app.post('/api/walk-in', (req, res) => {
  const { name, phone, serviceIds, barberPreference } = req.body;

  const services = salonState.services.filter(s => serviceIds.includes(s.id));
  const totalDuration = services.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalPrice = services.reduce((acc, s) => acc + s.price, 0);

  const tokenNumber = salonState.nextSequentialToken;
  const token = `S-${tokenNumber}`;

  const newCustomer = {
    id: 'cust-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    token,
    tokenNumber,
    name: name.trim(),
    phone: phone.trim(),
    serviceIds,
    totalDuration,
    totalPrice,
    barberPreference: barberPreference || 'any',
    status: 'waiting',
    createdAt: Date.now(),
    calledAt: null,
    startedAt: null,
    completedAt: null,
    assignedBarberId: null,
    isWalkIn: true,
  };

  salonState.queue.push(newCustomer);
  salonState.nextSequentialToken += 1;

  broadcastState(false);
  res.json({ success: true, customer: newCustomer });
});

// Call next customer for barber
app.post('/api/call-next', (req, res) => {
  const { barberId } = req.body;
  const customer = findNextCustomerForBarber(salonState.queue, barberId);

  if (!customer) {
    return res.json({ success: false, message: 'No eligible waiting customer' });
  }

  customer.status = 'called';
  customer.calledAt = Date.now();
  customer.assignedBarberId = barberId;

  salonState.lastCalledToken = customer.token;
  salonState.lastCalledTimestamp = Date.now();

  broadcastState(true);
  res.json({ success: true, customer });
});

// Start service (Barber Station)
app.post('/api/service/start', (req, res) => {
  const { barberId, customerId } = req.body;
  const customer = salonState.queue.find(c => c.id === customerId);
  const barber = salonState.barbers.find(b => b.id === barberId);

  if (customer) {
    customer.status = 'in_chair';
    customer.startedAt = Date.now();
    customer.assignedBarberId = barberId;
  }

  if (barber) {
    barber.currentCustomerId = customerId;
    barber.serviceStartTime = Date.now();
  }

  broadcastState(false);
  res.json({ success: true });
});

// Finish service (Barber Station)
app.post('/api/service/done', (req, res) => {
  const { barberId, customerId } = req.body;
  const customer = salonState.queue.find(c => c.id === customerId);
  const barber = salonState.barbers.find(b => b.id === barberId);

  if (customer) {
    customer.status = 'done';
    customer.completedAt = Date.now();
  }

  if (barber) {
    barber.currentCustomerId = null;
    barber.serviceStartTime = null;
  }

  broadcastState(false);
  res.json({ success: true });
});

// Mark no-show
app.post('/api/customer/no-show', (req, res) => {
  const { customerId } = req.body;
  const customer = salonState.queue.find(c => c.id === customerId);

  if (customer) {
    customer.status = 'no_show';
    const barber = salonState.barbers.find(b => b.currentCustomerId === customerId);
    if (barber) {
      barber.currentCustomerId = null;
      barber.serviceStartTime = null;
    }
  }

  broadcastState(false);
  res.json({ success: true });
});

// Cancel spot
app.post('/api/customer/cancel', (req, res) => {
  const { customerId } = req.body;
  const customer = salonState.queue.find(c => c.id === customerId);

  if (customer) {
    customer.status = 'cancelled';
    const barber = salonState.barbers.find(b => b.currentCustomerId === customerId);
    if (barber) {
      barber.currentCustomerId = null;
      barber.serviceStartTime = null;
    }
  }

  broadcastState(false);
  res.json({ success: true });
});

// Toggle barber break
app.post('/api/barber/break', (req, res) => {
  const { barberId } = req.body;
  const barber = salonState.barbers.find(b => b.id === barberId);
  if (barber) {
    barber.isOnBreak = !barber.isOnBreak;
  }

  broadcastState(false);
  res.json({ success: true, isOnBreak: barber?.isOnBreak });
});

// Toggle barber duty
app.post('/api/barber/duty', (req, res) => {
  const { barberId } = req.body;
  const barber = salonState.barbers.find(b => b.id === barberId);
  if (barber) {
    barber.isOnDuty = !barber.isOnDuty;
  }

  broadcastState(false);
  res.json({ success: true, isOnDuty: barber?.isOnDuty });
});

// Toggle online queue
app.post('/api/queue/toggle', (req, res) => {
  salonState.isOnlineQueueOpen = !salonState.isOnlineQueueOpen;
  broadcastState(false);
  res.json({ success: true, isOnlineQueueOpen: salonState.isOnlineQueueOpen });
});

// Update service
app.post('/api/services/update', (req, res) => {
  const { serviceId, updates } = req.body;
  const service = salonState.services.find(s => s.id === serviceId);
  if (service && updates) {
    Object.assign(service, updates);
  }

  broadcastState(false);
  res.json({ success: true, service });
});

// Reset to initial demo data
app.post('/api/reset', (req, res) => {
  salonState = createInitialState();
  broadcastState(false);
  res.json({ success: true, message: 'Queue state reset to demo' });
});

server.listen(PORT, () => {
  console.log(`💈 Salon Queue Backend running on port ${PORT}`);
  console.log(`📡 WebSocket endpoint available at ws://localhost:${PORT}`);
});
