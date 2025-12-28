import { useState, useEffect } from "react";
import { type User } from '@/interfaces/index'
import { LoadingTable, TableData, TableHead, MovileData, LoadingMovile, Modal } from "@/components/index";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";


interface TableProps {
    comments: User[];
    isLoading: boolean;
    isAdmin?: boolean;
}

export const TableUser: React.FC<TableProps> = ({ comments, isLoading, isAdmin }) => {
    const [show, setShow] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [filteredComments, setFilteredComments] = useState<User[]>(comments);
    const [sortField, setSortField] = useState<string>('nombre');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const notyf = new Notyf({
        duration: 4000,
        position: {
            x: 'right',
            y: 'top',
        }
    });

    // Función para manejar el sorting
    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Función para ordenar los comentarios
    const sortComments = (commentsToSort: User[]) => {
        return [...commentsToSort].sort((a, b) => {
            let aValue: any = a[sortField as keyof User];
            let bValue: any = b[sortField as keyof User];

            // Manejo especial para congregación
            if (sortField === 'congregacion') {
                aValue = a.congregacion?.nombre || '';
                bValue = b.congregacion?.nombre || '';
            }

            // Manejo especial para disponible
            if (sortField === 'isActive') {
                aValue = a.isActive ? 'Sí' : 'No';
                bValue = b.isActive ? 'Sí' : 'No';
            }

            // Comparación
            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    };

    // Sincronizar y ordenar filteredComments cuando cambian los comments o el sorting
    useEffect(() => {
        setFilteredComments(sortComments(comments));
    }, [comments, sortField, sortDirection]);

    const handleClick = (userId: number) => {
        setSelectedUserId(userId);
        setShow(true);
    };

    const handleDelete = async () => {
        if (selectedUserId === null) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/user/${selectedUserId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                notyf.success("Usuario eliminado correctamente");
                setShow(false);

                // Filtrar el usuario eliminado
                setFilteredComments(prevComments =>
                    prevComments.filter(comment => comment.user_id !== selectedUserId)
                );
            } else {
                notyf.error('Error al eliminar un usuario. Inténtalo más tarde');
            }
        } catch (error) {
            console.error('Error al hacer la solicitud de eliminación', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <table className="hidden md:table w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs uppercase bg-gray-300 text-gray-900">
                    <tr>
                        <TableHead 
                            title="Nombre" 
                            sortKey="nombre"
                            onSort={handleSort}
                            sortField={sortField}
                            sortDirection={sortDirection}
                        />
                        <TableHead 
                            title="Congregación"
                            sortKey="congregacion"
                            onSort={handleSort}
                            sortField={sortField}
                            sortDirection={sortDirection}
                        />
                        <TableHead title="Teléfono" />
                        <TableHead 
                            title="Disponible"
                            sortKey="isActive"
                            onSort={handleSort}
                            sortField={sortField}
                            sortDirection={sortDirection}
                        />
                        {isAdmin && <TableHead title="Descripción" />}
                        <TableHead title="Acciones" />
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <LoadingTable />
                    ) : (
                        <TableData comments={filteredComments} handleClick={handleClick} isAdmin={isAdmin} />
                    )}
                </tbody>
            </table>

            <table className="table md:hidden w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs uppercase bg-gray-300 text-gray-900">
                    <tr>
                        <TableHead title="Información" />
                        <TableHead title="Acciones" />
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <LoadingMovile />
                    ) : (
                        <MovileData comments={filteredComments} handleClick={handleClick} />
                    )}
                </tbody>
            </table>

            {/* Modal */}
            {show && (
                <Modal
                    loading={loading}
                    handleDelete={handleDelete}
                    setShow={setShow}
                    text="¿Seguro deseas eliminar a esta persona?"
                />
            )}
        </>
    );
};
