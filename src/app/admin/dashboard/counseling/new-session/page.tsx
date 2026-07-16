import { getStudentProfiles } from '@/lib/actions/counseling'
import SessionForm from './SessionForm'

export const dynamic = 'force-dynamic'

export default async function NewSessionPage() {
  const students = await getStudentProfiles()

  return (
    <div className="py-6">
      <SessionForm students={students} />
    </div>
  )
}
