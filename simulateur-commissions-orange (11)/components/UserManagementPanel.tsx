
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { UserPlus, Trash2, Key, Loader2 } from 'lucide-react';

interface UserManagementPanelProps {
  currentAgents: string[];
  onSaveUsers: (users: User[]) => void;
}

const UserManagementPanel: React.FC<UserManagementPanelProps> = ({ currentAgents, onSaveUsers }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedAgent, setSelectedAgent] = useState(currentAgents.length > 0 ? currentAgents[0] : '');
  const [newPassword, setNewPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const resp = await fetch('/api/getData?key=diversifia_users');
      if (resp.ok) {
        const data = await resp.json();
        if (data) setUsers(data);
      }
    } catch (e) {
      const stored = localStorage.getItem('diversifia_users');
      if (stored) setUsers(JSON.parse(stored));
    }
    setIsLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const saveUsers = async (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    localStorage.setItem('diversifia_users', JSON.stringify(updatedUsers));
    try {
      await fetch('/api/saveData', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'diversifia_users', value: updatedUsers }),
      });
      onSaveUsers(updatedUsers);
    } catch (e) {
      console.error("Failed to sync users to cloud");
    }
  };

  const handleCreateUser = () => {
    if (!newUsername || !newPassword) return alert("Remplissez tous les champs.");
    if (users.some(u => u.username === newUsername)) return alert("Identifiant déjà pris.");
    
    let updatedUsers = [...users];
    if (users.some(u => u.associatedAgentName === selectedAgent)) {
        if(!confirm(`Remplacer l'accès existant pour ${selectedAgent} ?`)) return;
        updatedUsers = users.filter(u => u.associatedAgentName !== selectedAgent);
    }
    
    const newUser: User = { username: newUsername, password: newPassword, role: 'agent', associatedAgentName: selectedAgent };
    updatedUsers.push(newUser);
    saveUsers(updatedUsers);
    setNewUsername('');
    setNewPassword('');
  };

  const handleDeleteUser = (username: string) => {
    if(confirm("Supprimer cet accès ?")) {
      saveUsers(users.filter(u => u.username !== username));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="flex items-center space-x-2 mb-8">
          <Key className="w-5 h-5 text-[#ff7900]" />
          <h3 className="font-black text-slate-900 uppercase tracking-tighter text-xl">Nouveaux Accès Vendeur</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-2">Agent</label>
            <select className="w-full rounded-2xl border-slate-100 bg-slate-50 py-4 px-6 font-bold focus:ring-[#ff7900]" value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)}>
              {currentAgents.map(agent => <option key={agent} value={agent}>{agent}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-2">Identifiant</label>
            <input type="text" className="w-full rounded-2xl border-slate-100 bg-slate-50 py-4 px-6 font-bold focus:ring-[#ff7900]" placeholder="ex: omar.k" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-2">Mot de passe</label>
            <input type="text" className="w-full rounded-2xl border-slate-100 bg-slate-50 py-4 px-6 font-bold focus:ring-[#ff7900]" placeholder="ex: orange2025" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <button onClick={handleCreateUser} className="flex items-center bg-[#ff7900] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-900 transition-all">
            <UserPlus className="w-4 h-4 mr-2" />
            Créer le compte
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-slate-900 uppercase tracking-tighter text-xl">Comptes Réseau ({users.length})</h3>
            {isLoading && <Loader2 className="animate-spin text-orange-400" />}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-50">
                <th className="px-6 py-4 text-left">Collaborateur</th>
                <th className="px-6 py-4 text-left">Login</th>
                <th className="px-6 py-4 text-left">Password</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((user) => (
                <tr key={user.username} className="group hover:bg-slate-50 transition-all">
                  <td className="px-6 py-5 font-black text-slate-900">{user.associatedAgentName}</td>
                  <td className="px-6 py-5 text-slate-500 font-bold">{user.username}</td>
                  <td className="px-6 py-5 font-mono text-orange-600 bg-orange-50/30 rounded-lg px-2 m-4">{user.password}</td>
                  <td className="px-6 py-5 text-right">
                    <button onClick={() => handleDeleteUser(user.username)} className="p-2 text-slate-200 hover:text-rose-500 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPanel;
