'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Verifies the current user is an authenticated admin.
 * Returns the user object and supabase client on success, or an error object on failure.
 */
async function requireAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated', supabase }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Forbidden: admin access required', supabase }
  }

  return { error: null, supabase }
}

// Categories
export async function addCategory(formData: FormData) {
  const { error: authError, supabase } = await requireAdmin()
  if (authError) throw new Error(authError)

  const name = formData.get('name')?.toString().trim()
  if (!name || name.length < 2) throw new Error('Invalid category name')
  const { error } = await supabase.from('adab_categories').insert({ name })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/action-plan')
}
export async function deleteCategory(formData: FormData) {
  const { error: authError, supabase } = await requireAdmin()
  if (authError) throw new Error(authError)

  const id = formData.get('id') as string
  await supabase.from('adab_categories').delete().eq('id', id)
  revalidatePath('/admin/action-plan')
}
export async function updateCategory(formData: FormData) {
  const { error: authError, supabase } = await requireAdmin()
  if (authError) throw new Error(authError)

  const id = formData.get('id')?.toString().trim()
  const name = formData.get('name')?.toString().trim()
  if (!id) throw new Error('Missing ID')
  if (!name || name.length < 2) throw new Error('Invalid category name')
  
  const { error } = await supabase.from('adab_categories').update({ name }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/action-plan')
}

// Items
export async function addItem(formData: FormData) {
  const { error: authError, supabase } = await requireAdmin()
  if (authError) throw new Error(authError)

  const category_id = formData.get('category_id')?.toString().trim()
  const description = formData.get('description')?.toString().trim()
  if (!category_id) throw new Error('Missing category ID')
  if (!description || description.length < 2) throw new Error('Invalid description')
  
  const { error } = await supabase.from('adab_items').insert({ category_id, description, is_active: true })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/action-plan')
}
export async function deleteItem(formData: FormData) {
  const { error: authError, supabase } = await requireAdmin()
  if (authError) throw new Error(authError)

  const id = formData.get('id') as string
  await supabase.from('adab_items').delete().eq('id', id)
  revalidatePath('/admin/action-plan')
}
export async function updateItem(formData: FormData) {
  const { error: authError, supabase } = await requireAdmin()
  if (authError) throw new Error(authError)

  const id = formData.get('id') as string
  const category_id = formData.get('category_id') as string
  const description = formData.get('description') as string
  await supabase.from('adab_items').update({ category_id, description }).eq('id', id)
  revalidatePath('/admin/action-plan')
}
export async function toggleItemActive(id: string, currentStatus: boolean) {
  const { error: authError, supabase } = await requireAdmin()
  if (authError) throw new Error(authError)

  await supabase.from('adab_items').update({ is_active: !currentStatus }).eq('id', id)
  revalidatePath('/admin/action-plan')
}

// Bulk Import
export async function bulkAddAdabItems(rows: { category: string, item: string }[]) {
  const { error: authError, supabase } = await requireAdmin()
  if (authError) throw new Error(authError)

  if (!Array.isArray(rows)) return { error: 'Invalid input format' }
  if (rows.length > 500) return { error: 'Maximum 500 items allowed per batch' }

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
