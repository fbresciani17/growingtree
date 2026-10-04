export interface Person {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string | null;
  birth_place: string | null;
  death_date: string | null;
  death_place: string | null;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
}

export type RelationshipType = 'parent' | 'partner';

export interface Relationship {
  id: string;
  person_id: string;
  related_person_id: string;
  relationship_type: RelationshipType;
  created_at?: string;
}

export interface PersonFormData {
  first_name: string;
  last_name: string;
  birth_date: string;
  birth_place: string;
  death_date: string;
  death_place: string;
  notes: string;
}

export interface TreePersonNode {
  person: Person;
  partners: Person[];
  children: TreePersonNode[];
  level: number;
  x: number;
  y: number;
  width: number;
  height: number;
}
