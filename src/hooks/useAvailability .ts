import { useState, useEffect } from 'react';

const useAvailability = (initialAvailability, onChange) => {
  const [availability, setAvailability] = useState(() => 
    initialAvailability ? JSON.parse(initialAvailability) : {}
  );

  // Llama a onChange cada vez que availability cambia, fuera del renderizado
  useEffect(() => {
    if (onChange) {
      onChange(availability);
    }
  }, [availability, onChange]);

  const handleCheckboxChange = (day, turno) => {
    setAvailability(prev => {
      const updatedAvailability = {
        ...prev,
        [day]: prev[day]?.includes(turno)
          ? prev[day].filter(t => t !== turno)
          : [...(prev[day] || []), turno]
      };
      return updatedAvailability;
    });
  };

  return { availability, handleCheckboxChange };
};

export default useAvailability;
