interface TRowProps {
  children?: React.ReactNode
  className?: string;
  text?: string;
}

export const TableRow: React.FC<TRowProps> = ({text,children,className}) => {
  return (
    <td className={`px-6 py-4 text-sm text-gray-700 ${className}`}>{text && text} {children}</td>
  )
}
