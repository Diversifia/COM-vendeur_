
import React, { useState } from 'react';
import { User } from '../types';
import { Loader2 } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate short delay for UX
    setTimeout(() => {
        // 1. Check for Admin (Hardcoded)
        if (username.toLowerCase() === 'admin' && password === 'admin123') {
            onLogin({ username: 'admin', role: 'admin' });
            setIsLoading(false);
            return;
        }

        // 2. Check LocalStorage
        let storedUsers = localStorage.getItem('diversifia_users');
        let users: User[] = storedUsers ? JSON.parse(storedUsers) : [];

        const foundUser = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
        
        if (foundUser) {
            onLogin(foundUser);
        } else {
            setError('Identifiant ou mot de passe incorrect.');
        }
        setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Brand Header */}
        <div className="bg-black p-8 text-center">
          <div className="bg-white w-16 h-16 mx-auto rounded-lg flex items-center justify-center mb-4">
             <img 
                src="https://upload.wikimedia.org/wikipedia/commons/c/c8/Orange_logo.svg" 
                alt="Orange Logo" 
                className="w-12 h-12"
              />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wider">DIVERSIFIA</h1>
          <p className="text-gray-400 text-sm mt-1">Portail Force de Vente</p>
        </div>

        {/* Login Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Identifiant</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#ff7900] focus:border-[#ff7900] transition-colors"
                placeholder="Votre identifiant"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#ff7900] focus:border-[#ff7900] transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#ff7900] hover:bg-[#e66e00] disabled:bg-orange-300 text-white font-bold py-3 rounded-lg transition-colors shadow-md flex items-center justify-center"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Se Connecter'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
             <p className="text-xs text-gray-400">
               En cas de problème d'accès, contactez l'administrateur RH.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
