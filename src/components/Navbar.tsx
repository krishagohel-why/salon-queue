import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSalon } from '../context/SalonContext';
import { Scissors, Globe, Monitor, Users, UserCheck, Shield, Clock } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { state, language, toggleLanguage, t } = useSalon();
  const location = useLocation();

  // If on TV display fullscreen mode, show minimal or hidden header option
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
    <header className="sticky top-0 z-40 bg-charcoal-900/95 backdrop-blur-md border-b border-charcoal-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Salon Name */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl gold-gradient-bg flex items-center justify-center shadow-md shadow-gold-500/20 group-hover:scale-105 transition-transform duration-200">
              <Scissors className="w-5 h-5 sm:w-6 sm:h-6 text-charcoal-950 font-bold" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-bold tracking-tight gold-gradient-text block">
                {t('salonName')}
              </span>
              <span className="text-xs text-gray-400 hidden sm:block">
                {t('salonTagline')}
              </span>
            </div>
          </Link>

          {/* Right Header Controls: Status badge & Language Toggle */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Live Open / Closed Badge */}
            <div className={`hidden sm:flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${
              state.isOnlineQueueOpen 
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80' 
                : 'bg-amber-950/60 text-amber-300 border-amber-800/80'
            }`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${state.isOnlineQueueOpen ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {state.isOnlineQueueOpen ? t('openBadge') : t('closedBadge')}
            </div>

            {/* Language Toggle Button (44px target) */}
            <button
              onClick={toggleLanguage}
              className="touch-target inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-gold-400 hover:text-gold-300 border border-charcoal-700 font-medium text-sm transition-colors shadow-sm"
              title="Toggle English / Gujarati"
              aria-label="Switch Language"
            >
              <Globe className="w-4 h-4 text-gold-400" />
              <span>{t('switchLanguage')}</span>
            </button>
          </div>
        </div>

        {/* Sub-bar: Role & Screen Navigation Bar */}
        {!isTvDisplay && (
          <nav className="flex space-x-1 overflow-x-auto py-2 border-t border-charcoal-800/60 text-xs sm:text-sm scrollbar-none" aria-label="Tabs">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to || 
                (item.to.startsWith('/barber') && location.pathname.startsWith('/barber'));

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`touch-target flex items-center space-x-1.5 px-3 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-150 ${
                    isActive
                      ? 'bg-gold-500/15 text-gold-400 border border-gold-500/40 shadow-sm'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-charcoal-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-gold-400' : 'text-gray-400'}`} />
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
