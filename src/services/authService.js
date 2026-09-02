// EvolveVita Authentication & Session Service

const USER_KEY = 'evolvevita_user';
const TOKEN_KEY = 'evolvevita_token';
const AUTH_USER_KEY = 'evolvevita_auth_user';
const AUTH_TOKEN_KEY = 'evolvevita_auth_token';

const persistUserAndToken = (user, token) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

export const authService = {
  login: async (email, password) => {
    const cleanEmail = email.trim();
    const displayName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    // Check if existing user info exists in storage
    const existing = authService.getCurrentUser();
    const user = {
      uid: existing?.uid || `user-${Date.now()}`,
      email: cleanEmail,
      name: existing?.name || displayName,
      displayName: existing?.displayName || displayName,
      role: existing?.role || null,
      avatar: existing?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanEmail)}`
    };

    const token = `token-${Date.now()}-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '')}`;
    persistUserAndToken(user, token);
    return user;
  },

  signup: async (fullName, email, password) => {
    const cleanEmail = email.trim();
    const cleanName = fullName.trim();
    const user = {
      uid: `user-${Date.now()}`,
      email: cleanEmail,
      name: cleanName,
      displayName: cleanName,
      role: null,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName || cleanEmail)}`
    };
    const token = `token-${Date.now()}-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '')}`;
    persistUserAndToken(user, token);
    return user;
  },

  chooseRole: (role) => {
    const userJson = localStorage.getItem(AUTH_USER_KEY) || localStorage.getItem(USER_KEY);
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        const formattedRole = role.toLowerCase();
        user.role = formattedRole;
        if (!user.title) {
          user.title = formattedRole === 'recruiter' ? 'Talent Acquisition' : 'Candidate';
        }
        const token = localStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || `token-${Date.now()}`;
        persistUserAndToken(user, token);
        return user;
      } catch (err) {
        console.error('Error setting role in authService:', err);
      }
    }
    return null;
  },

  logout: () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem('evolvevita_candidate_resume');
  },

  getCurrentUser: () => {
    const userJson = localStorage.getItem(AUTH_USER_KEY) || localStorage.getItem(USER_KEY);
    if (!userJson) return null;
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  },

  isAuthenticated: () => {
    return !!(localStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem(TOKEN_KEY));
  }
};

export default authService;
