export interface DurationOption {
  key: string;
  name: string;
}

export const DURATION_OPTIONS: DurationOption[] = [
    { key: "D", name: "Days" },
    { key: "W", name: "Weeks" },
    { key: "M", name: "Months" },
];

export const PAGE_ROUTE = 'projectschedule';
export const PAGE_NAME = 'Project Schedule';