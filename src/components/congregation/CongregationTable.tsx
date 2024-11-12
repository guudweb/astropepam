import { TableHead, CongregationData } from "@/components/index"
import type { Congregation } from "@/interfaces/index";
import { useEffect, useState } from "react";
import { LoadingCongregationData } from "./LoadingCongregationData";


export const CongregationTable = () => {


    const [congregaciones, setCongregaciones] = useState<Congregation[]>([])
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/getCongregations')
            const data = await res.json()
            console.log(data);
            setCongregaciones(data)
        } catch (error) {
            console.log(error);
        }finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleClick = (id: number) => {
        console.log(id);
    }


    return (
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
    )
}