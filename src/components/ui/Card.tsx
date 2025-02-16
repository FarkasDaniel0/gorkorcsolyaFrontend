export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={`bg-white rounded-lg shadow p-4  ${className}`}>{children}</div>;
  }
  
  export function CardContent({ children }: { children: React.ReactNode }) {
    return <div className="mt-2">{children}</div>;
  }
  