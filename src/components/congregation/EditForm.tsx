import { useEffect, useState } from "react";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";

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
    const [loadCongre, setLoadCongre] = useState(false)
    const [loading, setLoading] = useState(false);

    const notyf = new Notyf({
        duration: 4000,
        position: {
            x: "right",
            y: "top",
        },
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true)
            //llamada a la API
            const res = await fetch(`/api/congregation/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })

            if (!res.ok) {
                notyf.error('Error al actualizar la congregación. Inténtalo más tarde')
                return
            }

            notyf.success('Congregación actualizada correctamente')

        } catch (error) {
            notyf.error('Error al actualizar la congregación')
        } finally {
            setLoading(false)
        }
    };

    const getData = async () => {
        try {
            setLoadCongre(true)
            const response = await fetch(`/api/congregation/${id}`);

            if (!response.ok) {
                notyf.error('Error al obtener la congregación. Recarga la página')
                return
            }

            const data = await response.json();


            // Aquí actualizas los valores del formulario con los datos de la API
            setData({
                nombre: data[0].nombre,
                diaReunion: data[0].diaReunion,
                turnoReunion: data[0].turnoReunion
            });
        } catch (error) {
            console.log(error);
        } finally {
            setLoadCongre(false)
        }
    };

    useEffect(() => {
        getData();
    }, [id]); // La dependencia `id` asegura que solo se haga la llamada cuando el `id` cambie

    return (
        <>
            {
                loadCongre
                    ? <div className="h-96 flex items-center justify-center">
                        <svg aria-hidden="true" className={`text-gray-200 animate-spin fill-cyan-600 size-10`} viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                        </svg>
                    </div>
                    : <form onSubmit={handleSubmit} className="bg-white p-5 rounded-lg shadow-lg w-full md:w-1/2 mx-auto mt-10">
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

                        <button disabled={loading} className="bg-cyan-600 py-2 text-white rounded-md w-full hover:bg-cyan-700 transition-colors disabled:bg-gray-400" type="submit">
                            <svg aria-hidden="true" className={`text-gray-200 animate-spin fill-cyan-600 size-6 ${loading ? 'mx-auto' : 'hidden'}`} viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                            </svg>
                            <span className={`text-center ${loading ? 'hidden' : 'block'}`}>Añadir congregación</span>
                        </button>
                    </form>
            }
        </>
    );
};
