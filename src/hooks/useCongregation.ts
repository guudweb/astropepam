import { useEffect, useState } from "react"
import type { Congregation } from "@/interfaces/index"

export const useCongregation = () => {
    const [congregaciones, setCongregaciones] = useState<Congregation[]>([])
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/getCongregations')
            const data = await res.json()
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


    return {
        congregaciones,
        loading,
        handleClick
    }
}






