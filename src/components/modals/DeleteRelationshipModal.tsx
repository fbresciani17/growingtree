import React, { useState } from 'react';
import { Person } from '../../types';
import { useFamilyTree } from '../../context/FamilyTreeContext';
import { X, Link2Off, Trash2, Heart, Users, ArrowRight, AlertCircle, Check } from 'lucide-react';

interface DeleteRelationshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: Person;
}

export const DeleteRelationshipModal: React.FC<DeleteRelationshipModalProps> = ({
  isOpen,
  onClose,
  person,
}) => {
  const { relationships, people, deleteRelationship } = useFamilyTree();
  const [error, setError] = useState<string | null>(null);
  const [deletingRelId, setDeletingRelId] = useState<string | null>(null);

  if (!isOpen) return null;

  const peopleMap = new Map(people.map((p) => [p.id, p]));

  // Find all relationships involving this person
  const myRelationships = relationships.filter(
    (r) => r.person_id === person.id || r.related_person_id === person.id
  );

  const handleDelete = async (relId: string) => {
    try {
      setDeletingRelId(relId);
      setError(null);
      await deleteRelationship(relId);
    } catch (err: any) {
      setError(err.message || 'Impossibile eliminare la relazione.');
    } finally {
      setDeletingRelId(null);
    }
  };

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
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mb-3">
            <Link2Off className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Gestione Relazioni
          </span>
          <h2 className="font-serif text-2xl font-bold text-slate-900 mt-1">
            Relazioni collegate a {person.first_name} {person.last_name}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Elimina i collegamenti di parentela senza cancellare le persone dall'albero.
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-3 rounded-xl">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* List of Relationships */}
        {myRelationships.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-sm text-slate-500">Nessuna relazione collegata a questa persona.</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {myRelationships.map((rel) => {
              const otherPersonId = rel.person_id === person.id ? rel.related_person_id : rel.person_id;
              const otherPerson = peopleMap.get(otherPersonId);

              let relationLabel = '';
              let icon = null;

              if (rel.relationship_type === 'partner') {
                relationLabel = 'Coniuge / Partner';
                icon = <Heart className="w-4 h-4 text-rose-500 fill-rose-300" />;
              } else if (rel.relationship_type === 'parent') {
                if (rel.person_id === person.id) {
                  relationLabel = 'Genitore di';
                  icon = <Users className="w-4 h-4 text-family-600" />;
                } else {
                  relationLabel = 'Figlio di';
                  icon = <Users className="w-4 h-4 text-blue-600" />;
                }
              }

              return (
                <div
                  key={rel.id}
                  className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-200">
                      {icon}
                    </div>
                    <div>
                      <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">
                        {relationLabel}
                      </span>
                      <p className="text-sm font-semibold text-slate-800">
                        {otherPerson ? `${otherPerson.first_name} ${otherPerson.last_name}` : 'Persona sconosciuta'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(rel.id)}
                    disabled={deletingRelId === rel.id}
                    title="Elimina relazione"
                    className="p-2.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold transition-all"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
