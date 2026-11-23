import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSalon } from '../context/SalonContext';
import { findNextCustomerForBarber } from '../utils/queueRules';
import { 
  Scissors, 
  Clock, 
  Play, 
  CheckCircle2, 
  Coffee, 
  UserCheck, 
  Sparkles, 
  ChevronRight,
  Phone,
  AlertCircle
} from 'lucide-react';

export const BarberView: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const { 
    state, 
    startService, 
    completeService, 
    toggleBarberBreak, 
    language, 
    t 
  } = useSalon();

  // Find active barber by id or name
  const currentBarber = state.barbers.find(
    b => b.id.toLowerCase() === name?.toLowerCase() || b.name.toLowerCase().includes(name?.toLowerCase() || '')
  ) || state.barbers[0];

  // Active customer in chair
  const currentCustomer = currentBarber.currentCustomerId
    ? state.queue.find(c => c.id === currentBarber.currentCustomerId)
    : null;

  // Next up for this barber
  const nextCustomer = findNextCustomerForBarber(state.queue, currentBarber.id);

  // Live timer tick for service elapsed time
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    if (!currentBarber.serviceStartTime || currentCustomer?.status !== 'in_chair') {
      setElapsedSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - currentBarber.serviceStartTime!) / 1000);
      setElapsedSeconds(Math.max(0, diff));
    }, 1000);

    return () => clearInterval(interval);
  }, [currentBarber.serviceStartTime, currentCustomer?.status]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (currentCustomer) {
      startService(currentBarber.id, currentCustomer.id);
    }
  };

  const handleDone = () => {
    if (currentCustomer) {
      completeService(currentBarber.id, currentCustomer.id);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      
      {/* Station Selector Bar */}
      <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-bold tracking-wider text-gray-400">
            {t('switchBarberStation')}
          </span>
          <div className="flex space-x-1">
            {state.barbers.map(b => (
              <button
                key={b.id}
                onClick={() => navigate(`/barber/${b.id}`)}
                className={`touch-target px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  b.id === currentBarber.id
                    ? 'gold-gradient-bg text-charcoal-950 shadow-sm'
                    : 'bg-charcoal-800 text-gray-300 hover:bg-charcoal-700'
                }`}
              >
                {b.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Barber Header Info */}
        <div className="flex items-center justify-between pt-2 border-t border-charcoal-800">
          <div className="flex items-center space-x-3">
            <img
              src={currentBarber.avatar}
              alt={currentBarber.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-gold-500/50"
            />
            <div>
              <h1 className="text-base font-extrabold text-white">
                {currentBarber.name}
              </h1>
              <span className="text-xs text-gold-400 font-medium">
                Station Active
              </span>
            </div>
          </div>

          {/* Toggle Break Button */}
          <button
            onClick={() => toggleBarberBreak(currentBarber.id)}
            className={`touch-target px-3 py-2 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-colors ${
              currentBarber.isOnBreak
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-charcoal-800 text-gray-300 border-charcoal-700'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span>{currentBarber.isOnBreak ? t('stationOnBreak') : t('stationAvailable')}</span>
          </button>
        </div>
      </div>

      {/* Break Warning if On Break */}
      {currentBarber.isOnBreak && (
        <div className="p-4 rounded-2xl bg-amber-950/70 border border-amber-500 text-amber-200 text-xs flex items-center space-x-3">
          <Coffee className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <span>You are marked on break. Customers will see your station is paused.</span>
        </div>
      )}

      {/* Current Customer Card with Big Action Buttons */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-3xl p-6 space-y-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
          <h2 className="text-xs uppercase font-bold tracking-wider text-gold-400 flex items-center">
            <Scissors className="w-3.5 h-3.5 mr-1.5" />
            {t('currentCustomerHeading')}
          </h2>
          {currentCustomer && (
            <span className="px-2.5 py-1 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/30 text-xs font-bold">
              {currentCustomer.token}
            </span>
          )}
        </div>

        {currentCustomer ? (
          <div className="space-y-6">
            
            {/* Customer Details */}
            <div className="space-y-2">
              <div className="text-2xl font-black text-white">
                {currentCustomer.name}
              </div>
              <div className="text-xs text-gray-400 flex items-center">
                <Phone className="w-3 h-3 mr-1" />
                {currentCustomer.phone}
              </div>
              <div className="p-3 rounded-xl bg-charcoal-800 text-xs text-gray-300 space-y-1">
                <div className="font-semibold text-gold-400">Services:</div>
                <div>
                  {currentCustomer.serviceIds.map(id => {
                    const s = state.services.find(srv => srv.id === id);
                    return s ? (s.name[language] || s.name.en) : id;
                  }).join(', ')}
                </div>
                <div className="text-[11px] text-gray-400 pt-1">
                  Est. Duration: {currentCustomer.totalDuration} min · ₹{currentCustomer.totalPrice}
                </div>
              </div>
            </div>

            {/* Live Service Timer */}
            <div className="p-4 rounded-2xl bg-charcoal-950 border border-charcoal-800 text-center space-y-1">
              <span className="text-[11px] uppercase font-bold tracking-wider text-gray-400 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-gold-400" />
                {t('timerSinceStart')}
              </span>
              <div className="text-4xl font-mono font-extrabold text-gold-400">
                {formatTimer(elapsedSeconds)}
              </div>
            </div>

            {/* Big Action Buttons (>= 44px tap target) */}
            <div className="space-y-3">
              {currentCustomer.status === 'called' ? (
                <button
                  onClick={handleStart}
                  className="touch-target w-full py-4 px-6 rounded-2xl gold-gradient-bg text-charcoal-950 font-black text-lg shadow-lg hover:brightness-105 active:scale-[0.99] flex items-center justify-center space-x-2"
                >
                  <Play className="w-6 h-6 fill-current" />
                  <span>{t('startServiceButton')}</span>
                </button>
              ) : currentCustomer.status === 'in_chair' ? (
                <button
                  onClick={handleDone}
                  className="touch-target w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg shadow-lg hover:brightness-105 active:scale-[0.99] flex items-center justify-center space-x-2"
                >
                  <CheckCircle2 className="w-6 h-6" />
                  <span>{t('doneServiceButton')}</span>
                </button>
              ) : null}
            </div>

          </div>
        ) : (
          <div className="py-8 text-center space-y-3 text-gray-400">
            <CheckCircle2 className="w-12 h-12 text-gray-600 mx-auto" />
            <div className="text-base font-bold text-gray-300">
              {t('noActiveCustomer')}
            </div>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              {t('pressCallOrWait')}
            </p>
          </div>
        )}
      </div>

      {/* Up Next for You Card */}
      <div className="p-5 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-3 shadow-md">
        <h3 className="text-xs uppercase font-bold tracking-wider text-gray-400 flex items-center">
          <UserCheck className="w-3.5 h-3.5 mr-1.5 text-gold-400" />
          {t('upNextForYou')}
        </h3>

        {nextCustomer ? (
          <div className="p-3.5 rounded-2xl bg-charcoal-800/80 border border-charcoal-700/80 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-gold-400">{nextCustomer.token}</span>
                <span className="font-bold text-white text-sm">{nextCustomer.name}</span>
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {nextCustomer.serviceIds.map(id => {
                  const s = state.services.find(srv => srv.id === id);
                  return s ? (s.name[language] || s.name.en) : id;
                }).join(', ')} ({nextCustomer.totalDuration}m)
              </div>
            </div>
            <span className="text-xs font-semibold text-gold-400 bg-gold-500/10 px-2.5 py-1 rounded-full border border-gold-500/20">
              Next
            </span>
          </div>
        ) : (
          <p className="text-xs text-gray-500">
            {t('noUpcomingCustomer')}
          </p>
        )}
      </div>

    </div>
  );
};
