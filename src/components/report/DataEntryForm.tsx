import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ReportData, LaborEntry } from "@/types/report";

interface DataEntryFormProps {
  data: ReportData;
  onUpdate: (data: Partial<ReportData>) => void;
}

export const DataEntryForm = ({ data, onUpdate }: DataEntryFormProps) => {
  const addLaborEntry = () => {
    const newEntry: LaborEntry = {
      id: Date.now().toString(),
      name: "",
      role: "",
      hours: 0,
      task: "",
    };
    onUpdate({ laborDetails: [...data.laborDetails, newEntry] });
  };

  const removeLaborEntry = (id: string) => {
    onUpdate({
      laborDetails: data.laborDetails.filter((entry) => entry.id !== id),
    });
  };

  const updateLaborEntry = (id: string, field: keyof LaborEntry, value: string | number) => {
    onUpdate({
      laborDetails: data.laborDetails.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      ),
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Enter Report Details</h2>
        <p className="text-sm text-muted-foreground">Fill in the operational information</p>
      </div>

      <Card className="p-4 sm:p-6">
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="date">Report Date <span className="text-destructive">*</span></Label>
              <Input
                id="date"
                type="date"
                value={data.date}
                onChange={(e) => onUpdate({ date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="engineerName">Engineer Name <span className="text-destructive">*</span></Label>
              <Input
                id="engineerName"
                placeholder="Enter your name"
                value={data.engineerName}
                onChange={(e) => onUpdate({ engineerName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectCode">Project Code (Optional)</Label>
              <Input
                id="projectCode"
                placeholder="e.g., PRJ-2024-001"
                value={data.projectCode || ""}
                onChange={(e) => onUpdate({ projectCode: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hoursWorked">Total Hours Worked</Label>
              <Input
                id="hoursWorked"
                type="number"
                min="0"
                step="0.5"
                value={data.hoursWorked}
                onChange={(e) => onUpdate({ hoursWorked: parseFloat(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location Details (Optional)</Label>
            <Input
              id="location"
              placeholder="Specific location or coordinates"
              value={data.location || ""}
              onChange={(e) => onUpdate({ location: e.target.value })}
            />
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
              <Label className="text-base sm:text-lg font-semibold">Labor Details</Label>
              <Button onClick={addLaborEntry} size="sm" className="gap-2 w-full sm:w-auto">
                <Plus className="w-4 h-4" />
                <span className="text-sm">Add Worker</span>
              </Button>
            </div>

            {data.laborDetails.length === 0 ? (
              <Card className="p-6 sm:p-8 text-center bg-muted/50">
                <p className="text-sm text-muted-foreground">No labor entries yet. Click "Add Worker" to begin.</p>
              </Card>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {data.laborDetails.map((entry) => (
                  <Card key={entry.id} className="p-3 sm:p-4 bg-muted/30">
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="sm:col-span-2">
                          <Label className="text-xs sm:text-sm">Worker Name</Label>
                          <Input
                            placeholder="Name"
                            value={entry.name}
                            onChange={(e) => updateLaborEntry(entry.id, "name", e.target.value)}
                            className="mt-1 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs sm:text-sm">Role</Label>
                          <Input
                            placeholder="Role"
                            value={entry.role}
                            onChange={(e) => updateLaborEntry(entry.id, "role", e.target.value)}
                            className="mt-1 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs sm:text-sm">Hours</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.5"
                            placeholder="Hours"
                            value={entry.hours}
                            onChange={(e) =>
                              updateLaborEntry(entry.id, "hours", parseFloat(e.target.value) || 0)
                            }
                            className="mt-1 text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs sm:text-sm">Task Description</Label>
                        <Input
                          placeholder="Describe the work performed"
                          value={entry.task}
                          onChange={(e) => updateLaborEntry(entry.id, "task", e.target.value)}
                          className="mt-1 text-sm"
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeLaborEntry(entry.id)}
                        className="w-full sm:w-auto gap-2"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm">Remove</span>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">Additional Remarks</Label>
            <Textarea
              id="remarks"
              placeholder="Enter any additional notes or observations..."
              rows={4}
              value={data.remarks}
              onChange={(e) => onUpdate({ remarks: e.target.value })}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};
