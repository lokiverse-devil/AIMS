import { supabase } from "@/lib/supabaseClient";

export async function fetchLabsByDepartment(department: string) {
  try {
    // Resolve possible branch identifiers
    const { getBranchKey, getBranchLabel } = await import("@/lib/constants");
    const possibleNames = [department, getBranchKey(department), getBranchLabel(department)];
    let deptCodes = [...new Set(possibleNames)];

    // Fetch matching branch codes from DB just in case it uses '05', '12', etc.
    const { data: branches } = await supabase
      .from('branches')
      .select('code, name');
      
    if (branches) {
      const matchedBranches = branches.filter(b => 
        possibleNames.includes(b.name) || possibleNames.includes(b.code) ||
        (b.name && possibleNames.some(p => b.name.toLowerCase().includes(p.toLowerCase())))
      );
      matchedBranches.forEach(b => {
        if (b.code) deptCodes.push(b.code);
        if (b.name) deptCodes.push(b.name);
      });
    }

    const { data, error } = await supabase
      .from('labs')
      .select('*')
      .in('department', deptCodes)
      .order('name');
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching labs:', error);
    return [];
  }
}

export async function toggleLabStatus(labId: string, available: boolean) {
  try {
    const { data, error } = await supabase
      .from('labs')
      .update({ available })
      .eq('id', labId)
      .select()
      .single();
      
    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Error toggling lab status:', error);
    return { success: false, message: error.message };
  }
}

export async function fetchLabAvailability(labId: string, date: string) {
  console.log('fetchLabAvailability called', labId, date)
  return []
}

export async function bookLab(labId: string, data: Record<string, unknown>) {
  console.log('bookLab called', labId, data)
  return { data: null, error: null }
}
