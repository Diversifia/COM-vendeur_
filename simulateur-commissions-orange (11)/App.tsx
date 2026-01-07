
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import LoginScreen from './components/LoginScreen';
import { User } from './types';
import { LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  // Optional: Persist login session simple check
  useEffect(() => {
    const session = sessionStorage.getItem('diversifia_session');
    if (session) {
      setUser(JSON.parse(session));
    }
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    sessionStorage.setItem('diversifia_session', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem('diversifia_session');
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - Orange Branding */}
      <header className="bg-black text-white shadow-md sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Logo Container */}
            <div className="bg-white p-0.5 rounded-sm flex-shrink-0">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/c/c8/Orange_logo.svg" 
                alt="Orange Logo" 
                className="w-10 h-10"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight uppercase">DIVERSIFIA</h1>
              <p className="text-xs text-gray-400">Simulateur Commissions • Force de Vente</p>
            </div>
          </div>
          
          {/* User Info & Logout */}
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{user.role === 'admin' ? 'Administrateur' : user.associatedAgentName}</p>
              <p className="text-xs text-gray-500 uppercase">{user.role}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors text-gray-300"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow bg-gray-50">
        <Dashboard currentUser={user} />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} DIVERSIFIA. Basé sur la grille de commissionnement standard.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
