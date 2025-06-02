import { useState, useEffect, useCallback } from "react";
import Disponibility from "../Disponibility";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";

export const UserEditForm = ({ user, congregacionData, session }) => {
  const [nombre, setNombre] = useState(user.nombre || "");
  const [contraseña, setContraseña] = useState(user.contraseña || "");
  const [telefono, setTelefono] = useState(user.telefono || "");
  const [correo, setCorreo] = useState(user.correo || "");
  const [congregacion, setCongregacion] = useState(user.congregacion || "");
  const [isActive, setIsActive] = useState(user.isActive || false);
  const [sexo, setSexo] = useState(user.sexo || "M");
  const [estadoCivil, setEstadoCivil] = useState(user.estadoCivil || "soltero");
  const [role, setRole] = useState(user.role || "user");
  const [availability, setAvailability] = useState(user.disponibilidad || {});
  const [userName, setUsername] = useState(user.userName || "");
  const [loading, setLoading] = useState(false);
  const [descripcion, setDescripcion] = useState(user.descripcion || "");

  const handleDisponibilityChange = useCallback((newAvailability) => {
    setAvailability(newAvailability);
  }, []);

  const notyf = new Notyf({
    duration: 4000,
    position: {
      x: "right",
      y: "top",
    },
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
    setDescripcion(user.descripcion || "");
    setUsername(user.userName);
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
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
      role,
      descripcion, // NUEVO
    };

    try {
      const response = await fetch(`/api/user/${user.user_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="bg-white p-5 rounded-lg shadow-lg" onSubmit={handleSubmit}>
      <div className="mb-5">
        <label
          htmlFor="name"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Nombre
        </label>
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
        <label
          htmlFor="username"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Nombre de usuario
        </label>
        <span className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
          {userName}
        </span>
      </div>
      <div className="mb-5">
        <label
          htmlFor="password"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Contraseña
        </label>
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
        <label
          htmlFor="phone"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Teléfono
        </label>
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
        <label
          htmlFor="email"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Email
        </label>
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
        <label
          htmlFor="congregacion"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Congregación
        </label>
        <select
          className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          value={congregacion}
          onChange={(e) => setCongregacion(e.target.value)}
        >
          <option value="" disabled>
            Sin congregación
          </option>
          {congregacionData.map((item) => (
            <option value={item.id} key={item.id}>
              {item.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-5">
        <h5 className="block mb-4 text-sm font-medium text-gray-900">
          ¿Estoy disponible?
        </h5>
        <label className="inline-flex items-center cursor-pointer space-x-2">
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
                d="M6 18 18 6M6 6l12 12"
              ></path>
            </svg>
          </div>
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="sr-only peer"
          />
          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
          <div className="bg-green-200 rounded-full p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="text-green-700 size-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 12.75 6 6 9-13.5"
              />
            </svg>
          </div>
        </label>
      </div>

      <div className="mb-5">
        <label
          htmlFor="sexo"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Sexo
        </label>
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
        <label
          htmlFor="estadoCivil"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Estado Civil
        </label>
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
        <h5 className="block mb-4 text-sm font-medium text-gray-900">
          Disponibilidad
        </h5>
        <Disponibility
          disponibilidad={user.disponibilidad}
          onChange={(newAvailability) =>
            handleDisponibilityChange(newAvailability)
          }
        />
      </div>

      {session.user.role === "admin" && (
        <div className="mb-5 ">
          <label
            htmlFor="rol"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Rol del usuario (Solo Admins)
          </label>
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
      )}

      {/* NUEVO CAMPO: Descripción (solo para admins) */}
      {session.user.role === "admin" && (
        <div className="mb-5">
          <label
            htmlFor="descripcion"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Descripción (Solo visible para administradores)
          </label>
          <textarea
            id="descripcion"
            rows={4}
            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Notas internas sobre el usuario..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            maxLength={500}
          />
          <p className="mt-1 text-sm text-gray-500">
            {descripcion.length}/500 caracteres
          </p>
        </div>
      )}

      <button
        disabled={loading}
        type="submit"
        className="flex justify-center bg-cyan-600 rounded-lg px-4 py-2 w-full text-white hover:bg-cyan-700 transition-colors disabled:bg-gray-400"
      >
        {loading ? (
          <div role="status">
            <svg
              aria-hidden="true"
              className={`text-gray-200 animate-spin fill-cyan-600 size-6`}
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
          </div>
        ) : (
          <span>Guardar cambios</span>
        )}
      </button>
    </form>
  );
};
