import { TableHead, CongregationData, LoadingCongregationData, Modal, CongregationMovile, LoadingCongreMovile } from "@/components/index"
import { useCongregation } from "@/hooks/useCongregation"
import { useEffect, useState } from "react"

import { Notyf } from "notyf";
import "notyf/notyf.min.css";
import type { Congregation } from "@/interfaces/index"


export const CongregationTable = () => {

    const { congregaciones, handleClick, loading, show, setShow, congreId } = useCongregation()

    const [loadingDelete, setLoadingDelete] = useState(false);
    const [filteredCongres, setFilteredCongres] = useState<Congregation[]>(congregaciones);
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

    // Función para ordenar las congregaciones
    const sortCongregations = (congresToSort: Congregation[]) => {
        return [...congresToSort].sort((a, b) => {
            let aValue: any = a[sortField as keyof Congregation];
            let bValue: any = b[sortField as keyof Congregation];

            // Comparación
            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    };

    useEffect(() => {
        setFilteredCongres(sortCongregations(congregaciones));
    }, [congregaciones, sortField, sortDirection]);

    const handleDelete = async () => {
        if (congreId === null) return;
        setLoadingDelete(true);

        try {
            const res = await fetch(`/api/congregation/${congreId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                notyf.success("Usuario eliminado correctamente");
                setShow(false);

                // Filtrar el usuario eliminado
                setFilteredCongres(prevComments =>
                    prevComments.filter(comment => comment.id !== congreId)
                );
            } else {
                notyf.error('Error al eliminar un usuario. Inténtalo más tarde');
            }
        } catch (error) {
            notyf.error('Error al eliminar la congregación. Inténtalo más tarde');
        }finally {
            setLoadingDelete(false);
        }
    }

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
                            title="Dia de Reunión"
                            sortKey="dia"
                            onSort={handleSort}
                            sortField={sortField}
                            sortDirection={sortDirection}
                        />
                        <TableHead 
                            title="Turno"
                            sortKey="turno"
                            onSort={handleSort}
                            sortField={sortField}
                            sortDirection={sortDirection}
                        />
                        <TableHead title="Acciones" />
                    </tr>
                </thead>
                <tbody>
                    {
                        loading
                            ? <LoadingCongregationData />
                            : <CongregationData comments={filteredCongres} handleClick={handleClick} />
                    }
                </tbody>
            </table>

            <div className="overflow-x-scroll">
                <table className="md:hidden table w-full text-sm text-left rtl:text-right text-gray-500">
                    <thead className="text-xs uppercase bg-gray-300 text-gray-900">
                        <tr>
                            <TableHead title="Información" />
                            <TableHead title="Acciones" />
                        </tr>
                    </thead>
                    <tbody>
                        {
                            loading
                                ? <LoadingCongreMovile />
                                : <CongregationMovile comments={filteredCongres} handleClick={handleClick} />
                        }
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {show && (
                <Modal
                    loading={loadingDelete}
                    handleDelete={handleDelete}
                    setShow={setShow}
                    text="¿Seguro deseas eliminar esta congregación?"
                />
            )}
        </>
    )
}
