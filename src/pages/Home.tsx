import React from 'react';
import { Link } from 'react-router-dom';
import { useSalon } from '../context/SalonContext';
import { calculateEstimatedWaitTime } from '../utils/queueRules';
import { Users, Clock, ArrowRight, Sparkles, CheckCircle2, Coffee, AlertCircle, ShieldAlert } from 'lucide-react';

export const Home: React.FC = () => {
  const { state, t } = useSalon();

  const waitingCount = state.queue.filter(c => c.status === 'waiting').length;
  const estimatedWait = calculateEstimatedWaitTime(state.queue, null, state.barbers);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10 space-y-8">
      
      {/* Hero Welcome & Salon Status Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-charcoal-900 border border-gold-500/30 text-gold-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('salonTagline')}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
          {t('salonName')}
        </h1>
        <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto">
          Skip the physical waiting area. Track real-time turns, wait comfortably from anywhere, and arrive right on time.
        </p>
      </div>

      {/* Online Queue Closed Warning Banner if closed */}
      {!state.isOnlineQueueOpen && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-600/50 flex items-start space-x-3 text-amber-200">
          <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-semibold block">{t('closedBadge')}</span>
            <p className="text-amber-300/80 mt-0.5">{t('onlineQueueClosedMsg')}</p>
          </div>
        </div>
      )}

      {/* Live Queue Status Card */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center justify-between pb-6 border-b border-charcoal-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-3 h-3 rounded-full bg-gold-400 animate-pulse" />
            <h2 className="text-lg font-bold text-gray-200 tracking-wide">
              {t('liveQueueStatus')}
            </h2>
          </div>
          <span className="text-xs text-gray-400 bg-charcoal-800 px-3 py-1 rounded-full border border-charcoal-700">
            {state.isOnlineQueueOpen ? t('openBadge') : t('closedBadge')}
          </span>
        </div>

        {waitingCount === 0 ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-xl font-bold text-emerald-300">{t('noOneWaiting')}</h3>
            <p className="text-sm text-gray-400">Chairs are ready and waiting for you.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6">
            {/* Waiting Count */}
            <div className="flex items-center space-x-4 p-4 rounded-2xl bg-charcoal-800/60 border border-charcoal-700/60">
              <div className="w-12 h-12 rounded-xl bg-gold-500/15 flex items-center justify-center text-gold-400">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-3xl font-extrabold text-white">
                  {waitingCount}
                </div>
                <div className="text-xs sm:text-sm text-gray-400 font-medium">
                  {t('peopleWaiting')}
                </div>
              </div>
            </div>

            {/* Estimated Wait */}
            <div className="flex items-center space-x-4 p-4 rounded-2xl bg-charcoal-800/60 border border-charcoal-700/60">
              <div className="w-12 h-12 rounded-xl bg-gold-500/15 flex items-center justify-center text-gold-400">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-3xl font-extrabold text-gold-400">
                  ~{estimatedWait} {t('minutes')}
                </div>
                <div className="text-xs sm:text-sm text-gray-400 font-medium">
                  {t('currentWaitHeading')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Barber Chips with Real-Time Status */}
        <div className="pt-4 border-t border-charcoal-800">
          <h3 className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-3">
            {t('barbersOnDuty')}
          </h3>
          <div className="flex flex-wrap gap-2.5 sm:gap-3">
            {state.barbers.map((barber) => {
              // Status determination
              let statusLabel = t('free');
              let statusClass = 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80';
              let dotClass = 'bg-emerald-400';
              let Icon = CheckCircle2;

              if (!barber.isOnDuty) {
                statusLabel = t('offDuty');
                statusClass = 'bg-charcoal-800 text-gray-400 border-charcoal-700';
                dotClass = 'bg-gray-500';
                Icon = AlertCircle;
              } else if (barber.isOnBreak) {
                statusLabel = t('onBreak');
                statusClass = 'bg-amber-950/60 text-amber-300 border-amber-800/80';
                dotClass = 'bg-amber-400';
                Icon = Coffee;
              } else if (barber.currentCustomerId) {
                statusLabel = t('busy');
                statusClass = 'bg-rose-950/60 text-rose-300 border-rose-800/80';
                dotClass = 'bg-rose-400 animate-pulse';
                Icon = Users;
              }

              return (
                <div
                  key={barber.id}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-medium ${statusClass}`}
                >
                  <img
                    src={barber.avatar}
                    alt={barber.name}
                    className="w-5 h-5 rounded-full object-cover border border-white/20"
                  />
                  <span className="font-semibold text-gray-200">{barber.name}</span>
                  <span className="text-gray-400 font-normal">({statusLabel})</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Big Gold Button [ Join Queue ] */}
        <div className="mt-8">
          {state.isOnlineQueueOpen ? (
            <Link
              to="/join"
              className="touch-target w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-2xl gold-gradient-bg text-charcoal-950 font-bold text-lg shadow-lg hover:shadow-gold-500/25 hover:brightness-105 active:scale-[0.99] transition-all duration-150"
            >
              <span>{t('joinQueueNow')}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <button
              disabled
              className="touch-target w-full flex items-center justify-center space-x-2 px-6 py-4 rounded-2xl bg-charcoal-800 text-gray-500 font-bold text-lg cursor-not-allowed border border-charcoal-700"
            >
              <AlertCircle className="w-5 h-5" />
              <span>{t('closedBadge')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Role Simulator Card for MSc IT Lab Grading & Multi-window testing */}
      <div className="p-5 rounded-2xl bg-charcoal-900/60 border border-charcoal-800 text-xs sm:text-sm text-gray-400 space-y-3">
        <div className="flex items-center space-x-2 text-gold-400 font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>{t('quickNavigationNotice')}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Link to="/join" className="p-2.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-gray-300 text-center font-medium">
            📱 Phone: /join
          </Link>
          <Link to="/reception" className="p-2.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-gray-300 text-center font-medium">
            📋 Tablet: /reception
          </Link>
          <Link to="/barber/ravi" className="p-2.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-gray-300 text-center font-medium">
            ✂️ Barber: /barber/:name
          </Link>
          <Link to="/display" className="p-2.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-gray-300 text-center font-medium">
            📺 TV: /display
          </Link>
        </div>
      </div>

    </div>
  );
};
