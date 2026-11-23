import React, { useState } from 'react';
import { useSalon } from '../context/SalonContext';
import { 
  Plus, 
  Users, 
  UserCheck, 
  Clock, 
  AlertTriangle, 
  Scissors, 
  Coffee, 
  Play, 
  CheckCircle2, 
  X, 
  Sparkles,
  Phone
} from 'lucide-react';
import { isValidPhoneNumber } from '../utils/queueRules';

export const Reception: React.FC = () => {
  const { 
    state, 
    callNext, 
    addWalkIn, 
    markNoShow, 
    cancelCustomer, 
    toggleBarberBreak,
    language, 
    t 
  } = useSalon();

  // Walk-in modal state
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInServiceIds, setWalkInServiceIds] = useState<string[]>(['haircut']);
  const [walkInBarberId, setWalkInBarberId] = useState<string>('any');
  const [walkInError, setWalkInError] = useState<string | null>(null);

  // Filter waiting list in chronological queue order
  const waitingCustomers = state.queue.filter(c => c.status === 'waiting');

  const handleAddWalkInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWalkInError(null);

    if (!walkInName.trim()) {
      setWalkInError(t('nameValidationRequired'));
      return;
    }
    if (!isValidPhoneNumber(walkInPhone)) {
      setWalkInError(t('phoneValidationRequired'));
      return;
    }
    if (walkInServiceIds.length === 0) {
      setWalkInError(t('serviceValidationRequired'));
      return;
    }

    addWalkIn({
      name: walkInName,
      phone: walkInPhone,
      serviceIds: walkInServiceIds,
      barberPreference: walkInBarberId,
    });

    // Reset and close
    setWalkInName('');
    setWalkInPhone('');
    setWalkInServiceIds(['haircut']);
    setWalkInBarberId('any');
    setShowWalkInModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Bar: Title & Add Walk-In Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-charcoal-800">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-charcoal-800 border border-charcoal-700 text-xs text-gold-400 font-semibold mb-1">
            <UserCheck className="w-3.5 h-3.5" />
            <span>{t('tabletViewBadge')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t('receptionTitle')}
          </h1>
        </div>

        <button
          onClick={() => setShowWalkInModal(true)}
          className="touch-target inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl gold-gradient-bg text-charcoal-950 font-bold text-sm shadow-md hover:brightness-105 active:scale-[0.99] transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>{t('addWalkInButton')}</span>
        </button>
      </div>

      {/* Grid Layout: Left Column = Barber Cards; Right Column = Waiting List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Barber Stations (5 cols on desktop/tablet) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">
              {t('barberStationsHeading')}
            </h2>
            <span className="text-xs text-gold-400 font-semibold">
              {state.barbers.filter(b => b.isOnDuty).length} active
            </span>
          </div>

          <div className="space-y-4">
            {state.barbers.map((barber) => {
              // Current serving client if any
              const currentCustomer = barber.currentCustomerId
                ? state.queue.find(c => c.id === barber.currentCustomerId)
                : null;

              // Elapsed minutes since service start
              const elapsedMinutes = barber.serviceStartTime 
                ? Math.floor((Date.now() - barber.serviceStartTime) / (1000 * 60))
                : 0;

              return (
                <div
                  key={barber.id}
                  className={`p-5 rounded-3xl border transition-all ${
                    barber.isOnBreak
                      ? 'bg-charcoal-900/80 border-amber-900/50'
                      : barber.currentCustomerId
                      ? 'bg-charcoal-900 border-charcoal-700 shadow-md'
                      : 'bg-charcoal-900 border-emerald-800/40'
                  }`}
                >
                  {/* Barber Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={barber.avatar}
                        alt={barber.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-charcoal-700"
                      />
                      <div>
                        <h3 className="font-bold text-base text-white">{barber.name}</h3>
                        <div className="flex items-center space-x-2 text-xs">
                          {barber.isOnBreak ? (
                            <span className="text-amber-400 font-semibold flex items-center">
                              <Coffee className="w-3 h-3 mr-1" />
                              {t('onBreak')}
                            </span>
                          ) : barber.currentCustomerId ? (
                            <span className="text-rose-400 font-semibold flex items-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-1.5 animate-pulse" />
                              {t('busy')}
                            </span>
                          ) : (
                            <span className="text-emerald-400 font-semibold flex items-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
                              {t('free')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Toggle Break Button */}
                    <button
                      onClick={() => toggleBarberBreak(barber.id)}
                      className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-colors ${
                        barber.isOnBreak
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
                          : 'bg-charcoal-800 text-gray-400 border-charcoal-700 hover:text-white'
                      }`}
                    >
                      {barber.isOnBreak ? t('stationAvailable') : t('stationOnBreak')}
                    </button>
                  </div>

                  {/* Customer in Chair Details */}
                  {currentCustomer ? (
                    <div className="p-3.5 rounded-2xl bg-charcoal-800/70 border border-charcoal-700/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gold-400 font-bold">
                          {t('customerInChair')}: {currentCustomer.token}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {elapsedMinutes}m {t('elapsedTime')}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-white">
                        {currentCustomer.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {currentCustomer.serviceIds.map(id => {
                          const s = state.services.find(srv => srv.id === id);
                          return s ? (s.name[language] || s.name.en) : id;
                        }).join(', ')}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-charcoal-800/40 border border-charcoal-800 text-xs text-gray-400 text-center">
                      {t('emptyStation')}
                    </div>
                  )}

                  {/* Call Next Button for this Barber */}
                  <div className="mt-4">
                    <button
                      onClick={() => callNext(barber.id)}
                      disabled={barber.isOnBreak}
                      className={`touch-target w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all ${
                        barber.isOnBreak
                          ? 'bg-charcoal-800 text-gray-600 cursor-not-allowed border border-charcoal-700'
                          : 'gold-gradient-bg text-charcoal-950 hover:brightness-105 active:scale-[0.99] shadow'
                      }`}
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>{t('callNextCustomer')} ({barber.name.split(' ')[0]})</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Ordered Waiting Queue (7 cols on desktop/tablet) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">
              {t('waitingQueueHeading')}
            </h2>
            <span className="text-xs text-gold-400 font-semibold">
              {waitingCustomers.length} {t('peopleWaiting')}
            </span>
          </div>

          {waitingCustomers.length === 0 ? (
            <div className="bg-charcoal-900 border border-charcoal-800 rounded-3xl p-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">{t('queueEmptyMsg')}</h3>
              <p className="text-xs text-gray-400">{t('noOneWaiting')}</p>
            </div>
          ) : (
            <div className="bg-charcoal-900 border border-charcoal-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-charcoal-800/80 border-b border-charcoal-700 text-gray-400 font-semibold uppercase text-[11px] tracking-wider">
                      <th className="py-3 px-4">{t('tokenCol')}</th>
                      <th className="py-3 px-4">{t('nameCol')}</th>
                      <th className="py-3 px-4">{t('servicesCol')}</th>
                      <th className="py-3 px-4">{t('barberCol')}</th>
                      <th className="py-3 px-4">{t('waitCol')}</th>
                      <th className="py-3 px-4 text-right">{t('actionsCol')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal-800">
                    {waitingCustomers.map((cust) => {
                      const waitMinutes = Math.floor((Date.now() - cust.createdAt) / (1000 * 60));
                      const isLongWait = waitMinutes >= 60; // Highlight > 60 mins in amber!

                      const preferredBarber = cust.barberPreference === 'any'
                        ? t('anyBarber')
                        : state.barbers.find(b => b.id === cust.barberPreference)?.name || cust.barberPreference;

                      return (
                        <tr
                          key={cust.id}
                          className={`transition-colors hover:bg-charcoal-800/50 ${
                            isLongWait ? 'bg-amber-950/30' : ''
                          }`}
                        >
                          {/* Token */}
                          <td className="py-3.5 px-4">
                            <span className="font-extrabold text-gold-400 bg-charcoal-800 px-2.5 py-1 rounded-lg border border-charcoal-700">
                              {cust.token}
                            </span>
                          </td>

                          {/* Customer Name & Phone */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">{cust.name}</div>
                            <div className="text-[11px] text-gray-400 flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {cust.phone}
                              {cust.isWalkIn && (
                                <span className="ml-1.5 px-1.5 py-0.5 rounded bg-charcoal-700 text-[10px] text-gold-300">
                                  Walk-in
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Services */}
                          <td className="py-3.5 px-4 text-gray-300">
                            <div className="max-w-[140px] truncate" title={cust.serviceIds.join(', ')}>
                              {cust.serviceIds.map(id => {
                                const s = state.services.find(srv => srv.id === id);
                                return s ? (s.name[language] || s.name.en) : id;
                              }).join(', ')}
                            </div>
                            <div className="text-[11px] text-gold-400/80">
                              {cust.totalDuration}m · ₹{cust.totalPrice}
                            </div>
                          </td>

                          {/* Barber Preference */}
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${
                              cust.barberPreference === 'any'
                                ? 'bg-charcoal-800 text-gray-300 border-charcoal-700'
                                : 'bg-gold-500/10 text-gold-300 border-gold-500/30'
                            }`}>
                              {preferredBarber}
                            </span>
                          </td>

                          {/* Waiting Time (Amber if > 60 min) */}
                          <td className="py-3.5 px-4">
                            <div className={`font-semibold flex items-center ${
                              isLongWait ? 'text-amber-400' : 'text-gray-300'
                            }`}>
                              <Clock className="w-3.5 h-3.5 mr-1" />
                              <span>{waitMinutes} min</span>
                            </div>
                            {isLongWait && (
                              <div className="text-[10px] text-amber-400/90 font-medium">
                                &gt;60m alert
                              </div>
                            )}
                          </td>

                          {/* Actions: No-show, Cancel */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              {/* Mark No-Show */}
                              <button
                                onClick={() => markNoShow(cust.id)}
                                title={t('noShowAction')}
                                className="touch-target px-2.5 py-1.5 rounded-lg bg-charcoal-800 hover:bg-amber-950/50 text-amber-400 hover:text-amber-300 border border-charcoal-700 text-xs font-semibold"
                              >
                                {t('noShowAction')}
                              </button>

                              {/* Cancel */}
                              <button
                                onClick={() => cancelCustomer(cust.id)}
                                title={t('cancelAction')}
                                className="touch-target px-2 py-1.5 rounded-lg bg-charcoal-800 hover:bg-rose-950/50 text-rose-400 hover:text-rose-300 border border-charcoal-700 text-xs font-semibold"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Add Walk-in Modal Form */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-charcoal-900 border border-charcoal-700 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">{t('walkInModalTitle')}</h3>
                <p className="text-xs text-gray-400">{t('walkInModalDesc')}</p>
              </div>
              <button
                onClick={() => setShowWalkInModal(false)}
                className="w-8 h-8 rounded-full bg-charcoal-800 flex items-center justify-center text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {walkInError && (
              <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500 text-rose-300 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{walkInError}</span>
              </div>
            )}

            <form onSubmit={handleAddWalkInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  {t('fullNameLabel')}
                </label>
                <input
                  type="text"
                  value={walkInName}
                  onChange={e => setWalkInName(e.target.value)}
                  placeholder="e.g. Samir Dave"
                  required
                  className="touch-target w-full px-3 py-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white text-sm focus:border-gold-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  {t('phoneLabel')}
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={walkInPhone}
                  onChange={e => setWalkInPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 9898012345"
                  required
                  className="touch-target w-full px-3 py-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white text-sm focus:border-gold-500 focus:outline-none"
                />
              </div>

              {/* Service Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  {t('step2Title')}
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                  {state.services.filter(s => s.isActive).map(service => {
                    const isSelected = walkInServiceIds.includes(service.id);
                    return (
                      <div
                        key={service.id}
                        onClick={() => {
                          if (isSelected) {
                            if (walkInServiceIds.length > 1) {
                              setWalkInServiceIds(walkInServiceIds.filter(id => id !== service.id));
                            }
                          } else {
                            if (walkInServiceIds.length < 3) {
                              setWalkInServiceIds([...walkInServiceIds, service.id]);
                            }
                          }
                        }}
                        className={`cursor-pointer p-2 rounded-xl border text-xs flex items-center justify-between ${
                          isSelected
                            ? 'bg-gold-500/20 border-gold-500 text-white'
                            : 'bg-charcoal-800 border-charcoal-700 text-gray-300'
                        }`}
                      >
                        <span className="truncate">{service.name[language] || service.name.en}</span>
                        <span className="text-gold-400 font-bold ml-1">₹{service.price}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Barber Preference */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  {t('step3Title')}
                </label>
                <select
                  value={walkInBarberId}
                  onChange={e => setWalkInBarberId(e.target.value)}
                  className="touch-target w-full px-3 py-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white text-sm focus:border-gold-500 focus:outline-none"
                >
                  <option value="any">{t('anyBarber')}</option>
                  {state.barbers.filter(b => b.isOnDuty).map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} {b.isOnBreak ? `(${t('onBreak')})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="touch-target px-4 py-2.5 rounded-xl bg-charcoal-800 text-gray-300 text-sm font-semibold hover:bg-charcoal-700"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="touch-target px-5 py-2.5 rounded-xl gold-gradient-bg text-charcoal-950 text-sm font-bold shadow hover:brightness-105"
                >
                  {t('submitWalkIn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
