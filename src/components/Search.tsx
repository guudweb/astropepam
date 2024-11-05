
interface Props {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Search = ({ onChange }: Props) => {
    return (
        <div className="border border-gray-300 w-fit flex items-center px-2 rounded-lg">
            <input
                type="text"
                placeholder="Buscar por nombre..."
                onChange={onChange}
                className="p-2 focus:outline-none"
            />
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-6 text-gray-500"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                ></path>
            </svg>
        </div>

    )
}
