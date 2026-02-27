'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  Search, 
  MessageSquare, 
  User, 
  Headset, 
  ChevronLeft, 
  ChevronRight,
  Hash
} from 'lucide-react'

// Mock messages data
const mockMessages = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    createdAt: '2024-02-28',
    companyId: 'comp_123abc',
    message: 'Hello, I need help with my account setup.',
    userId: '550e8400-e29b-41d4-a716-446655440010',
    isAgent: false,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    createdAt: '2024-02-28',
    companyId: 'comp_123abc',
    message: 'Of course! I can help you get started. What specific assistance do you need?',
    userId: null,
    isAgent: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    createdAt: '2024-02-28',
    companyId: 'comp_123abc',
    message: 'I need to update my billing information.',
    userId: '550e8400-e29b-41d4-a716-446655440010',
    isAgent: false,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    createdAt: '2024-02-27',
    companyId: 'comp_123abc',
    message: 'You can update your billing information in the settings dashboard under "Billing".',
    userId: null,
    isAgent: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    createdAt: '2024-02-27',
    companyId: 'comp_123abc',
    message: 'Perfect! Thank you for the guidance.',
    userId: '550e8400-e29b-41d4-a716-446655440010',
    isAgent: false,
  }
]

export function MessagesList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 4

  const filteredMessages = mockMessages.filter(
    (msg) =>
      msg.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedMessages = filteredMessages.slice(startIndex, startIndex + itemsPerPage)

  return (
    <Card className="border-slate-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] bg-white rounded-3xl overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-100 rounded-lg">
                <MessageSquare className="w-4 h-4 text-slate-600" />
              </div>
              <CardTitle className="text-lg font-bold">Recent Interactions</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Showing {filteredMessages.length} total activity logs
            </CardDescription>
          </div>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input
              placeholder="Filter messages..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9 h-9 border-slate-200 rounded-xl focus-visible:ring-indigo-500 bg-slate-50/50"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-1 p-2">
        {paginatedMessages.length > 0 ? (
          paginatedMessages.map((message) => (
            <div 
              key={message.id}
              className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all group cursor-pointer"
            >
              {/* Avatar Column */}
              <div className={`mt-1 h-10 w-10 shrink-0 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${
                message.isAgent ? 'bg-orange-600' : 'bg-slate-200'
              }`}>
                {message.isAgent ? (
                  <Headset className="w-5 h-5 text-white" />
                ) : (
                  <User className="w-5 h-5 text-slate-600" />
                )}
              </div>

              {/* Content Column */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      {message.isAgent ? 'Support Agent' : 'Company User'}
                    </span>
                    <Badge className={`text-[10px] px-1.5 py-0 h-4 border-none ${
                      message.isAgent 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'bg-slate-100 text-slate-600'
                    }`}>
                      {message.isAgent ? 'Internal' : 'External'}
                    </Badge>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">
                    {message.createdAt}
                  </span>
                </div>
                
                <p className="text-sm text-slate-600 leading-relaxed mb-2">
                  {message.message}
                </p>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                    <Hash className="w-3 h-3" />
                    {message.id.slice(0, 8)}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 mb-3">
              <Search className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-500">No messages match your search</p>
          </div>
        )}

        {/* Improved Pagination Footer */}
        <div className="mt-4 px-2 pb-2 pt-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
            Page {currentPage} of {totalPages || 1}
          </p>
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 rounded-lg border-slate-200 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="h-8 w-8 rounded-lg border-slate-200 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}