import { ReactNode } from "react";
import Sidebar from "../_components/sidebar";
import Header from "../_components/header";
import SetupTitle from "../_components/SetupTitle";

export default function ProfileSetupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 pt-16 lg:pl-64 relative">
          <SetupTitle />
          <div className="px-4 py-6 mt-10 md:px-6 md:py-8 lg:px-8 max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
