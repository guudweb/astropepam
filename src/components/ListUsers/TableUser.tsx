import { useState } from "react";
import type { User } from "../../interfaces"
import { LoadingTable } from "./LoadingTable";
import { TableData } from "./TableData"
import { TableHead } from "./TableHead"

interface TableProps {
    comments: User[],
    isLoading: boolean;
}

export const TableUser: React.FC<TableProps> = ({ comments, isLoading }) => {
    const [show, setShow] = useState(false)

    const handleClick = () => {
        setShow(true)
    }

    return (
        <>
            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs uppercase bg-gray-300 text-gray-900">
                    <tr>
                        <TableHead title="Nombre" />
                        <TableHead title="Congregación" />
                        <TableHead title="Teléfono" />
                        <TableHead title="Disponible" />
                        <TableHead title="Acciones" />
                    </tr>
                </thead>
                <tbody>
                    {
                        isLoading
                            ? <LoadingTable />
                            : <TableData comments={comments} handleClick={handleClick} />
                    }
                </tbody>

            </table>
            {
                show && (
                    <>
                        <div className="bg-white/70 w-full h-full fixed top-0 left-0 z-10" />
                        <div className=" h-auto rounded-lg shadow-lg fixed inset-0 z-20 flex justify-center items-center">
                            <div className="bg-white w-full mx-10 md:w-1/2 xl:w-1/3 rounded-lg shadow-lg px-5 md:px-10 py-8 text-center">
                                <div className="bg-red-100 p-5 w-fit mx-auto rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-red-600 size-16"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 1.67c.955 0 1.845 .467 2.39 1.247l.105 .16l8.114 13.548a2.914 2.914 0 0 1 -2.307 4.363l-.195 .008h-16.225a2.914 2.914 0 0 1 -2.582 -4.2l.099 -.185l8.11 -13.538a2.914 2.914 0 0 1 2.491 -1.403zm.01 13.33l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm-.01 -7a1 1 0 0 0 -.993 .883l-.007 .117v4l.007 .117a1 1 0 0 0 1.986 0l.007 -.117v-4l-.007 -.117a1 1 0 0 0 -.993 -.883z" /></svg>
                                </div>
                                <h3 className="text-xl md:text-3xl font-bold text-balance">¿Seguro deseas eliminar a esta persona?</h3>
                                <p className="text-xs md:text-sm text-gray-700 mt-5 text-pretty">Una vez eliminados, los datos de esta persona no se podrán recuperar. Esta acción es irreversible.</p>

                                <div className="flex justify-between gap-x-5 mt-5">
                                    <button className="bg-red-600 px-2 py-1 text-white rounded-lg text-lg w-1/2">Eliminar</button>
                                    <button className="bg-gray-400 px-2 py-1 text-white rounded-lg text-lg w-1/2" onClick={() => setShow(false)}>Cerrar</button>
                                </div>
                            </div>
                        </div>
                    </>
                )
            }
        </>
    )
}
