
interface ButtonPaginationProps {
    disabled: boolean;
    onClick: () => void;
    text: string;
}



export const PaginationButton: React.FC<ButtonPaginationProps> = ({disabled, onClick, text}) => {
  return (
    <button disabled={disabled} onClick={onClick} className="bg-cyan-600 px-3 py-2 mt-5 rounded-lg text-white disabled:bg-gray-400">{text}</button>
  )
}
