import { Header } from "@/components/jalsarthi/header";

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col">
      <Header showSidebarTrigger={false} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
