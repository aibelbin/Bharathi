'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Search,
  MessageSquare,
  Headset,
  User,
  Loader2,
  MessagesSquare,
  Send,
} from 'lucide-react'
import { trpc } from '@/trpc/client'

export function InteractionsChat() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [inputMessage, setInputMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [optimisticMessage, setOptimisticMessage] = useState<{
    id: string
    message: string | null
    isAgent: boolean | null
    createdAt: string | null
    companyId: string
    userId: string | null
  } | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const usersQuery = trpc.dashboard.getUsers.useQuery()
  const messagesQuery = trpc.dashboard.getUserMessages.useQuery(
    { userId: selectedUserId! },
    { enabled: !!selectedUserId }
  )

  const users = usersQuery.data ?? []

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedUser = users.find((u) => u.id === selectedUserId)
  const dbMessages = messagesQuery.data ?? []

  // Merge optimistic message with DB messages
  const messages = optimisticMessage
    ? [...dbMessages, optimisticMessage]
    : dbMessages

  // Auto-scroll to bottom when messages load or change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isSending])

  // Focus input when a user is selected
  useEffect(() => {
    if (selectedUserId && inputRef.current) {
      inputRef.current.focus()
    }
  }, [selectedUserId])

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (dateString: string | Date | null) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  // Group messages by date
  const groupedMessages: { date: string; messages: typeof messages }[] = []
  messages.forEach((msg) => {
    const dateStr = formatDate(msg.createdAt)
    const lastGroup = groupedMessages[groupedMessages.length - 1]
    if (lastGroup && lastGroup.date === dateStr) {
      lastGroup.messages.push(msg)
    } else {
      groupedMessages.push({ date: dateStr, messages: [msg] })
    }
  })

  const sendMessageMutation = trpc.dashboard.sendMessage.useMutation()

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedUserId || isSending) return

    const messageText = inputMessage.trim()
    setInputMessage('')
    setIsSending(true)

    // Show the message instantly
    setOptimisticMessage({
      id: `optimistic-${Date.now()}`,
      message: messageText,
      isAgent: false,
      createdAt: new Date().toISOString(),
      companyId: '',
      userId: selectedUserId,
    })

    try {
      await sendMessageMutation.mutateAsync({
        userId: selectedUserId,
        message: messageText,
      })
      // Wait for fresh data (including agent response) to load
      await messagesQuery.refetch()
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      // Only clear optimistic message AFTER refetch completes
      setOptimisticMessage(null)
      setIsSending(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">User Interactions</h2>
        <p className="text-sm text-slate-500 mt-1">
          View conversations and send queries to your AI agent on behalf of users.
        </p>
      </div>

      {/* Chat Container */}
      <div className="flex rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 230px)', minHeight: '500px' }}>

        {/* Left Panel — User List */}
        <div className="w-[320px] border-r border-slate-200 flex flex-col shrink-0 bg-slate-50/30">
          {/* Search */}
          <div className="p-3 border-b border-slate-200/80">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all"
              />
            </div>
          </div>

          {/* User List */}
          <div className="flex-1 overflow-y-auto">
            {usersQuery.isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-16 text-center px-4">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 mb-2">
                  <User className="w-5 h-5 text-slate-300" />
                </div>
                <p className="text-xs font-medium text-slate-500">
                  {searchTerm ? 'No users match your search' : 'No users found'}
                </p>
              </div>
            ) : (
              filteredUsers.map((u) => {
                const isSelected = selectedUserId === u.id
                return (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUserId(u.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 transition-all duration-150 cursor-pointer border-b border-slate-100/80 ${isSelected
                      ? 'bg-orange-50/80 border-l-[3px] border-l-orange-500'
                      : 'hover:bg-slate-50 border-l-[3px] border-l-transparent'
                      }`}
                  >
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${isSelected
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-slate-100 text-slate-500'
                      }`}>
                      {u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 text-left">
                      <p className={`text-sm font-semibold truncate ${isSelected ? 'text-orange-900' : 'text-slate-800'
                        }`}>
                        {u.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{u.phone}</p>
                    </div>

                    {/* Date */}
                    <span className="text-[10px] text-slate-400 font-medium shrink-0">
                      {formatDate(u.createdAt)}
                    </span>
                  </button>
                )
              })
            )}
          </div>

          {/* User Count Footer */}
          <div className="px-4 py-2.5 border-t border-slate-200/80 bg-white/50">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Right Panel — Chat View */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="px-5 py-3.5 border-b border-slate-200/80 bg-white flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-sm font-bold shrink-0">
                  {selectedUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{selectedUser.name}</p>
                  <p className="text-[11px] text-slate-400">{selectedUser.phone}</p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium bg-slate-50 px-2.5 py-1 rounded-full">
                  <MessageSquare className="w-3 h-3" />
                  {messages.length} message{messages.length !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto px-5 py-4 bg-gradient-to-b from-slate-50/50 to-white space-y-1">
                {messagesQuery.isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
                  </div>
                ) : messages.length === 0 && !isSending ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                      <MessagesSquare className="w-7 h-7 text-slate-200" />
                    </div>
                    <p className="text-sm font-medium text-slate-400">No messages yet</p>
                    <p className="text-xs text-slate-300 mt-1">Send a message to start a conversation with the agent.</p>
                  </div>
                ) : (
                  <>
                    {groupedMessages.map((group, gi) => (
                      <div key={gi}>
                        {/* Date Separator */}
                        <div className="flex items-center justify-center my-4">
                          <div className="px-3 py-1 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-500 shadow-sm">
                            {group.date}
                          </div>
                        </div>

                        {/* Messages */}
                        {group.messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex mb-2 ${msg.isAgent ? 'justify-start' : 'justify-end'}`}
                          >
                            <div className={`flex items-end gap-2 max-w-[70%] ${msg.isAgent ? 'flex-row' : 'flex-row-reverse'}`}>
                              {/* Avatar */}
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mb-0.5 ${msg.isAgent
                                ? 'bg-orange-100'
                                : 'bg-slate-100'
                                }`}>
                                {msg.isAgent ? (
                                  <Headset className="w-3.5 h-3.5 text-orange-600" />
                                ) : (
                                  <User className="w-3.5 h-3.5 text-slate-500" />
                                )}
                              </div>

                              {/* Bubble */}
                              <div className={`px-3.5 py-2.5 rounded-2xl shadow-sm ${msg.isAgent
                                ? 'bg-white border border-slate-200/80 rounded-bl-md'
                                : 'bg-orange-600 text-white rounded-br-md'
                                }`}>
                                <p className={`text-[13px] leading-relaxed whitespace-pre-wrap ${msg.isAgent ? 'text-slate-700' : 'text-white'
                                  }`}>
                                  {msg.message}
                                </p>
                                <p className={`text-[9px] mt-1 text-right ${msg.isAgent ? 'text-slate-300' : 'text-orange-200'
                                  }`}>
                                  {formatTime(msg.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}

                    {/* Sending indicator */}
                    {isSending && (
                      <div className="flex justify-start mb-2">
                        <div className="flex items-end gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mb-0.5 bg-orange-100">
                            <Headset className="w-3.5 h-3.5 text-orange-600" />
                          </div>
                          <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white border border-slate-200/80 shadow-sm">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Message Input */}
              <div className="px-4 py-3 border-t border-slate-200/80 bg-white">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Type a message to the agent..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isSending}
                    className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 disabled:opacity-50 transition-all"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isSending}
                    className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 cursor-pointer shadow-sm shadow-orange-200"
                  >
                    {isSending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 px-1">
                  Messages are sent as this user. The agent will respond based on your company context.
                </p>
              </div>
            </>
          ) : (
            /* Empty State — No user selected */
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center mb-5 shadow-sm shadow-orange-100">
                <MessagesSquare className="w-10 h-10 text-orange-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-1">Select a conversation</h3>
              <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
                Choose a user from the list to view their conversation or send a message to the AI agent.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
