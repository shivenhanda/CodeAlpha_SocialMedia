import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);

  const loadProfile = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:8000/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setProfile(data.profile);
    } catch (err) {
      console.error(err);
    }
  };

  const loadFeed = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:8000/api/feed', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setPosts(data.posts || []);
      else setPosts([]);
    } catch (err) {
      console.error(err);
      setPosts([]);
    }
  };

  const refreshFeed = async () => {
    if (!token) return;

    try {
      const res = await fetch("http://localhost:8000/api/feed", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (data.success) {
        setPosts(prev => {
          const same =
            JSON.stringify(prev) === JSON.stringify(data.posts || []);
          return same ? prev : data.posts || [];
        });
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.error(err);
      setPosts([]);
    }
  };

  const loadUsers = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:8000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setUsers(data.users || []);
      else setUsers([]);
    } catch (err) {
      console.error(err);
      setUsers([]);
    }
  };

  const followUser = async (targetId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/user/follow/${targetId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
        loadUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const unfollowUser = async (targetId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/user/unfollow/${targetId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
        loadUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isFollowing = (targetId) => {
    return profile?.following?.some(f => (f._id || f).toString() === targetId.toString());
  };

  const login = (newUser, newToken) => {
    setUser(newUser);
    setToken(newToken);
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    setToken(null);
    setPosts([]);
    setUsers([]);
  };

  const updateProfile = async (updates) => {
    if (!token) return { success: false };
    try {
      const res = await fetch('http://localhost:8000/api/profile', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.success) setProfile(data.profile);
      return data;
    } catch (err) {
      return { success: false };
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedProfile = localStorage.getItem('profile');

    setLoading(false);
  }, []);

  useEffect(() => {
    if (!token) return;

    let mounted = true;

    const init = async () => {
      await Promise.all([
        loadProfile?.(),
        loadFeed?.(),
        loadUsers?.()
      ]);
    };

    init();

    return () => {
      mounted = false;
    };
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    if (profile) localStorage.setItem('profile', JSON.stringify(profile));
  }, [token, user, profile]);

  const value = {
    user,
    profile,
    token,
    loading,
    posts,
    users,
    login,
    logout,
    loadProfile,
    loadFeed,
    refreshFeed,
    loadUsers,
    followUser,
    unfollowUser,
    updateProfile,
    isFollowing
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};