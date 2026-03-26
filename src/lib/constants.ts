export const BRANCH_MAP: Record<string, string> = {
  "CSE": "Computer Science Engineering",
  "IT": "Information Technology",
  "ELEX": "Electronics Engineering",
  "CIVIL": "Civil Engineering",
  "MECH": "Mechanical Engineering"
};

export const REVERSE_BRANCH_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(BRANCH_MAP).map(([k, v]) => [v, k])
);

export const getBranchLabel = (branch: string) => BRANCH_MAP[branch] || branch;
export const getBranchKey = (label: string) => REVERSE_BRANCH_MAP[label] || label;
