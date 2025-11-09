export interface ReportData {
  site: string;
  machine: string;
  reportType: string;
  date: string;
  engineerName: string;
  laborDetails: LaborEntry[];
  hoursWorked: number;
  remarks: string;
  projectCode?: string;
  location?: string;
}

export interface LaborEntry {
  id: string;
  name: string;
  role: string;
  hours: number;
  task: string;
}

export const SITES = [
  "Site A - Construction Zone",
  "Site B - Manufacturing Plant",
  "Site C - Mining Operations",
  "Site D - Power Generation",
];

export const MACHINES = [
  "Excavator - CAT 320",
  "Bulldozer - D6T",
  "Crane - Liebherr LTM 1100",
  "Generator - Cummins C175",
  "Loader - Volvo L120",
];

export const REPORT_TYPES = [
  "Daily Operations Report",
  "Weekly Summary Report",
  "Maintenance Report",
  "Incident Report",
];
