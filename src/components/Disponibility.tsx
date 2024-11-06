import { useState, useEffect } from 'react';

const daysOfWeek = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
const turnos = ["T1", "T2", "T3", "T4"];

const Disponibility = ({ disponibilidad }) => {
  const [availability, setAvailability] = useState({});





  useEffect(() => {
    // Parsear la cadena JSON para obtener la disponibilidad inicial
    const parsedAvailability = JSON.parse(disponibilidad);
    setAvailability(parsedAvailability);
  }, [disponibilidad]);

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

  return (
    <div>
      {daysOfWeek.map(day => (
        <div key={day}>
          <p className='text-md my-2 text-cyan-600 font-bold'>{day.charAt(0).toUpperCase() + day.slice(1)}</p>
          <div className='flex gap-5 items-center'>
            {turnos.map(turno => (
              <label key={turno}>
                <input
                  type="checkbox"
                  checked={availability[day]?.includes(turno) || false}
                  onChange={() => handleCheckboxChange(day, turno)}
                />
                {turno}
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Disponibility;
