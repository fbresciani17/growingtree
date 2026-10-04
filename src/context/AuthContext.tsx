import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isEditModeUnlocked: boolean;
  unlockEditMode: (code: string) => boolean;
  lockEditMode: () => void;
  showCodeModal: boolean;
  openCodeModal: (onSuccessCallback?: () => void) => void;
  closeCodeModal: () => void;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'growingtree_edit_mode_unlocked';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEditModeUnlocked, setIsEditModeUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [showCodeModal, setShowCodeModal] = useState<boolean>(false);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const expectedCode = (import.meta.env.VITE_FAMILY_CODE || '1234').trim();

  const unlockEditMode = (inputCode: string): boolean => {
    if (!inputCode) {
      setAuthError('Inserisci il codice famiglia per continuare.');
      return false;
    }

    if (inputCode.trim() === expectedCode) {
      setIsEditModeUnlocked(true);
      try {
        sessionStorage.setItem(STORAGE_KEY, 'true');
      } catch (e) {
        console.error('Impossibile salvare lo stato in sessionStorage', e);
      }
      setAuthError(null);
      setShowCodeModal(false);
      if (pendingCallback) {
        pendingCallback();
        setPendingCallback(null);
      }
      return true;
    } else {
      setAuthError('Codice famiglia non corretto. Riprova.');
      return false;
    }
  };

  const lockEditMode = () => {
    setIsEditModeUnlocked(false);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  const openCodeModal = (onSuccessCallback?: () => void) => {
    if (isEditModeUnlocked) {
      if (onSuccessCallback) onSuccessCallback();
      return;
    }
    setAuthError(null);
    if (onSuccessCallback) {
      setPendingCallback(() => onSuccessCallback);
    }
    setShowCodeModal(true);
  };

  const closeCodeModal = () => {
    setShowCodeModal(false);
    setPendingCallback(null);
    setAuthError(null);
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isEditModeUnlocked,
        unlockEditMode,
        lockEditMode,
        showCodeModal,
        openCodeModal,
        closeCodeModal,
        authError,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve essere utilizzato all\'interno di un AuthProvider');
  }
  return context;
};
