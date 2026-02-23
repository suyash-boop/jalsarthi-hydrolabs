"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap } from "lucide-react";

interface AutoAssignDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AutoAssignDialog({
  open,
  onClose,
  onSuccess,
}: AutoAssignDialogProps) {
  const [minStressScore, setMinStressScore] = useState("70");
  const [maxDispatches, setMaxDispatches] = useState("5");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    summary: string;
    created: number;
    skipped: number;
  } | null>(null);

  const handleAutoAssign = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/dispatches/auto-assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          minStressScore: parseFloat(minStressScore),
          maxDispatches: parseInt(maxDispatches),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult({
          summary: data.summary,
          created: data.created.length,
          skipped: data.skipped.length,
        });
        onSuccess();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Auto-Assign Tankers
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Automatically assign available tankers to critical villages that don't
          have active dispatches.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Min Stress Score</label>
            <Input
              type="number"
              min="0"
              max="100"
              value={minStressScore}
              onChange={(e) => setMinStressScore(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Only villages above this score
            </p>
          </div>
          <div>
            <label className="text-sm font-medium">Max Dispatches</label>
            <Input
              type="number"
              min="1"
              max="50"
              value={maxDispatches}
              onChange={(e) => setMaxDispatches(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Maximum new dispatches to create
            </p>
          </div>
        </div>

        {result && (
          <div className="rounded-md bg-muted p-3 text-sm">
            <p className="font-medium">{result.summary}</p>
          </div>
        )}

        <Button onClick={handleAutoAssign} disabled={loading}>
          {loading ? "Assigning..." : "Run Auto-Assign"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
