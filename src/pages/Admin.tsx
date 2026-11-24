import React, { useState } from 'react';
import { useSalon } from '../context/SalonContext';
import { BarberAvatar } from '../components/BarberAvatar';
import { 
  Shield, 
  Settings, 
  Users, 
  Clock, 
  UserX, 
  CheckCircle2, 
  ToggleLeft, 
  ToggleRight, 
  RotateCcw, 
  Sparkles,
  Scissors,
  Check,
  Edit2
} from 'lucide-react';

export const Admin: React.FC = () => {
  const { 
    state, 
    toggleOnlineQueue, 
    toggleBarberDuty, 
    updateService, 
    resetToDemo, 
    language, 
    t 
  } = useSalon();

  const [resetMessage, setResetMessage] = useState<string | null>(null);

  // Compute live analytics
  const completedCustomers = state.queue.filter(c => c.status === 'done');
  const noShowCustomers = state.queue.filter(c => c.status === 'no_show');
  const activeWaiting = state.queue.filter(c => c.status === 'waiting');

  const totalWaitMinutes = completedCustomers.reduce((acc, c) => {
    if (c.calledAt && c.createdAt) {
      return acc + Math.round((c.calledAt - c.createdAt) / (1000 * 60));
    }
    return acc;
  }, 0);

  const avgWait = completedCustomers.length > 0 
    ? Math.round(totalWaitMinutes / completedCustomers.length) 
    : 18;

  const handleResetDemo = () => {
    resetToDemo();
    setResetMessage(t('demoDataResetSuccess'));
    setTimeout(() => {
      setResetMessage(null);
    }, 4000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Admin Title & Reset Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-charcoal-800">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-charcoal-900 border border-charcoal-700/80 text-xs text-gold-400 font-bold mb-1.5 shadow-sm">
            <Shield className="w-3.5 h-3.5" />
            <span>Admin PIN: 1234</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-serif">
            {t('adminTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            {t('adminSubtitle')}
          </p>
        </div>

        {/* Reset Demo Button */}
        <button
          onClick={handleResetDemo}
          className="touch-target inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-charcoal-900 hover:bg-charcoal-800 text-gold-400 border border-charcoal-700/80 hover:border-gold-500/40 text-xs sm:text-sm font-bold shadow-md transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t('resetDemoDataButton')}</span>
        </button>
      </div>

      {resetMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-sm font-bold flex items-center space-x-2 shadow-xl">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* Today's Stats Cards */}
      <div className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-widest text-gold-400">
          {t('todayStatsHeading')}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-3xl glass-panel space-y-1 shadow-lg">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-semibold">{t('customersServedToday')}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white font-mono">
              {completedCustomers.length}
            </div>
          </div>

          <div className="p-5 rounded-3xl glass-panel space-y-1 shadow-lg">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-semibold">{t('averageWaitTime')}</span>
              <Clock className="w-4 h-4 text-gold-400" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-gold-400 font-mono">
              {avgWait} <span className="text-xs font-sans text-gray-400">{t('minutes')}</span>
            </div>
          </div>

          <div className="p-5 rounded-3xl glass-panel space-y-1 shadow-lg">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-semibold">{t('totalNoShows')}</span>
              <UserX className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-rose-400 font-mono">
              {noShowCustomers.length}
            </div>
          </div>

          <div className="p-5 rounded-3xl glass-panel space-y-1 shadow-lg">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-semibold">{t('activeInQueue')}</span>
              <Users className="w-4 h-4 text-gold-400" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white font-mono">
              {activeWaiting.length}
            </div>
          </div>

        </div>
      </div>

      {/* Online Queue Control & Barbers on Duty */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Online Queue Switch */}
        <div className="p-6 rounded-3xl glass-panel space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white font-serif">
                {t('onlineQueueToggle')}
              </h3>
              <p className="text-xs text-gray-400 mt-1 max-w-xs leading-snug">
                {state.isOnlineQueueOpen ? t('onlineQueueOpenDesc') : t('onlineQueueClosedDesc')}
              </p>
            </div>

            <button
              onClick={toggleOnlineQueue}
              className={`p-1.5 rounded-2xl transition-colors ${
                state.isOnlineQueueOpen ? 'text-gold-400' : 'text-gray-500'
              }`}
              title="Toggle Online Queue"
            >
              {state.isOnlineQueueOpen ? (
                <ToggleRight className="w-12 h-12" />
              ) : (
                <ToggleLeft className="w-12 h-12" />
              )}
            </button>
          </div>

          <div className={`p-3.5 rounded-2xl text-xs font-bold ${
            state.isOnlineQueueOpen
              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
              : 'bg-amber-950/60 text-amber-300 border border-amber-800'
          }`}>
            Queue State: {state.isOnlineQueueOpen ? 'OPEN (Remote phone bookings active)' : 'CLOSED (Reception walk-ins only)'}
          </div>
        </div>

        {/* Barbers on Duty Today */}
        <div className="p-6 rounded-3xl glass-panel space-y-4 shadow-xl">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-white font-serif">
              {t('barbersOnDutyHeading')}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {t('barberDutyToggleDesc')}
            </p>
          </div>

          <div className="space-y-3">
            {state.barbers.map(barber => (
              <div
                key={barber.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-charcoal-900/90 border border-charcoal-700/80"
              >
                <div className="flex items-center space-x-3.5">
                  <BarberAvatar
                    barberId={barber.id}
                    name={barber.name}
                    size="md"
                    isOnDuty={barber.isOnDuty}
                  />
                  <div>
                    <div className="text-sm font-bold text-white">{barber.name}</div>
                    <div className="text-xs text-gray-400">
                      {barber.isOnDuty ? 'On Duty Today' : 'Off Duty'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => toggleBarberDuty(barber.id)}
                  className={`touch-target px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    barber.isOnDuty
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                      : 'bg-charcoal-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {barber.isOnDuty ? 'Active' : 'Off Duty'}
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Services Manager (Name EN/GU, Minutes, Price, On/Off) */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel space-y-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg sm:text-xl text-white font-serif">
              {t('servicesManagerHeading')}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Adjust prices, service durations, or toggle service availability on the customer join screen.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.services.map((service) => {
            const displayName = service.name[language] || service.name.en;

            return (
              <div
                key={service.id}
                className={`p-4 rounded-2xl border transition-all ${
                  service.isActive
                    ? 'bg-charcoal-900/90 border-charcoal-700/80 shadow-md'
                    : 'bg-charcoal-950/60 border-charcoal-800 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="font-bold text-white text-sm sm:text-base">
                    {displayName}
                  </div>
                  <button
                    onClick={() => updateService(service.id, { isActive: !service.isActive })}
                    className={`touch-target px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                      service.isActive
                        ? 'gold-gradient-bg text-charcoal-950 shadow-sm'
                        : 'bg-charcoal-800 text-gray-400'
                    }`}
                  >
                    {service.isActive ? 'Active' : 'Hidden'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-gray-400 font-semibold block mb-1">
                      {t('durationLabel')}
                    </label>
                    <input
                      type="number"
                      value={service.durationMinutes}
                      onChange={(e) => updateService(service.id, { durationMinutes: Number(e.target.value) || 15 })}
                      className="touch-target w-full px-3 py-2 rounded-xl bg-charcoal-950 border border-charcoal-700 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 font-semibold block mb-1">
                      {t('priceLabel')}
                    </label>
                    <input
                      type="number"
                      value={service.price}
                      onChange={(e) => updateService(service.id, { price: Number(e.target.value) || 50 })}
                      className="touch-target w-full px-3 py-2 rounded-xl bg-charcoal-950 border border-charcoal-700 text-gold-400 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
