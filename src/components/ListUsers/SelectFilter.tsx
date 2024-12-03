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
    <select value={value} onChange={onChange} className="border p-2 rounded">
      {data.map((item, index) => (
        <option key={index} value={item.value}>
          {item.text}
        </option>
      ))}
    </select>
  );
};
