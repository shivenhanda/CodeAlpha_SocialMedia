import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Signup from './auth/Signup';
import Login from './auth/Login';
import Dashboard from './auth/Dashboard';
import Posts from './posts/Posts';
import Users from './users/Users';


import Navbar from './components/Navbar';

const Home = ({ user }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 pt-24">
      <div className="max-w-2xl mx-auto p-8">
        <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          {user ? `Welcome back, ${user.username}!` : 'Welcome to SocialMedia'}
        </h2>
        {user ? (
          <div className="bg-white/70 backdrop-blur-md rounded-3xl p-12 shadow-2xl">
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              Your social media app is fully functional! Create posts, follow users, like & comment.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <Link to="/posts" className="group bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-2xl text-center hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-2xl font-bold mb-2 group-hover:translate-y-1 transition-transform">Start Posting</h3>
                <p className="opacity-90">Share your thoughts with the world</p>
              </Link>
              <Link to="/users" className="group bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-8 rounded-2xl text-center hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-2xl font-bold mb-2 group-hover:translate-y-1 transition-transform">Find People</h3>
                <p className="opacity-90">Connect and follow others</p>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white/70 backdrop-blur-md rounded-3xl p-12 shadow-2xl text-center">
            <div className="text-6xl mb-8">🚀</div>
            <h3 className="text-3xl font-bold text-gray-800 mb-6">Ready to join?</h3>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Create your profile and start sharing moments with friends and followers. Full-featured social experience awaits!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300">
                Login
              </Link>
              <Link to="/signup" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-10 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


const ProtectedRoute = ({ children }) => {
  const { user, token, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user && token ? children : <Navigate to="/login" replace />;
};

function AppContent() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/posts" element={
          <ProtectedRoute>
            <Posts name={user?.username} />
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

