import React from 'react';
import { useFamilyTree } from '../context/FamilyTreeContext';
import { useAuth } from '../context/AuthContext';
import { 
  isPersonDeceased, 
  formatItalianDate, 
  getLifespanLabel, 
  calculateAge,
  isExactDeathDateKnown 
} from '../utils/formatters';
import { 
  X, 
  Calendar, 
  MapPin, 
  Heart, 
  Users, 
  UserPlus, 
  Edit3, 
  Trash2, 
  BookOpen, 
  Link2Off, 
  Lock, 
  ChevronRight,
  UserCheck,
  Sparkles,
  GitBranch
} from 'lucide-react';

interface PersonSidePanelProps {
  onOpenEdit: () => void;
  onOpenAddChild: () => void;
  onOpenAddPartner: () => void;
  onOpenAddParent: () => void;
  onOpenDeleteRel: () => void;
  onOpenDeletePerson: () => void;
}

export const PersonSidePanel: React.FC<PersonSidePanelProps> = ({
  onOpenEdit,
  onOpenAddChild,
  onOpenAddPartner,
  onOpenAddParent,
  onOpenDeleteRel,
  onOpenDeletePerson,
}) => {
  const {
    selectedPersonId,
    setSelectedPersonId,
    getPersonById,
    getParents,
    getPartners,
    getChildren,
    setActiveView,
  } = useFamilyTree();

  const { isEditModeUnlocked, openCodeModal } = useAuth();

  if (!selectedPersonId) return null;

  const person = getPersonById(selectedPersonId);
  if (!person) return null;

  const parents = getParents(person.id);
  const partners = getPartners(person.id);
  const children = getChildren(person.id);

  const isDeceased = isPersonDeceased(person);
  const lifespan = getLifespanLabel(person.birth_date, person.death_date);
  const age = calculateAge(person.birth_date, person.death_date);

  // Protected action executor
  const handleProtectedAction = (action: () => void) => {
    if (isEditModeUnlocked) {
      action();
    } else {
      openCodeModal(action);
    }
  };

  return (
    <div
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] md:w-[480px] bg-white shadow-2xl border-l border-slate-200/90 flex flex-col animate-slide-in-right overflow-hidden"
    >
      {/* Panel Header */}
      <div className="relative p-6 bg-gradient-to-b from-family-50/80 to-white border-b border-slate-100 flex-shrink-0">
        <button
          onClick={() => setSelectedPersonId(null)}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-white/80 rounded-full transition-all active:scale-95"
          aria-label="Chiudi pannello"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tag & Status */}
        <div className="flex items-center gap-2 mb-2.5">
          <span
            className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
              isDeceased
                ? 'bg-stone-100 text-stone-700 border border-stone-200'
                : 'bg-emerald-100/70 text-emerald-800 border border-emerald-200'
            }`}
          >
            {isDeceased ? 'In memoria' : 'Vivente'}
          </span>
          {age !== null && (
            <span className="text-xs font-medium text-slate-500">
              {isDeceased ? `Vissuto ${age} anni` : `${age} anni compiuti`}
            </span>
          )}
        </div>

        {/* Name */}
        <h2 className="font-serif text-2xl font-bold text-slate-900 leading-tight">
          {person.first_name} {person.last_name}
        </h2>
        {lifespan && <p className="text-xs text-slate-600 mt-1">{lifespan}</p>}
      </div>

      {/* Panel Content (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Anagrafe / Dati Anagrafici */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Dati Anagrafici
          </h3>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 space-y-3">
            {/* Nascita */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100/60 flex items-center justify-center text-emerald-700 flex-shrink-0 mt-0.5">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Nascita</p>
                <p className="text-sm font-semibold text-slate-800">
                  {person.birth_date ? formatItalianDate(person.birth_date) : 'Data non specificata'}
                </p>
                {person.birth_place && (
                  <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {person.birth_place}
                  </p>
                )}
              </div>
            </div>

            {/* Decesso (se presente) */}
            {isDeceased && (
              <div className="flex items-start gap-3 pt-2 border-t border-slate-200/60">
                <div className="w-8 h-8 rounded-xl bg-stone-200/70 flex items-center justify-center text-stone-700 flex-shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-stone-500 font-medium">Decesso</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {formatItalianDate(person.death_date) || 'Data non specificata'}
                  </p>
                  {person.death_place && (
                    <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {person.death_place}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Note / Memorie di famiglia */}
        {person.notes && (
          <section className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              Note & Storia di Famiglia
            </h3>
            <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-4 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {person.notes}
            </div>
          </section>
        )}

        {/* Relazioni Familiari */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Relazioni di Famiglia
          </h3>

          {/* Genitori */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-family-600" />
                Genitori ({parents.length})
              </span>
            </div>

            {parents.length === 0 ? (
              <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl">
                Nessun genitore registrato nell'albero.
              </p>
            ) : (
              <div className="space-y-1.5">
                {parents.map((parent) => (
                  <button
                    key={parent.id}
                    onClick={() => setSelectedPersonId(parent.id)}
                    className="w-full flex items-center justify-between p-3 bg-white hover:bg-family-50/70 border border-slate-200 rounded-xl transition-all text-left group"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-family-800">
                        {parent.first_name} {parent.last_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {getLifespanLabel(parent.birth_date, parent.death_date) || 'Data non nota'}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-family-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Partner / Coniugi */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold flex items-center gap-1.5 text-rose-700">
                <Heart className="w-3.5 h-3.5 fill-rose-300 text-rose-500" />
                Partner / Coniugi ({partners.length})
              </span>
            </div>

            {partners.length === 0 ? (
              <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl">
                Nessun partner registrato.
              </p>
            ) : (
              <div className="space-y-1.5">
                {partners.map((partner) => (
                  <button
                    key={partner.id}
                    onClick={() => setSelectedPersonId(partner.id)}
                    className="w-full flex items-center justify-between p-3 bg-white hover:bg-rose-50/60 border border-rose-100 rounded-xl transition-all text-left group"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-rose-800">
                        {partner.first_name} {partner.last_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {getLifespanLabel(partner.birth_date, partner.death_date) || 'Data non nota'}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Figli */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold flex items-center gap-1.5 text-family-800">
                <Users className="w-3.5 h-3.5 text-family-600" />
                Figli ({children.length})
              </span>
            </div>

            {children.length === 0 ? (
              <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl">
                Nessun figlio registrato.
              </p>
            ) : (
              <div className="space-y-1.5">
                {children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => setSelectedPersonId(child.id)}
                    className="w-full flex items-center justify-between p-3 bg-white hover:bg-family-50/70 border border-slate-200 rounded-xl transition-all text-left group"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-family-800">
                        {child.first_name} {child.last_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {getLifespanLabel(child.birth_date, child.death_date) || 'Data non nota'}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-family-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Action Buttons */}
        <section className="space-y-3 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Azioni & Modifiche
            </h3>
            {!isEditModeUnlocked && (
              <span className="flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-medium border border-amber-200/50">
                <Lock className="w-3 h-3 text-amber-600" />
                Richiede codice
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Edit Person */}
            <button
              onClick={() => handleProtectedAction(onOpenEdit)}
              className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold py-2.5 px-3 rounded-xl transition-all"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-600" />
              <span>Modifica Dati</span>
            </button>

            {/* Add Child */}
            <button
              onClick={() => handleProtectedAction(onOpenAddChild)}
              className="flex items-center justify-center gap-1.5 bg-family-50 hover:bg-family-100 text-family-800 text-xs font-semibold py-2.5 px-3 rounded-xl transition-all border border-family-200/60"
            >
              <UserPlus className="w-3.5 h-3.5 text-family-600" />
              <span>Aggiungi Figlio</span>
            </button>

            {/* Add Partner */}
            <button
              onClick={() => handleProtectedAction(onOpenAddPartner)}
              className="flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold py-2.5 px-3 rounded-xl transition-all border border-rose-200/60"
            >
              <Heart className="w-3.5 h-3.5 text-rose-600" />
              <span>Aggiungi Partner</span>
            </button>

            {/* Add Parent */}
            <button
              onClick={() => handleProtectedAction(onOpenAddParent)}
              className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold py-2.5 px-3 rounded-xl transition-all"
            >
              <Users className="w-3.5 h-3.5 text-slate-600" />
              <span>Aggiungi Genitore</span>
            </button>
          </div>

          {/* Delete actions */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => handleProtectedAction(onOpenDeleteRel)}
              className="w-full flex items-center justify-center gap-1.5 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 text-xs font-medium py-2 rounded-xl border border-slate-200 transition-all"
            >
              <Link2Off className="w-3.5 h-3.5 text-slate-500" />
              <span>Elimina Relazione</span>
            </button>

            <button
              onClick={() => handleProtectedAction(onOpenDeletePerson)}
              className="w-full flex items-center justify-center gap-1.5 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-semibold py-2 rounded-xl border border-rose-200/60 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Elimina Persona dall'Albero</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
