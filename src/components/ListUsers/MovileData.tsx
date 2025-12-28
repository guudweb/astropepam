import type { User } from "@/interfaces/index";
import { TableRow } from "@/components/index";

interface Props {
    comments: User[] | [];
    handleClick: (userId: number) => void;
}

const PrivilegeBadge: React.FC<{ privilege: string }> = ({ privilege }) => {
    const firstLetter = privilege.charAt(0).toUpperCase();
    
    // Función para obtener el color según el privilegio
    const getPrivilegeColor = (priv: string) => {
        const privilegeLower = priv.toLowerCase();
        switch (privilegeLower) {
            case 'capitán':
            case 'capitan':
                return 'bg-blue-600';
            case 'precursor':
                return 'bg-green-600';
            case 'especial':
                return 'bg-red-600';
            case 'anciano':
                return 'bg-gray-600';
            case 'siervo':
                return 'bg-orange-600';
            default:
                return 'bg-violet-600'; // Color para categorías personalizadas
        }
    };
    
    return (
        <span 
            className={`inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white ${getPrivilegeColor(privilege)} rounded-full`}
            title={privilege}
        >
            {firstLetter}
        </span>
    );
};

export const MovileData: React.FC<Props> = ({ comments, handleClick }) => {




    return (
        <>
            {comments.map((user: User) => (
                <tr className="bg-white border-b hover:bg-gray-200 transition-colors" key={user.user_id}>
                    <TableRow // Manejo de info
                        className="whitespace-nowrap text-gray-900 font-medium px-[15px]"
                    >
                            <div className="">
                                <div className="flex items-center gap-2">
                                    <p className="text-md text-gray-900 text-[17px]">{user.nombre}</p>
                                    {user.privilegios && Array.isArray(user.privilegios) && (
                                        <div className="flex gap-1">
                                            {user.privilegios.map((privilege: string, index: number) => (
                                                <PrivilegeBadge key={index} privilege={privilege} />
                                            ))}
                                        </div>
                                    )}
                                    {user.isActive ? (
                                        <span className="flex justify-center items-center bg-green-200 rounded-full size-3" />
                                    ) : (
                                        <span className="flex justify-center items-center bg-red-200 rounded-full size-3" />
                                    )}
                                </div>
                                <p className="text-[14px] text-gray-500">{user.congregacion.nombre}</p>
                                <p className="text-[14px] text-gray-500">{user.telefono}</p>
                            </div>
                            <div></div>
                    </TableRow>
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
}
