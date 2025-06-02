import { useState, useEffect } from 'react';

interface PersonaInteresada {
  id: number;
  nombre: string;
  telefono: number;
  añadido_por: string;
}

export const PersonasInteresadasNotification = ({ userId, isServiceLink }: { userId: string, isServiceLink: boolean }) => {
  const [unattendedCount, setUnattendedCount] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [personas, setPersonas] = useState<PersonaInteresada[]>([]);

  useEffect(() => {
    fetchUnattendedPersonas();
  }, []);

  const fetchUnattendedPersonas = async () => {
    try {
      const response = await fetch('/api/get-unattended-personas.json');
      const data = await response.json();
      
      // Filtrar según permisos del usuario
      const filtered = isServiceLink 
        ? data // Si tiene service_link, ve todas
        : data.filter((p: PersonaInteresada) => p.añadido_por === userId); // Si no, solo las suyas
      
      setPersonas(filtered);
      setUnattendedCount(filtered.length);
    } catch (error) {
      console.error('Error fetching unattended personas:', error);
    }
  };

  if (unattendedCount === 0) return null;

  return (
    <div className="relative">
      {/* Badge de notificación */}
      <div 
        className="bg-red-500 text-white rounded-full px-3 py-1 text-sm font-bold cursor-pointer hover:bg-red-600 transition-colors"
        onClick={() => setShowDetails(!showDetails)}
      >
        {unattendedCount} persona{unattendedCount > 1 ? 's' : ''} sin atender
      </div>

      {/* Detalles desplegables */}
      {showDetails && (
        <div className="absolute top-10 right-0 bg-white shadow-lg rounded-lg p-4 min-w-[300px] z-50 border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-3">Personas interesadas pendientes:</h3>
          <div className="max-h-60 overflow-y-auto">
            {personas.map((persona) => (
              <div key={persona.id} className="mb-2 pb-2 border-b last:border-0">
                <p className="font-medium text-gray-700">{persona.nombre}</p>
                <p className="text-sm text-gray-500">Tel: {persona.telefono}</p>
              </div>
            ))}
          </div>
          <a 
            href="/personas-interesadas" 
            className="block mt-3 text-center bg-cyan-600 text-white py-2 rounded hover:bg-cyan-700 transition-colors"
          >
            Ver todas
          </a>
        </div>
      )}
    </div>
  );
};