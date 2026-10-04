import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Person, Relationship, PersonFormData, RelationshipType } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { initialMockPeople, initialMockRelationships } from '../lib/mockData';

interface AddPersonPayload {
  personData: PersonFormData;
  parentIds?: string[];
  partnerId?: string;
  childIds?: string[];
}

interface FamilyTreeContextType {
  people: Person[];
  relationships: Relationship[];
  loading: boolean;
  error: string | null;
  selectedPersonId: string | null;
  setSelectedPersonId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeView: 'tree' | 'list';
  setActiveView: (view: 'tree' | 'list') => void;
  isDemoMode: boolean;
  
  // CRUD actions
  fetchData: () => Promise<void>;
  addPerson: (payload: AddPersonPayload) => Promise<Person | null>;
  updatePerson: (id: string, personData: Partial<PersonFormData>) => Promise<boolean>;
  deletePerson: (id: string) => Promise<boolean>;
  addRelationship: (personId: string, relatedPersonId: string, type: RelationshipType) => Promise<boolean>;
  deleteRelationship: (id: string) => Promise<boolean>;
  
  // Relational queries
  getParents: (personId: string) => Person[];
  getPartners: (personId: string) => Person[];
  getChildren: (personId: string) => Person[];
  getPersonById: (personId: string) => Person | undefined;
  clearError: () => void;
}

const FamilyTreeContext = createContext<FamilyTreeContextType | undefined>(undefined);

export const FamilyTreeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [people, setPeople] = useState<Person[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeView, setActiveView] = useState<'tree' | 'list'>('tree');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(!isSupabaseConfigured);

  // Clear error
  const clearError = () => setError(null);

  // Fetch all people and relationships
  const fetchData = useCallback(async () => {
    if (!isSupabaseConfigured) {
      console.warn('Supabase non è ancora configurato. Utilizzo dei dati dimostrativi.');
      setPeople(initialMockPeople);
      setRelationships(initialMockRelationships);
      setIsDemoMode(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch People
      const { data: peopleData, error: peopleError } = await supabase
        .from('people')
        .select('*')
        .order('created_at', { ascending: true });

      if (peopleError) throw peopleError;

      // Fetch Relationships
      const { data: relData, error: relError } = await supabase
        .from('relationships')
        .select('*')
        .order('created_at', { ascending: true });

      if (relError) throw relError;

      setPeople(peopleData || []);
      setRelationships(relData || []);
      setIsDemoMode(false);
    } catch (err: any) {
      console.error('Errore durante il caricamento dei dati da Supabase:', err);
      setError('Impossibile caricare i dati dal server Supabase. Mostro i dati salvati in locale/dimostrativi.');
      setPeople(initialMockPeople);
      setRelationships(initialMockRelationships);
      setIsDemoMode(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Set up Supabase Realtime Subscription
  useEffect(() => {
    fetchData();

    if (!isSupabaseConfigured) return;

    // Realtime channel
    const channel = supabase
      .channel('growingtree-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'people' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPeople((prev) => {
              if (prev.some((p) => p.id === payload.new.id)) return prev;
              return [...prev, payload.new as Person];
            });
          } else if (payload.eventType === 'UPDATE') {
            setPeople((prev) =>
              prev.map((p) => (p.id === payload.new.id ? (payload.new as Person) : p))
            );
          } else if (payload.eventType === 'DELETE') {
            setPeople((prev) => prev.filter((p) => p.id === payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'relationships' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setRelationships((prev) => {
              if (prev.some((r) => r.id === payload.new.id)) return prev;
              return [...prev, payload.new as Relationship];
            });
          } else if (payload.eventType === 'UPDATE') {
            setRelationships((prev) =>
              prev.map((r) => (r.id === payload.new.id ? (payload.new as Relationship) : r))
            );
          } else if (payload.eventType === 'DELETE') {
            setRelationships((prev) => prev.filter((r) => r.id === payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  // Relational queries
  const getParents = useCallback(
    (personId: string): Person[] => {
      const parentRelIds = relationships
        .filter((r) => r.relationship_type === 'parent' && r.related_person_id === personId)
        .map((r) => r.person_id);
      return people.filter((p) => parentRelIds.includes(p.id));
    },
    [people, relationships]
  );

  const getPartners = useCallback(
    (personId: string): Person[] => {
      const partnerIds = relationships
        .filter((r) => r.relationship_type === 'partner')
        .map((r) => {
          if (r.person_id === personId) return r.related_person_id;
          if (r.related_person_id === personId) return r.person_id;
          return null;
        })
        .filter((id): id is string => Boolean(id));
      
      const uniquePartnerIds = Array.from(new Set(partnerIds));
      return people.filter((p) => uniquePartnerIds.includes(p.id));
    },
    [people, relationships]
  );

  const getChildren = useCallback(
    (personId: string): Person[] => {
      const childRelIds = relationships
        .filter((r) => r.relationship_type === 'parent' && r.person_id === personId)
        .map((r) => r.related_person_id);
      return people.filter((p) => childRelIds.includes(p.id));
    },
    [people, relationships]
  );

  const getPersonById = useCallback(
    (personId: string): Person | undefined => {
      return people.find((p) => p.id === personId);
    },
    [people]
  );

  // Helper to check if a relationship already exists
  const relationshipExists = (personId: string, relatedPersonId: string, type: RelationshipType): boolean => {
    return relationships.some((r) => {
      if (r.relationship_type !== type) return false;
      if (type === 'parent') {
        return r.person_id === personId && r.related_person_id === relatedPersonId;
      }
      if (type === 'partner') {
        return (
          (r.person_id === personId && r.related_person_id === relatedPersonId) ||
          (r.person_id === relatedPersonId && r.related_person_id === personId)
        );
      }
      return false;
    });
  };

  // Add Person and create associated relationships
  const addPerson = async (payload: AddPersonPayload): Promise<Person | null> => {
    try {
      setError(null);
      const cleanPersonData = {
        first_name: payload.personData.first_name.trim(),
        last_name: payload.personData.last_name.trim(),
        birth_date: payload.personData.birth_date || null,
        birth_place: payload.personData.birth_place ? payload.personData.birth_place.trim() : null,
        death_date: payload.personData.death_date || null,
        death_place: payload.personData.death_place ? payload.personData.death_place.trim() : null,
        notes: payload.personData.notes ? payload.personData.notes.trim() : null,
      };

      if (!cleanPersonData.first_name || !cleanPersonData.last_name) {
        throw new Error('Nome e cognome sono obbligatori.');
      }

      if (isDemoMode || !isSupabaseConfigured) {
        // Mock local creation
        const newPerson: Person = {
          id: crypto.randomUUID ? crypto.randomUUID() : `mock-${Date.now()}`,
          ...cleanPersonData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const newRels: Relationship[] = [];

        // Parent relations (parents -> newPerson)
        if (payload.parentIds && payload.parentIds.length > 0) {
          payload.parentIds.forEach((parentId) => {
            newRels.push({
              id: `rel-${Date.now()}-${Math.random()}`,
              person_id: parentId,
              related_person_id: newPerson.id,
              relationship_type: 'parent',
              created_at: new Date().toISOString(),
            });
          });
        }

        // Partner relation
        if (payload.partnerId) {
          newRels.push({
            id: `rel-${Date.now()}-${Math.random()}`,
            person_id: payload.partnerId,
            related_person_id: newPerson.id,
            relationship_type: 'partner',
            created_at: new Date().toISOString(),
          });
        }

        // Child relations (newPerson -> children)
        if (payload.childIds && payload.childIds.length > 0) {
          payload.childIds.forEach((childId) => {
            newRels.push({
              id: `rel-${Date.now()}-${Math.random()}`,
              person_id: newPerson.id,
              related_person_id: childId,
              relationship_type: 'parent',
              created_at: new Date().toISOString(),
            });
          });
        }

        setPeople((prev) => [...prev, newPerson]);
        setRelationships((prev) => [...prev, ...newRels]);
        return newPerson;
      }

      // Supabase insert
      const { data: createdPerson, error: insertError } = await supabase
        .from('people')
        .insert([cleanPersonData])
        .select()
        .single();

      if (insertError) throw insertError;
      if (!createdPerson) throw new Error('Creazione persona fallita.');

      // Insert relationships
      const relsToInsert: Array<{ person_id: string; related_person_id: string; relationship_type: RelationshipType }> = [];

      if (payload.parentIds && payload.parentIds.length > 0) {
        payload.parentIds.forEach((parentId) => {
          relsToInsert.push({
            person_id: parentId,
            related_person_id: createdPerson.id,
            relationship_type: 'parent',
          });
        });
      }

      if (payload.partnerId) {
        relsToInsert.push({
          person_id: payload.partnerId,
          related_person_id: createdPerson.id,
          relationship_type: 'partner',
        });
      }

      if (payload.childIds && payload.childIds.length > 0) {
        payload.childIds.forEach((childId) => {
          relsToInsert.push({
            person_id: createdPerson.id,
            related_person_id: childId,
            relationship_type: 'parent',
          });
        });
      }

      if (relsToInsert.length > 0) {
        const { data: insertedRels, error: relsError } = await supabase
          .from('relationships')
          .insert(relsToInsert)
          .select();

        if (relsError) throw relsError;
        if (insertedRels) {
          setRelationships((prev) => [...prev, ...insertedRels]);
        }
      }

      setPeople((prev) => [...prev, createdPerson]);
      return createdPerson;
    } catch (err: any) {
      console.error('Errore durante la creazione della persona:', err);
      setError(err.message || 'Errore durante il salvataggio della persona.');
      return null;
    }
  };

  // Update Person
  const updatePerson = async (id: string, personData: Partial<PersonFormData>): Promise<boolean> => {
    try {
      setError(null);
      const cleanUpdate: Partial<Person> = {};
      if (personData.first_name !== undefined) cleanUpdate.first_name = personData.first_name.trim();
      if (personData.last_name !== undefined) cleanUpdate.last_name = personData.last_name.trim();
      if (personData.birth_date !== undefined) cleanUpdate.birth_date = personData.birth_date || null;
      if (personData.birth_place !== undefined) cleanUpdate.birth_place = personData.birth_place ? personData.birth_place.trim() : null;
      if (personData.death_date !== undefined) cleanUpdate.death_date = personData.death_date || null;
      if (personData.death_place !== undefined) cleanUpdate.death_place = personData.death_place ? personData.death_place.trim() : null;
      if (personData.notes !== undefined) cleanUpdate.notes = personData.notes ? personData.notes.trim() : null;
      cleanUpdate.updated_at = new Date().toISOString();

      if (isDemoMode || !isSupabaseConfigured) {
        setPeople((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...cleanUpdate } : p))
        );
        return true;
      }

      const { error: updateError } = await supabase
        .from('people')
        .update(cleanUpdate)
        .eq('id', id);

      if (updateError) throw updateError;

      setPeople((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...cleanUpdate } : p))
      );
      return true;
    } catch (err: any) {
      console.error('Errore durante l\'aggiornamento:', err);
      setError(err.message || 'Errore durante l\'aggiornamento dei dati.');
      return false;
    }
  };

  // Delete Person and associated relationships
  const deletePerson = async (id: string): Promise<boolean> => {
    try {
      setError(null);

      if (isDemoMode || !isSupabaseConfigured) {
        setRelationships((prev) =>
          prev.filter((r) => r.person_id !== id && r.related_person_id !== id)
        );
        setPeople((prev) => prev.filter((p) => p.id !== id));
        if (selectedPersonId === id) {
          setSelectedPersonId(null);
        }
        return true;
      }

      // First delete all connected relationships from Supabase
      const { error: relDeleteError } = await supabase
        .from('relationships')
        .delete()
        .or(`person_id.eq.${id},related_person_id.eq.${id}`);

      if (relDeleteError) throw relDeleteError;

      // Delete person from Supabase
      const { error: personDeleteError } = await supabase
        .from('people')
        .delete()
        .eq('id', id);

      if (personDeleteError) throw personDeleteError;

      setRelationships((prev) =>
        prev.filter((r) => r.person_id !== id && r.related_person_id !== id)
      );
      setPeople((prev) => prev.filter((p) => p.id !== id));

      if (selectedPersonId === id) {
        setSelectedPersonId(null);
      }
      return true;
    } catch (err: any) {
      console.error('Errore durante l\'eliminazione:', err);
      setError(err.message || 'Errore durante l\'eliminazione della persona.');
      return false;
    }
  };

  // Add individual relationship
  const addRelationship = async (
    personId: string,
    relatedPersonId: string,
    type: RelationshipType
  ): Promise<boolean> => {
    try {
      setError(null);

      if (personId === relatedPersonId) {
        throw new Error('Una persona non può avere una relazione con se stessa.');
      }

      if (relationshipExists(personId, relatedPersonId, type)) {
        throw new Error('Questa relazione esiste già.');
      }

      if (isDemoMode || !isSupabaseConfigured) {
        const newRel: Relationship = {
          id: `rel-${Date.now()}-${Math.random()}`,
          person_id: personId,
          related_person_id: relatedPersonId,
          relationship_type: type,
          created_at: new Date().toISOString(),
        };
        setRelationships((prev) => [...prev, newRel]);
        return true;
      }

      const { data: insertedRel, error: relError } = await supabase
        .from('relationships')
        .insert([
          {
            person_id: personId,
            related_person_id: relatedPersonId,
            relationship_type: type,
          },
        ])
        .select()
        .single();

      if (relError) throw relError;
      if (insertedRel) {
        setRelationships((prev) => [...prev, insertedRel]);
      }
      return true;
    } catch (err: any) {
      console.error('Errore durante l\'aggiunta della relazione:', err);
      setError(err.message || 'Errore durante la creazione della relazione.');
      return false;
    }
  };

  // Delete Relationship
  const deleteRelationship = async (id: string): Promise<boolean> => {
    try {
      setError(null);

      if (isDemoMode || !isSupabaseConfigured) {
        setRelationships((prev) => prev.filter((r) => r.id !== id));
        return true;
      }

      const { error: deleteError } = await supabase
        .from('relationships')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setRelationships((prev) => prev.filter((r) => r.id !== id));
      return true;
    } catch (err: any) {
      console.error('Errore durante l\'eliminazione della relazione:', err);
      setError(err.message || 'Errore durante l\'eliminazione della relazione.');
      return false;
    }
  };

  return (
    <FamilyTreeContext.Provider
      value={{
        people,
        relationships,
        loading,
        error,
        selectedPersonId,
        setSelectedPersonId,
        searchQuery,
        setSearchQuery,
        activeView,
        setActiveView,
        isDemoMode,
        fetchData,
        addPerson,
        updatePerson,
        deletePerson,
        addRelationship,
        deleteRelationship,
        getParents,
        getPartners,
        getChildren,
        getPersonById,
        clearError,
      }}
    >
      {children}
    </FamilyTreeContext.Provider>
  );
};

export const useFamilyTree = (): FamilyTreeContextType => {
  const context = useContext(FamilyTreeContext);
  if (!context) {
    throw new Error('useFamilyTree deve essere utilizzato all\'interno di un FamilyTreeProvider');
  }
  return context;
};
