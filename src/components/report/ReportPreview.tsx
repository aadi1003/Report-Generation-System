import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ReportData } from "@/types/report";
import { Calendar, MapPin, User, Clock, FileCode, Edit, FileType } from "lucide-react";

interface ReportPreviewProps {
  data: ReportData;
  onUpdate: (data: Partial<ReportData>) => void;
  editable?: boolean;
  onEdit?: () => void;
  onChangeReportType?: () => void;
}

export const ReportPreview = ({ data, onUpdate, editable = true, onEdit, onChangeReportType }: ReportPreviewProps) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Report Preview</h2>
          <p className="text-sm text-muted-foreground">
            {editable ? "Review and make any final edits" : "Review your report"}
          </p>
        </div>
        {(onEdit || onChangeReportType) && (
          <div className="flex flex-col sm:flex-row gap-2">
            {onEdit && (
              <Button onClick={onEdit} variant="outline" className="gap-2 w-full sm:w-auto">
                <Edit className="w-4 h-4" />
                <span className="text-sm">Edit</span>
              </Button>
            )}
            {onChangeReportType && (
              <Button onClick={onChangeReportType} variant="outline" className="gap-2 w-full sm:w-auto">
                <FileType className="w-4 h-4" />
                <span className="text-sm">Change Report type</span>
              </Button>
            )}
          </div>
        )}
      </div>

      <Card className="p-4 sm:p-6 md:p-8 bg-card">
        {/* Header */}
        <div className="border-b-2 border-primary pb-4 sm:pb-6 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-2">{data.reportType}</h1>
          <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{data.date || "Not specified"}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{data.engineerName || "Not specified"}</span>
            </div>
            {data.projectCode && (
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4" />
                <span>{data.projectCode}</span>
              </div>
            )}
          </div>
        </div>

        {/* Site and Machine Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div>
            <Label className="text-sm font-semibold text-muted-foreground">SITE</Label>
            {editable ? (
              <Input
                value={data.site}
                onChange={(e) => onUpdate({ site: e.target.value })}
                className="mt-2 font-medium"
              />
            ) : (
              <p className="mt-2 font-medium text-foreground">{data.site}</p>
            )}
          </div>
          <div>
            <Label className="text-sm font-semibold text-muted-foreground">MACHINE</Label>
            {editable ? (
              <Input
                value={data.machine}
                onChange={(e) => onUpdate({ machine: e.target.value })}
                className="mt-2 font-medium"
              />
            ) : (
              <p className="mt-2 font-medium text-foreground">{data.machine}</p>
            )}
          </div>
          {data.location && (
            <div className="md:col-span-2">
              <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                LOCATION
              </Label>
              {editable ? (
                <Input
                  value={data.location}
                  onChange={(e) => onUpdate({ location: e.target.value })}
                  className="mt-2"
                />
              ) : (
                <p className="mt-2 text-foreground">{data.location}</p>
              )}
            </div>
          )}
          <div>
            <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              TOTAL HOURS
            </Label>
            <p className="mt-2 text-2xl font-bold text-primary">{data.hoursWorked} hrs</p>
          </div>
        </div>

        {/* Labor Details */}
        {data.laborDetails.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <Label className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2 sm:mb-3 block">
              LABOR DETAILS
            </Label>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                <table className="w-full border border-border">
                  <thead className="bg-muted">
                    <tr>
                      <th className="border border-border px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-semibold">
                        Worker Name
                      </th>
                      <th className="border border-border px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-semibold">
                        Role
                      </th>
                      <th className="border border-border px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-semibold">
                        Hours
                      </th>
                      <th className="border border-border px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-semibold hidden sm:table-cell">
                        Task
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.laborDetails.map((entry) => (
                      <tr key={entry.id} className="hover:bg-muted/50">
                        <td className="border border-border px-2 sm:px-4 py-2 text-xs sm:text-sm">{entry.name}</td>
                        <td className="border border-border px-2 sm:px-4 py-2 text-xs sm:text-sm">{entry.role}</td>
                        <td className="border border-border px-2 sm:px-4 py-2 text-xs sm:text-sm">{entry.hours}</td>
                        <td className="border border-border px-2 sm:px-4 py-2 text-xs sm:text-sm hidden sm:table-cell">{entry.task}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Mobile task display */}
            <div className="sm:hidden mt-3 space-y-2">
              {data.laborDetails.map((entry) => (
                <Card key={`task-${entry.id}`} className="p-2 bg-muted/30">
                  <Label className="text-xs font-semibold">{entry.name} - Task:</Label>
                  <p className="text-xs text-muted-foreground mt-1">{entry.task}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Remarks */}
        {data.remarks && (
          <div>
            <Label className="text-sm font-semibold text-muted-foreground mb-3 block">
              REMARKS
            </Label>
            {editable ? (
              <Textarea
                value={data.remarks}
                onChange={(e) => onUpdate({ remarks: e.target.value })}
                rows={4}
                className="bg-muted/30"
              />
            ) : (
              <Card className="p-4 bg-muted/30">
                <p className="text-foreground whitespace-pre-wrap">{data.remarks}</p>
              </Card>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};
