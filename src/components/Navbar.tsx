import React from 'react';
import { useFamilyTree } from '../context/FamilyTreeContext';
import { useAuth } from '../context/AuthContext';
import { 
  TreeDeciduous, 
  List, 
  Search, 
  X, 
  Lock, 
  Unlock, 
  UserPlus, 
  BarChart2, 
  HelpCircle,
  Sparkles,
  Database
} from 'lucide-react';

interface NavbarProps {
  onOpenAddPerson: () => void;
  onOpenStats: () => void;
  onOpenSetupGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddPerson,
  onOpenStats,
  onOpenSetupGuide,
}) => {
  const {
    activeView,
    setActiveView,
    searchQuery,
    setSearchQuery,
    people,
    isDemoMode,
  } = useFamilyTree();

  const { isEditModeUnlocked, openCodeModal, lockEditMode } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs flex-shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-family-700 to-family-500 flex items-center justify-center text-white shadow-soft">
            <TreeDeciduous className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-serif font-bold text-lg sm:text-xl text-slate-900 tracking-tight">
                GrowingTree
              </h1>
              {isDemoMode && (
                <button
                  onClick={onOpenSetupGuide}
                  title="Dati dimostrativi locali. Clicca per collegare Supabase."
                  className="hidden sm:flex items-center gap-1 text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300/50 hover:bg-amber-200 transition-colors"
                >
                  <Database className="w-3 h-3" />
                  <span>Demo</span>
                </button>
              )}
            </div>
            <p className="hidden sm:block text-[11px] text-slate-500 font-medium">
              Albero Genealogico Familiare
            </p>
          </div>
        </div>

        {/* View Switcher (Albero / Elenco) */}
        <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/60">
          <button
            onClick={() => setActiveView('tree')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'tree'
                ? 'bg-white text-family-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TreeDeciduous className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Albero</span>
          </button>
          <button
            onClick={() => setActiveView('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'list'
                ? 'bg-white text-family-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Elenco</span>
          </button>
        </div>

        {/* Search Bar (Tree View) */}
        {activeView === 'tree' && (
          <div className="hidden md:flex relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cerca parente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-family-500/30 focus:border-family-600 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Stats Button */}
          <button
            onClick={onOpenStats}
            title="Statistiche di Famiglia"
            className="p-2 sm:px-3 sm:py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <BarChart2 className="w-4 h-4" />
            <span className="hidden lg:inline">{people.length} Persone</span>
          </button>

          {/* Edit Mode Toggle */}
          {isEditModeUnlocked ? (
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300/80 rounded-xl px-2.5 py-1.5 text-xs text-emerald-800">
              <Unlock className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span className="hidden md:inline font-semibold">Modifica Attiva</span>
              <button
                onClick={lockEditMode}
                title="Esci dalla modalità modifica"
                className="ml-1 text-[11px] underline font-medium hover:text-emerald-950"
              >
                Esci
              </button>
            </div>
          ) : (
            <button
              onClick={() => openCodeModal()}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition-all active:scale-95"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Modalità modifica</span>
            </button>
          )}

          {/* Add Person CTA */}
          <button
            onClick={() => {
              if (!isEditModeUnlocked) {
                openCodeModal(onOpenAddPerson);
              } else {
                onOpenAddPerson();
              }
            }}
            className="flex items-center gap-1.5 bg-family-700 hover:bg-family-800 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-xs transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Aggiungi</span>
          </button>
        </div>
      </div>
    </header>
  );
};
