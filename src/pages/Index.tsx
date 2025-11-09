import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "@/components/report/StepIndicator";
import { SiteSelection } from "@/components/report/SiteSelection";
import { MachineSelection } from "@/components/report/MachineSelection";
import { ReportTypeSelection } from "@/components/report/ReportTypeSelection";
import { DataEntryForm } from "@/components/report/DataEntryForm";
import { ReportPreview } from "@/components/report/ReportPreview";
import { ReportData, REPORT_TYPES } from "@/types/report";
import { generatePDF } from "@/utils/pdfGenerator";
import { ArrowLeft, ArrowRight, Download, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const STEPS = [
  { number: 1, title: "Site", description: "Choose location" },
  { number: 2, title: "Machine", description: "Select equipment" },
  { number: 3, title: "Report Type", description: "Pick format" },
  { number: 4, title: "Data Entry", description: "Fill details" },
  { number: 5, title: "Preview", description: "Review & edit" },
  { number: 6, title: "Download", description: "Get PDF" },
];

const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  // Dummy data with max 4 entries
  const [sites] = useState<string[]>([
    "Site A - Manufacturing Plant",
    "Site B - Power Station",
    "Site C - Chemical Facility",
    "Site D - Refinery Complex"
  ]);
  const [machines] = useState<string[]>([
    "Compressor - Atlas Copco",
    "Turbine - Siemens",
    "Pump - Grundfos",
    "Generator - Caterpillar"
  ]);
  const [reportData, setReportData] = useState<ReportData>({
    site: "",
    machine: "",
    reportType: "",
    date: new Date().toISOString().split("T")[0],
    engineerName: "",
    laborDetails: [],
    hoursWorked: 0,
    remarks: "",
  });

  const updateReportData = (data: Partial<ReportData>) => {
    setReportData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    // Validation logic
    if (currentStep === 1 && !reportData.site) {
      toast({
        title: "Site Required",
        description: "Please select a site before proceeding.",
        variant: "destructive",
      });
      return;
    }
    if (currentStep === 2 && !reportData.machine) {
      toast({
        title: "Machine Required",
        description: "Please select a machine before proceeding.",
        variant: "destructive",
      });
      return;
    }
    if (currentStep === 3 && !reportData.reportType) {
      toast({
        title: "Report Type Required",
        description: "Please select a report type before proceeding.",
        variant: "destructive",
      });
      return;
    }
    if (currentStep === 4) {
      if (!reportData.engineerName || !reportData.date) {
        toast({
          title: "Required Fields Missing",
          description: "Please fill in engineer name and date.",
          variant: "destructive",
        });
        return;
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleDownload = () => {
    try {
      generatePDF(reportData);
      toast({
        title: "Success!",
        description: "Your report has been downloaded successfully.",
      });
      setCurrentStep(6);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStartNew = () => {
    setCurrentStep(1);
    setReportData({
      site: "",
      machine: "",
      reportType: "",
      date: new Date().toISOString().split("T")[0],
      engineerName: "",
      laborDetails: [],
      hoursWorked: 0,
      remarks: "",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary-hover text-primary-foreground shadow-lg">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Report Generation System</h1>
              <p className="text-xs sm:text-sm opacity-90 hidden sm:block">Automated Engineering Reports</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <StepIndicator currentStep={currentStep} steps={STEPS} />

        <div className="max-w-5xl mx-auto">
          {/* Step Content */}
          <div className="mb-8">
            {currentStep === 1 && (
              <SiteSelection
                sites={sites}
                selectedSite={reportData.site}
                onSelect={(site) => updateReportData({ site })}
              />
            )}

            {currentStep === 2 && (
              <MachineSelection
                machines={machines}
                selectedMachine={reportData.machine}
                onSelect={(machine) => updateReportData({ machine })}
              />
            )}

            {currentStep === 3 && (
              <ReportTypeSelection
                reportTypes={REPORT_TYPES}
                selectedType={reportData.reportType}
                onSelect={(reportType) => updateReportData({ reportType })}
              />
            )}

            {currentStep === 4 && (
              <DataEntryForm data={reportData} onUpdate={updateReportData} />
            )}

            {currentStep === 5 && (
              <ReportPreview
                data={reportData}
                onUpdate={updateReportData}
                editable={true}
                onEdit={() => setCurrentStep(4)}
                onChangeReportType={() => setCurrentStep(3)}
              />
            )}

            {currentStep === 6 && (
              <div className="text-center space-y-4 sm:space-y-6 py-8 sm:py-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Download className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 px-4">
                    Report Generated!
                  </h2>
                  <p className="text-base sm:text-lg text-muted-foreground px-4">
                    Your report has been successfully generated and downloaded.
                  </p>
                </div>
                <Button onClick={handleStartNew} size="lg" className="gap-2">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Generate New Report</span>
                </Button>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          {currentStep < 6 && currentStep !== 5 && (
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4 sm:pt-6 border-t border-border">
              <Button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                variant="outline"
                size="lg"
                className="gap-2 w-full sm:w-auto"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Previous</span>
              </Button>

              <Button onClick={handleNext} size="lg" className="gap-2 w-full sm:w-auto">
                <span className="text-sm sm:text-base">Next</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          )}
          
          {/* Download button for Preview step */}
          {currentStep === 5 && (
            <div className="flex justify-end pt-4 sm:pt-6 border-t border-border">
              <Button onClick={handleDownload} size="lg" className="gap-2 w-full sm:w-auto">
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Download PDF</span>
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted mt-8 sm:mt-16 py-4 sm:py-6 border-t border-border">
        <div className="container mx-auto px-3 sm:px-4 text-center text-xs sm:text-sm text-muted-foreground">
          <p>© 2025 Report Generation System. Streamlining engineering documentation.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
