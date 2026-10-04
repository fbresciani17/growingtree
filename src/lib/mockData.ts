import { Person, Relationship } from '../types';

export const initialMockPeople: Person[] = [
  {
    id: '11111111-1111-4111-a111-111111111111',
    first_name: 'Giovanni',
    last_name: 'Bresciani',
    birth_date: '1920-04-12',
    birth_place: 'Bergamo, Italia',
    death_date: '1998-11-20',
    death_place: 'Bergamo, Italia',
    notes: 'Capostipite della famiglia Bresciani. Amante della natura, dell\'agricoltura e del legno.',
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: '22222222-2222-4222-a222-222222222222',
    first_name: 'Teresa',
    last_name: 'Vavassori',
    birth_date: '1924-08-25',
    birth_place: 'Bergamo, Italia',
    death_date: '2005-03-14',
    death_place: 'Bergamo, Italia',
    notes: 'Matriarca della famiglia. Cuoca straordinaria, dedita ai figli e ai nipoti.',
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: '33333333-3333-4333-a333-333333333333',
    first_name: 'Giuseppe',
    last_name: 'Bresciani',
    birth_date: '1950-02-18',
    birth_place: 'Bergamo, Italia',
    death_date: null,
    death_place: null,
    notes: 'Primo figlio di Giovanni e Teresa. Ha continuato la tradizione di famiglia.',
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: '44444444-4444-4444-a444-444444444444',
    first_name: 'Maria',
    last_name: 'Bresciani',
    birth_date: '1953-09-04',
    birth_place: 'Bergamo, Italia',
    death_date: null,
    death_place: null,
    notes: 'Seconda figlia di Giovanni e Teresa. Insegnante appassionata.',
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: '55555555-5555-4555-a555-555555555555',
    first_name: 'Elena',
    last_name: 'Rossi',
    birth_date: '1952-11-10',
    birth_place: 'Milano, Italia',
    death_date: null,
    death_place: null,
    notes: 'Coniuge di Giuseppe Bresciani.',
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: '66666666-6666-4666-a666-666666666666',
    first_name: 'Francesco',
    last_name: 'Bresciani',
    birth_date: '1982-06-15',
    birth_place: 'Bergamo, Italia',
    death_date: null,
    death_place: null,
    notes: 'Figlio di Giuseppe ed Elena. Ingegnere del software e ideatore di GrowingTree.',
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  }
];

export const initialMockRelationships: Relationship[] = [
  // Giovanni & Teresa partner
  {
    id: 'rel-1',
    person_id: '11111111-1111-4111-a111-111111111111',
    related_person_id: '22222222-2222-4222-a222-222222222222',
    relationship_type: 'partner',
    created_at: '2024-01-01T10:00:00Z',
  },
  // Giovanni -> Giuseppe (parent)
  {
    id: 'rel-2',
    person_id: '11111111-1111-4111-a111-111111111111',
    related_person_id: '33333333-3333-4333-a333-333333333333',
    relationship_type: 'parent',
    created_at: '2024-01-01T10:00:00Z',
  },
  // Teresa -> Giuseppe (parent)
  {
    id: 'rel-3',
    person_id: '22222222-2222-4222-a222-222222222222',
    related_person_id: '33333333-3333-4333-a333-333333333333',
    relationship_type: 'parent',
    created_at: '2024-01-01T10:00:00Z',
  },
  // Giovanni -> Maria (parent)
  {
    id: 'rel-4',
    person_id: '11111111-1111-4111-a111-111111111111',
    related_person_id: '44444444-4444-4444-a444-444444444444',
    relationship_type: 'parent',
    created_at: '2024-01-01T10:00:00Z',
  },
  // Teresa -> Maria (parent)
  {
    id: 'rel-5',
    person_id: '22222222-2222-4222-a222-222222222222',
    related_person_id: '44444444-4444-4444-a444-444444444444',
    relationship_type: 'parent',
    created_at: '2024-01-01T10:00:00Z',
  },
  // Giuseppe & Elena partner
  {
    id: 'rel-6',
    person_id: '33333333-3333-4333-a333-333333333333',
    related_person_id: '55555555-5555-4555-a555-555555555555',
    relationship_type: 'partner',
    created_at: '2024-01-01T10:00:00Z',
  },
  // Giuseppe -> Francesco (parent)
  {
    id: 'rel-7',
    person_id: '33333333-3333-4333-a333-333333333333',
    related_person_id: '66666666-6666-4666-a666-666666666666',
    relationship_type: 'parent',
    created_at: '2024-01-01T10:00:00Z',
  },
  // Elena -> Francesco (parent)
  {
    id: 'rel-8',
    person_id: '55555555-5555-4555-a555-555555555555',
    related_person_id: '66666666-6666-4666-a666-666666666666',
    relationship_type: 'parent',
    created_at: '2024-01-01T10:00:00Z',
  }
];
