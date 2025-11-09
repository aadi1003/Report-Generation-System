import { FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ReportTypeSelectionProps {
  reportTypes: string[];
  selectedType: string;
  onSelect: (type: string) => void;
}

export const ReportTypeSelection = ({ reportTypes, selectedType, onSelect }: ReportTypeSelectionProps) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Select Report Type</h2>
        <p className="text-sm text-muted-foreground">Choose the type of report to generate</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {reportTypes.map((type) => (
          <Card
            key={type}
            className={cn(
              "p-4 sm:p-6 cursor-pointer transition-all duration-300 hover:shadow-lg",
              selectedType === type
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border hover:border-primary/50"
            )}
            onClick={() => onSelect(type)}
          >
            <div className="flex items-start space-x-3 sm:space-x-4">
              <div
                className={cn(
                  "p-2 sm:p-3 rounded-lg transition-colors flex-shrink-0",
                  selectedType === type
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <Label className="text-sm sm:text-base font-semibold cursor-pointer break-words">
                  {type}
                </Label>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Standard engineering report
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
