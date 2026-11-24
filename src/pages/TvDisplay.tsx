import React, { useState, useEffect } from 'react';
import { useSalon } from '../context/SalonContext';
import { calculateEstimatedWaitTime } from '../utils/queueRules';
import { playChimeSound } from '../utils/audio';
import { BarberAvatar } from '../components/BarberAvatar';
import { 
  Tv, 
  Volume2, 
  Clock, 
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

  useEffect(() => {
    if (state.lastCalledToken) {
      setFlashingToken(state.lastCalledToken);
      playChimeSound();

      const timer = setTimeout(() => {
        setFlashingToken(null);
      }, 7000);

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

  const upNextFive = state.queue
    .filter(c => c.status === 'waiting')
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-maroon-950 text-beige-50 p-6 sm:p-10 flex flex-col justify-between select-none font-sans">
      
      {/* Top TV Header in Maroon & Champagne Beige */}
      <div className="flex items-center justify-between pb-6 border-b-2 border-maroon-800">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl gold-gradient-bg flex items-center justify-center text-maroon-950 font-black shadow-xl shadow-maroon-950">
            <Tv className="w-8 h-8 sm:w-9 sm:h-9" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-beige-50 font-serif">
              {t('tvTitle')}
            </h1>
            <p className="text-sm sm:text-lg text-beige-300 font-bold tracking-wide">
              {t('tvSubtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3.5">
          {/* Test Chime Sound button */}
          <button
            onClick={() => playChimeSound()}
            title="Test Chime Sound"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-maroon-900 border border-maroon-700 text-beige-300 text-xs sm:text-sm font-bold hover:bg-maroon-850 transition-colors shadow-sm"
          >
            <Volume2 className="w-4 h-4 text-beige-300 animate-pulse" />
            <span className="hidden sm:inline">{t('chimeSoundNotice')}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-3 rounded-xl bg-maroon-900 border border-maroon-700 text-beige-200/70 hover:text-white transition-colors"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Flashing Champagne Beige Callout Banner if a token was recently called */}
      {flashingToken && (
        <div className="my-6 p-6 sm:p-10 rounded-3xl gold-gradient-bg border-4 border-beige-100 text-maroon-950 text-center shadow-2xl animate-bounce">
          <div className="inline-flex items-center space-x-2 bg-maroon-950 text-beige-300 px-5 py-2 rounded-full text-sm font-black uppercase tracking-widest mb-2 shadow-lg">
            <BellRing className="w-5 h-5 animate-spin" />
            <span>{t('flashCallingAlert')}</span>
          </div>
          <div className="text-6xl sm:text-8xl font-black tracking-widest mt-2 font-mono">
            {flashingToken}
          </div>
        </div>
      )}

      {/* Main TV Grid: Left = Barber Stations (Now Serving); Right = Next 5 Tokens */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto py-6">
        
        {/* Left Section: Barber Stations (Now Serving) - 7 cols */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center space-x-3 text-beige-300 mb-2">
            <span className="w-3.5 h-3.5 rounded-full bg-beige-300 animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-beige-50 font-serif">
              {t('nowServingStations')}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {state.barbers.filter(b => b.isOnDuty).map((barber) => {
              const currentCust = barber.currentCustomerId
                ? state.queue.find(c => c.id === barber.currentCustomerId)
                : null;

              const isBarberActiveCall = currentCust && currentCust.token === flashingToken;
              const isBusy = !!currentCust;

              return (
                <div
                  key={barber.id}
                  className={`p-6 rounded-3xl border-2 transition-all duration-300 flex items-center justify-between shadow-2xl ${
                    isBarberActiveCall
                      ? 'bg-beige-300/25 border-beige-300 animate-pulse'
                      : barber.isOnBreak
                      ? 'bg-maroon-900/60 border-amber-900/40'
                      : isBusy
                      ? 'bg-maroon-900 border-maroon-700'
                      : 'bg-maroon-900 border-maroon-750'
                  }`}
                >
                  {/* Barber Profile with Real Vector Avatar */}
                  <div className="flex items-center space-x-5">
                    <BarberAvatar
                      barberId={barber.id}
                      name={barber.name}
                      size="xl"
                      showStatus
                      isOnDuty={barber.isOnDuty}
                      isOnBreak={barber.isOnBreak}
                      isBusy={isBusy}
                    />
                    <div>
                      <div className="text-xl sm:text-3xl font-black text-white font-serif">
                        {barber.name}
                      </div>
                      <div className="text-sm sm:text-base font-bold mt-1">
                        {barber.isOnBreak ? (
                          <span className="text-amber-300 flex items-center">
                            <Coffee className="w-4 h-4 mr-1.5" />
                            {t('onBreak')}
                          </span>
                        ) : currentCust ? (
                          <span className="text-rose-300 flex items-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 mr-2 animate-ping" />
                            {t('busy')} · {currentCust.name}
                          </span>
                        ) : (
                          <span className="text-emerald-300 flex items-center">
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
                        <span className="text-xs sm:text-sm text-beige-300 font-black uppercase tracking-widest block">
                          {t('nowServing')}
                        </span>
                        <span className="text-5xl sm:text-7xl font-black tracking-wider text-beige-100 font-mono">
                          {currentCust.token}
                        </span>
                      </div>
                    ) : (
                      <div className="text-sm sm:text-base font-bold text-beige-200/50 uppercase px-4 py-2 rounded-xl bg-maroon-950/60 border border-maroon-800">
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
          <div className="flex items-center space-x-3 text-beige-300 mb-2">
            <Clock className="w-5 h-5 text-beige-300" />
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-beige-50 font-serif">
              {t('upNext5Heading')}
            </h2>
          </div>

          {upNextFive.length === 0 ? (
            <div className="p-10 rounded-3xl bg-maroon-900 border border-maroon-800 text-center text-beige-200/60 shadow-xl">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-beige-100 font-serif">{t('noUpcomingQueue')}</div>
            </div>
          ) : (
            <div className="space-y-3.5">
              {upNextFive.map((cust, idx) => {
                const estWait = calculateEstimatedWaitTime(state.queue, cust.id, state.barbers);
                const preferredBarber = cust.barberPreference === 'any'
                  ? t('anyBarber')
                  : state.barbers.find(b => b.id === cust.barberPreference)?.name || cust.barberPreference;

                return (
                  <div
                    key={cust.id}
                    className="p-5 rounded-2xl bg-maroon-900 border border-maroon-800 flex items-center justify-between shadow-xl hover:border-beige-300/40 transition-all"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="w-10 h-10 rounded-xl bg-maroon-950 text-beige-300 font-black flex items-center justify-center text-base border border-maroon-750">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="text-3xl sm:text-4xl font-black text-white tracking-wide font-mono">
                          {cust.token}
                        </div>
                        <div className="text-xs sm:text-sm text-beige-200/70 font-medium">
                          {cust.name} · <span className="text-beige-300 font-semibold">{preferredBarber}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-beige-200/70 font-semibold">
                        {t('estimatedWaitTime')}
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-beige-200 font-mono">
                        ~{estWait} <span className="text-xs font-sans">{t('minutes')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* TV Footer Board */}
      <div className="pt-6 border-t-2 border-maroon-800 flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-beige-200/70">
        <div>
          <span>Please look out for your token on the screen when your turn is called.</span>
        </div>
        <div className="mt-2 sm:mt-0 font-bold text-beige-300 font-serif">
          Royal Blend Salon & Spa · Digital Lounge Board
        </div>
      </div>

    </div>
  );
};
