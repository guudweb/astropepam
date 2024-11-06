import { useState, useEffect } from 'react';

const useAvailability = (initialAvailability, onChange) => {
  const [availability, setAvailability] = useState({});

  useEffect(() => {
    const parsedAvailability = JSON.parse(initialAvailability);
    setAvailability(parsedAvailability);
  }, [initialAvailability]);

  useEffect(() => {
    onChange(availability); // Emitir cambios a través de `onChange` cuando `availability` cambie
  }, [availability, onChange]);

  const handleCheckboxChange = (day, turno) => {
    setAvailability(prev => {
      const currentTurns = prev[day] || [];
      return {
        ...prev,
        [day]: currentTurns.includes(turno)
          ? currentTurns.filter(t => t !== turno)
          : [...currentTurns, turno]
      };
    });
  };

  return { availability, handleCheckboxChange };
};

export default useAvailability;
