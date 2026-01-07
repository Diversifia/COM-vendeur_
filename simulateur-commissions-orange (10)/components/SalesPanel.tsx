
import React from 'react';
import { SalesData } from '../types';
import { COMMISSION_RATES } from '../constants';
import { Wifi, Smartphone, Box, Share2 } from 'lucide-react';

interface SalesPanelProps {
  data: SalesData;
  onChange: (key: keyof SalesData, value: number) => void;
  readOnly?: boolean;
}

const SalesPanel: React.FC<SalesPanelProps> = ({ data, onChange, readOnly = false }) => {
  
  const renderInput = (key: keyof SalesData, label: string) => (
    <div>
      <label htmlFor={key} className="block text-xs font-medium text-gray-500 mb-1 truncate" title={label}>
        {label}
      </label>
      <div className="relative rounded-md shadow-sm">
        <input
          type="number"
          id={key}
          min="0"
          readOnly={readOnly}
          value={data[key] === 0 ? '' : data[key]}
          onChange={(e) => {
            if (readOnly) return;
            const val = parseInt(e.target.value);
            onChange(key, isNaN(val) ? 0 : val);
          }}
          className={`block w-full rounded-md border-gray-300 py-2 pl-3 pr-16 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#ff7900] sm:text-sm sm:leading-6 ${
            readOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
          }`}
          placeholder="0"
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <span className="text-gray-400 text-[10px] mr-1">x</span>
          <span className="text-gray-600 text-xs font-medium">{COMMISSION_RATES[key]} Dh</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Section 1: Internet */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 bg-orange-50 border-b border-orange-100 flex items-center space-x-2">
          <Wifi className="w-5 h-5 text-[#ff7900]" />
          <h3 className="font-semibold text-gray-800">Internet Fixe</h3>
        </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {renderInput('tdlte', 'TDLTE')}
          {renderInput('ftth20', 'FTTH 20M')}
          {renderInput('ftth50', 'FTTH 50M')}
          {renderInput('ftth100', 'FTTH 100M')}
          {renderInput('ftth200', 'FTTH 200M')}
          {renderInput('ftth500', 'FTTH 500M')}
          {renderInput('adsl', 'ADSL')}
        </div>
      </div>

      {/* Section 2: Box & Forfaits */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 flex items-center space-x-2">
          <Box className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-800">Box & Forfaits</h3>
        </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {renderInput('box249', 'BOX 249')}
          {renderInput('box349', 'BOX 349')}
          {renderInput('box5g', 'BOX 5G')}
          {renderInput('forf6h', 'FORF 59')}
          {renderInput('forf15h', 'FORF 99')}
          {renderInput('forf22h', 'FORF 149')}
          {renderInput('forf34h', 'FORF 199')}
          {renderInput('illimiteNat', 'Illimité National')}
        </div>
      </div>

      {/* Section 3: Partage */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 bg-purple-50 border-b border-purple-100 flex items-center space-x-2">
          <Share2 className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-800">Partage</h3>
        </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {renderInput('partage20', 'Partage 20M')}
          {renderInput('partage50', 'Partage 50M')}
          {renderInput('partage100', 'Partage 100M')}
          {renderInput('partage200', 'Partage 200M')}
        </div>
      </div>
    </div>
  );
};

export default SalesPanel;
