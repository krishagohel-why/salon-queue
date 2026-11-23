import React, { useState, useEffect } from 'react';
import { useSalon } from '../context/SalonContext';
import { calculateEstimatedWaitTime } from '../utils/queueRules';
import { playChimeSound } from '../utils/audio';
import { 
  Tv, 
  Volume2, 
  Clock, 
  Sparkles, 
  Coffee, 
  CheckCircle2, 
  Maximize2, 
  Minimize2,
  BellRing
} from 'lucide-react';

export const TvDisplay: React.FC = () => {
  const { state, language, t } = useSalon();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [flashingToken, setFlashingToken] = useState<string | null>(null);

  // Monitor lastCalledToken to trigger flashing gold alert and audio chime
  useEffect(() => {
    if (state.lastCalledToken) {
      setFlashingToken(state.lastCalledToken);
      playChimeSound();

      const timer = setTimeout(() => {
        setFlashingToken(null);
      }, 7000); // flash for 7 seconds

      return () => clearTimeout(timer);
    }
  }, [state.lastCalledToken, state.lastCalledTimestamp]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Get the top 5 waiting tokens for "Up Next"
  const upNextFive = state.queue
    .filter(c => c.status === 'waiting')
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-charcoal-950 text-white p-6 sm:p-10 flex flex-col justify-between select-none">
      
      {/* Top TV Header */}
      <div className="flex items-center justify-between pb-6 border-b-2 border-charcoal-800">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl gold-gradient-bg flex items-center justify-center text-charcoal-950 font-black shadow-lg">
            <Tv className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {t('tvTitle')}
            </h1>
            <p className="text-sm sm:text-lg text-gold-400 font-semibold tracking-wide">
              {t('tvSubtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Audio Chime Indicator */}
          <button
            onClick={() => playChimeSound()}
            title="Test Chime Sound"
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-charcoal-900 border border-charcoal-700 text-gold-400 text-xs sm:text-sm font-bold hover:bg-charcoal-800 transition-colors"
          >
            <Volume2 className="w-4 h-4 text-gold-400 animate-pulse" />
            <span className="hidden sm:inline">{t('chimeSoundNotice')}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-gray-400 hover:text-white transition-colors"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Flashing Gold Callout Banner if a token was recently called */}
      {flashingToken && (
        <div className="my-6 p-6 sm:p-8 rounded-3xl bg-gold-500 border-4 border-yellow-300 text-charcoal-950 text-center shadow-2xl animate-bounce">
          <div className="inline-flex items-center space-x-2 bg-charcoal-950 text-gold-400 px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-widest mb-2">
            <BellRing className="w-4 h-4 animate-spin" />
            <span>{t('flashCallingAlert')}</span>
          </div>
          <div className="text-5xl sm:text-7xl font-black tracking-widest mt-1">
            {flashingToken}
          </div>
        </div>
      )}

      {/* Main TV Grid: Left = Barber Stations (Now Serving); Right = Next 5 Tokens */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto py-6">
        
        {/* Left Section: Barber Stations (Now Serving) - 7 cols */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center space-x-3 text-gold-400 mb-2">
            <span className="w-3 h-3 rounded-full bg-gold-400 animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-gray-200">
              {t('nowServingStations')}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {state.barbers.filter(b => b.isOnDuty).map((barber) => {
              const currentCust = barber.currentCustomerId
                ? state.queue.find(c => c.id === barber.currentCustomerId)
                : null;

              const isBarberActiveCall = currentCust && currentCust.token === flashingToken;

              return (
                <div
                  key={barber.id}
                  className={`p-6 rounded-3xl border-2 transition-all duration-300 flex items-center justify-between shadow-xl ${
                    isBarberActiveCall
                      ? 'bg-gold-500/30 border-gold-400 animate-pulse'
                      : barber.isOnBreak
                      ? 'bg-charcoal-900/60 border-amber-900/40'
                      : currentCust
                      ? 'bg-charcoal-900 border-charcoal-700'
                      : 'bg-charcoal-900 border-emerald-800/40'
                  }`}
                >
                  {/* Barber Profile */}
                  <div className="flex items-center space-x-4">
                    <img
                      src={barber.avatar}
                      alt={barber.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-charcoal-700"
                    />
                    <div>
                      <div className="text-xl sm:text-2xl font-extrabold text-white">
                        {barber.name}
                      </div>
                      <div className="text-sm sm:text-base font-semibold mt-1">
                        {barber.isOnBreak ? (
                          <span className="text-amber-400 flex items-center">
                            <Coffee className="w-4 h-4 mr-1.5" />
                            {t('onBreak')}
                          </span>
                        ) : currentCust ? (
                          <span className="text-rose-400 flex items-center">
                            <span className="w-2 h-2 rounded-full bg-rose-400 mr-2 animate-ping" />
                            {t('busy')} · {currentCust.name}
                          </span>
                        ) : (
                          <span className="text-emerald-400 flex items-center">
                            <CheckCircle2 className="w-4 h-4 mr-1.5" />
                            {t('free')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Token Display for Barber Station */}
                  <div className="text-right">
                    {currentCust ? (
                      <div>
                        <span className="text-xs sm:text-sm text-gold-400 font-bold uppercase tracking-widest block">
                          {t('nowServing')}
                        </span>
                        <span className="text-4xl sm:text-6xl font-black tracking-wider text-white">
                          {currentCust.token}
                        </span>
                      </div>
                    ) : (
                      <div className="text-sm font-semibold text-gray-500 uppercase">
                        {t('free')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Section: Up Next 5 Tokens - 5 cols */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center space-x-3 text-gold-400 mb-2">
            <Clock className="w-5 h-5 text-gold-400" />
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-gray-200">
              {t('upNext5Heading')}
            </h2>
          </div>

          {upNextFive.length === 0 ? (
            <div className="p-8 rounded-3xl bg-charcoal-900 border border-charcoal-800 text-center text-gray-500">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <div className="text-lg font-bold text-gray-300">{t('noUpcomingQueue')}</div>
            </div>
          ) : (
            <div className="space-y-3">
              {upNextFive.map((cust, idx) => {
                const estWait = calculateEstimatedWaitTime(state.queue, cust.id, state.barbers);
                const preferredBarber = cust.barberPreference === 'any'
                  ? t('anyBarber')
                  : state.barbers.find(b => b.id === cust.barberPreference)?.name || cust.barberPreference;

                return (
                  <div
                    key={cust.id}
                    className="p-4 sm:p-5 rounded-2xl bg-charcoal-900 border border-charcoal-800 flex items-center justify-between shadow-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="w-8 h-8 rounded-xl bg-charcoal-800 text-gold-400 font-bold flex items-center justify-center text-sm">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="text-2xl sm:text-3xl font-black text-white tracking-wide">
                          {cust.token}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-400">
                          {cust.name} · <span className="text-gold-400">{preferredBarber}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-gray-400 font-medium">
                        {t('estimatedWaitTime')}
                      </div>
                      <div className="text-lg sm:text-xl font-extrabold text-gold-400">
                        ~{estWait} {t('minutes')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* TV Footer Clock & Instructions */}
      <div className="pt-6 border-t-2 border-charcoal-800 flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-gray-400">
        <div>
          <span>Please look out for your token on the screen when your turn is called.</span>
        </div>
        <div className="mt-2 sm:mt-0 font-bold text-gold-400">
          Royal Blend Salon & Spa · Digital Queue Board
        </div>
      </div>

    </div>
  );
};
