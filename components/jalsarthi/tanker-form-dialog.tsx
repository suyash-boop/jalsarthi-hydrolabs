"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TankerFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TankerFormDialog({
  open,
  onClose,
  onSuccess,
}: TankerFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    registrationNo: "",
    driverName: "",
    driverPhone: "",
    capacity: "10000",
    depotLocation: "",
    depotLat: "21.1458",
    depotLng: "79.0882",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/tankers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          capacity: parseInt(form.capacity),
          depotLat: parseFloat(form.depotLat),
          depotLng: parseFloat(form.depotLng),
        }),
      });
      if (res.ok) {
        onSuccess();
        onClose();
        setForm({
          registrationNo: "",
          driverName: "",
          driverPhone: "",
          capacity: "10000",
          depotLocation: "",
          depotLat: "21.1458",
          depotLng: "79.0882",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Tanker</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-sm font-medium">Registration No.</label>
            <Input
              required
              placeholder="MH-31-XX-0000"
              value={form.registrationNo}
              onChange={(e) =>
                setForm({ ...form, registrationNo: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium">Driver Name</label>
            <Input
              required
              placeholder="Full name"
              value={form.driverName}
              onChange={(e) =>
                setForm({ ...form, driverName: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium">Driver Phone</label>
            <Input
              placeholder="9876543210"
              value={form.driverPhone}
              onChange={(e) =>
                setForm({ ...form, driverPhone: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Capacity (L)</label>
              <Input
                required
                type="number"
                value={form.capacity}
                onChange={(e) =>
                  setForm({ ...form, capacity: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Depot Location</label>
              <Input
                required
                placeholder="Nagpur"
                value={form.depotLocation}
                onChange={(e) =>
                  setForm({ ...form, depotLocation: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Depot Lat</label>
              <Input
                required
                type="number"
                step="any"
                value={form.depotLat}
                onChange={(e) =>
                  setForm({ ...form, depotLat: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Depot Lng</label>
              <Input
                required
                type="number"
                step="any"
                value={form.depotLng}
                onChange={(e) =>
                  setForm({ ...form, depotLng: e.target.value })
                }
              />
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Add Tanker"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
