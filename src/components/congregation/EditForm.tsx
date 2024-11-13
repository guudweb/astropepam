import { useEffect, useState } from "react";

interface Props {
    id: string;
}

export const EditForm = ({ id }: Props) => {
    // Estado para almacenar los datos del formulario
    const [data, setData] = useState({
        nombre: '',
        diaReunion: '',
        turnoReunion: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(data); // Aquí puedes hacer la llamada para actualizar los datos en la API
    };

    const getData = async () => {
        try {
            const response = await fetch(`/api/congregation/${id}`);
            const res = await response.json();

            // Aquí actualizas los valores del formulario con los datos de la API
            setData({
                nombre: res[0].nombre,
                diaReunion: res[0].diaReunion,
                turnoReunion: res[0].turnoReunion
            });
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getData();
    }, [id]); // La dependencia `id` asegura que solo se haga la llamada cuando el `id` cambie

    return (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-lg shadow-lg w-1/2 mx-auto mt-10">
            <div className="mb-5">
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">
                    Nombre Congregación
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={data.nombre}
                    onChange={(e) => setData({ ...data, nombre: e.target.value })}
                    className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="Sampaka"
                />
            </div>
            <div className="mb-5">
                <label htmlFor="dia_reunion" className="block mb-2 text-sm font-medium text-gray-900">
                    Día de Reunión
                </label>
                <select
                    name="dia_reunion"
                    id="dia_reunion"
                    className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    value={data.diaReunion}
                    onChange={(e) => setData({ ...data, diaReunion: e.target.value })}
                >
                    <option value="" disabled>
                        --- Selecciona un día ---
                    </option>
                    <option value="domingo">Domingo</option>
                    <option value="sabado">Sábado</option>
                </select>
            </div>
            <div className="mb-5">
                <label htmlFor="turno_reunion" className="block mb-2 text-sm font-medium text-gray-900">
                    Turno de la reunión
                </label>
                <select
                    name="turno_reunion"
                    id="turno_reunion"
                    className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    value={data.turnoReunion}
                    onChange={(e) => setData({ ...data, turnoReunion: e.target.value })}
                >
                    <option value="" disabled>
                        --- Selecciona un turno ---
                    </option>
                    <option value="T1">Turno 1 (9:30 - 11:30)</option>
                    <option value="T2">Turno 2 (11:30 - 13:30)</option>
                    <option value="T3">Turno 3 (13:30 - 15:30)</option>
                    <option value="T4">Turno 4 (15:30 - 17:30)</option>
                </select>
            </div>

            <button className="bg-cyan-600 py-2 text-white rounded-md w-full hover:bg-cyan-700 transition-colors disabled:bg-gray-400" type="submit">
                <span className="text-center">Añadir congregación</span>
            </button>
        </form>
    );
};
