import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSalon } from '../context/SalonContext';
import { calculateEstimatedWaitTime, getQueuePosition } from '../utils/queueRules';
import { triggerVibration } from '../utils/audio';
import { BarberAvatar } from '../components/BarberAvatar';
import confetti from 'canvas-confetti';
import { 
  Clock, 
  Sparkles, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Scissors, 
  ChevronRight,
  BellRing
} from 'lucide-react';

export const MyStatus: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, cancelCustomer, language, t } = useSalon();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [hasCelebrated, setHasCelebrated] = useState(false);

  const customer = state.queue.find(c => c.id === id);

  if (!customer) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-maroon-900 border border-maroon-750 flex items-center justify-center mx-auto text-beige-300/60">
          <Scissors className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-beige-50 font-serif">Ticket Not Found</h2>
        <p className="text-sm text-beige-200/70">
          This queue ticket may have expired, or was completed or removed.
        </p>
        <Link
          to="/"
          className="touch-target inline-flex items-center justify-center px-6 py-3 rounded-xl gold-gradient-bg text-maroon-950 font-bold text-sm"
        >
          {t('home')}
        </Link>
      </div>
    );
  }

  const position = getQueuePosition(state.queue, customer.id);
  const estimatedWait = calculateEstimatedWaitTime(state.queue, customer.id, state.barbers);

  const assignedBarber = customer.assignedBarberId 
    ? state.barbers.find(b => b.id === customer.assignedBarberId) 
    : (customer.barberPreference !== 'any' ? state.barbers.find(b => b.id === customer.barberPreference) : null);

  useEffect(() => {
    if (customer.status === 'called' && !hasCelebrated) {
      setHasCelebrated(true);
      triggerVibration();
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#F4ECE1', '#DFC8A9', '#B08655', '#FFFFFF', '#681630']
        });
      } catch {
        // ignore
      }
    }
  }, [customer.status, hasCelebrated]);

  const handleConfirmCancel = () => {
    cancelCustomer(customer.id);
    setShowCancelModal(false);
  };

  // FULL-SCREEN CELEBRATORY CHAMPAGNE BEIGE ALERT WHEN CALLED
  if (customer.status === 'called') {
    return (
      <div className="fixed inset-0 z-50 gold-gradient-bg text-maroon-950 flex flex-col items-center justify-center p-6 text-center animate-pulse-fast select-none">
        <div className="max-w-md w-full space-y-6">
          <div className="w-24 h-24 rounded-3xl bg-maroon-950 text-beige-200 flex items-center justify-center mx-auto shadow-2xl animate-bounce border-2 border-beige-200">
            <BellRing className="w-12 h-12 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest bg-maroon-950 text-beige-200 px-5 py-2 rounded-full inline-block shadow-md">
              {t('yourToken')} {customer.token}
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none text-maroon-950 font-serif">
              {t('itsYourTurnTitle')}
            </h1>
            <p className="text-base sm:text-lg font-bold text-maroon-900">
              {t('itsYourTurnSubtitle')}
            </p>
          </div>

          {assignedBarber && (
            <div className="p-5 rounded-3xl bg-maroon-950 text-white flex items-center justify-center space-x-4 shadow-2xl border border-beige-300/50">
              <BarberAvatar
                barberId={assignedBarber.id}
                name={assignedBarber.name}
                size="lg"
              />
              <div className="text-left">
                <span className="text-xs text-beige-300 uppercase font-bold tracking-wider">{t('assignedBarber')}</span>
                <div className="text-xl font-black font-serif text-beige-50">{assignedBarber.name}</div>
              </div>
            </div>
          )}

          <div className="pt-2">
            <p className="text-sm font-bold text-maroon-950 bg-white/40 backdrop-blur-sm px-4 py-2 rounded-full inline-block">
              ✨ Station is prepared and waiting for you right now
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-6">
      
      {/* Alert when 2nd in line: "Start coming to the salon" */}
      {position === 2 && customer.status === 'waiting' && (
        <div className="p-4 rounded-3xl bg-amber-500 text-maroon-950 font-black shadow-xl flex items-center space-x-3.5 animate-pulse">
          <BellRing className="w-6 h-6 flex-shrink-0" />
          <div className="text-sm sm:text-base leading-snug">
            {t('youAreNextBanner')}
          </div>
        </div>
      )}

      {/* In-Chair or Completed States */}
      {customer.status === 'in_chair' && (
        <div className="p-5 rounded-3xl bg-maroon-900 border border-emerald-500 text-emerald-200 text-center space-y-2 shadow-xl">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <div className="text-lg font-black text-white font-serif">{t('inChairStatus')}</div>
          {assignedBarber && (
            <p className="text-xs sm:text-sm text-beige-200">
              Serving with <span className="font-bold">{assignedBarber.name}</span>
            </p>
          )}
        </div>
      )}

      {customer.status === 'done' && (
        <div className="glass-panel-beige rounded-3xl p-6 text-center space-y-4 shadow-2xl">
          <CheckCircle2 className="w-14 h-14 text-beige-300 mx-auto" />
          <h2 className="text-xl sm:text-2xl font-black text-beige-50 font-serif">{t('completedStatus')}</h2>
          <Link
            to="/"
            className="touch-target inline-flex items-center px-6 py-3 rounded-2xl gold-gradient-bg text-maroon-950 font-black text-sm shadow-md"
          >
            {t('home')}
          </Link>
        </div>
      )}

      {customer.status === 'no_show' && (
        <div className="p-5 rounded-3xl bg-maroon-900 border border-rose-500 text-rose-200 text-center space-y-2 shadow-xl">
          <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
          <div className="text-base font-bold text-white font-serif">{t('noShowStatus')}</div>
        </div>
      )}

      {customer.status === 'cancelled' && (
        <div className="glass-panel rounded-3xl p-6 text-beige-200/60 text-center space-y-2">
          <X className="w-10 h-10 text-beige-300/40 mx-auto" />
          <div className="text-base font-bold text-white font-serif">{t('cancelledStatus')}</div>
        </div>
      )}

      {/* Main Luxury Digital Ticket */}
      <div className="glass-panel-beige rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-beige-300/10 rounded-full blur-3xl pointer-events-none" />

        {/* Large Token Header */}
        <div className="text-center space-y-1 pb-4 border-b border-maroon-800">
          <span className="text-xs uppercase font-extrabold tracking-widest text-beige-300">
            {t('yourToken')}
          </span>
          <div className="text-6xl font-black text-beige-50 tracking-wider font-mono">
            {customer.token}
          </div>
          <div className="text-sm font-bold text-beige-200">
            {customer.name}
          </div>
        </div>

        {/* Circular Countdown Progress Visualizer */}
        {customer.status === 'waiting' && (
          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-maroon-800" />
              <div className="absolute inset-0 rounded-full border-4 border-beige-300 border-t-transparent animate-spin" style={{ animationDuration: '8s' }} />
              
              <div className="text-center space-y-0.5 z-10 px-4">
                <Clock className="w-6 h-6 text-beige-300 mx-auto mb-1 animate-pulse" />
                <div className="text-3xl font-black text-beige-50 font-mono">
                  ~{estimatedWait}
                </div>
                <div className="text-xs text-beige-300 uppercase font-black tracking-wider">
                  {t('minutes')}
                </div>
                <div className="text-[11px] text-beige-200/70 font-medium">
                  {t('about')}
                </div>
              </div>
            </div>

            {/* Position in line indicator */}
            <div className="mt-4 inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-maroon-900 border border-beige-300/30 text-sm font-bold text-beige-300 shadow-sm">
              <span>{position === 1 ? 'Next in line!' : `${position}th in line`}</span>
              <span className="text-beige-200/70 font-normal">
                ({position > 1 ? `${position - 1} ${t('peopleAhead')}` : 'prepare to step in'})
              </span>
            </div>
          </div>
        )}

        {/* Service Details & Stylist info */}
        <div className="pt-4 border-t border-maroon-800/80 space-y-3.5 text-xs sm:text-sm">
          <div className="flex items-center justify-between text-beige-200/70">
            <span>{t('serviceDetails')}:</span>
            <span className="text-white font-semibold text-right max-w-[200px] truncate">
              {customer.serviceIds.map(id => {
                const s = state.services.find(srv => srv.id === id);
                return s ? (s.name[language] || s.name.en) : id;
              }).join(', ')}
            </span>
          </div>

          <div className="flex items-center justify-between text-beige-200/70">
            <span>{t('barberCol')}:</span>
            <span className="text-white font-semibold">
              {customer.barberPreference === 'any' ? t('anyBarber') : (assignedBarber?.name || customer.barberPreference)}
            </span>
          </div>

          <div className="flex items-center justify-between text-beige-200/70">
            <span>{t('totalPrice')}:</span>
            <span className="text-beige-200 font-black text-lg font-mono">
              ₹{customer.totalPrice}
            </span>
          </div>
        </div>

        {/* Cancel Spot Button */}
        {customer.status === 'waiting' && (
          <div className="pt-2">
            <button
              onClick={() => setShowCancelModal(true)}
              className="touch-target w-full py-3 rounded-2xl bg-maroon-900/80 hover:bg-rose-950/40 text-beige-200/70 hover:text-rose-300 border border-maroon-800 hover:border-rose-800/60 text-xs sm:text-sm font-semibold transition-colors"
            >
              {t('cancelSpotButton')}
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Spot Cancellation */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel-beige rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-white font-serif">{t('confirmCancelTitle')}</h3>
              <p className="text-xs text-beige-200/70 leading-snug">{t('confirmCancelDesc')}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="touch-target py-3 rounded-xl bg-maroon-850 text-beige-200 font-semibold text-xs sm:text-sm hover:bg-maroon-800"
              >
                {t('keepMySpot')}
              </button>
              <button
                onClick={handleConfirmCancel}
                className="touch-target py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm shadow"
              >
                {t('confirmCancelAction')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
