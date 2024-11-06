import { useState, useEffect } from 'react';

const useAvailability = (initialAvailability) => {
  const [availability, setAvailability] = useState({});

  useEffect(() => {
    // Parsear la cadena JSON para obtener la disponibilidad inicial
    const parsedAvailability = JSON.parse(initialAvailability);
    setAvailability(parsedAvailability);
  }, [initialAvailability]);

  const handleCheckboxChange = (day, turno) => {
    setAvailability(prev => {
      const currentTurns = prev[day] || [];
      return {
        ...prev,
        [day]: currentTurns.includes(turno)
          ? currentTurns.filter(t => t !== turno) // Elimina turno si está seleccionado
          : [...currentTurns, turno]              // Agrega turno si no está
      };
    });
  };

  return { availability, handleCheckboxChange };
};

export default useAvailability;
