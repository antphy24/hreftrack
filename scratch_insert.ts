import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Or anon key if RLS allows, but RLS restricts to admin

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function main() {
  const { data, error } = await supabase.from('counseling_students').insert([
    { student_name: 'Alice Smith', grade_level: 10, class_section: 'A' },
    { student_name: 'Bob Johnson', grade_level: 11, class_section: 'B' },
    { student_name: 'Charlie Brown', grade_level: 9, class_section: 'C' }
  ])

  if (error) {
    console.error('Error inserting dummy students:', error)
  } else {
    console.log('Inserted dummy students successfully!')
  }
}

main()
