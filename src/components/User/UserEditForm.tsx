import { useState, useEffect, useCallback } from "react";
import Disponibility from "../Disponibility";
import useAvailability from "../../hooks/useAvailability ";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";


export const UserEditForm = ({ user, congregacionData }) => {
    const [nombre, setNombre] = useState(user.nombre || "");
    const [contraseña, setContraseña] = useState(user.contraseña || "");
    const [telefono, setTelefono] = useState(user.telefono || "");
    const [correo, setCorreo] = useState(user.correo || "");
    const [congregacion, setCongregacion] = useState(user.congregacion || "");
    const [isActive, setIsActive] = useState(user.isActive || false);
    const [sexo, setSexo] = useState(user.sexo || "M");
    const [estadoCivil, setEstadoCivil] = useState(user.estadoCivil || "soltero");
    const [role, setRole] = useState(user.role || "user")
    const [availability, setAvailability] = useState(user.disponibilidad || {});

    const handleDisponibilityChange = useCallback((newAvailability) => {
        setAvailability(newAvailability);
    }, []);

    const notyf = new Notyf({
        duration: 4000,
        position: {
            x: 'right',
            y: 'top',
        }
    });

    useEffect(() => {
        setNombre(user.nombre || "");
        setContraseña(user.contraseña || "");
        setTelefono(user.telefono || "");
        setCorreo(user.correo || "");
        setCongregacion(user.congregacion || "");
        setIsActive(user.isActive || false);
        setSexo(user.sexo || "M");
        setEstadoCivil(user.estadoCivil || "soltero");
    }, [user]);


    const handleSubmit = async (e) => {
        e.preventDefault();

        const userData = {
            nombre,
            contraseña,
            telefono,
            correo,
            congregacion: congregacion || null,
            isActive,
            sexo,
            estadoCivil,
            availability,
            role
        };

        try {
            const response = await fetch(`/api/user/${user.user_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                const updatedUser = await response.json();
                notyf.success("Usuario actualizado correctamente");

            } else {
                notyf.error("Error al actualizar el usuario. Inténtalo más tarde");
                console.error("Error al actualizar el usuario:", response.statusText);
            }
        } catch (error) {
            notyf.error("Error del servidor");
        }
    }

    return (
        <form className="bg-white p-5 rounded-lg shadow-lg" onSubmit={handleSubmit}>
            <div className="mb-5">
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">Nombre</label>
                <input
                    type="text"
                    id="name"
                    className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="Pedro Ondo"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                />
            </div>
            <div className="mb-5">
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">Contraseña</label>
                <input
                    type="text"
                    id="password"
                    className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="Pon la contraseña que desees"
                    required
                    value={contraseña}
                    onChange={(e) => setContraseña(e.target.value)}
                />
            </div>
            <div className="mb-5">
                <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-900">Teléfono</label>
                <input
                    type="text"
                    id="phone"
                    className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="222587412"
                    required
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                />
            </div>
            <div className="mb-5">
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">Email</label>
                <input
                    type="email"
                    id="email"
                    className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="ppam@malabo.com"
                    required
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                />
            </div>

            <div className="mb-5">
                <label htmlFor="congregacion" className="block mb-2 text-sm font-medium text-gray-900">Congregación</label>
                <select
                    className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    value={congregacion}
                    onChange={(e) => setCongregacion(e.target.value)}
                >
                    {congregacionData.map((item) => (
                        <option value={item.id} key={item.id}>{item.nombre}</option>
                    ))}
                </select>
            </div>

            <div className="mb-5">
                <h5 className="block mb-4 text-sm font-medium text-gray-900">
                    ¿Estoy disponible?
                </h5>
                <label
                    className="inline-flex items-center cursor-pointer space-x-2"
                >
                    <div className="bg-red-200 rounded-full p-1">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-4 text-red-700"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18 18 6M6 6l12 12"></path>
                        </svg>
                    </div>
                    <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="sr-only peer"
                    />
                    <div
                        className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"
                    >
                    </div>
                    <div className="bg-green-200 rounded-full p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="text-green-700 size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                    </div>
                </label>
            </div>

            <div className="mb-5">
                <label htmlFor="sexo" className="block mb-2 text-sm font-medium text-gray-900">Sexo</label>
                <select
                    id="sexo"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
                    value={sexo}
                    onChange={(e) => setSexo(e.target.value)}
                >
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                </select>
            </div>

            <div className="mb-5">
                <label htmlFor="estadoCivil" className="block mb-2 text-sm font-medium text-gray-900">Estado Civil</label>
                <select
                    id="estadoCivil"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
                    value={estadoCivil}
                    onChange={(e) => setEstadoCivil(e.target.value)}
                >
                    <option value="casado">Casado</option>
                    <option value="soltero">Soltero</option>
                </select>
            </div>

            <div className="mb-10">
                <h5 className="block mb-4 text-sm font-medium text-gray-900">Disponibilidad</h5>
                <Disponibility disponibilidad={user.disponibilidad} onChange={handleDisponibilityChange} />
            </div>

            <div className="mb-5 ">
                <label htmlFor="rol" className="block mb-2 text-sm font-medium text-gray-900">Rol del usuario (Solo Admins)</label>
                <select
                    id="rol"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                >
                    <option value="superadmin">Super Admin</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                </select>
            </div>
            {
                user.role === 'admin' || user.role === 'superadmin' && (
                    <div className="mb-5 ">
                        <label htmlFor="rol" className="block mb-2 text-sm font-medium text-gray-900">Rol del usuario (Solo Admins)</label>
                        <select
                            id="rol"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="superadmin">Super Admin</option>
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                        </select>
                    </div>
                )
            }

            <button type="submit" className="bg-cyan-600 rounded-lg px-4 py-2 w-full text-white hover:bg-cyan-700 transition-colors">
                Editar Usuario
            </button>
        </form>
    );
};
