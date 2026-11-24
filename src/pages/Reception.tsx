import React, { useState } from 'react';
import { useSalon } from '../context/SalonContext';
import { BarberAvatar } from '../components/BarberAvatar';
import { isValidPhoneNumber } from '../utils/queueRules';
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
  Phone
} from 'lucide-react';

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

    setWalkInName('');
    setWalkInPhone('');
    setWalkInServiceIds(['haircut']);
    setWalkInBarberId('any');
    setShowWalkInModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Bar: Title & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-maroon-800">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-maroon-900 border border-beige-300/30 text-xs text-beige-300 font-bold mb-1.5 shadow-sm">
            <UserCheck className="w-3.5 h-3.5" />
            <span>{t('tabletViewBadge')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-beige-50 font-serif">
            {t('receptionTitle')}
          </h1>
        </div>

        <button
          onClick={() => setShowWalkInModal(true)}
          className="touch-target inline-flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-2xl gold-gradient-bg text-maroon-950 font-black text-sm shadow-lg shadow-maroon-950/80 hover:brightness-105 active:scale-[0.99] transition-all"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          <span>{t('addWalkInButton')}</span>
        </button>
      </div>

      {/* 3-COLUMN BARBER STATIONS ROW (Handout requirement) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-widest text-beige-300 flex items-center">
            <Scissors className="w-3.5 h-3.5 mr-1.5" />
            {t('barberStationsHeading')}
          </h2>
          <span className="text-xs text-beige-200/70 font-semibold">
            {state.barbers.filter(b => b.isOnDuty && !b.isOnBreak).length} Stations Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {state.barbers.map((barber) => {
            const currentCustomer = barber.currentCustomerId
              ? state.queue.find(c => c.id === barber.currentCustomerId)
              : null;

            const isBusy = !!currentCustomer;
            const elapsedMinutes = barber.serviceStartTime 
              ? Math.floor((Date.now() - barber.serviceStartTime) / (1000 * 60))
              : 0;

            const totalDuration = currentCustomer?.totalDuration || 30;
            const progressPercent = Math.min(100, Math.round((elapsedMinutes / totalDuration) * 100));

            return (
              <div
                key={barber.id}
                className={`glass-panel rounded-3xl p-5 border-2 transition-all flex flex-col justify-between shadow-xl ${
                  barber.isOnBreak
                    ? 'border-amber-900/60 bg-maroon-950/70'
                    : isBusy
                    ? 'border-maroon-700 bg-maroon-900/90'
                    : 'border-maroon-750 bg-maroon-900/80'
                }`}
              >
                <div>
                  {/* Barber Header */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-maroon-800/80">
                    <div className="flex items-center space-x-3.5">
                      <BarberAvatar
                        barberId={barber.id}
                        name={barber.name}
                        size="md"
                        showStatus
                        isOnDuty={barber.isOnDuty}
                        isOnBreak={barber.isOnBreak}
                        isBusy={isBusy}
                      />
                      <div>
                        <h3 className="font-bold text-base text-beige-50">{barber.name}</h3>
                        <div className="flex items-center space-x-2 text-xs">
                          {barber.isOnBreak ? (
                            <span className="text-amber-300 font-semibold flex items-center">
                              <Coffee className="w-3 h-3 mr-1" />
                              {t('onBreak')}
                            </span>
                          ) : isBusy ? (
                            <span className="text-rose-300 font-semibold flex items-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-1.5 animate-pulse" />
                              {t('busy')}
                            </span>
                          ) : (
                            <span className="text-emerald-300 font-semibold flex items-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
                              {t('free')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Toggle Break */}
                    <button
                      onClick={() => toggleBarberBreak(barber.id)}
                      className={`text-xs px-3 py-1.5 rounded-xl border font-bold transition-colors ${
                        barber.isOnBreak
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
                          : 'bg-maroon-850 text-beige-200 border-maroon-700 hover:text-white'
                      }`}
                    >
                      {barber.isOnBreak ? t('stationAvailable') : t('stationOnBreak')}
                    </button>
                  </div>

                  {/* Customer in Chair Card */}
                  {currentCustomer ? (
                    <div className="p-4 rounded-2xl bg-maroon-950/80 border border-maroon-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black px-2 py-0.5 rounded-md bg-beige-300/20 text-beige-200 border border-beige-300/30">
                          {currentCustomer.token}
                        </span>
                        <span className="text-xs font-semibold text-beige-200/70 flex items-center">
                          <Clock className="w-3 h-3 mr-1 text-beige-300" />
                          {elapsedMinutes}m / {totalDuration}m
                        </span>
                      </div>

                      <div>
                        <div className="text-sm font-bold text-white">
                          {currentCustomer.name}
                        </div>
                        <div className="text-xs text-beige-200/70 truncate mt-0.5">
                          {currentCustomer.serviceIds.map(id => {
                            const s = state.services.find(srv => srv.id === id);
                            return s ? (s.name[language] || s.name.en) : id;
                          }).join(', ')}
                        </div>
                      </div>

                      {/* Progress Bar (Handout requirement) */}
                      <div className="space-y-1">
                        <div className="w-full h-2 rounded-full bg-maroon-900 overflow-hidden border border-maroon-800">
                          <div
                            className="h-full gold-gradient-bg transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-beige-200/70 font-mono">
                          <span>{elapsedMinutes}m elapsed</span>
                          <span>{progressPercent}%</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-maroon-950/40 border border-maroon-800/60 text-xs text-beige-200/60 text-center flex flex-col items-center justify-center space-y-1.5 min-h-[120px]">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400/80" />
                      <span className="font-semibold text-beige-100">{t('emptyStation')}</span>
                      <span className="text-[11px] text-beige-200/50">Ready to take next customer</span>
                    </div>
                  )}
                </div>

                {/* Call Next Button for Barber */}
                <div className="mt-4 pt-3 border-t border-maroon-800/60">
                  <button
                    onClick={() => callNext(barber.id)}
                    disabled={barber.isOnBreak}
                    className={`touch-target w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all ${
                      barber.isOnBreak
                        ? 'bg-maroon-900 text-gray-500 cursor-not-allowed border border-maroon-800'
                        : 'gold-gradient-bg text-maroon-950 hover:brightness-105 active:scale-[0.99] shadow-md shadow-maroon-950/80'
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

      {/* WAITING QUEUE LIST */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-widest text-beige-300 flex items-center">
            <Users className="w-3.5 h-3.5 mr-1.5" />
            {t('waitingQueueHeading')}
          </h2>
          <span className="text-xs font-bold text-beige-300 bg-maroon-850 px-3 py-1 rounded-full border border-beige-300/30">
            {waitingCustomers.length} {t('peopleWaiting')}
          </span>
        </div>

        {waitingCustomers.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center space-y-3 shadow-xl">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-xl font-bold text-beige-50">{t('queueEmptyMsg')}</h3>
            <p className="text-xs text-beige-200/70 max-w-xs mx-auto">{t('noOneWaiting')}</p>
          </div>
        ) : (
          <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-maroon-900/90 border-b border-maroon-750 text-beige-300 font-bold uppercase text-[11px] tracking-wider">
                    <th className="py-4 px-5">{t('tokenCol')}</th>
                    <th className="py-4 px-5">{t('nameCol')}</th>
                    <th className="py-4 px-5">{t('servicesCol')}</th>
                    <th className="py-4 px-5">{t('barberCol')}</th>
                    <th className="py-4 px-5">{t('waitCol')}</th>
                    <th className="py-4 px-5 text-right">{t('actionsCol')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-maroon-800">
                  {waitingCustomers.map((cust) => {
                    const waitMinutes = Math.floor((Date.now() - cust.createdAt) / (1000 * 60));
                    const isLongWait = waitMinutes >= 60;

                    const preferredBarber = cust.barberPreference === 'any'
                      ? t('anyBarber')
                      : state.barbers.find(b => b.id === cust.barberPreference)?.name || cust.barberPreference;

                    return (
                      <tr
                        key={cust.id}
                        className={`transition-colors hover:bg-maroon-900/60 ${
                          isLongWait ? 'bg-amber-950/40 border-l-4 border-l-amber-500' : ''
                        }`}
                      >
                        {/* Token */}
                        <td className="py-4 px-5">
                          <span className="font-black text-beige-200 bg-maroon-950 px-3 py-1.5 rounded-xl border border-beige-300/30 font-mono text-sm">
                            {cust.token}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="py-4 px-5">
                          <div className="font-bold text-white text-sm sm:text-base">{cust.name}</div>
                          <div className="text-xs text-beige-200/70 flex items-center mt-0.5 font-mono">
                            <Phone className="w-3 h-3 mr-1 text-beige-300" />
                            {cust.phone}
                            {cust.isWalkIn && (
                              <span className="ml-2 px-2 py-0.5 rounded-md bg-maroon-850 text-[10px] text-beige-200 font-semibold border border-beige-300/20 font-sans">
                                Walk-in
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Services */}
                        <td className="py-4 px-5 text-beige-100">
                          <div className="max-w-[180px] font-medium truncate" title={cust.serviceIds.join(', ')}>
                            {cust.serviceIds.map(id => {
                              const s = state.services.find(srv => srv.id === id);
                              return s ? (s.name[language] || s.name.en) : id;
                            }).join(', ')}
                          </div>
                          <div className="text-xs text-beige-300 font-mono mt-0.5">
                            {cust.totalDuration}m · ₹{cust.totalPrice}
                          </div>
                        </td>

                        {/* Barber Preference */}
                        <td className="py-4 px-5">
                          <span className={`px-2.5 py-1 rounded-xl text-xs font-semibold border ${
                            cust.barberPreference === 'any'
                              ? 'bg-maroon-950 text-beige-100 border-maroon-750'
                              : 'bg-maroon-850 text-beige-200 border-beige-300/30'
                          }`}>
                            {preferredBarber}
                          </span>
                        </td>

                        {/* Wait Time */}
                        <td className="py-4 px-5">
                          <div className={`font-bold flex items-center ${
                            isLongWait ? 'text-amber-300' : 'text-beige-200'
                          }`}>
                            <Clock className="w-3.5 h-3.5 mr-1.5" />
                            <span>{waitMinutes} min</span>
                          </div>
                          {isLongWait && (
                            <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider mt-0.5">
                              ⚠️ &gt;60m Alert
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => markNoShow(cust.id)}
                              title={t('noShowAction')}
                              className="touch-target px-3 py-1.5 rounded-xl bg-maroon-950 hover:bg-amber-950/60 text-amber-300 hover:text-amber-200 border border-maroon-700/80 hover:border-amber-500/50 text-xs font-bold transition-colors"
                            >
                              {t('noShowAction')}
                            </button>

                            <button
                              onClick={() => cancelCustomer(cust.id)}
                              title={t('cancelAction')}
                              className="touch-target px-2.5 py-1.5 rounded-xl bg-maroon-950 hover:bg-rose-950/60 text-rose-300 hover:text-rose-200 border border-maroon-700/80 hover:border-rose-500/50 text-xs font-bold transition-colors"
                            >
                              <X className="w-4 h-4 stroke-[2.5]" />
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

      {/* Add Walk-in Modal */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel-beige rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-maroon-800 pb-3">
              <div>
                <h3 className="text-xl font-bold text-beige-50 font-serif">{t('walkInModalTitle')}</h3>
                <p className="text-xs text-beige-200/70 mt-0.5">{t('walkInModalDesc')}</p>
              </div>
              <button
                onClick={() => setShowWalkInModal(false)}
                className="w-8 h-8 rounded-full bg-maroon-900 flex items-center justify-center text-beige-200 hover:text-white border border-maroon-750"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {walkInError && (
              <div className="p-3.5 rounded-2xl bg-maroon-900/90 border border-rose-500 text-rose-200 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{walkInError}</span>
              </div>
            )}

            <form onSubmit={handleAddWalkInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-beige-200/90 uppercase mb-1.5">
                  {t('fullNameLabel')}
                </label>
                <input
                  type="text"
                  value={walkInName}
                  onChange={e => setWalkInName(e.target.value)}
                  placeholder="e.g. Samir Dave"
                  required
                  className="touch-target w-full px-4 py-3 rounded-xl bg-maroon-950 border border-maroon-750 text-beige-50 text-sm focus:border-beige-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-beige-200/90 uppercase mb-1.5">
                  {t('phoneLabel')}
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={walkInPhone}
                  onChange={e => setWalkInPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 9898012345"
                  required
                  className="touch-target w-full px-4 py-3 rounded-xl bg-maroon-950 border border-maroon-750 text-beige-50 text-sm font-mono focus:border-beige-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-beige-200/90 uppercase mb-1.5">
                  {t('step2Title')}
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
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
                        className={`cursor-pointer p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                          isSelected
                            ? 'bg-beige-300/20 border-beige-300 text-white font-bold'
                            : 'bg-maroon-950 border-maroon-800 text-beige-100'
                        }`}
                      >
                        <span className="truncate">{service.name[language] || service.name.en}</span>
                        <span className="text-beige-300 font-mono ml-1">₹{service.price}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-beige-200/90 uppercase mb-1.5">
                  {t('step3Title')}
                </label>
                <select
                  value={walkInBarberId}
                  onChange={e => setWalkInBarberId(e.target.value)}
                  className="touch-target w-full px-4 py-3 rounded-xl bg-maroon-950 border border-maroon-750 text-beige-50 text-sm focus:border-beige-300 focus:outline-none"
                >
                  <option value="any">{t('anyBarber')}</option>
                  {state.barbers.filter(b => b.isOnDuty).map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} {b.isOnBreak ? `(${t('onBreak')})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="touch-target px-5 py-3 rounded-xl bg-maroon-900 text-beige-200 text-sm font-semibold hover:bg-maroon-850 border border-maroon-750"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="touch-target px-6 py-3 rounded-xl gold-gradient-bg text-maroon-950 text-sm font-black shadow-md hover:brightness-105"
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
