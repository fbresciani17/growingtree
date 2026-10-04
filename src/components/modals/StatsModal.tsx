import React from 'react';
import { useFamilyTree } from '../../context/FamilyTreeContext';
import { computeFamilyTreeLayout } from '../../utils/treeLayout';
import { formatItalianDate, getYearOnly, isPersonDeceased } from '../../utils/formatters';
import { 
  X, 
  BarChart2, 
  Users, 
  Heart, 
  TreeDeciduous, 
  Calendar, 
  Sparkles 
} from 'lucide-react';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose }) => {
  const { people, relationships } = useFamilyTree();

  if (!isOpen) return null;

  const totalPeople = people.length;
  const livingPeople = people.filter((p) => !isPersonDeceased(p)).length;
  const deceasedPeople = totalPeople - livingPeople;
  
  const partnerRelationships = relationships.filter((r) => r.relationship_type === 'partner');
  const totalCouples = Math.round(partnerRelationships.length / 2) || partnerRelationships.length;

  const layout = computeFamilyTreeLayout(people, relationships);
  const maxGeneration = layout.cards.length > 0
    ? Math.max(...layout.cards.map((c) => c.generation)) + 1
    : 0;

  // Surnames distribution
  const surnameCounts: { [key: string]: number } = {};
  people.forEach((p) => {
    const surname = (p.last_name || 'Non specificato').trim();
    surnameCounts[surname] = (surnameCounts[surname] || 0) + 1;
  });

  const sortedSurnames = Object.entries(surnameCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Oldest born ancestor
  const peopleWithBirth = people
    .filter((p) => p.birth_date)
    .sort((a, b) => (a.birth_date || '').localeCompare(b.birth_date || ''));
  const oldestAncestor = peopleWithBirth[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="w-12 h-12 rounded-2xl bg-family-50 text-family-700 flex items-center justify-center mb-3">
            <BarChart2 className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-family-700">
            Statistiche di Famiglia
          </span>
          <h2 className="font-serif text-2xl font-bold text-slate-900 mt-1">
            I numeri di GrowingTree
          </h2>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-family-50/70 p-4 rounded-2xl border border-family-200/60 text-center">
            <span className="block text-2xl font-extrabold text-family-900 font-serif">
              {totalPeople}
            </span>
            <span className="text-[11px] font-semibold text-family-700 uppercase tracking-wider">
              Familiari
            </span>
          </div>

          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/60 text-center">
            <span className="block text-2xl font-extrabold text-emerald-900 font-serif">
              {livingPeople}
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
              Viventi
            </span>
          </div>

          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-center">
            <span className="block text-2xl font-extrabold text-stone-900 font-serif">
              {deceasedPeople}
            </span>
            <span className="text-[11px] font-semibold text-stone-700 uppercase tracking-wider">
              In memoria
            </span>
          </div>

          <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200/60 text-center">
            <span className="block text-2xl font-extrabold text-rose-900 font-serif">
              {totalCouples}
            </span>
            <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">
              Unioni / Coppie
            </span>
          </div>

          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/60 text-center col-span-2 sm:col-span-2">
            <span className="block text-2xl font-extrabold text-amber-900 font-serif">
              {maxGeneration}
            </span>
            <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
              Generazioni documentate
            </span>
          </div>
        </div>

        {/* Most frequent surnames */}
        <div className="mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
            Cognomi Principali
          </h4>
          <div className="space-y-2">
            {sortedSurnames.map(([surname, count]) => {
              const pct = Math.round((count / (totalPeople || 1)) * 100);
              return (
                <div key={surname} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{surname}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-family-600 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="font-medium text-slate-500 w-12 text-right">
                      {count} ({pct}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Oldest ancestor note */}
        {oldestAncestor && (
          <div className="bg-family-50/50 border border-family-200 rounded-2xl p-4 text-xs text-family-900 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-family-600 flex-shrink-0" />
            <div>
              <p className="font-bold">Antenato con data di nascita più antica:</p>
              <p className="text-slate-700 mt-0.5">
                {oldestAncestor.first_name} {oldestAncestor.last_name} (
                {formatItalianDate(oldestAncestor.birth_date)})
              </p>
            </div>
          </div>
        )}

        <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold transition-all"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
