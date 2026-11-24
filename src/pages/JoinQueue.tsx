import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSalon } from '../context/SalonContext';
import { isValidPhoneNumber, calculateEstimatedWaitTime } from '../utils/queueRules';
import { BarberAvatar } from '../components/BarberAvatar';
import { 
  Check, 
  Sparkles, 
  User, 
  Phone, 
  Clock, 
  AlertCircle, 
  Zap, 
  ChevronRight,
  Coffee
} from 'lucide-react';

export const JoinQueue: React.FC = () => {
  const { state, joinQueue, language, t } = useSalon();
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(['haircut']);
  const [selectedBarberId, setSelectedBarberId] = useState<string>('any');

  // Error feedback states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [duplicateAlert, setDuplicateAlert] = useState<string | null>(null);

  // Filter active services only
  const activeServices = useMemo(() => {
    return state.services.filter(s => s.isActive);
  }, [state.services]);

  // Compute live totals
  const { totalDuration, totalPrice, expectedWait } = useMemo(() => {
    const selected = activeServices.filter(s => selectedServiceIds.includes(s.id));
    const duration = selected.reduce((sum, s) => sum + s.durationMinutes, 0);
    const price = selected.reduce((sum, s) => sum + s.price, 0);

    const wait = calculateEstimatedWaitTime(
      state.queue,
      null,
      state.barbers
    );

    return {
      totalDuration: duration,
      totalPrice: price,
      expectedWait: wait,
    };
  }, [activeServices, selectedServiceIds, state.queue, state.barbers]);

  // Handle service multi-select (Max 3 rule)
  const handleToggleService = (serviceId: string) => {
    setErrorMessage(null);
    if (selectedServiceIds.includes(serviceId)) {
      if (selectedServiceIds.length === 1) {
        setErrorMessage(t('serviceValidationRequired'));
        return;
      }
      setSelectedServiceIds(selectedServiceIds.filter(id => id !== serviceId));
    } else {
      if (selectedServiceIds.length >= 3) {
        setErrorMessage(t('maxServicesNotice'));
        return;
      }
      setSelectedServiceIds([...selectedServiceIds, serviceId]);
    }
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setDuplicateAlert(null);

    if (!name.trim()) {
      setErrorMessage(t('nameValidationRequired'));
      return;
    }

    if (!isValidPhoneNumber(phone)) {
      setErrorMessage(t('phoneValidationRequired'));
      return;
    }

    if (selectedServiceIds.length === 0) {
      setErrorMessage(t('serviceValidationRequired'));
      return;
    }

    const result = joinQueue({
      name,
      phone,
      serviceIds: selectedServiceIds,
      barberPreference: selectedBarberId,
    });

    if (result.isExisting) {
      setDuplicateAlert(t('alreadyInQueueAlert'));
      setTimeout(() => {
        navigate(`/status/${result.customer.id}`);
      }, 1200);
      return;
    }

    navigate(`/status/${result.customer.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10 space-y-8">
      
      {/* Title & Subtitle */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-beige-300">
          Fast Digital Check-in
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-beige-50 font-serif">
          {t('joinQueueTitle')}
        </h1>
        <p className="text-sm text-beige-200/75 max-w-md mx-auto">
          {t('joinQueueSubtitle')}
        </p>
      </div>

      {/* Duplicate alert if re-joining */}
      {duplicateAlert && (
        <div className="p-4 rounded-2xl bg-maroon-900/90 border border-amber-500 text-amber-200 flex items-center space-x-3 animate-pulse shadow-lg">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <span className="text-sm font-semibold">{duplicateAlert}</span>
        </div>
      )}

      {/* Validation Error banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-maroon-900/90 border border-rose-500 text-rose-200 flex items-center space-x-3 shadow-lg">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span className="text-sm font-semibold">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Step 1: Customer Details */}
        <div className="glass-panel rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center space-x-2.5 text-beige-300 font-bold text-sm sm:text-base border-b border-maroon-800 pb-3">
            <User className="w-4 h-4" />
            <span>{t('step1Title')}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-beige-200/90 uppercase tracking-wider mb-2">
                {t('fullNameLabel')} <span className="text-beige-300">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('fullNamePlaceholder')}
                required
                className="touch-target w-full px-4 py-3.5 rounded-2xl bg-maroon-950 border border-maroon-750 text-beige-50 placeholder-gray-500 focus:outline-none focus:border-beige-300 focus:ring-1 focus:ring-beige-300 text-sm font-medium transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-beige-200/90 uppercase tracking-wider mb-2">
                {t('phoneLabel')} <span className="text-beige-300">*</span>
              </label>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder={t('phonePlaceholder')}
                required
                className="touch-target w-full px-4 py-3.5 rounded-2xl bg-maroon-950 border border-maroon-750 text-beige-50 placeholder-gray-500 focus:outline-none focus:border-beige-300 focus:ring-1 focus:ring-beige-300 text-sm font-mono tracking-wider transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Service Selection (Multi-select, Max 3) */}
        <div className="glass-panel rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-maroon-800 pb-3">
            <div className="flex items-center space-x-2.5 text-beige-300 font-bold text-sm sm:text-base">
              <Sparkles className="w-4 h-4" />
              <span>{t('step2Title')}</span>
            </div>
            <span className="text-xs font-bold text-beige-300 bg-maroon-850 px-3 py-1 rounded-full border border-beige-300/40">
              {selectedServiceIds.length}/3 selected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {activeServices.map((service) => {
              const isSelected = selectedServiceIds.includes(service.id);
              const displayName = service.name[language] || service.name.en;

              return (
                <div
                  key={service.id}
                  onClick={() => handleToggleService(service.id)}
                  className={`touch-target cursor-pointer p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between group ${
                    isSelected
                      ? 'bg-beige-300/15 border-beige-300 text-white shadow-lg shadow-maroon-950/80 scale-[1.01]'
                      : 'bg-maroon-900/90 border-maroon-750 text-beige-100 hover:border-maroon-650'
                  }`}
                >
                  <div className="space-y-1.5 pr-2">
                    <div className="font-bold text-sm sm:text-base leading-snug">
                      {displayName}
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-beige-200/70">
                      <span className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1 text-beige-300" />
                        {service.durationMinutes} {t('minutes')}
                      </span>
                      <span className="font-extrabold text-beige-200 font-mono text-sm">
                        ₹{service.price}
                      </span>
                    </div>
                  </div>

                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 border transition-colors ${
                    isSelected 
                      ? 'gold-gradient-bg border-beige-200 text-maroon-950 font-bold shadow' 
                      : 'border-maroon-700 bg-maroon-950 text-transparent'
                  }`}>
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 3: Barber Picker with Real Vector Avatars */}
        <div className="glass-panel rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center space-x-2.5 text-beige-300 font-bold text-sm sm:text-base border-b border-maroon-800 pb-3">
            <User className="w-4 h-4" />
            <span>{t('step3Title')}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Any Barber (Fastest) */}
            <div
              onClick={() => setSelectedBarberId('any')}
              className={`touch-target cursor-pointer p-4 rounded-2xl border transition-all duration-200 flex items-center space-x-3.5 sm:col-span-2 ${
                selectedBarberId === 'any'
                  ? 'bg-beige-300/15 border-beige-300 text-white shadow-lg shadow-maroon-950/80'
                  : 'bg-maroon-900/90 border-maroon-750 text-beige-100 hover:border-maroon-650'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl gold-gradient-bg flex items-center justify-center text-maroon-950 font-bold shadow-md shadow-maroon-950 flex-shrink-0">
                <Zap className="w-6 h-6 fill-current" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm sm:text-base text-white">{t('anyBarber')}</div>
                <div className="text-xs text-beige-200/70">{t('anyBarberDesc')}</div>
              </div>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                selectedBarberId === 'any' ? 'border-beige-300 bg-beige-300' : 'border-gray-500'
              }`}>
                {selectedBarberId === 'any' && <div className="w-2 h-2 rounded-full bg-maroon-950" />}
              </div>
            </div>

            {/* Individual Barbers */}
            {state.barbers.filter(b => b.isOnDuty).map((barber) => {
              const isSelected = selectedBarberId === barber.id;
              const isBusy = !!barber.currentCustomerId;

              return (
                <div
                  key={barber.id}
                  onClick={() => setSelectedBarberId(barber.id)}
                  className={`touch-target cursor-pointer p-3.5 rounded-2xl border transition-all duration-200 flex items-center space-x-3.5 ${
                    isSelected
                      ? 'bg-beige-300/15 border-beige-300 text-white shadow-md shadow-maroon-950/80'
                      : 'bg-maroon-900/90 border-maroon-750 text-beige-100 hover:border-maroon-650'
                  }`}
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
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate text-beige-50">{barber.name}</div>
                    {barber.isOnBreak ? (
                      <span className="inline-flex items-center text-xs text-amber-300 font-medium">
                        <Coffee className="w-3 h-3 mr-1" />
                        {t('barberIsOnBreakMsg')}
                      </span>
                    ) : (
                      <span className="text-xs text-emerald-300 font-semibold flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
                        {isBusy ? t('busy') : t('free')}
                      </span>
                    )}
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'border-beige-300 bg-beige-300' : 'border-gray-500'
                  }`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-maroon-950" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 4: Summary Card */}
        <div className="glass-panel-beige rounded-3xl p-6 space-y-5 shadow-2xl">
          <div className="text-xs uppercase font-extrabold tracking-widest text-beige-300">
            {t('liveSummary')}
          </div>

          <div className="grid grid-cols-3 gap-2 text-center py-3 border-y border-maroon-800/80">
            <div>
              <div className="text-xs text-beige-200/70 font-medium">{t('totalServiceDuration')}</div>
              <div className="text-lg sm:text-2xl font-black text-beige-50 mt-1 font-mono">
                {totalDuration} <span className="text-xs font-sans text-beige-200/70">{t('minutes')}</span>
              </div>
            </div>
            <div className="border-x border-maroon-800/80">
              <div className="text-xs text-beige-200/70 font-medium">{t('totalPrice')}</div>
              <div className="text-lg sm:text-2xl font-black text-beige-200 mt-1 font-mono">
                ₹{totalPrice}
              </div>
            </div>
            <div>
              <div className="text-xs text-beige-200/70 font-medium">{t('estimatedWaitTime')}</div>
              <div className="text-lg sm:text-2xl font-black text-beige-50 mt-1 font-mono">
                ~{expectedWait} <span className="text-xs font-sans text-beige-200/70">{t('minutes')}</span>
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            type="submit"
            className="touch-target w-full py-4 sm:py-5 px-6 rounded-2xl gold-gradient-bg text-maroon-950 font-black text-base sm:text-lg shadow-xl shadow-maroon-950/80 hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center space-x-2"
          >
            <span>{t('confirmSpotButton')}</span>
            <ChevronRight className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

      </form>

    </div>
  );
};
