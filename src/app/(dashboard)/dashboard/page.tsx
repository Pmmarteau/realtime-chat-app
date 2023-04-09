import Button from '@/components/UI/Button'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

const Dashboard = async () => {
  const session = await getServerSession(authOptions)

  return (
    <div>
      <pre>{JSON.stringify(session)}</pre>
      <Button>Hello</Button>
    </div>
  )
}

export default Dashboard
