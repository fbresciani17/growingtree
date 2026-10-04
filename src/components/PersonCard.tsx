import React from 'react';
import { Person } from '../types';
import { isPersonDeceased, getLifespanLabel, getYearOnly } from '../utils/formatters';
import { Heart, Users, MapPin, Calendar, BookOpen } from 'lucide-react';

interface PersonCardProps {
  person: Person;
  partnerCount?: number;
  childrenCount?: number;
  isSelected?: boolean;
  isSearchMatch?: boolean;
  onClick: () => void;
}

export const PersonCard: React.FC<PersonCardProps> = ({
  person,
  partnerCount = 0,
  childrenCount = 0,
  isSelected = false,
  isSearchMatch = false,
  onClick,
}) => {
  const isDeceased = isPersonDeceased(person);
  const birthYear = getYearOnly(person.birth_date);
  const lifespan = getLifespanLabel(person.birth_date, person.death_date);

  return (
    <div
      onClick={onClick}
      className={`
        relative w-[220px] rounded-2xl p-4 cursor-pointer transition-all duration-200
        bg-white border text-left select-none
        ${
          isSelected
            ? 'border-family-600 ring-4 ring-family-500/20 shadow-lg scale-105 z-30'
            : isSearchMatch
            ? 'border-amber-500 ring-4 ring-amber-400/30 shadow-lg pulse-search-match z-20'
            : 'border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-family-400 hover:-translate-y-1 z-10'
        }
      `}
    >
      {/* Top Header / Badges */}
      <div className="flex items-center justify-between gap-1 mb-2">
        <span
          className={`text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full ${
            isDeceased
              ? 'bg-stone-100 text-stone-600 border border-stone-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
          }`}
        >
          {isDeceased ? 'Memoria' : 'Vivente'}
        </span>

        {/* Indicators for spouses and children */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          {partnerCount > 0 && (
            <span
              className="flex items-center gap-0.5 text-rose-500 font-medium text-[11px] bg-rose-50 px-1.5 py-0.5 rounded-md"
              title={`${partnerCount} partner`}
            >
              <Heart className="w-3 h-3 fill-rose-400 text-rose-500" />
              {partnerCount > 1 ? partnerCount : ''}
            </span>
          )}
          {childrenCount > 0 && (
            <span
              className="flex items-center gap-0.5 text-family-700 font-medium text-[11px] bg-family-50 px-1.5 py-0.5 rounded-md"
              title={`${childrenCount} figli`}
            >
              <Users className="w-3 h-3 text-family-600" />
              {childrenCount}
            </span>
          )}
        </div>
      </div>

      {/* Person Name */}
      <div className="mb-2">
        <h3 className="font-serif text-base font-bold text-slate-900 leading-snug truncate">
          {person.first_name}
        </h3>
        <p className="text-sm font-semibold text-family-800 uppercase tracking-wide truncate">
          {person.last_name}
        </p>
      </div>

      {/* Dates / Lifespan */}
      <div className="space-y-1 text-xs text-slate-600">
        <div className="flex items-center gap-1.5 text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-family-600 flex-shrink-0" />
          <span className="truncate font-medium">
            {lifespan || (birthYear ? `Nato ${birthYear}` : 'Data non nota')}
          </span>
        </div>

        {/* Place of Birth */}
        {person.birth_place && (
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] truncate">
            <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="truncate">{person.birth_place}</span>
          </div>
        )}

        {/* Notes icon snippet indicator */}
        {person.notes && (
          <div className="flex items-center gap-1 text-[11px] text-amber-700/80 pt-0.5">
            <BookOpen className="w-3 h-3 flex-shrink-0 text-amber-600" />
            <span className="truncate italic">Note biografiche</span>
          </div>
        )}
      </div>

      {/* Selection Arrow indicator */}
      {isSelected && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-family-600 rotate-45 rounded-sm" />
      )}
    </div>
  );
};
