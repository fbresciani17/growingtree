import React, { useState, useMemo } from 'react';
import { useFamilyTree } from '../context/FamilyTreeContext';
import { 
  normalizeSearch, 
  formatItalianDate, 
  getLifespanLabel, 
  getYearOnly,
  isPersonDeceased 
} from '../utils/formatters';
import { 
  Search, 
  ArrowUpDown, 
  Eye, 
  MapPin, 
  Calendar, 
  Users, 
  Heart, 
  Plus, 
  UserPlus,
  GitBranch
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ListViewProps {
  onOpenAddPerson: () => void;
}

type SortField = 'name' | 'birth' | 'children';
type SortDirection = 'asc' | 'desc';

export const ListView: React.FC<ListViewProps> = ({ onOpenAddPerson }) => {
  const {
    people,
    setSelectedPersonId,
    setActiveView,
    searchQuery,
    setSearchQuery,
    getParents,
    getPartners,
    getChildren,
  } = useFamilyTree();

  const { isEditModeUnlocked, openCodeModal } = useAuth();

  const [sortField, setSortField] = useState<SortField>('birth');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filterDeceased, setFilterDeceased] = useState<'all' | 'living' | 'deceased'>('all');

  const normalizedQuery = normalizeSearch(searchQuery);

  const filteredAndSortedPeople = useMemo(() => {
    return people
      .filter((p) => {
        // Search filter
        if (normalizedQuery) {
          const searchTargets = [
            p.first_name,
            p.last_name,
            p.birth_place || '',
            p.death_place || '',
            p.birth_date || '',
            p.notes || '',
          ].join(' ');
          if (!normalizeSearch(searchTargets).includes(normalizedQuery)) {
            return false;
          }
        }

        // Living / Deceased filter
        const personDeceased = isPersonDeceased(p);
        if (filterDeceased === 'living' && personDeceased) return false;
        if (filterDeceased === 'deceased' && !personDeceased) return false;

        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortField === 'name') {
          const nameA = `${a.last_name} ${a.first_name}`.toLowerCase();
          const nameB = `${b.last_name} ${b.first_name}`.toLowerCase();
          cmp = nameA.localeCompare(nameB);
        } else if (sortField === 'birth') {
          const yearA = a.birth_date ? a.birth_date : '9999';
          const yearB = b.birth_date ? b.birth_date : '9999';
          cmp = yearA.localeCompare(yearB);
        } else if (sortField === 'children') {
          const countA = getChildren(a.id).length;
          const countB = getChildren(b.id).length;
          cmp = countA - countB;
        }
        return sortDirection === 'asc' ? cmp : -cmp;
      });
  }, [people, normalizedQuery, filterDeceased, sortField, sortDirection, getChildren]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAndShowInTree = (personId: string) => {
    setSelectedPersonId(personId);
    setActiveView('tree');
  };

  return (
    <div className="flex-1 w-full h-full overflow-y-auto bg-[#FAF8F5] p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Controls Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cerca per nome, cognome, luogo o anno..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-family-500/30 focus:border-family-600 transition-all"
            />
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600">
              <button
                onClick={() => setFilterDeceased('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterDeceased === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
                }`}
              >
                Tutti ({people.length})
              </button>
              <button
                onClick={() => setFilterDeceased('living')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterDeceased === 'living' ? 'bg-white text-emerald-700 shadow-sm' : 'hover:text-slate-900'
                }`}
              >
                Viventi
              </button>
              <button
                onClick={() => setFilterDeceased('deceased')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterDeceased === 'deceased' ? 'bg-white text-stone-700 shadow-sm' : 'hover:text-slate-900'
                }`}
              >
                Memoria
              </button>
            </div>

            {/* Add Person Button */}
            <button
              onClick={() => {
                if (!isEditModeUnlocked) {
                  openCodeModal(onOpenAddPerson);
                } else {
                  onOpenAddPerson();
                }
              }}
              className="flex items-center gap-1.5 bg-family-700 hover:bg-family-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm transition-all active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Nuova persona</span>
            </button>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Visualizzati <strong className="text-slate-800">{filteredAndSortedPeople.length}</strong> su{' '}
            {people.length} familiari
          </span>
          <div className="flex items-center gap-3">
            <span>Ordina per:</span>
            <button
              onClick={() => toggleSort('birth')}
              className={`flex items-center gap-1 hover:text-slate-900 ${sortField === 'birth' ? 'font-semibold text-family-700' : ''}`}
            >
              Anno di Nascita <ArrowUpDown className="w-3 h-3" />
            </button>
            <button
              onClick={() => toggleSort('name')}
              className={`flex items-center gap-1 hover:text-slate-900 ${sortField === 'name' ? 'font-semibold text-family-700' : ''}`}
            >
              Cognome <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* People Cards Grid */}
        {filteredAndSortedPeople.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-base">Nessun parente trovato con i filtri attuali.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedPeople.map((person) => {
              const parents = getParents(person.id);
              const partners = getPartners(person.id);
              const children = getChildren(person.id);
              const isDeceased = isPersonDeceased(person);
              const lifespan = getLifespanLabel(person.birth_date, person.death_date);

              return (
                <div
                  key={person.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Tag & Quick View */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          isDeceased
                            ? 'bg-stone-100 text-stone-600 border border-stone-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        }`}
                      >
                        {isDeceased ? 'In memoria' : 'Vivente'}
                      </span>

                      <button
                        onClick={() => handleSelectAndShowInTree(person.id)}
                        className="flex items-center gap-1 text-xs font-medium text-family-700 hover:text-family-900 bg-family-50 hover:bg-family-100 px-2.5 py-1 rounded-lg transition-colors"
                        title="Localizza nell'albero"
                      >
                        <GitBranch className="w-3.5 h-3.5" />
                        <span>Albero</span>
                      </button>
                    </div>

                    {/* Name */}
                    <h3 className="font-serif text-lg font-bold text-slate-900 leading-snug">
                      {person.first_name} {person.last_name}
                    </h3>

                    {/* Lifespan & Place */}
                    <div className="mt-2 space-y-1 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-family-600 flex-shrink-0" />
                        <span>{lifespan || (person.birth_date ? formatItalianDate(person.birth_date) : 'Data di nascita non nota')}</span>
                      </div>
                      {person.birth_place && (
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{person.birth_place}</span>
                        </div>
                      )}
                    </div>

                    {/* Relationships Summary */}
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                      {parents.length > 0 && (
                        <p className="truncate">
                          <strong className="text-slate-700">Genitori:</strong>{' '}
                          {parents.map((p) => `${p.first_name} ${p.last_name}`).join(', ')}
                        </p>
                      )}
                      {partners.length > 0 && (
                        <p className="truncate flex items-center gap-1 text-rose-700">
                          <Heart className="w-3 h-3 fill-rose-300 text-rose-500 flex-shrink-0" />
                          <span>{partners.map((p) => `${p.first_name} ${p.last_name}`).join(', ')}</span>
                        </p>
                      )}
                      {children.length > 0 && (
                        <p className="truncate flex items-center gap-1 text-family-800">
                          <Users className="w-3 h-3 text-family-600 flex-shrink-0" />
                          <span>
                            {children.length} {children.length === 1 ? 'figlio' : 'figli'} (
                            {children.map((c) => c.first_name).join(', ')})
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Open Details Button */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => setSelectedPersonId(person.id)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Visualizza Scheda Completa</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
