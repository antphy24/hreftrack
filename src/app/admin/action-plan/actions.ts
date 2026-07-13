'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Categories
export async function addCategory(formData: FormData) {
  const supabase = createClient()
  const name = formData.get('name') as string
  await supabase.from('adab_categories').insert({ name })
  revalidatePath('/admin/action-plan')
}
export async function deleteCategory(formData: FormData) {
  const supabase = createClient()
  const id = formData.get('id') as string
  await supabase.from('adab_categories').delete().eq('id', id)
  revalidatePath('/admin/action-plan')
}

// Items
export async function addItem(formData: FormData) {
  const supabase = createClient()
  const category_id = formData.get('category_id') as string
  const description = formData.get('description') as string
  await supabase.from('adab_items').insert({ category_id, description, is_active: true })
  revalidatePath('/admin/action-plan')
}
export async function deleteItem(formData: FormData) {
  const supabase = createClient()
  const id = formData.get('id') as string
  await supabase.from('adab_items').delete().eq('id', id)
  revalidatePath('/admin/action-plan')
}
export async function toggleItemActive(id: string, currentStatus: boolean) {
  const supabase = createClient()
  await supabase.from('adab_items').update({ is_active: !currentStatus }).eq('id', id)
  revalidatePath('/admin/action-plan')
}

// Bulk Import
export async function bulkAddAdabItems(rows: { category: string, item: string }[]) {
  const supabase = createClient()
  
  // Group by category to minimize inserts
  const grouped = rows.reduce((acc, row) => {
    if (!acc[row.category]) acc[row.category] = []
    acc[row.category].push(row.item)
    return acc
  }, {} as Record<string, string[]>)

  for (const [categoryName, items] of Object.entries(grouped)) {
    // 1. Find or Create Category
    let categoryId = null
    const { data: existingCat } = await supabase.from('adab_categories').select('id').eq('name', categoryName).single()
    
    if (existingCat) {
      categoryId = existingCat.id
    } else {
      const { data: newCat } = await supabase.from('adab_categories').insert({ name: categoryName }).select().single()
      if (newCat) categoryId = newCat.id
    }

    if (!categoryId) continue

    // 2. Insert items
    const inserts = items.map(desc => ({
      category_id: categoryId,
      description: desc,
      is_active: true
    }))
    
    await supabase.from('adab_items').insert(inserts)
  }
  
  revalidatePath('/admin/action-plan')
}
