
interface THeadProps {
    title: string;
    classes?: string;
    sortKey?: string;
    onSort?: (key: string) => void;
    sortField?: string;
    sortDirection?: 'asc' | 'desc';
}

export const TableHead: React.FC<THeadProps> = ({title, classes, sortKey, onSort, sortField, sortDirection}) => {
    const isSorted = sortKey && sortField === sortKey;
    const isClickable = sortKey && onSort;
    
    return (
        <th 
            className={`px-6 py-3 ${classes} ${isClickable ? 'cursor-pointer hover:bg-gray-400 select-none' : ''}`}
            onClick={() => isClickable && onSort(sortKey)}
        >
            <div className="flex items-center gap-1">
                {title}
                {isClickable && (
                    <div className="flex flex-col text-xs">
                        <span className={`${isSorted && sortDirection === 'asc' ? 'text-gray-900' : 'text-gray-400'}`}>▲</span>
                        <span className={`${isSorted && sortDirection === 'desc' ? 'text-gray-900' : 'text-gray-400'} -mt-1`}>▼</span>
                    </div>
                )}
            </div>
        </th>
    )
}
