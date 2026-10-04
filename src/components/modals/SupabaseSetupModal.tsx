import React from 'react';
import { X, Database, ShieldCheck, Key, CheckCircle, ExternalLink, GitBranch } from 'lucide-react';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
            <Database className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Guida di Configurazione
          </span>
          <h2 className="font-serif text-2xl font-bold text-slate-900 mt-1">
            Collegamento Supabase & GitHub
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            L'applicazione sta attualmente mostrando i dati dimostrativi locali. Per salvare i dati in modo persistente e condiviso in realtime:
          </p>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-700">
          
          {/* Step 1 */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-family-600 text-white flex items-center justify-center text-xs">1</span>
              File <code className="text-family-700 bg-family-50 px-1.5 py-0.5 rounded">.env</code> in locale
            </h4>
            <p className="text-slate-600 mb-2">
              Crea un file chiamato <code>.env</code> nella cartella radice del progetto copiando <code>.env.example</code>:
            </p>
            <pre className="bg-slate-900 text-slate-100 p-3 rounded-xl text-xs font-mono overflow-x-auto">
{`VITE_SUPABASE_URL=https://tuo-progetto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=tua-chiave-anon-pubblica
VITE_FAMILY_CODE=1234`}
            </pre>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-family-600 text-white flex items-center justify-center text-xs">2</span>
              Deploy GitHub Pages (Secrets)
            </h4>
            <p className="text-slate-600 mb-2">
              Nel repository GitHub (<strong>Settings &rarr; Secrets and variables &rarr; Actions</strong>), aggiungi i seguenti repository secrets:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 ml-1">
              <li><code>VITE_SUPABASE_URL</code></li>
              <li><code>VITE_SUPABASE_PUBLISHABLE_KEY</code></li>
              <li><code>VITE_FAMILY_CODE</code></li>
            </ul>
          </div>

          {/* Step 3 */}
          <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 text-emerald-950">
            <h4 className="font-bold flex items-center gap-2 mb-1 text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Sicurezza Garantita
            </h4>
            <p className="text-xs text-emerald-800">
              La secret key di Supabase non viene mai inclusa. Solo la chiave anonima / publishable key viene usata nel client con il codice famiglia a protezione delle modifiche.
            </p>
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold transition-all"
          >
            Ho capito
          </button>
        </div>
      </div>
    </div>
  );
};
