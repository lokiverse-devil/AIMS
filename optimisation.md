# AIMS Codebase Optimization Analysis

This document outlines the findings from a full-system analysis of the AIMS codebase, identifying redundant code and optimization opportunities.

## 1. Critical Redundancies (Duplicate Files)
- **`src/api/notices.ts` & `src/api/timetable.ts`**: These files are identical. 
  - **Optimization**: Standardize on one and delete the other.
- **`src/app/branches/`**: Each branch has a separate directory and `page.tsx` that essentially does the same thing: pass a data object to `BranchPageTemplate`.
  - **Optimization**: Implement a dynamic route `src/app/branches/[slug]/page.tsx`.

## 2. Layering & Architecture
- **Service Wrappers**: `src/services/authService.ts` and `src/services/resourceService.ts` are thin wrappers around API files. They add unnecessary boilerplate.
  - **Optimization**: Import directly from `src/api/` in your components.
- **Legacy FastAPI Logic**: `src/services/csvService.ts` contains logic for a Python backend. Since we've moved to direct Supabase calls for student uploads, this file creates a fragmented architecture.
  - **Optimization**: Port the remaining unit-test upload logic to direct Supabase calls and remove the FastAPI dependency.

## 3. Logic & Helper Consolidation
- **Semester Normalization**: Logic to convert "6th" to "6" or vice versa is duplicated in `users.ts`, `auth.ts`, and several dashboard components.
  - **Optimization**: Move to a `normalizeSemester` utility function in `src/lib/utils.ts`.
- **Branch Key Mapping**: `getBranchKey` and `getBranchLabel` are used throughout the app. Ensuring these are always imported from `src/lib/constants.ts` is crucial for consistency.

## 4. Performance & Payload
- **Large Page Files**: `src/app/dashboard/student/page.tsx` is over 70KB.
  - **Optimization**: Break down large dashboard pages into smaller, memoized components in `src/components/dashboard/`.
- **Image/Video Handling**: Faculty videos are referenced with hardcoded Supabase URLs. 
  - **Optimization**: Use a central storage helper to generate these URLs.

## 5. Summary of Recommended Actions
1. **Merge** `notices.ts` and `timetable.ts`.
2. **Refactor** branch pages into a dynamic route.
3. **Migrate** all remaining FastAPI-dependent code to direct Supabase calls.
4. **Clean up** the `src/services` folder by removing pass-through wrappers.

---
*Note: These optimizations can be performed incrementally without breaking existing functionality.*
