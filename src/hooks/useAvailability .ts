import { useState, useEffect } from 'react';

const useAvailability = (initialAvailability, onChange) => {
  const [availability, setAvailability] = useState(initialAvailability || {});

  useEffect(() => {
    setAvailability(JSON.parse(initialAvailability || '{}'));
  }, [initialAvailability]);

  const handleCheckboxChange = (day, turno) => {
    setAvailability(prev => {
      const updatedAvailability = {
        ...prev,
        [day]: prev[day]?.includes(turno)
          ? prev[day].filter(t => t !== turno)
          : [...(prev[day] || []), turno]
      };
      // Llamamos a onChange solo después de que `availability` se haya actualizado
      onChange(updatedAvailability);
      return updatedAvailability;
    });
  };

  return { availability, handleCheckboxChange };
};

export default useAvailability;
