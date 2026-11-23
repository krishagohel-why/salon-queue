import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSalon } from '../context/SalonContext';
import { isValidPhoneNumber, calculateEstimatedWaitTime } from '../utils/queueRules';
import { 
  Check, 
  Sparkles, 
  User, 
  Phone, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Coffee,
  ChevronRight
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

    // Calculate dynamic wait time for a new customer joining with this barber preference
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

    // Validate Name
    if (!name.trim()) {
      setErrorMessage(t('nameValidationRequired'));
      return;
    }

    // Validate 10-digit Phone
    if (!isValidPhoneNumber(phone)) {
      setErrorMessage(t('phoneValidationRequired'));
      return;
    }

    // Validate Services (1 - 3)
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
      // Test checklist #2: Same phone joins twice -> shown existing spot, no duplicate
      setDuplicateAlert(t('alreadyInQueueAlert'));
      setTimeout(() => {
        navigate(`/status/${result.customer.id}`);
      }, 1200);
      return;
    }

    // Successfully joined -> navigate to My Status
    navigate(`/status/${result.customer.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      
      {/* Title & Subtitle */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          {t('joinQueueTitle')}
        </h1>
        <p className="text-sm text-gray-400">
          {t('joinQueueSubtitle')}
        </p>
      </div>

      {/* Duplicate alert if re-joining */}
      {duplicateAlert && (
        <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-500/80 text-amber-200 flex items-center space-x-3 animate-pulse">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <span className="text-sm font-semibold">{duplicateAlert}</span>
        </div>
      )}

      {/* Validation Error banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/80 text-rose-200 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span className="text-sm font-semibold">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Step 1: Contact Details */}
        <div className="bg-charcoal-900 border border-charcoal-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-md">
          <div className="flex items-center space-x-2 text-gold-400 font-bold text-sm sm:text-base border-b border-charcoal-800 pb-3">
            <User className="w-4 h-4" />
            <span>{t('step1Title')}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                {t('fullNameLabel')} <span className="text-gold-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('fullNamePlaceholder')}
                  required
                  className="touch-target w-full px-4 py-3 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                {t('phoneLabel')} <span className="text-gold-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder={t('phonePlaceholder')}
                  required
                  className="touch-target w-full px-4 py-3 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-sm tracking-wider"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Service Selection (Multi-select, Max 3) */}
        <div className="bg-charcoal-900 border border-charcoal-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
            <div className="flex items-center space-x-2 text-gold-400 font-bold text-sm sm:text-base">
              <Sparkles className="w-4 h-4" />
              <span>{t('step2Title')}</span>
            </div>
            <span className="text-xs text-gray-400 bg-charcoal-800 px-2.5 py-1 rounded-full border border-charcoal-700">
              {selectedServiceIds.length}/3 selected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeServices.map((service) => {
              const isSelected = selectedServiceIds.includes(service.id);
              const displayName = service.name[language] || service.name.en;

              return (
                <div
                  key={service.id}
                  onClick={() => handleToggleService(service.id)}
                  className={`touch-target cursor-pointer p-4 rounded-2xl border transition-all duration-150 flex items-center justify-between ${
                    isSelected
                      ? 'bg-gold-500/10 border-gold-500 text-white shadow-sm shadow-gold-500/10'
                      : 'bg-charcoal-800/70 border-charcoal-700/70 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <div className="space-y-1 pr-2">
                    <div className="font-semibold text-sm sm:text-base leading-snug">
                      {displayName}
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-gray-400">
                      <span className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1 text-gold-400" />
                        {service.durationMinutes} {t('minutes')}
                      </span>
                      <span className="font-bold text-gold-400">
                        ₹{service.price}
                      </span>
                    </div>
                  </div>

                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 border ${
                    isSelected 
                      ? 'gold-gradient-bg border-gold-400 text-charcoal-950 font-bold' 
                      : 'border-charcoal-600 bg-charcoal-900'
                  }`}>
                    {isSelected && <Check className="w-4 h-4" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 3: Barber Picker */}
        <div className="bg-charcoal-900 border border-charcoal-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-md">
          <div className="flex items-center space-x-2 text-gold-400 font-bold text-sm sm:text-base border-b border-charcoal-800 pb-3">
            <User className="w-4 h-4" />
            <span>{t('step3Title')}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Any Barber (Fastest) Option */}
            <div
              onClick={() => setSelectedBarberId('any')}
              className={`touch-target cursor-pointer p-4 rounded-2xl border transition-all duration-150 flex items-center space-x-3 sm:col-span-2 ${
                selectedBarberId === 'any'
                  ? 'bg-gold-500/15 border-gold-500 text-white'
                  : 'bg-charcoal-800/70 border-charcoal-700/70 text-gray-300 hover:border-gray-600'
              }`}
            >
              <div className="w-10 h-10 rounded-xl gold-gradient-bg flex items-center justify-center text-charcoal-950 font-bold flex-shrink-0">
                ⚡
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm sm:text-base">{t('anyBarber')}</div>
                <div className="text-xs text-gray-400">{t('anyBarberDesc')}</div>
              </div>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                selectedBarberId === 'any' ? 'border-gold-400 bg-gold-400' : 'border-gray-500'
              }`}>
                {selectedBarberId === 'any' && <div className="w-2 h-2 rounded-full bg-charcoal-950" />}
              </div>
            </div>

            {/* Individual Barbers */}
            {state.barbers.filter(b => b.isOnDuty).map((barber) => {
              const isSelected = selectedBarberId === barber.id;

              return (
                <div
                  key={barber.id}
                  onClick={() => setSelectedBarberId(barber.id)}
                  className={`touch-target cursor-pointer p-3.5 rounded-2xl border transition-all duration-150 flex items-center space-x-3 ${
                    isSelected
                      ? 'bg-gold-500/15 border-gold-500 text-white'
                      : 'bg-charcoal-800/70 border-charcoal-700/70 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <img
                    src={barber.avatar}
                    alt={barber.name}
                    className="w-11 h-11 rounded-full object-cover border border-charcoal-600 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{barber.name}</div>
                    {barber.isOnBreak ? (
                      <span className="inline-flex items-center text-xs text-amber-400 font-medium">
                        <Coffee className="w-3 h-3 mr-1" />
                        {t('barberIsOnBreakMsg')}
                      </span>
                    ) : (
                      <span className="text-xs text-emerald-400 font-medium flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
                        {barber.currentCustomerId ? t('busy') : t('free')}
                      </span>
                    )}
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'border-gold-400 bg-gold-400' : 'border-gray-500'
                  }`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-charcoal-950" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 4: Live Summary Footer Card */}
        <div className="bg-charcoal-900 border border-gold-500/40 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl gold-border-glow">
          <div className="text-xs uppercase font-bold tracking-wider text-gold-400">
            {t('liveSummary')}
          </div>

          <div className="grid grid-cols-3 gap-2 text-center py-2 border-y border-charcoal-800">
            <div>
              <div className="text-xs text-gray-400">{t('totalServiceDuration')}</div>
              <div className="text-lg sm:text-xl font-bold text-white mt-1">
                {totalDuration} {t('minutes')}
              </div>
            </div>
            <div className="border-x border-charcoal-800">
              <div className="text-xs text-gray-400">{t('totalPrice')}</div>
              <div className="text-lg sm:text-xl font-bold text-gold-400 mt-1">
                ₹{totalPrice}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">{t('estimatedWaitTime')}</div>
              <div className="text-lg sm:text-xl font-bold text-white mt-1">
                ~{expectedWait} {t('minutes')}
              </div>
            </div>
          </div>

          {/* Confirm Button (Minimum 44px) */}
          <button
            type="submit"
            className="touch-target w-full py-4 px-6 rounded-2xl gold-gradient-bg text-charcoal-950 font-bold text-base sm:text-lg shadow-lg hover:brightness-105 active:scale-[0.99] transition-all duration-150 flex items-center justify-center space-x-2"
          >
            <span>{t('confirmSpotButton')}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

      </form>

    </div>
  );
};
