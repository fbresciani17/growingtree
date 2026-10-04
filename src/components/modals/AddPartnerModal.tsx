import React, { useState } from 'react';
import { Person, PersonFormData } from '../../types';
import { useFamilyTree } from '../../context/FamilyTreeContext';
import { UNKNOWN_DEATH_DATE } from '../../utils/formatters';
import { X, Heart, Check, AlertCircle } from 'lucide-react';

interface AddPartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: Person;
}

export const AddPartnerModal: React.FC<AddPartnerModalProps> = ({
  isOpen,
  onClose,
  person,
}) => {
  const { people, addPerson, addRelationship, getPartners, setSelectedPersonId } = useFamilyTree();

  const [mode, setMode] = useState<'create' | 'link'>('create');
  const [selectedExistingPartnerId, setSelectedExistingPartnerId] = useState<string>('');

  const [partnerData, setPartnerData] = useState<PersonFormData>({
    first_name: '',
    last_name: '',
    birth_date: '',
    birth_place: '',
    death_date: '',
    death_place: '',
    notes: '',
  });

  const [isDeceased, setIsDeceased] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const existingPartners = getPartners(person.id);
  const existingPartnerIds = existingPartners.map((p) => p.id);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);

      if (mode === 'create') {
        if (!partnerData.first_name.trim() || !partnerData.last_name.trim()) {
          setError('Nome e cognome sono obbligatori.');
          return;
        }

        let resolvedDeathDate = '';
        let resolvedDeathPlace = '';

        if (isDeceased) {
          resolvedDeathDate = partnerData.death_date.trim() !== '' ? partnerData.death_date : UNKNOWN_DEATH_DATE;
          resolvedDeathPlace = partnerData.death_place.trim();
        }

        const newPartner = await addPerson({
          personData: {
            ...partnerData,
            death_date: resolvedDeathDate,
            death_place: resolvedDeathPlace,
          },
          partnerId: person.id,
        });

        if (newPartner) {
          setSelectedPersonId(newPartner.id);
          onClose();
        }
      } else {
        if (!selectedExistingPartnerId) {
          setError('Seleziona una persona da collegare come partner.');
          return;
        }

        const success = await addRelationship(person.id, selectedExistingPartnerId, 'partner');
        if (success) {
          onClose();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Errore durante l\'aggiunta del partner.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availablePeople = people.filter(
    (p) => p.id !== person.id && !existingPartnerIds.includes(p.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
            <Heart className="w-4 h-4 fill-rose-300 text-rose-500" />
            Nuovo Coniuge / Partner
          </span>
          <h2 className="font-serif text-2xl font-bold text-slate-900 mt-1">
            Aggiungi partner a {person.first_name} {person.last_name}
          </h2>
        </div>

        {/* Mode Selector */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('create')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === 'create' ? 'bg-white text-rose-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            Crea nuova persona
          </button>
          <button
            type="button"
            onClick={() => setMode('link')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === 'link' ? 'bg-white text-rose-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            Collega persona esistente
          </button>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2 bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-semibold p-3 rounded-xl">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'create' ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nome <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={partnerData.first_name}
                    onChange={(e) => setPartnerData({ ...partnerData, first_name: e.target.value })}
                    placeholder="es. Teresa"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Cognome <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={partnerData.last_name}
                    onChange={(e) => setPartnerData({ ...partnerData, last_name: e.target.value })}
                    placeholder="es. Vavassori"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Data di Nascita
                  </label>
                  <input
                    type="date"
                    value={partnerData.birth_date}
                    onChange={(e) => setPartnerData({ ...partnerData, birth_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Luogo di Nascita
                  </label>
                  <input
                    type="text"
                    value={partnerData.birth_place}
                    onChange={(e) => setPartnerData({ ...partnerData, birth_place: e.target.value })}
                    placeholder="es. Bergamo, IT"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Deceased Checkbox */}
              <div className="pt-2 bg-stone-50/70 p-3.5 rounded-2xl border border-stone-200/80">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isDeceased}
                    onChange={(e) => setIsDeceased(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                  />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Persona deceduta (in memoria)
                  </span>
                </label>

                {isDeceased && (
                  <div className="mt-3 pt-3 border-t border-stone-200/80 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                          Data di Decesso <span className="font-normal text-stone-500 text-[10px]">(opzionale)</span>
                        </label>
                        <input
                          type="date"
                          value={partnerData.death_date}
                          onChange={(e) => setPartnerData({ ...partnerData, death_date: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-sm focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                          Luogo di Decesso <span className="font-normal text-stone-500 text-[10px]">(opzionale)</span>
                        </label>
                        <input
                          type="text"
                          value={partnerData.death_place}
                          onChange={(e) => setPartnerData({ ...partnerData, death_place: e.target.value })}
                          placeholder="es. Bergamo, IT"
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-sm focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Note biografiche
                </label>
                <textarea
                  rows={2}
                  value={partnerData.notes}
                  onChange={(e) => setPartnerData({ ...partnerData, notes: e.target.value })}
                  placeholder="Note sul matrimonio, storia insieme, ecc..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Seleziona persona da collegare come coniuge
              </label>
              <select
                value={selectedExistingPartnerId}
                onChange={(e) => setSelectedExistingPartnerId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              >
                <option value="">-- Scegli un familiare --</option>
                {availablePeople.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.last_name} {p.first_name} {p.birth_date ? `(${p.birth_date.slice(0, 4)})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm font-semibold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Aggiungi Partner</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
