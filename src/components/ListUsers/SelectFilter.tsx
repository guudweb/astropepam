interface Option {
  value: string;
  text: string | boolean;
}

interface Props {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  data: Option[];
}

export const SelectFilter = ({ onChange, value, data }: Props) => {
  return (
    <div className="relative">
      <select 
        value={value} 
        onChange={onChange} 
        className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 pr-8 bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer"
      >
        {data.map((item, index) => (
          <option key={index} value={item.value}>
            {item.text}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};
