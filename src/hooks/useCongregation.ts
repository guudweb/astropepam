import { useEffect, useState } from "react"
import type { Congregation } from "@/interfaces/index"

export const useCongregation = () => {
    const [congregaciones, setCongregaciones] = useState<Congregation[]>([])
    const [loading, setLoading] = useState(true)

    const [show, setShow] = useState(false)
    const [congreId, setCongreId] = useState(0)

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
        setShow(true)
        setCongreId(id)
    }


    return {
        congregaciones,
        loading,
        show, 
        congreId,
        handleClick,
        setShow,
    }
}






