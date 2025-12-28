import { TableRow } from "@/components/index"


export const LoadingCongreMovile = () => {
    return (
        <>
            {Array.from({ length: 12 }).map((_, index) => (
                <tr className="bg-white border-b hover:bg-gray-200 transition-colors" key={index}>
                    <TableRow className="animate-pulse">
                        <div className="bg-gray-300 h-6 w-full rounded"></div>
                    </TableRow>
                    <TableRow className="animate-pulse">
                        <div className="bg-gray-300 h-6 w-full rounded"></div>
                    </TableRow>
                </tr>
            ))}

        </>
    )
}
