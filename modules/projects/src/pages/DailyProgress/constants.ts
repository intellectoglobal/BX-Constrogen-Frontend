export interface StatusOption {
  key: string;
  name: string;
}

export const STATUS_OPTIONS: StatusOption[] = [
  { key: "Y", name: "Yet to Start" },
  { key: "P", name: "In Progress" },
  { key: "C", name: "Completed" },
];

export const MODULE_NAME = "projects";
export const PAGE_NAME = "Daily Progress";
export const PAGE_ROUTE = "dailyprogress";
