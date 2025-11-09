import { Wrench } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface MachineSelectionProps {
  machines: string[];
  selectedMachine: string;
  onSelect: (machine: string) => void;
}

export const MachineSelection = ({ machines, selectedMachine, onSelect }: MachineSelectionProps) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Select Machine</h2>
          <p className="text-sm text-muted-foreground">Choose the machine for this report</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {machines.map((machine) => (
          <Card
            key={machine}
            className={cn(
              "p-4 sm:p-6 cursor-pointer transition-all duration-300 hover:shadow-lg",
              selectedMachine === machine
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border hover:border-primary/50"
            )}
            onClick={() => onSelect(machine)}
          >
            <div className="flex items-start space-x-3 sm:space-x-4">
              <div
                className={cn(
                  "p-2 sm:p-3 rounded-lg transition-colors flex-shrink-0",
                  selectedMachine === machine
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Wrench className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <Label className="text-sm sm:text-base font-semibold cursor-pointer break-words">
                  {machine}
                </Label>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Heavy machinery equipment
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
