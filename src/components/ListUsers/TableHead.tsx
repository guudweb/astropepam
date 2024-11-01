
interface THeadProps {
    title: string;
}

export const TableHead: React.FC<THeadProps> = ({title}) => {
    return (
        <th className="px-6 py-3">
            {title}
        </th>
    )
}
