import React, { useState, useEffect } from 'react';
import { Person, PersonFormData } from '../../types';
import { useFamilyTree } from '../../context/FamilyTreeContext';
import { isPersonDeceased, isExactDeathDateKnown, UNKNOWN_DEATH_DATE } from '../../utils/formatters';
import { X, User, Calendar, MapPin, BookOpen, AlertCircle, Check, HelpCircle } from 'lucide-react';

interface EditPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  personToEdit?: Person | null;
}

export const EditPersonModal: React.FC<EditPersonModalProps> = ({
  isOpen,
  onClose,
  personToEdit,
}) => {
  const { addPerson, updatePerson, setSelectedPersonId } = useFamilyTree();

  const [formData, setFormData] = useState<PersonFormData>({
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

  useEffect(() => {
    if (personToEdit) {
      const deceased = isPersonDeceased(personToEdit);
      const exactDate = isExactDeathDateKnown(personToEdit.death_date) ? (personToEdit.death_date || '') : '';
      
      setFormData({
        first_name: personToEdit.first_name || '',
        last_name: personToEdit.last_name || '',
        birth_date: personToEdit.birth_date || '',
        birth_place: personToEdit.birth_place || '',
        death_date: exactDate,
        death_place: personToEdit.death_place || '',
        notes: personToEdit.notes || '',
      });
      setIsDeceased(deceased);
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        birth_date: '',
        birth_place: '',
        death_date: '',
        death_place: '',
        notes: '',
      });
      setIsDeceased(false);
    }
    setError(null);
  }, [personToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setError('Nome e Cognome sono obbligatori.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Resolve death_date
      let resolvedDeathDate = '';
      let resolvedDeathPlace = '';

      if (isDeceased) {
        resolvedDeathDate = formData.death_date.trim() !== '' ? formData.death_date : UNKNOWN_DEATH_DATE;
        resolvedDeathPlace = formData.death_place.trim();
      }

      const payloadData: PersonFormData = {
        ...formData,
        death_date: resolvedDeathDate,
        death_place: resolvedDeathPlace,
      };

      if (personToEdit) {
        const success = await updatePerson(personToEdit.id, payloadData);
        if (success) {
          onClose();
        }
      } else {
        const created = await addPerson({ personData: payloadData });
        if (created) {
          setSelectedPersonId(created.id);
          onClose();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Errore durante il salvataggio.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-family-700">
            {personToEdit ? 'Modifica Dati' : 'Nuova Persona'}
          </span>
          <h2 className="font-serif text-2xl font-bold text-slate-900 mt-1">
            {personToEdit ? `${personToEdit.first_name} ${personToEdit.last_name}` : 'Aggiungi un familiare'}
          </h2>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 flex items-center gap-2 bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-semibold p-3 rounded-xl">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name & Surname */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nome <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="es. Giovanni"
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
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="es. Bresciani"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-family-600/30 focus:border-family-600"
              />
            </div>
          </div>

          {/* Birth Date & Birth Place */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Data di Nascita
              </label>
              <input
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-family-600/30 focus:border-family-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Luogo di Nascita
              </label>
              <input
                type="text"
                value={formData.birth_place}
                onChange={(e) => setFormData({ ...formData, birth_place: e.target.value })}
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

            {/* Death Date & Death Place (if deceased) */}
            {isDeceased && (
              <div className="mt-3 pt-3 border-t border-stone-200/80 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Data di Decesso <span className="font-normal text-stone-500 text-[10px]">(opzionale)</span>
                    </label>
                    <input
                      type="date"
                      value={formData.death_date}
                      onChange={(e) => setFormData({ ...formData, death_date: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-600/30"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Luogo di Decesso <span className="font-normal text-stone-500 text-[10px]">(opzionale)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.death_place}
                      onChange={(e) => setFormData({ ...formData, death_place: e.target.value })}
                      placeholder="es. Bergamo, IT"
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-600/30"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-stone-500 italic">
                  Nota: Se non conosci la data o il luogo esatto, puoi lasciarli vuoti: la persona verrà comunque registrata correttamente come deceduta nell'albero.
                </p>
              </div>
            )}
          </div>

          {/* Notes / Story */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Note, ricordi & aneddoti
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Aggiungi una breve biografia, professione o memoria..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-family-600/30 focus:border-family-600"
            />
          </div>

          {/* Action Buttons */}
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
              <span>{personToEdit ? 'Salva Modifiche' : 'Crea Persona'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
