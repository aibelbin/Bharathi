import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/db'
import { context } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { DashboardClient } from './_components/DashboardClient'

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect('/login')
  }

  // Check if the company has filled in their context
  const companyContext = await db
    .select({ id: context.id })
    .from(context)
    .where(eq(context.companyId, session.user.id))
    .limit(1)

  if (companyContext.length === 0) {
    redirect('/context')
  }

  return <DashboardClient />
}
