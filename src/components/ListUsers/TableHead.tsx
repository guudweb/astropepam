
interface THeadProps {
    title: string;
    classes?: string;
}

export const TableHead: React.FC<THeadProps> = ({title, classes}) => {
    return (
        <th className={`px-6 py-3 ${classes}`}>
            {title}
        </th>
    )
}
