import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSalon } from '../context/SalonContext';
import { calculateEstimatedWaitTime, getQueuePosition } from '../utils/queueRules';
import { triggerVibration } from '../utils/audio';
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

  // Find customer in live state
  const customer = state.queue.find(c => c.id === id);

  // If customer not found, show not found screen
  if (!customer) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-charcoal-800 flex items-center justify-center mx-auto text-gray-500">
          <Scissors className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Ticket Not Found</h2>
        <p className="text-sm text-gray-400">
          This queue ticket may have expired, or was completed or removed.
        </p>
        <Link
          to="/"
          className="touch-target inline-flex items-center justify-center px-6 py-3 rounded-xl gold-gradient-bg text-charcoal-950 font-bold text-sm"
        >
          {t('home')}
        </Link>
      </div>
    );
  }

  // Calculate live position and wait time
  const position = getQueuePosition(state.queue, customer.id);
  const estimatedWait = calculateEstimatedWaitTime(state.queue, customer.id, state.barbers);

  // Assigned barber info
  const assignedBarber = customer.assignedBarberId 
    ? state.barbers.find(b => b.id === customer.assignedBarberId) 
    : (customer.barberPreference !== 'any' ? state.barbers.find(b => b.id === customer.barberPreference) : null);

  // Trigger celebration & vibration once when called
  useEffect(() => {
    if (customer.status === 'called' && !hasCelebrated) {
      setHasCelebrated(true);
      triggerVibration();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FACC15', '#D4A017', '#FFFFFF']
        });
      } catch {
        // ignore confetti errors
      }
    }
  }, [customer.status, hasCelebrated]);

  const handleConfirmCancel = () => {
    cancelCustomer(customer.id);
    setShowCancelModal(false);
  };

  // FULL-SCREEN GOLD CALL ALERT: When status is 'called'
  if (customer.status === 'called') {
    return (
      <div className="fixed inset-0 z-50 bg-gold-500 text-charcoal-950 flex flex-col items-center justify-center p-6 text-center animate-pulse-fast select-none">
        <div className="max-w-lg space-y-6">
          <div className="w-24 h-24 rounded-full bg-charcoal-950 text-gold-400 flex items-center justify-center mx-auto shadow-2xl animate-bounce">
            <BellRing className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest bg-charcoal-950 text-gold-400 px-4 py-1.5 rounded-full inline-block">
              {t('yourToken')} {customer.token}
            </span>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none text-charcoal-950">
              {t('itsYourTurnTitle')}
            </h1>
            <p className="text-lg sm:text-xl font-bold text-charcoal-900">
              {t('itsYourTurnSubtitle')}
            </p>
          </div>

          {assignedBarber && (
            <div className="p-4 rounded-2xl bg-charcoal-950 text-white flex items-center justify-center space-x-4 shadow-xl">
              <img
                src={assignedBarber.avatar}
                alt={assignedBarber.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-gold-400"
              />
              <div className="text-left">
                <span className="text-xs text-gold-400 uppercase font-semibold">{t('assignedBarber')}</span>
                <div className="text-xl font-extrabold">{assignedBarber.name}</div>
              </div>
            </div>
          )}

          <div className="pt-4">
            <p className="text-sm font-semibold text-charcoal-900/80">
              Your barber station is ready for you right now.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      
      {/* Top Notice if 2nd in Line: "Start coming to the salon" */}
      {position === 2 && customer.status === 'waiting' && (
        <div className="p-4 rounded-2xl bg-amber-500 text-charcoal-950 font-bold shadow-lg flex items-center space-x-3 animate-pulse">
          <BellRing className="w-6 h-6 flex-shrink-0" />
          <div className="text-sm sm:text-base leading-tight">
            {t('youAreNextBanner')}
          </div>
        </div>
      )}

      {/* In-Chair or Completed States */}
      {customer.status === 'in_chair' && (
        <div className="p-5 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <div className="text-lg font-bold text-white">{t('inChairStatus')}</div>
          {assignedBarber && (
            <p className="text-xs sm:text-sm text-emerald-300">
              Serving with <span className="font-semibold">{assignedBarber.name}</span>
            </p>
          )}
        </div>
      )}

      {customer.status === 'done' && (
        <div className="p-6 rounded-2xl bg-charcoal-900 border border-gold-500/50 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-gold-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">{t('completedStatus')}</h2>
          <Link
            to="/"
            className="touch-target inline-flex items-center px-5 py-2.5 rounded-xl gold-gradient-bg text-charcoal-950 font-bold text-sm"
          >
            {t('home')}
          </Link>
        </div>
      )}

      {customer.status === 'no_show' && (
        <div className="p-5 rounded-2xl bg-rose-950/70 border border-rose-500/80 text-rose-200 text-center space-y-2">
          <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
          <div className="text-lg font-bold text-white">{t('noShowStatus')}</div>
        </div>
      )}

      {customer.status === 'cancelled' && (
        <div className="p-5 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-gray-400 text-center space-y-2">
          <X className="w-10 h-10 text-gray-500 mx-auto" />
          <div className="text-lg font-bold text-white">{t('cancelledStatus')}</div>
        </div>
      )}

      {/* Main Ticket Card */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Large Token Header */}
        <div className="text-center space-y-1">
          <span className="text-xs uppercase font-bold tracking-widest text-gold-400">
            {t('yourToken')}
          </span>
          <div className="text-5xl sm:text-6xl font-black text-white tracking-wider">
            {customer.token}
          </div>
          <div className="text-sm font-semibold text-gray-300">
            {customer.name}
          </div>
        </div>

        {/* Circular Countdown Progress Visualizer */}
        {customer.status === 'waiting' && (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center">
              {/* Outer glowing ring */}
              <div className="absolute inset-0 rounded-full border-4 border-charcoal-800" />
              <div className="absolute inset-0 rounded-full border-4 border-gold-500 border-t-transparent animate-spin" style={{ animationDuration: '8s' }} />
              
              <div className="text-center space-y-0.5 z-10 px-4">
                <Clock className="w-6 h-6 text-gold-400 mx-auto mb-1" />
                <div className="text-2xl sm:text-3xl font-extrabold text-white">
                  ~{estimatedWait}
                </div>
                <div className="text-xs text-gold-400 uppercase font-semibold">
                  {t('minutes')}
                </div>
                <div className="text-[11px] text-gray-400">
                  {t('about')}
                </div>
              </div>
            </div>

            {/* Position indicator */}
            <div className="mt-4 inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-charcoal-800 border border-charcoal-700 text-sm font-bold text-gold-400">
              <span>{position === 1 ? 'Next in line!' : `${position}th in line`}</span>
              <span className="text-gray-400 font-normal">
                ({position > 1 ? `${position - 1} ${t('peopleAhead')}` : 'get ready'})
              </span>
            </div>
          </div>
        )}

        {/* Details List */}
        <div className="pt-4 border-t border-charcoal-800 space-y-3 text-xs sm:text-sm">
          <div className="flex items-center justify-between text-gray-400">
            <span>{t('serviceDetails')}:</span>
            <span className="text-white font-medium text-right">
              {customer.serviceIds.map(id => {
                const s = state.services.find(srv => srv.id === id);
                return s ? (s.name[language] || s.name.en) : id;
              }).join(', ')}
            </span>
          </div>

          <div className="flex items-center justify-between text-gray-400">
            <span>{t('barberCol')}:</span>
            <span className="text-white font-medium">
              {customer.barberPreference === 'any' ? t('anyBarber') : (assignedBarber?.name || customer.barberPreference)}
            </span>
          </div>

          <div className="flex items-center justify-between text-gray-400">
            <span>{t('totalPrice')}:</span>
            <span className="text-gold-400 font-bold text-base">
              ₹{customer.totalPrice}
            </span>
          </div>
        </div>

        {/* Cancel Spot Button */}
        {customer.status === 'waiting' && (
          <div className="pt-2">
            <button
              onClick={() => setShowCancelModal(true)}
              className="touch-target w-full py-3 rounded-xl bg-charcoal-800/80 hover:bg-rose-950/40 text-gray-400 hover:text-rose-300 border border-charcoal-700 hover:border-rose-800/60 text-xs sm:text-sm font-semibold transition-colors"
            >
              {t('cancelSpotButton')}
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Spot Cancellation */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-charcoal-900 border border-charcoal-700 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-white">{t('confirmCancelTitle')}</h3>
              <p className="text-xs text-gray-400">{t('confirmCancelDesc')}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="touch-target py-2.5 rounded-xl bg-charcoal-800 text-gray-300 font-semibold text-xs sm:text-sm hover:bg-charcoal-700"
              >
                {t('keepMySpot')}
              </button>
              <button
                onClick={handleConfirmCancel}
                className="touch-target py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs sm:text-sm"
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
