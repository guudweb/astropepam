import { useState, useEffect } from 'react';
import type { Congregation } from '@/interfaces/index';

interface CongregationFilterProps {
  onChange: (congregations: string[]) => void;
  value: string[];
}

export const CongregationFilter: React.FC<CongregationFilterProps> = ({ onChange, value }) => {
  const [selectedCongregations, setSelectedCongregations] = useState<string[]>(value || []);
  const [showDropdown, setShowDropdown] = useState(false);
  const [congregations, setCongregations] = useState<Congregation[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar congregaciones al montar el componente
  useEffect(() => {
    const fetchCongregations = async () => {
      try {
        const response = await fetch('/api/getCongregations');
        if (response.ok) {
          const data = await response.json();
          setCongregations(data);
        }
      } catch (error) {
        console.error('Error fetching congregations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCongregations();
  }, []);

  useEffect(() => {
    onChange(selectedCongregations);
  }, [selectedCongregations]);

  const handleToggleCongregation = (congregationId: string) => {
    setSelectedCongregations(prev => {
      if (prev.includes(congregationId)) {
        return prev.filter(c => c !== congregationId);
      } else {
        return [...prev, congregationId];
      }
    });
  };

  const handleClearAll = () => {
    setSelectedCongregations([]);
  };

  const handleSelectAll = () => {
    setSelectedCongregations(congregations.map(c => c.id.toString()));
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="border border-gray-300 rounded-lg px-4 py-2 bg-white flex items-center gap-2 hover:border-gray-400 transition-colors"
      >
        <span>Congregaciones</span>
        {selectedCongregations.length > 0 && (
          <span className="bg-blue-600 text-white rounded-full px-2 py-0.5 text-xs">
            {selectedCongregations.length}
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
              <h4 className="text-sm font-medium text-gray-700">Filtrar por congregaciones</h4>
              <div className="flex gap-2">
                <button
                  onClick={handleSelectAll}
                  className="text-xs text-green-600 hover:text-green-700"
                >
                  Todas
                </button>
                <button
                  onClick={handleClearAll}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Limpiar
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-4">
                <span className="text-sm text-gray-500">Cargando congregaciones...</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {congregations.map(congregation => (
                  <label key={congregation.id} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCongregations.includes(congregation.id.toString())}
                      onChange={() => handleToggleCongregation(congregation.id.toString())}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{congregation.nombre}</span>
                    <span className="ml-auto text-xs text-gray-500">
                      {congregation.diaReunion} - {congregation.turnoReunion}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {!loading && congregations.length === 0 && (
              <div className="text-center py-4">
                <span className="text-sm text-gray-500">No hay congregaciones disponibles</span>
              </div>
            )}
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