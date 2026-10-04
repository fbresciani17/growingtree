import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, KeyRound, X, AlertCircle, CheckCircle2 } from 'lucide-react';

export const FamilyCodeModal: React.FC = () => {
  const { showCodeModal, closeCodeModal, unlockEditMode, authError, clearAuthError } = useAuth();
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showCodeModal) {
      setCode('');
      clearAuthError();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [showCodeModal]);

  if (!showCodeModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = unlockEditMode(code);
    setIsSubmitting(false);
    if (success) {
      setCode('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={closeCodeModal}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-200/50">
          <KeyRound className="w-7 h-7" />
        </div>

        {/* Title */}
        <h3 className="font-serif text-2xl font-bold text-slate-900 mb-2">
          Codice Famiglia
        </h3>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Inserisci il codice segreto di famiglia per abilitare l'aggiunta e la modifica dei dati dell'albero genealogico.
        </p>

        {/* Error Alert */}
        {authError && (
          <div className="mb-4 flex items-center gap-2 bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-semibold p-3 rounded-xl">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Codice di accesso
            </label>
            <input
              ref={inputRef}
              type="password"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (authError) clearAuthError();
              }}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-center text-lg tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-family-600/30 focus:border-family-600 transition-all"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={closeCodeModal}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !code.trim()}
              className="flex-1 py-3 px-4 rounded-xl bg-family-700 hover:bg-family-800 disabled:opacity-50 text-white text-sm font-semibold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Sblocca</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
