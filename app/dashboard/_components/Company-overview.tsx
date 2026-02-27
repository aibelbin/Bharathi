'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  Mail, 
  Phone, 
  Calendar, 
  Coins, 
  Zap,
  CheckCircle2,
  ExternalLink,
  ArrowUpRight
} from 'lucide-react'

const company = {
  id: 'comp_123abc',
  name: 'Acme Corporation',
  email: 'contact@acme.com',
  phone: '+1 (555) 123-4567',
  emailVerified: true,
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-02-28T14:45:00Z',
  cost: '234.50',
  totalToken: '45230',
}
import { trpc } from '@/trpc/client'
export function CompanyOverview() {
  const formatDate = (dateString: string | Date) => 
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
const { data: companyData, isLoading, error } = trpc.company.companyDetails.useQuery()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error || !companyData) {
    return <div>Error loading company details.</div>
  }

  return (
    <Card className="max-w-md overflow-hidden border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-3xl">
      {/* Header Section */}
      <CardHeader className="bg-slate-50/50 pb-8 border-b border-slate-100">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <Building2 className="w-7 h-7 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                {companyData.name}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded leading-none">
                  ID: {companyData.id.split(" ")[0]}
                </span>
                {companyData.emailVerified && (
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50 px-2 py-0">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <button className="p-2 hover:bg-white hover:shadow-md transition-all rounded-full text-slate-400 hover:text-indigo-600">
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="pt-8 space-y-8">
        {/* Contact Info Grid */}
        <div className="grid grid-cols-1 gap-5">
          <div className="flex items-center gap-4 group cursor-default">
            <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
              <Mail className="w-4 h-4 text-slate-500 group-hover:text-orange-600" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Primary Email</p>
              <p className="text-sm font-semibold text-slate-700">{companyData.email}</p>
            </div>
          </div>

          
        </div>

        {/* Usage Stats - The "Aesthetic" Hero Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 rounded-[2rem] bg-orange-600 text-white shadow-lg shadow-orange-200 flex flex-col justify-between h-32 relative overflow-hidden group">
            <Coins className="absolute -right-2 -bottom-2 w-20 h-20 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
            <div className="flex justify-between items-start">
              <p className="text-xs font-medium text-orange-100 uppercase tracking-wide">Total Spend</p>
              <ArrowUpRight className="w-4 h-4 text-orange-300" />
            </div>
            <p className="text-2xl font-bold">${parseFloat(companyData.cost ?? '0').toFixed(2)}</p>
          </div>

          <div className="p-5 rounded-[2rem] bg-slate-900 text-white shadow-lg shadow-slate-200 flex flex-col justify-between h-32 relative overflow-hidden group">
            <Zap className="absolute -right-2 -bottom-2 w-20 h-20 text-white/10 -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
            <div className="flex justify-between items-start">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Usage</p>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div>
              <p className="text-2xl font-bold">{parseInt(companyData.totalToken ?? '0').toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 font-medium">TOKENS USED</p>
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium italic">Joined {formatDate(companyData.createdAt)}</span>
          </div>
          <p className="text-[11px] text-slate-300">Last update: {formatDate(companyData.updatedAt)}</p>
        </div>
      </CardContent>
    </Card>
  )
}