import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSalon } from '../context/SalonContext';
import { findNextCustomerForBarber } from '../utils/queueRules';
import { BarberAvatar } from '../components/BarberAvatar';
import { 
  Scissors, 
  Clock, 
  Play, 
  CheckCircle2, 
  Coffee, 
  UserCheck, 
  Phone
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

  const currentBarber = state.barbers.find(
    b => b.id.toLowerCase() === name?.toLowerCase() || b.name.toLowerCase().includes(name?.toLowerCase() || '')
  ) || state.barbers[0];

  const currentCustomer = currentBarber.currentCustomerId
    ? state.queue.find(c => c.id === currentBarber.currentCustomerId)
    : null;

  const nextCustomer = findNextCustomerForBarber(state.queue, currentBarber.id);

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
    <div className="max-w-md mx-auto px-4 py-6 sm:py-8 space-y-6">
      
      {/* Station Selector Bar */}
      <div className="glass-panel rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-extrabold tracking-widest text-beige-300">
            {t('switchBarberStation')}
          </span>
          <div className="flex space-x-1.5">
            {state.barbers.map(b => (
              <button
                key={b.id}
                onClick={() => navigate(`/barber/${b.id}`)}
                className={`touch-target px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  b.id === currentBarber.id
                    ? 'gold-gradient-bg text-maroon-950 shadow-md shadow-maroon-950'
                    : 'bg-maroon-900 text-beige-200 hover:bg-maroon-850 border border-maroon-750'
                }`}
              >
                {b.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Barber Header Info */}
        <div className="flex items-center justify-between pt-3 border-t border-maroon-800">
          <div className="flex items-center space-x-3.5">
            <BarberAvatar
              barberId={currentBarber.id}
              name={currentBarber.name}
              size="lg"
              showStatus
              isOnDuty={currentBarber.isOnDuty}
              isOnBreak={currentBarber.isOnBreak}
              isBusy={!!currentCustomer}
            />
            <div>
              <h1 className="text-lg font-black text-beige-50 font-serif">
                {currentBarber.name}
              </h1>
              <span className="text-xs text-beige-300 font-semibold">
                Station Active
              </span>
            </div>
          </div>

          {/* Toggle Break Button */}
          <button
            onClick={() => toggleBarberBreak(currentBarber.id)}
            className={`touch-target px-3.5 py-2 rounded-2xl border text-xs font-bold flex items-center space-x-1.5 transition-colors ${
              currentBarber.isOnBreak
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-maroon-900 text-beige-200 border-maroon-700 hover:border-beige-300/50'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span>{currentBarber.isOnBreak ? t('stationOnBreak') : t('stationAvailable')}</span>
          </button>
        </div>
      </div>

      {/* Break Warning if On Break */}
      {currentBarber.isOnBreak && (
        <div className="p-4 rounded-2xl bg-maroon-900/90 border border-amber-500 text-amber-200 text-xs flex items-center space-x-3 shadow-lg">
          <Coffee className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <span>You are marked on break. Customers see that your station is temporarily paused.</span>
        </div>
      )}

      {/* Current Customer Card with Big Action Buttons */}
      <div className="glass-panel-beige rounded-3xl p-6 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-maroon-800 pb-3">
          <h2 className="text-xs uppercase font-extrabold tracking-widest text-beige-300 flex items-center">
            <Scissors className="w-3.5 h-3.5 mr-1.5" />
            {t('currentCustomerHeading')}
          </h2>
          {currentCustomer && (
            <span className="px-3 py-1 rounded-xl bg-beige-300/20 text-beige-200 border border-beige-300/40 text-xs font-black font-mono">
              {currentCustomer.token}
            </span>
          )}
        </div>

        {currentCustomer ? (
          <div className="space-y-6">
            
            {/* Customer Details */}
            <div className="space-y-2">
              <div className="text-2xl sm:text-3xl font-black text-white font-serif">
                {currentCustomer.name}
              </div>
              <div className="text-xs text-beige-200/70 flex items-center font-mono">
                <Phone className="w-3 h-3 mr-1 text-beige-300" />
                {currentCustomer.phone}
              </div>

              <div className="p-4 rounded-2xl bg-maroon-950/80 border border-maroon-800 text-xs text-beige-100 space-y-1.5">
                <div className="font-bold text-beige-300 text-xs uppercase tracking-wider">Services:</div>
                <div className="text-sm font-semibold text-white">
                  {currentCustomer.serviceIds.map(id => {
                    const s = state.services.find(srv => srv.id === id);
                    return s ? (s.name[language] || s.name.en) : id;
                  }).join(', ')}
                </div>
                <div className="text-[11px] text-beige-200/60 pt-1 font-mono">
                  Est. Duration: {currentCustomer.totalDuration} min · Total: ₹{currentCustomer.totalPrice}
                </div>
              </div>
            </div>

            {/* Live Service Timer */}
            <div className="p-5 rounded-3xl bg-maroon-950 border border-maroon-800 text-center space-y-1 shadow-inner">
              <span className="text-[11px] uppercase font-bold tracking-wider text-beige-300/80 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-beige-300" />
                {t('timerSinceStart')}
              </span>
              <div className="text-5xl font-mono font-black text-beige-200 tracking-wider">
                {formatTimer(elapsedSeconds)}
              </div>
            </div>

            {/* Big Action Touch Buttons (>= 52px tap targets) */}
            <div className="space-y-3">
              {currentCustomer.status === 'called' ? (
                <button
                  onClick={handleStart}
                  className="touch-target w-full py-4 sm:py-5 px-6 rounded-2xl gold-gradient-bg text-maroon-950 font-black text-lg shadow-xl shadow-maroon-950 hover:brightness-105 active:scale-[0.99] flex items-center justify-center space-x-2.5 transition-all"
                >
                  <Play className="w-6 h-6 fill-current stroke-[3]" />
                  <span>{t('startServiceButton')}</span>
                </button>
              ) : currentCustomer.status === 'in_chair' ? (
                <button
                  onClick={handleDone}
                  className="touch-target w-full py-4 sm:py-5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg shadow-xl shadow-emerald-700/40 hover:brightness-105 active:scale-[0.99] flex items-center justify-center space-x-2.5 transition-all"
                >
                  <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                  <span>{t('doneServiceButton')}</span>
                </button>
              ) : null}
            </div>

          </div>
        ) : (
          <div className="py-12 text-center space-y-3 text-beige-200/70">
            <CheckCircle2 className="w-12 h-12 text-maroon-700 mx-auto" />
            <div className="text-lg font-bold text-beige-100 font-serif">
              {t('noActiveCustomer')}
            </div>
            <p className="text-xs text-beige-200/60 max-w-xs mx-auto">
              {t('pressCallOrWait')}
            </p>
          </div>
        )}
      </div>

      {/* Up Next for You Card */}
      <div className="glass-panel rounded-3xl p-5 space-y-3 shadow-md">
        <h3 className="text-xs uppercase font-extrabold tracking-widest text-beige-300 flex items-center">
          <UserCheck className="w-3.5 h-3.5 mr-1.5" />
          {t('upNextForYou')}
        </h3>

        {nextCustomer ? (
          <div className="p-4 rounded-2xl bg-maroon-900/90 border border-maroon-750 flex items-center justify-between shadow-sm">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-beige-200 font-mono text-base">{nextCustomer.token}</span>
                <span className="font-bold text-white text-sm">{nextCustomer.name}</span>
              </div>
              <div className="text-xs text-beige-200/70 mt-1">
                {nextCustomer.serviceIds.map(id => {
                  const s = state.services.find(srv => srv.id === id);
                  return s ? (s.name[language] || s.name.en) : id;
                }).join(', ')} ({nextCustomer.totalDuration}m)
              </div>
            </div>
            <span className="text-xs font-bold text-beige-300 bg-maroon-850 px-3 py-1 rounded-full border border-beige-300/30">
              Up Next
            </span>
          </div>
        ) : (
          <p className="text-xs text-beige-200/60 py-2">
            {t('noUpcomingCustomer')}
          </p>
        )}
      </div>

    </div>
  );
};
