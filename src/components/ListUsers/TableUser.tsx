import type { User } from "../../interfaces"
import { LoadingTable } from "./LoadingTable";
import { TableData } from "./TableData"
import { TableHead } from "./TableHead"

interface TableProps {
    comments: User[],
    isLoading: boolean;
}

export const TableUser: React.FC<TableProps> = ({comments, isLoading}) => {
    
    
    return (
        <table className="w-full text-sm text-left rtl:text-right text-gray-500">
            <thead className="text-xs uppercase bg-gray-300 text-gray-900">
                <tr>
                    <TableHead title="Nombre"/>
                    <TableHead title="Congregación"/>
                    <TableHead title="Teléfono"/>
                    <TableHead title="Disponible"/>
                    <TableHead title="Acciones"/>
                </tr>
            </thead>
            <tbody>
               {
                isLoading
                ? <LoadingTable />
                : <TableData comments={comments} />
               }
            </tbody>
        </table>
    )
}
