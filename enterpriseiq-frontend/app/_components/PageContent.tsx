import { ReactNode } from "react";

export function PageContent({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col flex-1 min-w-0 h-full">
      <div className="flex-1 overflow-y-auto scrollbar-thin">{children}</div>
    </div>
  );
}
