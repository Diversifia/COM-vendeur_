
import { SalesData, SalaryData, initialSalaryData, initialSalesData } from './types';

// Liste des vendeurs pour la saisie manuelle
export const SALES_AGENTS: string[] = [
  "Zakaria Haroual",
  "Oussama Enacri",
  "Khalid Zaoug",
  "Fouad Amarti",
  "Hamza Sitel",
  "Hamza Cherradi",
  "Ayoub Zahir",
  "Mehdi El Yaouissi",
  "Ismail bahbouhi",
  "Adnane Lommuni",
  "Omar Kerfali",
  "Ayman Joouali",
  "Said Serrar",
  "Ilyas Hassi Rahou",
  "Tarik El Harradi",
  "Youssef Houass",
  "Moncef chakir",
  "Mehdi Kouyes",
  "Haitam Allache"
];

// Defines the commission value (in MAD) for a single sale of each type.
export const COMMISSION_RATES: Record<keyof SalesData, number> = {
  // Internet
  tdlte: 250,
  ftth20: 200,
  ftth50: 250,
  ftth100: 300,
  ftth200: 400,
  ftth500: 450,
  adsl: 99,

  // Box
  box249: 100,
  box349: 125,
  box5g: 125,

  // Mobile
  forf6h: 40,
  forf15h: 60,
  forf22h: 75,
  forf34h: 100,
  illimiteNat: 125,

  // Partage
  partage20: 200,
  partage50: 250,
  partage100: 300,
  partage200: 400,
};

// Objectifs (Conservés comme Configuration pour les graphiques)
export const NOVEMBER_OBJECTIVES: Record<string, number> = {
  "ayoub": 32, "Ayoub Zahir": 32,
  "oussama": 37, "Oussama Enacri": 37,
  "omar": 32, "Omar Kerfali": 32,
  "cherradi": 47, "Hamza Cherradi": 47,
  "bahbouhi": 47, "Ismail bahbouhi": 47,
  "aymane jouali": 37, "Ayman Joouali": 37,
  "mehdi kouy": 47, "Mehdi Kouyes": 47,
  "moncef": 37, "Moncef chakir": 37,
  "mehdi": 37, "Mehdi El Yaouissi": 37,
  "youssef": 30, "Youssef Houass": 30,
  "tarik": 30, "Tarik El Harradi": 30,
  "ilyas": 28, "Ilyas Hassi Rahou": 28,
  "khalid": 47, "Khalid Zaoug": 47,
  "zakaria": 47, "Zakaria Haroual": 47,
  "said serrar": 36, "Said Serrar": 36,
  "haitam": 32, "Haitam Allache": 32,
  "sitel": 36, "Hamza Sitel": 36,
  "adnane": 35, "Adnane Lommuni": 35
};

// Catalogue des incidents
export const INCIDENT_CATALOG = [
  { id: 'no_kit', label: "Absence Gilet / Kit Orange", amount: 100 },
  { id: 'zero_sales', label: "Journée 0 Vente", amount: 150 },
  { id: 'no_respect', label: "Non respect des consignes", amount: 300 },
  { id: 'fraud', label: "Dépôt Dossier Frauduleux", amount: 500 },
  { id: 'behavior', label: "Comportement Inapproprié", amount: 200 },
  { id: 'late_report', label: "Retard Reporting", amount: 50 },
];
