
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { SalaryData, initialSalaryData, CalculationResult, SalesData, initialSalesData, User } from '../types';
import { COMMISSION_RATES, SALES_AGENTS, INCIDENT_CATALOG } from '../constants';
import InputGroup from './InputGroup';
import SummaryCard from './SummaryCard';
import SalesPanel from './SalesPanel';
import AnalyticsDashboard from './AnalyticsDashboard';
import PayslipTemplate from './PayslipTemplate';
import GlobalReportTemplate from './GlobalReportTemplate';
import UserManagementPanel from './UserManagementPanel';
import IncidentManager from './IncidentManager'; 
import { 
  TrendingUp, TrendingDown, Calculator, LayoutGrid, PieChart, 
  ShieldCheck, Printer, Calendar, Plus, X, Trash2, 
  RefreshCcw, CheckCircle2, Loader2, Database, Bell
} from 'lucide-react';

type Tab = 'simulation' | 'source' | 'analytics' | 'access';
type MonthlyStore = Record<string, Record<string, { salary: SalaryData, sales: SalesData }>>;

const getInitialSalary = (name: string): SalaryData => ({ ...initialSalaryData, agentName: name });
const getInitialSales = (name: string): SalesData => ({ ...initialSalesData });

interface DashboardProps {
  currentUser: User;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser }) => {
  const isAdmin = currentUser.role === 'admin';
  const apiBase = '/api';

  const [activeTab, setActiveTab] = useState<Tab>('simulation');
  const [isPrintingGlobal, setIsPrintingGlobal] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'local' | 'loading'>('loading');
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [agentsList, setAgentsList] = useState<string[]>(SALES_AGENTS);
  const [isAddingAgent, setIsAddingAgent] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [historyStore, setHistoryStore] = useState<MonthlyStore>({});

  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const syncData = useCallback(async (mode: 'load' | 'save', data?: MonthlyStore) => {
    setSyncStatus('loading');
    try {
      if (mode === 'load') {
        const [respH, respA] = await Promise.all([
          fetch(`${apiBase}/getData?key=diversifia_payroll_history`),
          fetch(`${apiBase}/getData?key=diversifia_agents`)
        ]);
        
        let loadedHistory = {};
        let loadedAgents = SALES_AGENTS;

        if (respH.ok) {
          const cloudH = await respH.json();
          if (cloudH) loadedHistory = cloudH;
        }
        if (respA.ok) {
          const cloudA = await respA.json();
          if (cloudA && Array.isArray(cloudA)) loadedAgents = cloudA;
        }

        setHistoryStore(loadedHistory);
        setAgentsList(loadedAgents);
        setSyncStatus('synced');
      } else if (data && isAdmin) {
        const results = await Promise.all([
            fetch(`${apiBase}/saveData`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'diversifia_payroll_history', value: data }),
            }),
            fetch(`${apiBase}/saveData`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'diversifia_agents', value: agentsList }),
            })
        ]);
        if (results.every(r => r.ok)) setSyncStatus('synced');
      }
    } catch (e) {
      console.error("Sync error:", e);
      setSyncStatus('local');
      if (mode === 'load') {
        const h = localStorage.getItem('diversifia_payroll_history');
        if (h) setHistoryStore(JSON.parse(h));
      }
    }
  }, [isAdmin, apiBase, agentsList]);

  useEffect(() => { syncData('load'); }, [syncData]);

  // Auto-save pour l'admin toutes les 10 secondes si changements
  useEffect(() => {
    if (isAdmin && syncStatus !== 'loading') {
      const timer = setTimeout(() => syncData('save', historyStore), 10000);
      return () => clearTimeout(timer);
    }
  }, [historyStore, agentsList, isAdmin, syncData, syncStatus]);

  useEffect(() => {
    if (!selectedAgent && agentsList.length > 0) {
        const found = !isAdmin && currentUser.associatedAgentName 
            ? agentsList.find(a => a === currentUser.associatedAgentName) 
            : agentsList[0];
        setSelectedAgent(found || agentsList[0]);
    }
  }, [agentsList, currentUser, isAdmin, selectedAgent]);

  const updateStore = (agentName: string, month: string, newSalary: SalaryData, newSales: SalesData) => {
      setHistoryStore(prev => ({
          ...prev,
          [month]: {
              ...(prev[month] || {}),
              [agentName]: { salary: newSalary, sales: newSales }
          }
      }));
  };

  const currentMonthData = useMemo(() => historyStore[selectedMonth] || {}, [historyStore, selectedMonth]);
  const currentSalaryData = useMemo(() => {
    const data = currentMonthData[selectedAgent]?.salary || getInitialSalary(selectedAgent);
    return { ...data, incidentsList: data.incidentsList || {} };
  }, [currentMonthData, selectedAgent]);
  const currentSalesData = useMemo(() => currentMonthData[selectedAgent]?.sales || getInitialSales(selectedAgent), [currentMonthData, selectedAgent]);
  const allAgentsData = useMemo(() => agentsList.map(name => ({
      name,
      salary: currentMonthData[name]?.salary || getInitialSalary(name),
      sales: currentMonthData[name]?.sales || getInitialSales(name)
  })), [agentsList, currentMonthData]);

  const result: CalculationResult = useMemo(() => {
    const s = currentSalaryData;
    const totalGross = (s.baseSalary || 0) + (s.commission || 0) + (s.seniorityBonus || 0) + (s.prime20HD || 0) + (s.prime100 || 0) + (s.bonusCA || 0) + (s.p4 || 0) + (s.bonusOther || 0);
    const totalDeductions = (s.routerMalus || 0) + (s.salaryConditionMalus || 0) + (s.clawbackResiliation || 0) + (s.clawbackDiversifia || 0) + (s.lateness || 0) + (s.absences || 0) + (s.advance || 0) + (s.otherDeductions || 0) + (s.cnss || 0) + (s.hrIncidents || 0);
    return { totalGross, totalDeductions, netSalary: totalGross - totalDeductions };
  }, [currentSalaryData]);

  const displayMonth = new Date(selectedMonth + "-01").toLocaleDateString('fr-MA', { month: 'long', year: 'numeric' });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-32">
      {!isPrintingGlobal && <PayslipTemplate salaryData={currentSalaryData} salesData={currentSalesData} result={result} month={displayMonth} />}
      {isPrintingGlobal && isAdmin && <GlobalReportTemplate data={allAgentsData} month={displayMonth} />}

      <div className="print:hidden">
        <div className="flex flex-col xl:flex-row justify-between items-center mb-10 gap-6">
            <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
                <div className="bg-white px-5 py-3 rounded-[2rem] shadow-sm border border-slate-200 flex items-center w-full md:w-auto">
                     <Calendar className="w-5 h-5 text-[#ff7900] mr-3" />
                     <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="border-none text-slate-900 font-extrabold focus:ring-0 cursor-pointer bg-transparent p-0 text-lg" />
                     <div className="h-6 w-px bg-slate-200 mx-5"></div>
                     <div className="flex items-center group cursor-pointer" title="État de la synchronisation cloud" onClick={() => syncData('load')}>
                        {syncStatus === 'loading' ? (
                            <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
                        ) : (
                            <div className="flex items-center space-x-2">
                                <div className={`w-2.5 h-2.5 rounded-full ${syncStatus === 'synced' ? 'bg-emerald-500 shadow-lg shadow-emerald-200' : 'bg-blue-500'}`}></div>
                                <span className={`text-[11px] font-black uppercase tracking-tighter ${syncStatus === 'synced' ? 'text-emerald-600' : 'text-blue-600'}`}>
                                    {syncStatus === 'synced' ? 'Cloud' : 'Local'}
                                </span>
                            </div>
                        )}
                     </div>
                </div>
                
                <div className="flex items-center gap-1 bg-slate-900 p-1.5 rounded-[2rem] shadow-2xl w-full md:w-auto">
                    <button onClick={() => { setIsPrintingGlobal(false); setTimeout(() => window.print(), 100); }} className="flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-[1.5rem] transition-all font-bold text-sm">
                        <Printer className="w-4 h-4 text-orange-400" />
                        <span>Bulletins</span>
                    </button>
                    {isAdmin && (
                        <button onClick={() => { setIsPrintingGlobal(true); setTimeout(() => window.print(), 100); }} className="flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-[1.5rem] transition-all font-bold text-sm border-l border-slate-700">
                            <Database className="w-4 h-4 text-sky-400" />
                            <span>Rapport</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="flex bg-slate-100 p-1.5 rounded-[2rem] border border-slate-200 w-full xl:w-auto relative">
                 {[
                   { id: 'simulation', icon: Calculator, label: 'Paie' },
                   { id: 'source', icon: LayoutGrid, label: 'Ventes' },
                   ...(isAdmin ? [
                     { id: 'analytics', icon: PieChart, label: 'Stats' },
                     { id: 'access', icon: ShieldCheck, label: 'Réseau' }
                   ] : [])
                 ].map((tab) => {
                   const isActive = activeTab === tab.id;
                   const Icon = tab.icon;
                   return (
                     <button 
                       key={tab.id}
                       onClick={() => setActiveTab(tab.id as Tab)} 
                       className={`flex items-center px-6 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all duration-300 relative z-10 ${isActive ? 'text-white' : 'text-slate-400 hover:text-slate-600'}`}
                     >
                       {isActive && <div className="absolute inset-0 bg-[#ff7900] rounded-[1.5rem] shadow-lg shadow-orange-200 -z-10 transition-all duration-300"></div>}
                       <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                       {tab.label}
                     </button>
                   );
                 })}
            </div>
        </div>

        {(activeTab === 'simulation' || activeTab === 'source') && (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3 space-y-6">
              
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Équipe Diversifia</h3>
                  {isAdmin && (
                      <button onClick={() => setIsAddingAgent(true)} className="bg-orange-50 text-[#ff7900] p-2 rounded-xl hover:bg-[#ff7900] hover:text-white transition-all shadow-sm">
                          <Plus className="w-5 h-5"/>
                      </button>
                  )}
                </div>

                {isAddingAgent ? (
                    <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-2xl">
                        <input type="text" value={newAgentName} onChange={(e) => setNewAgentName(e.target.value)} className="input-field border-none bg-transparent text-lg" autoFocus placeholder="Prénom Nom" />
                        <button onClick={() => { 
                            if (!newAgentName.trim()) return;
                            setAgentsList(p => [...p, newAgentName]);
                            setSelectedAgent(newAgentName);
                            setIsAddingAgent(false);
                            setNewAgentName('');
                            addToast(`${newAgentName} ajouté.`);
                        }} className="btn-primary py-3 px-8">Ajouter</button>
                        <button onClick={() => setIsAddingAgent(false)} className="p-3 text-slate-400 hover:text-slate-600"><X className="w-6 h-6"/></button>
                    </div>
                ) : (
                  <div className="flex items-center space-x-5">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-[#ff7900] to-[#e66e00] flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-orange-100">
                        {selectedAgent ? selectedAgent.charAt(0) : '?'}
                    </div>
                    <div className="flex-grow">
                        <select 
                            disabled={!isAdmin} 
                            className="w-full text-3xl font-black text-slate-900 bg-transparent border-none focus:ring-0 p-0 appearance-none cursor-pointer tracking-tighter" 
                            value={selectedAgent} 
                            onChange={(e) => setSelectedAgent(e.target.value)}
                        >
                            {agentsList.map((agent) => <option key={agent} value={agent}>{agent}</option>)}
                        </select>
                        <div className="flex items-center mt-1">
                          <div className="flex items-center px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-100">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></div>
                            <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Connecté</span>
                          </div>
                        </div>
                    </div>
                    {isAdmin && (
                        <button onClick={() => { 
                          if(confirm('Supprimer ce profil ?')) {
                            setAgentsList(p => p.filter(a => a !== selectedAgent));
                            addToast("Dossier supprimé.", "error");
                          }
                        }} className="p-4 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all">
                            <Trash2 className="w-6 h-6" />
                        </button>
                    )}
                  </div>
                )}
              </div>

              {activeTab === 'simulation' && (
                <div className="space-y-6">
                    <div className={!isAdmin ? 'opacity-90 pointer-events-none' : ''}>
                        <InputGroup title="Primes et Gains" icon={<TrendingUp className="w-6 h-6" />} colorClass="text-emerald-500" data={currentSalaryData} readOnly={!isAdmin} onChange={(k,v) => updateStore(selectedAgent, selectedMonth, {...currentSalaryData, [k]: v}, currentSalesData)}
                        fields={[
                            { key: 'baseSalary', label: 'Salaire Base', placeholder: '3000' },
                            { key: 'commission', label: 'Commissions', placeholder: '0' },
                            { key: 'seniorityBonus', label: "Ancienneté", placeholder: '0' },
                            { key: 'prime20HD', label: 'Prime 20 HD', placeholder: '0' },
                            { key: 'prime100', label: 'Prime 100%', placeholder: '0' },
                            { key: 'bonusCA', label: 'Performance CA', placeholder: '0' },
                            { key: 'p4', label: 'Bonus P4', placeholder: '0' },
                            { key: 'bonusOther', label: 'Primes Divers', placeholder: '0' },
                        ]} />
                        
                        <InputGroup title="Déductions et Malus" icon={<TrendingDown className="w-6 h-6" />} colorClass="text-rose-500" data={currentSalaryData} readOnly={!isAdmin} onChange={(k,v) => updateStore(selectedAgent, selectedMonth, {...currentSalaryData, [k]: v}, currentSalesData)}
                        fields={[
                            { key: 'cnss', label: 'CNSS', placeholder: '0' },
                            { key: 'advance', label: 'Avances', placeholder: '0' },
                            { key: 'hrIncidents', label: 'Retenues RH', placeholder: '0' },
                            { key: 'routerMalus', label: 'Frais Routeur', placeholder: '0' },
                            { key: 'lateness', label: 'Retards', placeholder: '0' },
                            { key: 'absences', label: 'Absences', placeholder: '0' },
                            { key: 'clawbackResiliation', label: 'Clawback Resil', placeholder: '0' },
                            { key: 'otherDeductions', label: 'Prélèvements', placeholder: '0' },
                        ]} />

                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
                          <IncidentManager selectedIncidents={currentSalaryData.incidentsList || {}} onToggleIncident={(id, amt, delta) => {
                              if (!isAdmin) return;
                              const counts = currentSalaryData.incidentsList || {};
                              const newCount = Math.max(0, (counts[id] || 0) + delta);
                              const newCounts = { ...counts, [id]: newCount };
                              let hrTotal = 0;
                              INCIDENT_CATALOG.forEach(inc => hrTotal += (newCounts[inc.id] || 0) * inc.amount);
                              updateStore(selectedAgent, selectedMonth, { ...currentSalaryData, incidentsList: newCounts, hrIncidents: hrTotal }, currentSalesData);
                          }} readOnly={!isAdmin} />
                        </div>
                    </div>
                </div>
              )}

              {activeTab === 'source' && (
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter border-l-8 border-[#ff7900] pl-6 mb-10">Feuille de Ventes</h3>
                  <SalesPanel data={currentSalesData} readOnly={!isAdmin} onChange={(k,v) => {
                      if (!isAdmin) return;
                      const newSales = { ...currentSalesData, [k]: v };
                      let comm = 0;
                      (Object.keys(newSales) as Array<keyof SalesData>).forEach(key => comm += (newSales[key] || 0) * (COMMISSION_RATES[key] || 0));
                      updateStore(selectedAgent, selectedMonth, { ...currentSalaryData, commission: comm }, newSales);
                  }} />
                </div>
              )}
            </div>

            <div className="lg:w-1/3">
              <SummaryCard result={result} />
            </div>
          </div>
        )}
        
        {activeTab === 'analytics' && isAdmin && (
          <AnalyticsDashboard allAgentsData={allAgentsData} />
        )}
        
        {activeTab === 'access' && isAdmin && (
          <UserManagementPanel currentAgents={agentsList} onSaveUsers={() => addToast("Accès mis à jour.")} />
        )}
      </div>

      <div className="fixed bottom-10 right-10 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border pointer-events-auto transition-all duration-300 ${
            toast.type === 'success' ? 'bg-slate-900 border-emerald-500/30 text-white' : 
            toast.type === 'error' ? 'bg-rose-900 border-rose-500/30 text-white' : 
            'bg-slate-800 border-sky-500/30 text-white'
          }`}>
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {toast.type === 'error' && <Bell className="w-5 h-5 text-rose-400" />}
            {toast.type === 'info' && <RefreshCcw className="w-5 h-5 text-sky-400 animate-spin" />}
            <span className="text-sm font-bold">{toast.message}</span>
          </div>
        ))}
      </div>

      <style>{`
        .btn-primary { @apply flex items-center justify-center px-8 py-4 bg-[#ff7900] text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-900 transition-all shadow-2xl shadow-orange-100; }
        .input-field { @apply block w-full rounded-2xl border-slate-100 bg-slate-50 focus:bg-white shadow-none focus:border-[#ff7900] focus:ring-[#ff7900] sm:text-sm py-4 px-6 transition-all font-bold; }
      `}</style>
    </div>
  );
};

export default Dashboard;
