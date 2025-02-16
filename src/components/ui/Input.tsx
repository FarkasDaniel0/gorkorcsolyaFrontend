export function Input({ type = "text", placeholder, value, onChange, className }: {
    type?: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
  }) {
    return (
      <input 
        type={type} 
        placeholder={placeholder} 
        value={value} 
        onChange={onChange} 
        className={`border rounded-lg p-2 w-full ${className}`}
      />
    );
  }