import { createAdminClient } from '@/utils/supabase/admin'
import { LoginPageClient } from './LoginPageClient'

export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  const supabase = createAdminClient()
  const { data: students } = await supabase
    .from('profiles')
    .select('id, full_name, nis')
    .eq('role', 'student')
    .order('full_name', { ascending: true })

  return <LoginPageClient students={students || []} />
}
