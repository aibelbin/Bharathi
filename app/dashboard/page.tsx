import { DashboardHeader } from './_components/Dashboard-header'
import { CompanyOverview } from './_components/Company-overview'
import { MessagesList } from './_components/Messages-list'
import { StatisticsCards } from './_components/Statitiics-card'
import { Navbar } from '@/components/Navbar'

export default function DashboardPage() {
  return (
    <>
    <Navbar />
    <main className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto p-6 space-y-8">
        <DashboardHeader />
        <StatisticsCards />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <CompanyOverview />
          </div>
          <div className="lg:col-span-2">
            <MessagesList />
          </div>
        </div>
      </div>
    </main>
        </>

  )
}
