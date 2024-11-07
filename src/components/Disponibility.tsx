import useAvailability from '../hooks/useAvailability ';

const daysOfWeek = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
const turnos = ["T1", "T2", "T3", "T4"];

const Disponibility = ({ disponibilidad, onChange }) => {
  const { availability, handleCheckboxChange } = useAvailability(disponibilidad, onChange);

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
