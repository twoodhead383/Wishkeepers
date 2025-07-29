import { ReactNode } from "react";
import { Navigation } from "./navigation";

interface LayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
}

export function Layout({ children, showNavigation = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-soft-gray">
      {showNavigation && <Navigation />}
      <main className={showNavigation ? "" : "pt-0"}>
        {children}
      </main>
    </div>
  );
}
