import type { Congregacion, User } from "@/interfaces/user.interface";

import { TableRow } from "@/components/index";

interface Props {
    comments: User[] | [];
    handleClick: (userId: number) => void;
    isAdmin?: boolean; // NUEVA PROP
}

export const TableData: React.FC<Props> = ({ comments, handleClick, isAdmin }) => {

    

    return (
        <>
            {comments.map((user: User) => (
                <tr className="bg-white border-b hover:bg-gray-200 transition-colors" key={user.user_id}>
                    <TableRow
                        text={user.nombre || 'Sin Nombre'} // Manejo de nombre
                        className="whitespace-nowrap text-gray-900 font-medium"
                    />
                    <TableRow
                        text={user.congregacion ? user.congregacion.nombre : 'Sin Congregación'} // Manejo de congregación
                    />
                    <TableRow
                        text={user.telefono || 'Sin Teléfono'} // Manejo de teléfono
                    />
                    <TableRow>
                        {user.isActive ? (
                            <span className="flex justify-center items-center bg-green-200 rounded-full size-6">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-3 text-green-700">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                            </span>
                        ) : (
                            <span className="flex justify-center items-center bg-red-200 rounded-full size-6">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 text-red-700">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </span>
                        )}
                    </TableRow>
                    {/* NUEVO: Mostrar descripción solo para admins */}
                    {isAdmin && (
                        <TableRow>
                            <div className="max-w-xs">
                                <p className="text-sm text-gray-600 truncate" title={user.descripcion || 'Sin descripción'}>
                                    {user.descripcion || 'Sin descripción'}
                                </p>
                            </div>
                        </TableRow>
                    )}
                    <TableRow className="flex gap-x-5">
                        <a href={`/user/${user.user_id}`} className="group">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-7 text-cyan-700 group-hover:scale-110 transition-transform">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                        </a>
                        <button className="group" onClick={() => handleClick(user.user_id)}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-7 text-red-600 group-hover:scale-110 transition-transform">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                        </button>
                    </TableRow>
                </tr>
            ))}
        </>
    );
};
