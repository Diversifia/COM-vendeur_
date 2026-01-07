
import React from 'react';
import { SalaryData, SalesData, CalculationResult } from '../types';
import { INCIDENT_CATALOG } from '../constants';

interface PayslipTemplateProps {
  salaryData: SalaryData;
  salesData: SalesData;
  result: CalculationResult;
  month: string;
}

const PayslipTemplate: React.FC<PayslipTemplateProps> = ({ salaryData, result, month }) => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', minimumFractionDigits: 2 }).format(val);

  // Helper for table rows
  const Row = ({ label, amount, isDeduction = false, bold = false }: { label: string, amount: number, isDeduction?: boolean, bold?: boolean }) => (
    <tr className={`border-b border-gray-100 ${bold ? 'font-bold' : ''}`}>
      <td className="py-1 px-2 text-left">{label}</td>
      <td className={`py-1 px-2 text-right ${isDeduction ? 'text-red-600' : 'text-gray-900'}`}>
        {amount !== 0 ? (isDeduction ? '-' : '') + formatCurrency(amount) : '-'}
      </td>
    </tr>
  );

  // Resolve incident labels and counts
  const activeIncidents = Object.entries(salaryData.incidentsList || {}).map(([id, value]) => {
      const count = value as number;
      const meta = INCIDENT_CATALOG.find(item => item.id === id);
      if (meta && count > 0) {
          return { ...meta, count, total: count * meta.amount };
      }
      return null;
  }).filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <div 
      id="printable-payslip" 
      className="hidden print:block bg-white p-6 max-w-[210mm] mx-auto text-xs leading-tight text-gray-800"
      style={{ fontFamily: 'Verdana, sans-serif' }}
    >
      
      {/* Header */}
      <div className="flex justify-between items-center border-b-2 border-[#ff7900] pb-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-[#ff7900] flex items-center justify-center text-white font-bold rounded-sm">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18v18H3V3zm16 16V5H5v14h14z"/></svg>
          </div>
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wide text-gray-900">DIVERSIFIA</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Partenaire Agréé Orange Maroc</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-lg font-bold uppercase text-gray-800">Bulletin de Paie</h2>
          <p className="text-sm font-medium text-gray-600">Période : {month}</p>
        </div>
      </div>

      {/* Identification Blocks */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Employer */}
        <div className="border border-gray-300 rounded-sm p-3">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-2 border-b border-gray-100 pb-1">Employeur</h3>
          <p className="font-bold text-sm">DIVERSIFIA S.A.R.L</p>
          <p className="text-gray-600">Temara Mall Imb A2 Bureau N7</p>
          <p className="text-gray-600">Temara centre</p>
        </div>
        
        {/* Employee */}
        <div className="border border-gray-300 rounded-sm p-3 bg-gray-50">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-2 border-b border-gray-200 pb-1">Salarié</h3>
          <div className="grid grid-cols-3 gap-2">
            <span className="text-gray-500">Nom Prénom :</span>
            <span className="col-span-2 font-bold">{salaryData.agentName}</span>
            <span className="text-gray-500">Matricule :</span>
            <span className="col-span-2 font-mono">{salaryData.agentName.substring(0, 3).toUpperCase()}-00X</span>
            <span className="text-gray-500">Fonction :</span>
            <span className="col-span-2">Commercial Terrain</span>
          </div>
        </div>
      </div>

      {/* Financial Details Grid */}
      <div className="border border-gray-300 rounded-sm mb-6 overflow-hidden">
        <div className="grid grid-cols-2 divide-x divide-gray-300">
          
          {/* GAINS (Left) */}
          <div>
            <div className="bg-gray-100 py-1 px-2 font-bold text-center border-b border-gray-300 text-[10px] uppercase text-gray-600">
              Éléments de Rémunération (Brut)
            </div>
            <table className="w-full">
              <thead>
                 <tr className="bg-gray-50 border-b border-gray-200 text-[9px] text-gray-500 uppercase">
                   <th className="py-1 px-2 text-left font-medium">Rubrique</th>
                   <th className="py-1 px-2 text-right font-medium">Montant</th>
                 </tr>
              </thead>
              <tbody>
                <Row label="Salaire de Base" amount={salaryData.baseSalary} bold />
                <Row label="Commissions Ventes" amount={salaryData.commission} />
                <Row label="Prime d'ancienneté" amount={salaryData.seniorityBonus} />
                <Row label="Prime 20 HD" amount={salaryData.prime20HD} />
                <Row label="Prime 100%" amount={salaryData.prime100} />
                <Row label="Bonus Chiffre d'Affaires" amount={salaryData.bonusCA} />
                <Row label="Prime P4" amount={salaryData.p4} />
                <Row label="Autres Bonus" amount={salaryData.bonusOther} />
                {/* Empty spacer rows to align height if needed */}
                <tr><td className="py-4"></td><td></td></tr> 
              </tbody>
            </table>
          </div>

          {/* RETENUES (Right) */}
          <div>
            <div className="bg-gray-100 py-1 px-2 font-bold text-center border-b border-gray-300 text-[10px] uppercase text-gray-600">
              Retenues & Déductions
            </div>
            <table className="w-full">
              <thead>
                 <tr className="bg-gray-50 border-b border-gray-200 text-[9px] text-gray-500 uppercase">
                   <th className="py-1 px-2 text-left font-medium">Rubrique</th>
                   <th className="py-1 px-2 text-right font-medium">Montant</th>
                 </tr>
              </thead>
              <tbody>
                <Row label="Cotisation CNSS" amount={salaryData.cnss} isDeduction />
                <Row label="Malus Routeur" amount={salaryData.routerMalus} isDeduction />
                <Row label="Condition Salaire" amount={salaryData.salaryConditionMalus} isDeduction />
                <Row label="Clawback (Résiliation)" amount={salaryData.clawbackResiliation} isDeduction />
                <Row label="Clawback (Diversifia)" amount={salaryData.clawbackDiversifia} isDeduction />
                <Row label="Retards" amount={salaryData.lateness} isDeduction />
                <Row label="Absences" amount={salaryData.absences} isDeduction />
                <Row label="Avance sur Salaire" amount={salaryData.advance} isDeduction />
                <Row label="Incidents RH" amount={salaryData.hrIncidents} isDeduction />
                <Row label="Autres Prélèvements" amount={salaryData.otherDeductions} isDeduction />
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Row */}
        <div className="grid grid-cols-2 divide-x divide-gray-300 border-t border-gray-300 bg-gray-50">
          <div className="flex justify-between items-center py-2 px-3">
            <span className="font-bold text-gray-700">TOTAL BRUT</span>
            <span className="font-bold text-gray-900">{formatCurrency(result.totalGross)}</span>
          </div>
          <div className="flex justify-between items-center py-2 px-3">
            <span className="font-bold text-gray-700">TOTAL RETENUES</span>
            <span className="font-bold text-red-600">-{formatCurrency(result.totalDeductions)}</span>
          </div>
        </div>
      </div>

      {/* Incident Details Section (If any) */}
      {activeIncidents.length > 0 && (
        <div className="mb-6 border border-gray-200 bg-gray-50 p-2 text-[9px]">
          <h4 className="font-bold text-gray-600 mb-1 uppercase">Détail Incidents & Justifications :</h4>
          <ul className="list-disc list-inside text-gray-500">
            {activeIncidents.map((inc, idx) => (
              <li key={idx}>
                  {inc.label} 
                  {inc.count > 1 && <span className="font-bold text-gray-700"> (x{inc.count})</span>}
                  {' '}- {inc.total} Dh
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Net Payable Box */}
      <div className="flex justify-end mb-8">
        <div className="border border-gray-900 rounded-md overflow-hidden w-2/5">
          <div className="bg-gray-900 text-white text-center py-1 text-[10px] uppercase tracking-wider">
            Net à Payer
          </div>
          <div className="bg-white text-center py-3">
            <span className="text-2xl font-bold text-gray-900">{formatCurrency(result.netSalary)}</span>
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-12 mt-8 pt-4 border-t border-gray-200 page-break-inside-avoid">
        <div className="text-center">
          <p className="font-bold text-[10px] uppercase mb-8 text-gray-500">Signature Responsable</p>
          <div className="h-16 border-b border-dashed border-gray-300 w-3/4 mx-auto"></div>
        </div>
        <div className="text-center">
          <p className="font-bold text-[10px] uppercase mb-8 text-gray-500">Signature Salarié</p>
          <p className="text-[9px] text-gray-400 mb-2 italic">"Lu et approuvé"</p>
          <div className="h-12 border-b border-dashed border-gray-300 w-3/4 mx-auto"></div>
        </div>
      </div>
      
      {/* Footer Disclaimer */}
      <div className="mt-8 text-center text-[9px] text-gray-400">
        <p>Document généré informatiquement par DIVERSIFIA - Valable sans cachet pour simulation interne.</p>
        <p>DIVERSIFIA S.A.R.L au capital de 100.000 DH - RC 123456 - IF 12345678 - ICE 000123456000078</p>
      </div>
    </div>
  );
};

export default PayslipTemplate;
