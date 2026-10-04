import React, { useState } from 'react';
import { Person, PersonFormData } from '../../types';
import { useFamilyTree } from '../../context/FamilyTreeContext';
import { UNKNOWN_DEATH_DATE } from '../../utils/formatters';
import { X, UserPlus, Users, Check, AlertCircle, Link } from 'lucide-react';

interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  parent: Person;
}

export const AddChildModal: React.FC<AddChildModalProps> = ({
  isOpen,
  onClose,
  parent,
}) => {
  const { people, addPerson, addRelationship, getPartners, setSelectedPersonId } = useFamilyTree();

  const [mode, setMode] = useState<'create' | 'link'>('create');
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  const [selectedExistingChildId, setSelectedExistingChildId] = useState<string>('');

  const [childData, setChildData] = useState<PersonFormData>({
    first_name: '',
    last_name: parent.last_name || '',
    birth_date: '',
    birth_place: '',
    death_date: '',
    death_place: '',
    notes: '',
  });

  const [isDeceased, setIsDeceased] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const partners = getPartners(parent.id);

  // Set default partner if there's only 1 partner
  React.useEffect(() => {
    if (partners.length === 1) {
      setSelectedPartnerId(partners[0].id);
    } else {
      setSelectedPartnerId('');
    }
  }, [parent.id, partners.length]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);

      const parentIds = [parent.id];
      if (selectedPartnerId && selectedPartnerId !== 'none') {
        parentIds.push(selectedPartnerId);
      }

      if (mode === 'create') {
        if (!childData.first_name.trim() || !childData.last_name.trim()) {
          setError('Nome e cognome sono obbligatori.');
          return;
        }

        let resolvedDeathDate = '';
        let resolvedDeathPlace = '';

        if (isDeceased) {
          resolvedDeathDate = childData.death_date.trim() !== '' ? childData.death_date : UNKNOWN_DEATH_DATE;
          resolvedDeathPlace = childData.death_place.trim();
        }

        const newChild = await addPerson({
          personData: {
            ...childData,
            death_date: resolvedDeathDate,
            death_place: resolvedDeathPlace,
          },
          parentIds,
        });

        if (newChild) {
          setSelectedPersonId(newChild.id);
          onClose();
        }
      } else {
        // Link existing person as child
        if (!selectedExistingChildId) {
          setError('Seleziona una persona da collegare come figlio.');
          return;
        }

        // Add parent relationships
        for (const pId of parentIds) {
          await addRelationship(pId, selectedExistingChildId, 'parent');
        }

        setSelectedPersonId(selectedExistingChildId);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Errore durante l\'aggiunta del figlio.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter available existing people (exclude parent and current ancestors)
  const availablePeople = people.filter((p) => p.id !== parent.id);

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
          <span className="text-xs font-bold uppercase tracking-wider text-family-700 flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            Nuovo Figlio / Discendente
          </span>
          <h2 className="font-serif text-2xl font-bold text-slate-900 mt-1">
            Aggiungi figlio a {parent.first_name} {parent.last_name}
          </h2>
        </div>

        {/* Mode Selector */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('create')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === 'create' ? 'bg-white text-family-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            Crea nuova persona
          </button>
          <button
            type="button"
            onClick={() => setMode('link')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === 'link' ? 'bg-white text-family-800 shadow-xs' : 'text-slate-600'
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
          
          {/* Second Parent Selection if partners exist */}
          {partners.length > 0 && (
            <div className="bg-family-50/70 p-4 rounded-2xl border border-family-200/60">
              <label className="block text-xs font-bold text-family-900 uppercase tracking-wider mb-1.5">
                Secondo Genitore (Opzionale)
              </label>
              <select
                value={selectedPartnerId}
                onChange={(e) => setSelectedPartnerId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-family-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-family-600/30"
              >
                <option value="none">Nessun secondo genitore (solo {parent.first_name})</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.first_name} {p.last_name} (Partner)
                  </option>
                ))}
              </select>
            </div>
          )}

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
                    value={childData.first_name}
                    onChange={(e) => setChildData({ ...childData, first_name: e.target.value })}
                    placeholder="es. Marco"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-family-600/30 focus:border-family-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Cognome <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={childData.last_name}
                    onChange={(e) => setChildData({ ...childData, last_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-family-600/30 focus:border-family-600"
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
                    value={childData.birth_date}
                    onChange={(e) => setChildData({ ...childData, birth_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-family-600/30 focus:border-family-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Luogo di Nascita
                  </label>
                  <input
                    type="text"
                    value={childData.birth_place}
                    onChange={(e) => setChildData({ ...childData, birth_place: e.target.value })}
                    placeholder="es. Bergamo, IT"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-family-600/30 focus:border-family-600"
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
                    className="w-4 h-4 rounded text-family-600 focus:ring-family-500 border-slate-300"
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
                          value={childData.death_date}
                          onChange={(e) => setChildData({ ...childData, death_date: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-sm focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                          Luogo di Decesso <span className="font-normal text-stone-500 text-[10px]">(opzionale)</span>
                        </label>
                        <input
                          type="text"
                          value={childData.death_place}
                          onChange={(e) => setChildData({ ...childData, death_place: e.target.value })}
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
                  value={childData.notes}
                  onChange={(e) => setChildData({ ...childData, notes: e.target.value })}
                  placeholder="Note, professione, aneddoti..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-family-600/30"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Seleziona persona già presente
              </label>
              <select
                value={selectedExistingChildId}
                onChange={(e) => setSelectedExistingChildId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-family-600/30"
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
              className="flex-1 py-3 px-4 rounded-xl bg-family-700 hover:bg-family-800 disabled:opacity-50 text-white text-sm font-semibold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Aggiungi Figlio</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
