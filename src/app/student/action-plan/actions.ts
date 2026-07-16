'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getStartOfDayMakassar } from '@/lib/utils'

export async function submitActionPlan(formData: FormData) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // formData.getAll('item_id') gets all checked items
  const itemIds = formData.getAll('item_id') as string[]

  if (itemIds.length === 0) {
    return { error: 'Please select at least one item.' }
  }

  // Check which items were already logged today to prevent duplicates
  const startOfDay = getStartOfDayMakassar()
  
  const { data: existingLogs } = await supabase
    .from('adab_logs')
    .select('item_id')
    .eq('student_id', user.id)
    .gte('created_at', startOfDay)

  const existingItemIds = existingLogs?.map(log => log.item_id) || []

  // Filter out already logged items
  const newLogs = itemIds
    .filter(id => !existingItemIds.includes(id))
    .map(id => ({
      student_id: user.id,
      item_id: id
    }))

  if (newLogs.length > 0) {
    const { error } = await supabase.from('adab_logs').insert(newLogs)
    if (error) {
      return { error: error.message }
    }
  } else {
    return { error: 'You have already logged all these items for today.' }
  }

  revalidatePath('/student/action-plan')
  return { success: true }
}
