import { ReactNode } from "react";
import BottomNavigation from "./BottomNavigation";
import Header from "./Header";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pb-16">{children}</main>      
      <BottomNavigation />
    </div>
  );
}
