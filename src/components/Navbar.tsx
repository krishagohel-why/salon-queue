import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSalon } from '../context/SalonContext';
import { Scissors, Globe, Monitor, Users, UserCheck, Shield, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { state, language, toggleLanguage, t } = useSalon();
  const location = useLocation();

  const isTvDisplay = location.pathname === '/display';

  const navLinks = [
    { to: '/', label: t('home'), icon: Scissors },
    { to: '/join', label: t('joinQueue'), icon: Users },
    { to: '/reception', label: t('reception'), icon: UserCheck },
    { to: '/barber/ravi', label: t('barberView'), icon: Scissors },
    { to: '/display', label: t('tvDisplay'), icon: Monitor },
    { to: '/admin', label: t('adminSettings'), icon: Shield },
  ];

  return (
    <header className="sticky top-0 z-40 bg-charcoal-950/90 backdrop-blur-xl border-b border-charcoal-800/80 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Luxury Brand Title */}
          <Link to="/" className="flex items-center space-x-3.5 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl gold-gradient-bg p-0.5 shadow-lg shadow-gold-500/25 group-hover:scale-105 transition-all duration-300">
              <div className="w-full h-full bg-charcoal-950 rounded-[14px] flex items-center justify-center">
                <Scissors className="w-5 h-5 sm:w-6 sm:h-6 text-gold-400 font-bold transform -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg sm:text-2xl font-black tracking-tight gold-gradient-text font-serif">
                  {t('salonName')}
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold-500/10 text-gold-400 border border-gold-500/30">
                  <Sparkles className="w-2.5 h-2.5 mr-1" />
                  PREMIUM
                </span>
              </div>
              <span className="text-xs text-gray-400 font-medium tracking-wide hidden sm:block">
                {t('salonTagline')}
              </span>
            </div>
          </Link>

          {/* Right Controls: Open/Closed Badge & Language Toggle */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            {/* Live Open / Closed Badge */}
            <div className={`flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              state.isOnlineQueueOpen 
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80 shadow-sm shadow-emerald-500/10' 
                : 'bg-amber-950/60 text-amber-300 border-amber-800/80 shadow-sm shadow-amber-500/10'
            }`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${state.isOnlineQueueOpen ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="hidden xs:inline">{state.isOnlineQueueOpen ? t('openBadge') : t('closedBadge')}</span>
              <span className="xs:hidden">{state.isOnlineQueueOpen ? 'OPEN' : 'CLOSED'}</span>
            </div>

            {/* Language Toggle Button (44px target) */}
            <button
              onClick={toggleLanguage}
              className="touch-target inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-gold-400 hover:text-gold-300 border border-charcoal-700/80 hover:border-gold-500/40 font-semibold text-xs sm:text-sm transition-all duration-200 shadow-sm"
              title="Toggle English / Gujarati"
              aria-label="Switch Language"
            >
              <Globe className="w-4 h-4 text-gold-400" />
              <span>{t('switchLanguage')}</span>
            </button>
          </div>
        </div>

        {/* Sub-bar: Screen & Device Navigation Tabs */}
        {!isTvDisplay && (
          <nav className="flex space-x-1.5 overflow-x-auto py-2.5 border-t border-charcoal-800/60 text-xs sm:text-sm scrollbar-none" aria-label="Tabs">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to || 
                (item.to.startsWith('/barber') && location.pathname.startsWith('/barber'));

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`touch-target flex items-center space-x-2 px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'gold-gradient-bg text-charcoal-950 font-bold shadow-md shadow-gold-500/20 scale-[1.02]'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-charcoal-900 border border-transparent hover:border-charcoal-700/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-charcoal-950' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
};
