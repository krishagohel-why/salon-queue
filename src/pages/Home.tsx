import React from 'react';
import { Link } from 'react-router-dom';
import { useSalon } from '../context/SalonContext';
import { calculateEstimatedWaitTime } from '../utils/queueRules';
import { BarberAvatar } from '../components/BarberAvatar';
import { 
  Users, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  ShieldAlert, 
  Scissors, 
  ChevronRight
} from 'lucide-react';

export const Home: React.FC = () => {
  const { state, language, t } = useSalon();

  const waitingCount = state.queue.filter(c => c.status === 'waiting').length;
  const estimatedWait = calculateEstimatedWaitTime(state.queue, null, state.barbers);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      
      {/* Luxury Hero Welcome in Maroon & Champagne Beige */}
      <div className="text-center space-y-4 relative">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-maroon-900/90 border border-beige-300/40 text-beige-300 text-xs font-bold uppercase tracking-widest shadow-lg shadow-maroon-950/80">
          <Sparkles className="w-3.5 h-3.5 animate-spin text-beige-300" style={{ animationDuration: '6s' }} />
          <span>{t('salonTagline')}</span>
        </div>

        <h1 className="text-3xl sm:text-6xl font-black tracking-tight text-beige-50 font-serif">
          {t('salonName')}
        </h1>

        <p className="text-sm sm:text-base text-beige-200/80 max-w-xl mx-auto leading-relaxed font-normal">
          Skip the crowded salon lounge. Reserve your digital spot from anywhere, track your live turn, and step in right as your chair is ready.
        </p>

        {/* Feature Highlights Strip */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-2 text-xs font-semibold text-beige-200/75">
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-beige-300" />
            <span>Real-time Live Sync</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-beige-300" />
            <span>Zero Physical Queue</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-beige-300" />
            <span>Master Stylists</span>
          </div>
        </div>
      </div>

      {/* Online Queue Closed Warning Banner */}
      {!state.isOnlineQueueOpen && (
        <div className="p-4 sm:p-5 rounded-3xl bg-maroon-900/90 border border-amber-600/70 flex items-start space-x-3.5 text-amber-200 shadow-xl">
          <ShieldAlert className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-bold text-base block">{t('closedBadge')}</span>
            <p className="text-amber-200/80 mt-1 leading-snug">{t('onlineQueueClosedMsg')}</p>
          </div>
        </div>
      )}

      {/* Live Queue Status Main Card */}
      <div className="glass-panel-beige rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-56 h-56 bg-beige-300/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Card Header */}
        <div className="flex items-center justify-between pb-6 border-b border-maroon-800/80">
          <div className="flex items-center space-x-3">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-beige-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-beige-400"></span>
            </span>
            <h2 className="text-lg sm:text-xl font-black text-beige-50 tracking-wide font-serif">
              {t('liveQueueStatus')}
            </h2>
          </div>
          <span className="text-xs text-beige-300 font-bold bg-maroon-900/90 px-3.5 py-1.5 rounded-full border border-beige-300/30">
            {state.isOnlineQueueOpen ? t('openBadge') : t('closedBadge')}
          </span>
        </div>

        {/* Live Metrics Grid */}
        {waitingCount === 0 ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-maroon-900 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-emerald-300 font-serif">
              {t('noOneWaiting')}
            </h3>
            <p className="text-sm text-beige-200/70 max-w-sm mx-auto">
              Our master barbers are available. You will be seated right away upon arrival!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 py-8">
            {/* Customers Waiting */}
            <div className="flex items-center space-x-5 p-5 rounded-2xl bg-maroon-900/90 border border-maroon-700/70 shadow-lg hover:border-beige-300/40 transition-all">
              <div className="w-14 h-14 rounded-2xl gold-gradient-bg flex items-center justify-center text-maroon-950 font-bold shadow-md shadow-maroon-950">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black text-beige-50 font-mono">
                  {waitingCount}
                </div>
                <div className="text-xs sm:text-sm text-beige-200/75 font-semibold tracking-wide">
                  {t('peopleWaiting')}
                </div>
              </div>
            </div>

            {/* Estimated Wait Time */}
            <div className="flex items-center space-x-5 p-5 rounded-2xl bg-maroon-900/90 border border-maroon-700/70 shadow-lg hover:border-beige-300/40 transition-all">
              <div className="w-14 h-14 rounded-2xl gold-gradient-bg flex items-center justify-center text-maroon-950 font-bold shadow-md shadow-maroon-950">
                <Clock className="w-7 h-7" />
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black text-beige-200 font-mono">
                  ~{estimatedWait} <span className="text-xl font-sans text-beige-300">{t('minutes')}</span>
                </div>
                <div className="text-xs sm:text-sm text-beige-200/75 font-semibold tracking-wide">
                  {t('currentWaitHeading')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Master Stylists Roster with SVG Avatars */}
        <div className="pt-6 border-t border-maroon-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-beige-300">
              {t('barbersOnDuty')}
            </h3>
            <span className="text-xs text-beige-200/70">
              {state.barbers.filter(b => b.isOnDuty).length} Barbers Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {state.barbers.map((barber) => {
              const isBusy = !!barber.currentCustomerId;
              let statusLabel = t('free');
              let statusBadgeClass = 'text-emerald-300 bg-emerald-950/70 border-emerald-800/80';

              if (!barber.isOnDuty) {
                statusLabel = t('offDuty');
                statusBadgeClass = 'text-gray-400 bg-maroon-950 border-maroon-800';
              } else if (barber.isOnBreak) {
                statusLabel = t('onBreak');
                statusBadgeClass = 'text-amber-300 bg-amber-950/70 border-amber-800/80';
              } else if (isBusy) {
                statusLabel = t('busy');
                statusBadgeClass = 'text-rose-300 bg-rose-950/70 border-rose-800/80';
              }

              return (
                <div
                  key={barber.id}
                  className="flex items-center space-x-3.5 p-3.5 rounded-2xl bg-maroon-900/85 border border-maroon-750 hover:border-beige-300/50 transition-all shadow-md"
                >
                  <BarberAvatar
                    barberId={barber.id}
                    name={barber.name}
                    size="md"
                    showStatus
                    isOnDuty={barber.isOnDuty}
                    isOnBreak={barber.isOnBreak}
                    isBusy={isBusy}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm text-beige-50 truncate">
                      {barber.name}
                    </div>
                    <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md border mt-0.5 ${statusBadgeClass}`}>
                      {statusLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Big Champagne Beige Button [ Join Queue ] */}
        <div className="mt-8 pt-4">
          {state.isOnlineQueueOpen ? (
            <Link
              to="/join"
              className="touch-target w-full py-4 sm:py-5 px-6 rounded-2xl gold-gradient-bg text-maroon-950 font-black text-lg sm:text-xl shadow-xl shadow-maroon-950/80 hover:brightness-105 active:scale-[0.99] transition-all duration-200 flex items-center justify-center space-x-3 group"
            >
              <span>{t('joinQueueNow')}</span>
              <ArrowRight className="w-6 h-6 transform group-hover:translate-x-1.5 transition-transform duration-200 stroke-[2.5]" />
            </Link>
          ) : (
            <button
              disabled
              className="touch-target w-full py-4 px-6 rounded-2xl bg-maroon-900 text-gray-400 font-bold text-base cursor-not-allowed border border-maroon-700 flex items-center justify-center space-x-2"
            >
              <span>{t('closedBadge')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Featured Services Preview Catalog */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-beige-300 font-serif">
            <Scissors className="w-5 h-5 text-beige-300" />
            <h2 className="text-xl font-bold text-beige-50">Our Signature Services</h2>
          </div>
          <Link to="/join" className="text-xs text-beige-300 font-bold hover:underline flex items-center">
            <span>Book Now</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {state.services.filter(s => s.isActive).map(service => (
            <div
              key={service.id}
              className="p-4 rounded-2xl bg-maroon-900/80 border border-maroon-800 hover:border-beige-300/40 transition-all flex items-center justify-between shadow-md"
            >
              <div className="space-y-1 pr-2">
                <div className="font-bold text-sm text-beige-50">
                  {service.name[language] || service.name.en}
                </div>
                <div className="flex items-center space-x-2 text-xs text-beige-200/70">
                  <Clock className="w-3.5 h-3.5 text-beige-300" />
                  <span>{service.durationMinutes} {t('minutes')}</span>
                </div>
              </div>
              <div className="text-base font-extrabold text-beige-200 font-mono">
                ₹{service.price}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role Switcher Toolbar for Lab Evaluation */}
      <div className="p-5 rounded-3xl bg-maroon-900/70 border border-maroon-800/80 text-xs sm:text-sm text-beige-200/70 space-y-3">
        <div className="flex items-center space-x-2 text-beige-300 font-bold">
          <Sparkles className="w-4 h-4 text-beige-300" />
          <span>{t('quickNavigationNotice')}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <Link to="/join" className="p-3 rounded-xl bg-maroon-850 hover:bg-maroon-800 text-beige-100 text-center font-bold border border-maroon-700/80 hover:border-beige-300/40 transition-colors">
            📱 Phone: /join
          </Link>
          <Link to="/reception" className="p-3 rounded-xl bg-maroon-850 hover:bg-maroon-800 text-beige-100 text-center font-bold border border-maroon-700/80 hover:border-beige-300/40 transition-colors">
            📋 Tablet: /reception
          </Link>
          <Link to="/barber/ravi" className="p-3 rounded-xl bg-maroon-850 hover:bg-maroon-800 text-beige-100 text-center font-bold border border-maroon-700/80 hover:border-beige-300/40 transition-colors">
            ✂️ Barber: /barber/:name
          </Link>
          <Link to="/display" className="p-3 rounded-xl bg-maroon-850 hover:bg-maroon-800 text-beige-100 text-center font-bold border border-maroon-700/80 hover:border-beige-300/40 transition-colors">
            📺 TV Display: /display
          </Link>
        </div>
      </div>

    </div>
  );
};
