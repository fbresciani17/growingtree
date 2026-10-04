import React, { useState } from 'react';
import { Person } from '../../types';
import { useFamilyTree } from '../../context/FamilyTreeContext';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: Person;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  person,
}) => {
  const { deletePerson } = useFamilyTree();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      const success = await deletePerson(person.id);
      if (success) {
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Errore durante l\'eliminazione della persona.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-100 overflow-hidden">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon */}
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-200/60">
          <AlertTriangle className="w-7 h-7" />
        </div>

        {/* Title */}
        <h3 className="font-serif text-2xl font-bold text-slate-900 mb-2">
          Elimina Persona
        </h3>
        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
          Sei sicuro di voler eliminare <strong className="text-slate-900">{person.first_name} {person.last_name}</strong> dall'albero genealogico?
        </p>

        <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-4 text-xs text-rose-800 space-y-1 mb-6">
          <p className="font-bold">Attenzione:</p>
          <p>Tutti i collegamenti di parentela (genitori, coniugi e figli) associati a questa persona verranno rimossi automaticamente dal database.</p>
        </div>

        {error && (
          <div className="mb-4 text-xs font-semibold text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all"
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm font-semibold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isDeleting ? 'Eliminazione...' : 'Elimina'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
