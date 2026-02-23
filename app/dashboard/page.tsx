"use client";

import { useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/jalsarthi/app-sidebar";
import { MaharashtraMap } from "@/components/jalsarthi/maharashtra-map";
import { Header } from "@/components/jalsarthi/header";
import { VillageDetailPanel } from "@/components/jalsarthi/village-detail-panel";
import { DispatchDetailSheet } from "@/components/jalsarthi/dispatch-detail-sheet";
import { DispatchCreateDialog } from "@/components/jalsarthi/dispatch-create-dialog";
import { useVillages } from "@/hooks/use-villages";
import { useTankers } from "@/hooks/use-tankers";
import { useDispatches } from "@/hooks/use-dispatches";
import type { Village, Dispatch } from "@/lib/types";

const SIDEBAR_WIDTHS = {
  villages: "22rem",
  tankers: "25rem",
} as const;

export default function DashboardPage() {
  const { villages, waterSources } = useVillages();
  const { tankers, refetch: refetchTankers } = useTankers();
  const { dispatches, refetch: refetchDispatches } = useDispatches();
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState<Dispatch | null>(
    null
  );
  const [dispatchDetailOpen, setDispatchDetailOpen] = useState(false);
  const [requestDispatchOpen, setRequestDispatchOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<"villages" | "tankers">(
    "villages"
  );

  const handleVillageSelect = (village: Village | null) => {
    setSelectedVillage(village);
    if (village) {
      setDetailOpen(true);
    }
  };

  const handleDispatchSelect = (dispatch: Dispatch) => {
    setSelectedDispatch(dispatch);
    setDispatchDetailOpen(true);
  };

  const handleDispatchUpdate = () => {
    refetchDispatches();
    refetchTankers();
  };

  const handleRequestTanker = () => {
    setDetailOpen(false);
    setRequestDispatchOpen(true);
  };

  const handleRequestDispatchSuccess = () => {
    refetchDispatches();
    refetchTankers();
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": SIDEBAR_WIDTHS[sidebarMode],
        } as React.CSSProperties
      }
    >
      <AppSidebar
        villages={villages}
        tankers={tankers}
        dispatches={dispatches}
        selectedVillage={selectedVillage}
        onVillageSelect={(v) => handleVillageSelect(v)}
        onDispatchSelect={handleDispatchSelect}
        onTankerRefetch={refetchTankers}
        onDispatchRefetch={refetchDispatches}
        onModeChange={setSidebarMode}
      />
      <SidebarInset>
        <Header />
        <div className="flex-1 relative">
          <MaharashtraMap
            villages={villages}
            waterSources={waterSources}
            tankers={tankers}
            dispatches={dispatches}
            selectedVillage={selectedVillage}
            onVillageSelect={handleVillageSelect}
          />
        </div>
      </SidebarInset>

      <VillageDetailPanel
        village={selectedVillage}
        dispatches={dispatches}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onRequestTanker={handleRequestTanker}
      />

      <DispatchDetailSheet
        dispatch={selectedDispatch}
        open={dispatchDetailOpen}
        onClose={() => setDispatchDetailOpen(false)}
        onUpdate={handleDispatchUpdate}
      />

      <DispatchCreateDialog
        open={requestDispatchOpen}
        onClose={() => setRequestDispatchOpen(false)}
        onSuccess={handleRequestDispatchSuccess}
        villages={villages}
      />
    </SidebarProvider>
  );
}
