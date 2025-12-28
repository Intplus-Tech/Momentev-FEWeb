import { ReactNode } from "react";

type ContentWrapperProps = {
  children: ReactNode;
  className?: string;
};

export default function ContentWrapper({
  children,
  className = "",
}: ContentWrapperProps) {
  return (
    <div className="w-full overflow-x-hidden">
      <div
        className={`
          mx-auto
          w-full
          
          ${className}
        `}
      >
        {children}
      </div>
    </div>
  );
}
