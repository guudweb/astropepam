import { TableHead, CongregationData, LoadingCongregationData } from "@/components/index"
import { useCongregation } from "@/hooks/useCongregation"
import { CongregationMovile } from "./CongregationMovile"
import { LoadingCongreMovile } from "./LoadingCongreMovile"


export const CongregationTable = () => {

    const { congregaciones, handleClick, loading } = useCongregation()

    return (
        <>
            <table className="hidden md:table w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs uppercase bg-gray-300 text-gray-900">
                    <tr>
                        <TableHead title="Nombre" />
                        <TableHead title="Dia de Reunión" />
                        <TableHead title="Turno" />
                        <TableHead title="Acciones" />
                    </tr>
                </thead>
                <tbody>
                    {
                        loading
                            ? <LoadingCongregationData />
                            : <CongregationData comments={congregaciones} handleClick={handleClick} />
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
                                : <CongregationMovile comments={congregaciones} handleClick={handleClick} />
                        }
                    </tbody>
                </table>
            </div>
        </>
    )
}
