import { useState, useEffect } from 'react';

interface PrivilegeFilterProps {
  onChange: (privileges: string[]) => void;
  value: string[];
}

export const PrivilegeFilter: React.FC<PrivilegeFilterProps> = ({ onChange, value }) => {
  const [selectedPrivileges, setSelectedPrivileges] = useState<string[]>(value || []);
  const [customPrivilege, setCustomPrivilege] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const defaultPrivileges = ['precursor', 'capitan', 'anciano', 'siervo', 'especial'];

  useEffect(() => {
    onChange(selectedPrivileges);
  }, [selectedPrivileges]);

  const handleTogglePrivilege = (privilege: string) => {
    setSelectedPrivileges(prev => {
      if (prev.includes(privilege)) {
        return prev.filter(p => p !== privilege);
      } else {
        return [...prev, privilege];
      }
    });
  };

  const handleAddCustomPrivilege = () => {
    if (customPrivilege.trim() && !selectedPrivileges.includes(customPrivilege.trim())) {
      setSelectedPrivileges(prev => [...prev, customPrivilege.trim()]);
      setCustomPrivilege('');
    }
  };

  const handleClearAll = () => {
    setSelectedPrivileges([]);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="border border-gray-300 rounded-lg px-4 py-2 bg-white flex items-center gap-2 hover:border-gray-400 transition-colors"
      >
        <span>Privilegios</span>
        {selectedPrivileges.length > 0 && (
          <span className="bg-blue-600 text-white rounded-full px-2 py-0.5 text-xs">
            {selectedPrivileges.length}
          </span>
        )}
        <svg
          className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute z-10 mt-1 w-80 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium text-gray-700">Filtrar por privilegios</h4>
              <button
                onClick={handleClearAll}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Limpiar
              </button>
            </div>

            {/* Default privileges */}
            <div className="space-y-2 mb-3">
              {defaultPrivileges.map(privilege => (
                <label key={privilege} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPrivileges.includes(privilege)}
                    onChange={() => handleTogglePrivilege(privilege)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">{privilege}</span>
                </label>
              ))}
            </div>

            {/* Custom privileges */}
            {selectedPrivileges
              .filter(p => !defaultPrivileges.includes(p))
              .map(privilege => (
                <label key={privilege} className="flex items-center cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={true}
                    onChange={() => handleTogglePrivilege(privilege)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{privilege}</span>
                </label>
              ))}

            {/* Add custom privilege */}
            <div className="flex gap-2 mt-3 pt-3 border-t">
              <input
                type="text"
                value={customPrivilege}
                onChange={(e) => setCustomPrivilege(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomPrivilege()}
                placeholder="Otro privilegio..."
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleAddCustomPrivilege}
                className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Añadir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};