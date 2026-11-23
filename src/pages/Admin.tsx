import React, { useState } from 'react';
import { useSalon } from '../context/SalonContext';
import { 
  Shield, 
  Settings, 
  Users, 
  Clock, 
  UserX, 
  CheckCircle2, 
  ToggleLeft, 
  ToggleRight, 
  Plus, 
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

  // Average wait time for customers who were served or waiting
  const totalWaitMinutes = completedCustomers.reduce((acc, c) => {
    if (c.calledAt && c.createdAt) {
      return acc + Math.round((c.calledAt - c.createdAt) / (1000 * 60));
    }
    return acc;
  }, 0);

  const avgWait = completedCustomers.length > 0 
    ? Math.round(totalWaitMinutes / completedCustomers.length) 
    : 18; // default benchmark

  const handleResetDemo = () => {
    resetToDemo();
    setResetMessage(t('demoDataResetSuccess'));
    setTimeout(() => {
      setResetMessage(null);
    }, 4000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Admin Title & Reset Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-charcoal-800">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-charcoal-800 border border-charcoal-700 text-xs text-gold-400 font-semibold mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Admin PIN: 1234</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t('adminTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            {t('adminSubtitle')}
          </p>
        </div>

        {/* Reset Demo Button */}
        <button
          onClick={handleResetDemo}
          className="touch-target inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-gold-400 border border-charcoal-700 text-xs sm:text-sm font-bold shadow transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t('resetDemoDataButton')}</span>
        </button>
      </div>

      {resetMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/80 text-emerald-200 text-sm font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* Today's Stats Cards */}
      <div className="space-y-3">
        <h2 className="text-sm uppercase font-bold tracking-wider text-gray-400">
          {t('todayStatsHeading')}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-1">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-semibold">{t('customersServedToday')}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {completedCustomers.length}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-1">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-semibold">{t('averageWaitTime')}</span>
              <Clock className="w-4 h-4 text-gold-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-gold-400">
              {avgWait} {t('minutes')}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-1">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-semibold">{t('totalNoShows')}</span>
              <UserX className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-400">
              {noShowCustomers.length}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-1">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-semibold">{t('activeInQueue')}</span>
              <Users className="w-4 h-4 text-gold-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {activeWaiting.length}
            </div>
          </div>

        </div>
      </div>

      {/* Online Queue Control & Barbers on Duty */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Online Queue Switch */}
        <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white">
                {t('onlineQueueToggle')}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
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

          <div className={`p-3 rounded-xl text-xs font-semibold ${
            state.isOnlineQueueOpen
              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
              : 'bg-amber-950/60 text-amber-300 border border-amber-800'
          }`}>
            Status: {state.isOnlineQueueOpen ? 'OPEN for remote customers' : 'CLOSED (Walk-ins only at desk)'}
          </div>
        </div>

        {/* Barbers on Duty Today */}
        <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-4">
          <div>
            <h3 className="font-bold text-base text-white">
              {t('barbersOnDutyHeading')}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {t('barberDutyToggleDesc')}
            </p>
          </div>

          <div className="space-y-2.5">
            {state.barbers.map(barber => (
              <div
                key={barber.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-charcoal-800/80 border border-charcoal-700/80"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={barber.avatar}
                    alt={barber.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="text-sm font-bold text-white">{barber.name}</div>
                    <div className="text-xs text-gray-400">
                      {barber.isOnDuty ? 'On Duty' : 'Off Duty'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => toggleBarberDuty(barber.id)}
                  className={`touch-target px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    barber.isOnDuty
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-charcoal-700 text-gray-400'
                  }`}
                >
                  {barber.isOnDuty ? 'On Duty' : 'Off Duty'}
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Services Manager (Name EN/GU, Minutes, Price, On/Off) */}
      <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-white">
              {t('servicesManagerHeading')}
            </h3>
            <p className="text-xs text-gray-400">
              Toggle visibility, update prices, or adjust durations.
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
                    ? 'bg-charcoal-800/70 border-charcoal-700'
                    : 'bg-charcoal-900/60 border-charcoal-800 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="font-bold text-white text-sm sm:text-base">
                    {displayName}
                  </div>
                  <button
                    onClick={() => updateService(service.id, { isActive: !service.isActive })}
                    className={`touch-target px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      service.isActive
                        ? 'bg-gold-500 text-charcoal-950 font-extrabold'
                        : 'bg-charcoal-700 text-gray-400'
                    }`}
                  >
                    {service.isActive ? 'Active' : 'Hidden'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-gray-400 block mb-1">
                      {t('durationLabel')}
                    </label>
                    <input
                      type="number"
                      value={service.durationMinutes}
                      onChange={(e) => updateService(service.id, { durationMinutes: Number(e.target.value) || 15 })}
                      className="touch-target w-full px-3 py-1.5 rounded-lg bg-charcoal-900 border border-charcoal-700 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">
                      {t('priceLabel')}
                    </label>
                    <input
                      type="number"
                      value={service.price}
                      onChange={(e) => updateService(service.id, { price: Number(e.target.value) || 50 })}
                      className="touch-target w-full px-3 py-1.5 rounded-lg bg-charcoal-900 border border-charcoal-700 text-gold-400 font-mono font-bold"
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
