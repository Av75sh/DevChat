import React, { useState } from 'react';
import { apiCall } from './api';

const AuthForm = ({ setUser, setShowAuth }) => {
  const [authMode, setAuthMode] = useState('login');
  const [authData, setAuthData] = useState({ username: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const handleAuth = async () => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
      const res = await apiCall(endpoint, 'POST', authData);
      setUser(res.data.user);
      setShowAuth(false);
    } catch (e) {
      setAuthError(e.message);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-xl shadow-xl w-full max-w-sm">
        <h1 className="text-white text-2xl mb-4 font-semibold text-center">DevChat</h1>
        {authError && <p className="text-red-400 text-sm mb-2 text-center">{authError}</p>}
        {authMode === 'register' && (
          <input type="text" placeholder="Username" className="mb-3 w-full p-3 rounded bg-gray-700 text-white" value={authData.username} onChange={e => setAuthData({ ...authData, username: e.target.value })} />
        )}
        <input type="email" placeholder="Email" className="mb-3 w-full p-3 rounded bg-gray-700 text-white" value={authData.email} onChange={e => setAuthData({ ...authData, email: e.target.value })} />
        <input type="password" placeholder="Password" className="mb-4 w-full p-3 rounded bg-gray-700 text-white" value={authData.password} onChange={e => setAuthData({ ...authData, password: e.target.value })} />
        <button onClick={handleAuth} className="w-full bg-blue-600 hover:bg-blue-700 transition p-3 text-white rounded font-medium mb-2">{authMode === 'login' ? 'Login' : 'Register'}</button>
        <p className="text-center text-sm text-gray-300">
          {authMode === 'login' ? 'New user?' : 'Have an account?'}{' '}
          <button className="text-blue-400 hover:underline" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
            {authMode === 'login' ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
