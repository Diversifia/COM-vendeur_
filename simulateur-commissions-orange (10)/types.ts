
export interface SalaryData {
  agentName: string;       // Nom du commercial
  // Revenus (Page 1 & 3)
  baseSalary: number;      // Salaire de base / Salaire brut fixed
  commission: number;      // Commission Vente (Calculated or Manual)
  seniorityBonus: number;  // Prime d'ancienneté (New)
  prime20HD: number;       // Prime 20 HD (formerly Prime 80%)
  prime100: number;        // Prime 100%
  bonusCA: number;         // Bonus CA
  p4: number;             // P4
  bonusOther: number;      // Autres Bonus

  // Déductions (Page 2 & 3)
  routerMalus: number;         // Malus Frais routeur (Moved from Bonus)
  salaryConditionMalus: number; // Malus Condition salaire
  clawbackResiliation: number; // Clawback (Resiliation)
  clawbackDiversifia: number;  // Clawback (Payé Par Diversifia)
  lateness: number;            // Retards
  absences: number;            // Absences
  advance: number;             // Avance sur Salaire
  otherDeductions: number;     // Autres Prélèvements / Détails Autres
  cnss: number;                // CNSS
  hrIncidents: number;         // Retenue Incidents RH
  incidentsList: Record<string, number>;     // ID -> Count mapping
}

export const initialSalaryData: SalaryData = {
  agentName: '',
  baseSalary: 0, 
  commission: 0,
  seniorityBonus: 0,
  prime20HD: 0,
  prime100: 0,
  bonusCA: 0,
  p4: 0,
  bonusOther: 0,
  routerMalus: 0,
  salaryConditionMalus: 0,
  clawbackResiliation: 0,
  clawbackDiversifia: 0,
  lateness: 0,
  absences: 0,
  advance: 0,
  otherDeductions: 0,
  cnss: 0, 
  hrIncidents: 0,
  incidentsList: {},
};

export interface CalculationResult {
  totalGross: number;
  totalDeductions: number;
  netSalary: number;
}

// New Types for Sales Source
export interface SalesData {
  // Internet (Page 1)
  tdlte: number;
  ftth20: number;
  ftth50: number;
  ftth100: number;
  ftth200: number;
  ftth500: number; // New
  adsl: number;

  // Box (Page 2)
  box249: number;
  box349: number;
  box5g: number; // New

  // Forfaits Mobile (Page 2 & 3)
  forf6h: number;
  forf15h: number;
  forf22h: number;
  illimiteNat: number;
  forf34h: number;

  // Partage (Page 3)
  partage20: number;
  partage50: number;
  partage100: number;
  partage200: number;
}

export const initialSalesData: SalesData = {
  tdlte: 0,
  ftth20: 0,
  ftth50: 0,
  ftth100: 0,
  ftth200: 0,
  ftth500: 0,
  adsl: 0,
  box249: 0,
  box349: 0,
  box5g: 0,
  forf6h: 0,
  forf15h: 0,
  forf22h: 0,
  illimiteNat: 0,
  forf34h: 0,
  partage20: 0,
  partage50: 0,
  partage100: 0,
  partage200: 0,
};

// Auth Types
export type UserRole = 'admin' | 'agent';

export interface User {
  username: string;
  password?: string; // Optional for display security
  role: UserRole;
  associatedAgentName?: string; // If role is agent, which data do they see?
}
