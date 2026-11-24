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
  Star,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export const Home: React.FC = () => {
  const { state, language, t } = useSalon();

  const waitingCount = state.queue.filter(c => c.status === 'waiting').length;
  const estimatedWait = calculateEstimatedWaitTime(state.queue, null, state.barbers);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      
      {/* Luxury Hero Welcome */}
      <div className="text-center space-y-4 relative">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-charcoal-900/90 border border-gold-500/40 text-gold-400 text-xs font-bold uppercase tracking-widest shadow-lg shadow-gold-500/10">
          <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
          <span>{t('salonTagline')}</span>
        </div>

        <h1 className="text-3xl sm:text-6xl font-black tracking-tight text-white font-serif">
          {t('salonName')}
        </h1>

        <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto leading-relaxed">
          Skip the crowded salon lounge. Reserve your digital spot from anywhere, track your live turn, and step in right as your chair is ready.
        </p>

        {/* Feature Highlights Strip */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-2 text-xs font-semibold text-gray-400">
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-gold-400" />
            <span>Real-time Live Sync</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-gold-400" />
            <span>Zero Physical Queue</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-gold-400" />
            <span>Master Stylists</span>
          </div>
        </div>
      </div>

      {/* Online Queue Closed Warning Banner */}
      {!state.isOnlineQueueOpen && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-950/60 border border-amber-600/70 flex items-start space-x-3.5 text-amber-200 shadow-xl">
          <ShieldAlert className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-bold text-base block">{t('closedBadge')}</span>
            <p className="text-amber-300/80 mt-1 leading-snug">{t('onlineQueueClosedMsg')}</p>
          </div>
        </div>
      )}

      {/* Live Queue Status Main Card */}
      <div className="glass-panel-gold rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-56 h-56 bg-gold-500/15 rounded-full blur-3xl pointer-events-none" />
        
        {/* Card Header */}
        <div className="flex items-center justify-between pb-6 border-b border-charcoal-800/80">
          <div className="flex items-center space-x-3">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-gold-500"></span>
            </span>
            <h2 className="text-lg sm:text-xl font-black text-gray-100 tracking-wide font-serif">
              {t('liveQueueStatus')}
            </h2>
          </div>
          <span className="text-xs text-gold-400 font-bold bg-charcoal-900/90 px-3.5 py-1.5 rounded-full border border-gold-500/30">
            {state.isOnlineQueueOpen ? t('openBadge') : t('closedBadge')}
          </span>
        </div>

        {/* Live Metrics Grid */}
        {waitingCount === 0 ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl gold-gradient-subtle border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-emerald-300 font-serif">
              {t('noOneWaiting')}
            </h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              Our master barbers are available. You will be seated right away upon arrival!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 py-8">
            {/* Customers Waiting */}
            <div className="flex items-center space-x-5 p-5 rounded-2xl bg-charcoal-900/90 border border-charcoal-700/70 shadow-lg hover:border-gold-500/30 transition-all">
              <div className="w-14 h-14 rounded-2xl gold-gradient-bg flex items-center justify-center text-charcoal-950 font-bold shadow-md shadow-gold-500/20">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black text-white font-mono">
                  {waitingCount}
                </div>
                <div className="text-xs sm:text-sm text-gray-400 font-semibold tracking-wide">
                  {t('peopleWaiting')}
                </div>
              </div>
            </div>

            {/* Estimated Wait Time */}
            <div className="flex items-center space-x-5 p-5 rounded-2xl bg-charcoal-900/90 border border-charcoal-700/70 shadow-lg hover:border-gold-500/30 transition-all">
              <div className="w-14 h-14 rounded-2xl gold-gradient-bg flex items-center justify-center text-charcoal-950 font-bold shadow-md shadow-gold-500/20">
                <Clock className="w-7 h-7" />
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black text-gold-400 font-mono">
                  ~{estimatedWait} <span className="text-xl font-sans text-gold-300">{t('minutes')}</span>
                </div>
                <div className="text-xs sm:text-sm text-gray-400 font-semibold tracking-wide">
                  {t('currentWaitHeading')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Master Stylists Roster with SVG Avatars */}
        <div className="pt-6 border-t border-charcoal-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-gold-400">
              {t('barbersOnDuty')}
            </h3>
            <span className="text-xs text-gray-400">
              {state.barbers.filter(b => b.isOnDuty).length} Barbers Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {state.barbers.map((barber) => {
              const isBusy = !!barber.currentCustomerId;
              let statusLabel = t('free');
              let statusBadgeClass = 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60';

              if (!barber.isOnDuty) {
                statusLabel = t('offDuty');
                statusBadgeClass = 'text-gray-400 bg-charcoal-800 border-charcoal-700';
              } else if (barber.isOnBreak) {
                statusLabel = t('onBreak');
                statusBadgeClass = 'text-amber-400 bg-amber-950/60 border-amber-800/60';
              } else if (isBusy) {
                statusLabel = t('busy');
                statusBadgeClass = 'text-rose-400 bg-rose-950/60 border-rose-800/60';
              }

              return (
                <div
                  key={barber.id}
                  className="flex items-center space-x-3.5 p-3.5 rounded-2xl bg-charcoal-900/80 border border-charcoal-800 hover:border-gold-500/40 transition-all shadow-sm"
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
                    <div className="font-bold text-sm text-gray-100 truncate">
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

        {/* Big Glowing Gold Button [ Join Queue ] */}
        <div className="mt-8 pt-4">
          {state.isOnlineQueueOpen ? (
            <Link
              to="/join"
              className="touch-target w-full py-4 sm:py-5 px-6 rounded-2xl gold-gradient-bg text-charcoal-950 font-black text-lg sm:text-xl shadow-xl shadow-gold-500/25 hover:brightness-110 active:scale-[0.99] transition-all duration-200 flex items-center justify-center space-x-3 group"
            >
              <span>{t('joinQueueNow')}</span>
              <ArrowRight className="w-6 h-6 transform group-hover:translate-x-1.5 transition-transform duration-200" />
            </Link>
          ) : (
            <button
              disabled
              className="touch-target w-full py-4 px-6 rounded-2xl bg-charcoal-800 text-gray-500 font-bold text-base cursor-not-allowed border border-charcoal-700 flex items-center justify-center space-x-2"
            >
              <span>{t('closedBadge')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Featured Services Preview Catalog */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-gold-400 font-serif">
            <Scissors className="w-5 h-5" />
            <h2 className="text-xl font-bold text-white">Our Signature Services</h2>
          </div>
          <Link to="/join" className="text-xs text-gold-400 font-semibold hover:underline flex items-center">
            <span>Book Now</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {state.services.filter(s => s.isActive).map(service => (
            <div
              key={service.id}
              className="p-4 rounded-2xl bg-charcoal-900/70 border border-charcoal-800/90 hover:border-gold-500/30 transition-all flex items-center justify-between shadow-sm"
            >
              <div className="space-y-1 pr-2">
                <div className="font-bold text-sm text-gray-100">
                  {service.name[language] || service.name.en}
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <Clock className="w-3.5 h-3.5 text-gold-400" />
                  <span>{service.durationMinutes} {t('minutes')}</span>
                </div>
              </div>
              <div className="text-base font-extrabold text-gold-400 font-mono">
                ₹{service.price}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role Switcher Toolbar for Lab Evaluation */}
      <div className="p-5 rounded-3xl bg-charcoal-900/60 border border-charcoal-800/80 text-xs sm:text-sm text-gray-400 space-y-3">
        <div className="flex items-center space-x-2 text-gold-400 font-bold">
          <Sparkles className="w-4 h-4" />
          <span>{t('quickNavigationNotice')}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <Link to="/join" className="p-3 rounded-xl bg-charcoal-800/80 hover:bg-charcoal-700 text-gray-200 text-center font-bold border border-charcoal-700/60 hover:border-gold-500/40 transition-colors">
            📱 Phone: /join
          </Link>
          <Link to="/reception" className="p-3 rounded-xl bg-charcoal-800/80 hover:bg-charcoal-700 text-gray-200 text-center font-bold border border-charcoal-700/60 hover:border-gold-500/40 transition-colors">
            📋 Tablet: /reception
          </Link>
          <Link to="/barber/ravi" className="p-3 rounded-xl bg-charcoal-800/80 hover:bg-charcoal-700 text-gray-200 text-center font-bold border border-charcoal-700/60 hover:border-gold-500/40 transition-colors">
            ✂️ Barber: /barber/:name
          </Link>
          <Link to="/display" className="p-3 rounded-xl bg-charcoal-800/80 hover:bg-charcoal-700 text-gray-200 text-center font-bold border border-charcoal-700/60 hover:border-gold-500/40 transition-colors">
            📺 TV Display: /display
          </Link>
        </div>
      </div>

    </div>
  );
};
