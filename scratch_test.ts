import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tjqykfwgpgnvskcdbkmr.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqcXlrZndncGdudnNrY2Ria21yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzgzNjQ1MiwiZXhwIjoyMDk5NDEyNDUyfQ.3PbtnSepdx3Edt-o8ugkArGP8UwFM6vAr-Pt-x4PbpI'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function test() {
  const { data: users, error: usersError } = await supabase.from('profiles').select('*').limit(1)
  if (usersError || !users.length) {
    console.error('Error fetching user', usersError)
    return
  }
  const user = users[0]
  
  // We need to get the user's email from auth.users, but we have their id
  const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(user.id)
  if (authError || !authUser.user) {
    console.error('Error getting auth user', authError)
    return
  }
  const email = authUser.user.email
  
  console.log('Generating link for', email)
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: email as string,
  })
  
  console.log('Link data:', linkData)
  console.log('Link error:', linkError)
}

test()
