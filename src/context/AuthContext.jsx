import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  googleProvider, 
  isFirebaseConfigured, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from '../lib/firebase';
import { apiFetch } from '../services/api';

const AuthContext = createContext(null);

const LOCAL_STORAGE_USER_KEY = 'evolvevita_auth_user';
const LOCAL_STORAGE_TOKEN_KEY = 'evolvevita_auth_token';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync profile with backend SQLite database
  const syncBackendProfile = async (authUser, token, overrideRole = null) => {
    try {
      const response = await apiFetch('/api/users/profile', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          firebase_uid: authUser.uid,
          email: authUser.email,
          full_name: authUser.displayName || authUser.name || authUser.email.split('@')[0],
          avatar: authUser.photoURL || authUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authUser.email)}`,
          role: overrideRole || authUser.role || null
        })
      });

      setUserProfile(response);
      if (response.role) {
        setRole(response.role);
      }
      return response;
    } catch (err) {
      console.warn('[AuthContext] Backend profile sync note:', err.message || err);
      const fallbackProfile = {
        firebase_uid: authUser.uid,
        email: authUser.email,
        full_name: authUser.displayName || authUser.name || authUser.email.split('@')[0],
        avatar: authUser.photoURL || authUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authUser.email)}`,
        role: overrideRole || authUser.role || null
      };
      setUserProfile(fallbackProfile);
      if (fallbackProfile.role) {
        setRole(fallbackProfile.role);
      }
      return fallbackProfile;
    }
  };

  // Listen to Firebase auth state or retrieve from localStorage
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const token = await firebaseUser.getIdToken();
            localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, token);
            const userObj = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              name: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              token: token
            };
            setCurrentUser(userObj);
            localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userObj));
            await syncBackendProfile(userObj, token);
          } catch (e) {
            console.error('[Auth Error] Failed fetching user token:', e);
          }
        } else {
          setCurrentUser(null);
          setUserProfile(null);
          setRole(null);
          localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
          localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // Local authentication state from localStorage
      const cachedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      const cachedToken = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
      if (cachedUser && cachedToken) {
        try {
          const parsed = JSON.parse(cachedUser);
          setCurrentUser(parsed);
          setRole(parsed.role || null);
          syncBackendProfile(parsed, cachedToken, parsed.role);
        } catch (err) {
          console.error('[Auth Error] Cached user parse failed:', err);
        }
      }
      setLoading(false);
    }
  }, []);

  // 1. Google Sign-In (Honest handling)
  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      throw new Error('Google Sign-In is not configured. Please add your Firebase configuration to the .env file, or sign up / log in with email and password.');
    }

    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, token);
      const userObj = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        name: result.user.displayName,
        photoURL: result.user.photoURL,
        avatar: result.user.photoURL,
        token: token
      };
      setCurrentUser(userObj);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userObj));
      const profile = await syncBackendProfile(userObj, token);
      setLoading(false);
      return { user: userObj, profile, role: profile.role };
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // 2. Email Sign-In
  const loginWithEmail = async (email, password) => {
    setLoading(true);
    const cleanEmail = email.trim();
    try {
      if (isFirebaseConfigured && auth) {
        const result = await signInWithEmailAndPassword(auth, cleanEmail, password);
        const token = await result.user.getIdToken();
        localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, token);
        const userObj = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          name: result.user.displayName,
          photoURL: result.user.photoURL,
          avatar: result.user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(result.user.email)}`,
          token: token
        };
        setCurrentUser(userObj);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userObj));
        const profile = await syncBackendProfile(userObj, token);
        setLoading(false);
        return { user: userObj, profile, role: profile.role };
      } else {
        // Direct credentials sign-in for workspace
        const nameDerived = cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const devUid = `usr-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
        const devToken = `token-${Date.now()}-${devUid}`;
        
        // Check if there's saved user data in localStorage
        const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
        let existingRole = null;
        let existingName = nameDerived;
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.email === cleanEmail) {
              existingRole = parsed.role;
              existingName = parsed.displayName || parsed.name || nameDerived;
            }
          } catch {}
        }

        const userObj = {
          uid: devUid,
          email: cleanEmail,
          displayName: existingName,
          name: existingName,
          photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanEmail)}`,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanEmail)}`,
          role: existingRole,
          token: devToken
        };

        localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, userObj.token);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userObj));
        setCurrentUser(userObj);
        const profile = await syncBackendProfile(userObj, userObj.token, existingRole);
        setLoading(false);
        return { user: userObj, profile, role: profile.role || existingRole };
      }
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // 3. Email Sign-Up
  const signupWithEmail = async (email, password, fullName) => {
    setLoading(true);
    const cleanEmail = email.trim();
    const cleanName = fullName.trim();
    try {
      if (isFirebaseConfigured && auth) {
        const result = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`;
        await updateProfile(result.user, {
          displayName: cleanName,
          photoURL: avatarUrl
        });
        const token = await result.user.getIdToken();
        localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, token);
        const userObj = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: cleanName,
          name: cleanName,
          photoURL: avatarUrl,
          avatar: avatarUrl,
          token: token
        };
        setCurrentUser(userObj);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userObj));
        const profile = await syncBackendProfile(userObj, token);
        setLoading(false);
        return { user: userObj, profile, role: null };
      } else {
        const devUid = `usr-${Date.now()}`;
        const devToken = `token-${Date.now()}-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '')}`;
        const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName || cleanEmail)}`;
        const userObj = {
          uid: devUid,
          email: cleanEmail,
          displayName: cleanName,
          name: cleanName,
          photoURL: avatarUrl,
          avatar: avatarUrl,
          role: null,
          token: devToken
        };
        localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, userObj.token);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userObj));
        setCurrentUser(userObj);
        const profile = await syncBackendProfile(userObj, userObj.token);
        setLoading(false);
        return { user: userObj, profile, role: null };
      }
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // 4. Update Role Permanently
  const updateRole = async (selectedRole) => {
    const formattedRole = selectedRole.toLowerCase();
    try {
      const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY) || 'auth-token';
      const response = await apiFetch('/api/users/role', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          firebase_uid: currentUser ? currentUser.uid : null,
          role: formattedRole
        })
      });

      setUserProfile(response);
      setRole(formattedRole);

      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          role: formattedRole,
          displayName: response.full_name || currentUser.displayName,
          name: response.full_name || currentUser.name
        };
        setCurrentUser(updatedUser);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updatedUser));
      }

      return response;
    } catch (err) {
      console.warn('[AuthContext] Setting role via backend failed, applying locally:', err);
      setRole(formattedRole);
      if (currentUser) {
        const updatedUser = { ...currentUser, role: formattedRole };
        setCurrentUser(updatedUser);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updatedUser));
      }
      return { role: formattedRole };
    }
  };

  // 5. Sign Out
  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    setCurrentUser(null);
    setUserProfile(null);
    setRole(null);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
  };

  // 6. Refresh User Profile
  const refreshUserProfile = async () => {
    const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
    if (!token) return null;
    try {
      const res = await apiFetch('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserProfile(res);
      if (res.role) setRole(res.role);
      return res;
    } catch (err) {
      console.warn('[AuthContext] Refresh profile failed:', err);
      return null;
    }
  };

  const value = {
    currentUser,
    userProfile,
    role,
    loading,
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    updateRole,
    logout,
    refreshUserProfile,
    isAuthenticated: Boolean(currentUser)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
