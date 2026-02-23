import { Droplets } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export function Header() {
  return (
    <header className="flex h-14 items-center gap-3 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-6" />
      <div className="flex items-center gap-2">
        <Droplets className="h-5 w-5 text-secondary" />
        <h1 className="text-lg font-bold tracking-tight">
          <span className="text-primary">Jal</span>
          <span className="text-secondary">Sarthi</span>
        </h1>
      </div>
      <p className="hidden sm:block text-xs text-muted-foreground ml-2">
        Drought Warning & Smart Tanker Management
      </p>
    </header>
  );
}
