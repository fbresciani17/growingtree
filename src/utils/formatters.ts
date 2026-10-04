export const UNKNOWN_DEATH_DATE = '0001-01-01';

export function isPersonDeceased(
  person: { death_date?: string | null; death_place?: string | null } | null | undefined
): boolean {
  if (!person) return false;
  if (person.death_date && person.death_date.trim() !== '') return true;
  if (person.death_place && person.death_place.trim() !== '') return true;
  return false;
}

export function isExactDeathDateKnown(dateString: string | null | undefined): boolean {
  if (!dateString) return false;
  if (dateString === UNKNOWN_DEATH_DATE || dateString.startsWith('0001')) return false;
  return true;
}

export function formatItalianDate(dateString: string | null | undefined): string {
  if (!dateString || !isExactDeathDateKnown(dateString)) return '';
  try {
    const [year, month, day] = dateString.split('-');
    if (!year || !month || !day) return dateString;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return new Intl.DateTimeFormat('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getYearOnly(dateString: string | null | undefined): string {
  if (!dateString || !isExactDeathDateKnown(dateString)) return '';
  const match = dateString.match(/^\d{4}/);
  return match ? match[0] : '';
}

export function calculateAge(
  birthDate: string | null | undefined,
  deathDate: string | null | undefined
): number | null {
  if (!birthDate) return null;
  try {
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return null;

    const isDeceased = Boolean(deathDate);
    const hasKnownDeathDate = isExactDeathDateKnown(deathDate);

    // If deceased with unknown death date, we cannot accurately calculate exact age
    if (isDeceased && !hasKnownDeathDate) {
      return null;
    }

    const end = (isDeceased && deathDate) ? new Date(deathDate) : new Date();
    if (isNaN(end.getTime())) return null;
    
    let age = end.getFullYear() - birth.getFullYear();
    const m = end.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) {
      age--;
    }
    return age >= 0 ? age : null;
  } catch {
    return null;
  }
}

export function getLifespanLabel(
  birthDate: string | null | undefined,
  deathDate: string | null | undefined
): string {
  const isDeceased = isPersonDeceased({ death_date: deathDate });
  const birthYear = getYearOnly(birthDate);
  const deathYear = getYearOnly(deathDate);
  
  if (isDeceased) {
    if (birthYear && deathYear) {
      const age = calculateAge(birthDate, deathDate);
      return `${birthYear} – ${deathYear}${age !== null ? ` (${age} anni)` : ''}`;
    }
    if (birthYear && !deathYear) {
      return `Nato nel ${birthYear} (Deceduto)`;
    }
    if (!birthYear && deathYear) {
      return `Deceduto nel ${deathYear}`;
    }
    return 'In memoria (Deceduto)';
  }

  // Living person
  if (birthYear) {
    const age = calculateAge(birthDate, null);
    return `Nato nel ${birthYear}${age !== null ? ` (${age} anni)` : ''}`;
  }
  
  return 'Vivente';
}

export function normalizeSearch(text: string): string {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}
