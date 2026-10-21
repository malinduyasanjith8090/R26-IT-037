import { createContext, useContext, useEffect, useState } from 'react';
import { logoutParent } from '../services/apiService';
import { storage } from '../utils/storage';

const ChildContext = createContext();

export function ChildProvider({ children }) {
  const [activeChild, setActiveChild] = useState(null);
  const [cognitiveState, setCognitiveState] = useState(null);
  const [parentProfile, setParentProfile] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [childrenList, setChildrenList] = useState([]);

  // Important:
  // Prevent navigation decisions before saved auth state is restored.
  const [isHydrated, setIsHydrated] = useState(false);

  // Rehydrate persisted app state
  useEffect(() => {
    async function restoreState() {
      try {
        const [
          storedChild,
          storedToken,
          storedParent,
        ] = await Promise.all([
          storage.get('active_child'),
          storage.get('auth_token'),
          storage.get('parent_profile'),
        ]);

        if (storedChild) {
          setActiveChild(storedChild);
        }

        if (storedToken) {
          setAuthToken(storedToken);
        }

        if (storedParent) {
          setParentProfile(storedParent);
        }
      } catch (error) {
        console.warn(
          'Failed to restore app state:',
          error
        );
      } finally {
        setIsHydrated(true);
      }
    }

    restoreState();
  }, []);

  const selectChild = async (child) => {
    setActiveChild(child);
    await storage.set('active_child', child);
  };

  const setParent = async (parent, token) => {
    setParentProfile(parent);
    setAuthToken(token);

    await storage.set('parent_profile', parent);
    await storage.set('auth_token', token);
  };

  const logout = async () => {
    try {
      setActiveChild(null);
      setParentProfile(null);
      setAuthToken(null);
      setChildrenList([]);
      setCognitiveState(null);

      await storage.remove('active_child');
      await storage.remove('parent_profile');
      await storage.remove('auth_token');

      await logoutParent();
    } catch (error) {
      console.log('[ChildContext] Logout failed:', error);
    }
  };

  const updateCognitiveState = (state) => {
    setCognitiveState(state);
  };

  const setChildren = (children) => {
    setChildrenList(children || []);
  };

  return (
    <ChildContext.Provider
      value={{
        activeChild,
        selectChild,

        parentProfile,
        setParent,

        authToken,

        childrenList,
        setChildren,

        cognitiveState,
        updateCognitiveState,

        logout,

        // Used by RootLayout to wait until
        // saved login state has been restored.
        isHydrated,
      }}
    >
      {children}
    </ChildContext.Provider>
  );
}

export const useChild = () => useContext(ChildContext);