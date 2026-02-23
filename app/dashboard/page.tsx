"use client";

import { useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/jalsarthi/app-sidebar";
import { MaharashtraMap } from "@/components/jalsarthi/maharashtra-map";
import { Header } from "@/components/jalsarthi/header";
import { villages } from "@/lib/mock-data";
import type { Village } from "@/lib/types";

export default function DashboardPage() {
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);

  return (
    <SidebarProvider>
      <AppSidebar
        villages={villages}
        selectedVillage={selectedVillage}
        onVillageSelect={setSelectedVillage}
      />
      <SidebarInset>
        <Header />
        <div className="flex-1 relative">
          <MaharashtraMap
            villages={villages}
            selectedVillage={selectedVillage}
            onVillageSelect={setSelectedVillage}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
