import React, { useState } from 'react';
import { useFamilyTree } from './context/FamilyTreeContext';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { TreeView } from './components/TreeView';
import { ListView } from './components/ListView';
import { PersonSidePanel } from './components/PersonSidePanel';

// Modals
import { FamilyCodeModal } from './components/modals/FamilyCodeModal';
import { EditPersonModal } from './components/modals/EditPersonModal';
import { AddChildModal } from './components/modals/AddChildModal';
import { AddPartnerModal } from './components/modals/AddPartnerModal';
import { AddParentModal } from './components/modals/AddParentModal';
import { DeleteRelationshipModal } from './components/modals/DeleteRelationshipModal';
import { DeleteConfirmModal } from './components/modals/DeleteConfirmModal';
import { StatsModal } from './components/modals/StatsModal';
import { SupabaseSetupModal } from './components/modals/SupabaseSetupModal';
import { AlertCircle, X, Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  const {
    activeView,
    selectedPersonId,
    getPersonById,
    loading,
    error,
    clearError,
  } = useFamilyTree();

  const { isEditModeUnlocked, openCodeModal } = useAuth();

  // Modal states
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [isEditPersonOpen, setIsEditPersonOpen] = useState(false);
  const [isAddChildOpen, setIsAddChildOpen] = useState(false);
  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);
  const [isAddParentOpen, setIsAddParentOpen] = useState(false);
  const [isDeleteRelOpen, setIsDeleteRelOpen] = useState(false);
  const [isDeletePersonOpen, setIsDeletePersonOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isSetupGuideOpen, setIsSetupGuideOpen] = useState(false);

  const selectedPerson = selectedPersonId ? getPersonById(selectedPersonId) : null;

  return (
    <div className="relative h-screen w-screen flex flex-col overflow-hidden bg-[#FAF8F5]">
      {/* Top Navigation */}
      <Navbar
        onOpenAddPerson={() => {
          if (!isEditModeUnlocked) {
            openCodeModal(() => setIsAddPersonOpen(true));
          } else {
            setIsAddPersonOpen(true);
          }
        }}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenSetupGuide={() => setIsSetupGuideOpen(true)}
      />

      {/* Global Error Banner */}
      {error && (
        <div className="relative z-30 bg-rose-600 text-white px-4 py-2.5 text-xs sm:text-sm font-medium flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2 max-w-4xl">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={clearError}
            className="p-1 hover:bg-rose-700 rounded-lg transition-colors ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Viewport */}
      <main className="relative flex-1 w-full h-full overflow-hidden flex">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-family-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-600">
              Caricamento dell'albero genealogico...
            </p>
          </div>
        ) : (
          <>
            {activeView === 'tree' ? (
              <TreeView
                onOpenAddPerson={() => {
                  if (!isEditModeUnlocked) {
                    openCodeModal(() => setIsAddPersonOpen(true));
                  } else {
                    setIsAddPersonOpen(true);
                  }
                }}
              />
            ) : (
              <ListView
                onOpenAddPerson={() => {
                  if (!isEditModeUnlocked) {
                    openCodeModal(() => setIsAddPersonOpen(true));
                  } else {
                    setIsAddPersonOpen(true);
                  }
                }}
              />
            )}
          </>
        )}

        {/* Side Panel for Person Details */}
        <PersonSidePanel
          onOpenEdit={() => setIsEditPersonOpen(true)}
          onOpenAddChild={() => setIsAddChildOpen(true)}
          onOpenAddPartner={() => setIsAddPartnerOpen(true)}
          onOpenAddParent={() => setIsAddParentOpen(true)}
          onOpenDeleteRel={() => setIsDeleteRelOpen(true)}
          onOpenDeletePerson={() => setIsDeletePersonOpen(true)}
        />
      </main>

      {/* Modals */}
      <FamilyCodeModal />

      {/* Add / Edit Person Modal */}
      <EditPersonModal
        isOpen={isAddPersonOpen}
        onClose={() => setIsAddPersonOpen(false)}
        personToEdit={null}
      />

      {selectedPerson && (
        <>
          <EditPersonModal
            isOpen={isEditPersonOpen}
            onClose={() => setIsEditPersonOpen(false)}
            personToEdit={selectedPerson}
          />

          <AddChildModal
            isOpen={isAddChildOpen}
            onClose={() => setIsAddChildOpen(false)}
            parent={selectedPerson}
          />

          <AddPartnerModal
            isOpen={isAddPartnerOpen}
            onClose={() => setIsAddPartnerOpen(false)}
            person={selectedPerson}
          />

          <AddParentModal
            isOpen={isAddParentOpen}
            onClose={() => setIsAddParentOpen(false)}
            child={selectedPerson}
          />

          <DeleteRelationshipModal
            isOpen={isDeleteRelOpen}
            onClose={() => setIsDeleteRelOpen(false)}
            person={selectedPerson}
          />

          <DeleteConfirmModal
            isOpen={isDeletePersonOpen}
            onClose={() => setIsDeletePersonOpen(false)}
            person={selectedPerson}
          />
        </>
      )}

      {/* Stats Modal */}
      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
      />

      {/* Setup Guide Modal */}
      <SupabaseSetupModal
        isOpen={isSetupGuideOpen}
        onClose={() => setIsSetupGuideOpen(false)}
      />
    </div>
  );
};
