"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PriorityBadge } from "./priority-badge";
import {
  Brain,
  Loader2,
  ArrowRight,
  Truck,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface AIAssignment {
  tankerId: string;
  tankerReg: string;
  villageId: string;
  villageName: string;
  priority: "low" | "medium" | "high" | "urgent";
  reasoning: string;
  estimatedDistance: number;
}

interface AIPlan {
  summary: string;
  assignments: AIAssignment[];
}

interface AIContext {
  totalVillages: number;
  criticalVillages: number;
  unservedVillages: number;
  availableTankers: number;
}

type DialogState = "initial" | "loading" | "review" | "applying" | "applied" | "error";

interface AIOptimizerDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AIOptimizerDialog({
  open,
  onClose,
  onSuccess,
}: AIOptimizerDialogProps) {
  const [state, setState] = useState<DialogState>("initial");
  const [plan, setPlan] = useState<AIPlan | null>(null);
  const [context, setContext] = useState<AIContext | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [appliedCount, setAppliedCount] = useState(0);

  const handleGenerate = async () => {
    setState("loading");
    setError(null);
    try {
      const res = await fetch("/api/dispatches/ai-optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server returned an invalid response. Check your GROQ_API_KEY is set in .env.local");
      }
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate plan");
      }
      setPlan(data.plan);
      setContext(data.context);
      setState("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate plan");
      setState("error");
    }
  };

  const handleApply = async () => {
    if (!plan) return;
    setState("applying");
    try {
      const res = await fetch("/api/dispatches/ai-optimize?apply=true", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server returned an invalid response");
      }
      if (!res.ok) {
        throw new Error(data.error || "Failed to apply plan");
      }
      setAppliedCount(data.created.length);
      setState("applied");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to apply plan");
      setState("error");
    }
  };

  const handleClose = () => {
    setState("initial");
    setPlan(null);
    setContext(null);
    setError(null);
    setAppliedCount(0);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Dispatch Optimizer
            <Badge variant="secondary" className="text-[10px] ml-1">
              Llama 3.3
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Initial State */}
        {state === "initial" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The AI optimizer analyzes all critical villages, available tankers,
              and water sources to generate an optimal dispatch plan with
              reasoning.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <StatCard
                label="Critical Villages"
                value="--"
                icon={AlertTriangle}
              />
              <StatCard label="Available Tankers" value="--" icon={Truck} />
            </div>
            <Button onClick={handleGenerate} className="w-full">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate AI Plan
            </Button>
          </div>
        )}

        {/* Loading State */}
        {state === "loading" && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="relative">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <Brain className="h-5 w-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-medium">AI is analyzing...</p>
              <p className="text-sm text-muted-foreground">
                Evaluating villages, tankers, and routes
              </p>
            </div>
          </div>
        )}

        {/* Review State */}
        {state === "review" && plan && context && (
          <div className="flex flex-col gap-3">
            {/* Context Stats */}
            <div className="grid grid-cols-2 gap-2">
              <StatCard
                label="Critical Villages"
                value={String(context.criticalVillages)}
                icon={AlertTriangle}
              />
              <StatCard
                label="Available Tankers"
                value={String(context.availableTankers)}
                icon={Truck}
              />
            </div>

            {/* AI Summary */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3">
                <p className="text-xs font-medium text-primary mb-1 flex items-center gap-1">
                  <Brain className="h-3 w-3" />
                  AI Strategy
                </p>
                <p className="text-sm">{plan.summary}</p>
              </CardContent>
            </Card>

            <Separator />

            {/* Assignments — scrollable */}
            <p className="text-sm font-medium">
              Dispatch Plan ({plan.assignments.length} assignments)
            </p>
            <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1">
              {plan.assignments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No assignments recommended
                </p>
              ) : (
                plan.assignments.map((a, i) => (
                  <Card key={i}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5 text-sm font-medium">
                          <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                          {a.tankerReg}
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          {a.villageName}
                        </div>
                        <PriorityBadge priority={a.priority} />
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {a.reasoning}
                      </p>
                      <p className="text-xs font-mono text-muted-foreground">
                        ~{a.estimatedDistance} km
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                onClick={handleGenerate}
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
              <Button
                onClick={handleApply}
                className="flex-1"
                disabled={plan.assignments.length === 0}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Apply Plan
              </Button>
            </div>
          </div>
        )}

        {/* Applying State */}
        {state === "applying" && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="font-medium">Creating dispatches...</p>
          </div>
        )}

        {/* Applied State */}
        {state === "applied" && (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <div className="text-center">
              <p className="font-medium">Plan Applied Successfully</p>
              <p className="text-sm text-muted-foreground">
                {appliedCount} dispatches created
              </p>
            </div>
            <Button onClick={handleClose}>Done</Button>
          </div>
        )}

        {/* Error State */}
        {state === "error" && (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div className="text-center">
              <p className="font-medium">Something went wrong</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button onClick={handleGenerate}>Try Again</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-lg border bg-muted/50 p-2.5">
      <div className="flex items-center gap-1.5 mb-0.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-lg font-semibold font-mono">{value}</p>
    </div>
  );
}
