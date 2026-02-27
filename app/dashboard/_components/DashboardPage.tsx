"use client";

import { useState, useEffect } from "react";
import { 
  Phone, User, Clock, MessageSquare, 
  ChevronRight, LogOut, Settings, Bell, 
  ChevronDown, ShieldCheck, Activity,
  Zap, Search, Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const MOCK_USERS = [
  { id: "1", name: "Alex Rivera", phone: "+91 98765 43210", initials: "AR" },
  { id: "2", name: "Sarah Chen", phone: "+91 91234 56789", initials: "SC" },
];

const MOCK_LOGS: Record<string, any[]> = {
  "1": [{ id: "l1", callerPhone: "+91 98765 43210", status: "completed", duration: 142, summary: "Customer reached out to confirm their subscription renewal date and asked about new AI features.", createdAt: new Date().toISOString() }],
  "2": [{ id: "l3", callerPhone: "+91 91234 56789", status: "processing", duration: 45, summary: "Active session: Troubleshooting API connectivity issues in real-time.", createdAt: new Date().toISOString() }],
};

export default function SpilledDashboard() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedUserId) {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 450);
    }
  }, [selectedUserId]);

  const handleLogout = () => console.log("Better-auth: session_end");

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-[#fafafa] font-sans text-slate-900 selection:bg-orange-100">
      
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden flex items-center justify-center">
        <div className="absolute h-150 w-150 rounded-full bg-orange-500/10 blur-[130px]" />
        <div className="absolute h-200 w-200 rounded-full bg-orange-400/5 blur-[160px]" />
        <div className="absolute h-100 w-100 rounded-full bg-amber-300/10 blur-[100px] -translate-x-1/4 -translate-y-1/4" />
      </div>

      <aside className="relative z-10 w-72 border-r border-slate-100 bg-white/40 backdrop-blur-xl flex flex-col shadow-xl shadow-orange-950/5">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/40">
              <Zap size={22} className="text-white fill-current" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-950">Bharathi<span className="text-orange-600">.ai</span></span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5">
          <div className="relative px-3 mb-6">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-4 text-orange-400" />
            <input 
              placeholder="Search directory..." 
              className="w-full bg-orange-50/50 border border-orange-100 rounded-xl py-2 pl-9 pr-4 text-xs focus:ring-4 focus:ring-orange-500/10 outline-none transition-all placeholder:text-orange-950/30" 
            />
          </div>

          <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-orange-950/30 mb-2">Fleet Active</p>
          {MOCK_USERS.map((u) => (
            <button
              key={u.id}
              onClick={() => setSelectedUserId(u.id)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300",
                selectedUserId === u.id 
                  ? "bg-orange-500 text-white shadow-xl shadow-orange-500/30 -translate-y-0.5" 
                  : "hover:bg-orange-50/50 text-slate-700 hover:text-orange-950"
              )}
            >
              <div className={cn(
                "size-8 rounded-xl flex items-center justify-center text-xs font-bold border-2 transition-all",
                selectedUserId === u.id ? "bg-white text-orange-500 border-white" : "bg-white border-orange-100 text-orange-400"
              )}>
                {u.initials}
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-bold leading-none mb-1">{u.name}</p>
                <p className={cn("text-[10px] font-mono opacity-60", selectedUserId === u.id ? "text-orange-100" : "text-slate-400")}>{u.phone}</p>
              </div>
            </button>
          ))}
        </nav>
      </aside>
      <div className="relative z-10 flex-1 flex flex-col min-w-0">
        <header className="h-20 flex items-center justify-between px-10 border-b border-orange-50 bg-white/40 backdrop-blur-xl">
          <div className="flex flex-col">
             <h2 className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Analytics Terminal</h2>
             <p className="text-xl font-black text-slate-950">Active Interceptions</p>
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 rounded-xl border border-orange-100 px-4 py-2 text-xs font-bold text-orange-700 bg-orange-50 shadow-sm hover:shadow-lg transition-all">
                <Filter size={14}/> Filter Nodes
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <div className="flex items-center gap-3 p-1 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
                  <Avatar className="size-8 rounded-full">
                    <AvatarFallback className="bg-slate-900 text-white text-[10px] font-black">SA</AvatarFallback>
                  </Avatar>
                  <ChevronDown size={14} className="text-slate-500 mr-2" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-3 rounded-2xl border-slate-100 p-2 shadow-2xl">
                <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-3 py-2">Account Node</DropdownMenuLabel>
                <DropdownMenuItem className="rounded-xl focus:bg-orange-50 focus:text-orange-600 cursor-pointer gap-3 py-3 font-bold">
                  <Settings size={16}/> Configuration
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-50" />
                <DropdownMenuItem onClick={handleLogout} className="rounded-xl focus:bg-red-50 focus:text-red-600 cursor-pointer gap-3 py-3 font-bold text-red-500">
                  <LogOut size={16}/> Terminate Session
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-12">
          <AnimatePresence mode="wait">
            {!selectedUserId ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-orange-300"
              >
                <ShieldCheck size={72} strokeWidth={1} className="mb-6 drop-shadow-lg" />
                <h3 className="text-2xl font-black text-slate-950 tracking-tighter italic uppercase">Decryption Protocol</h3>
                <p className="text-sm font-medium mt-1">Please select an active node from the sidebar.</p>
              </motion.div>
            ) : (
              <motion.div
                key={selectedUserId}
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="max-w-4xl mx-auto space-y-10"
              >
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map(i => <div key={i} className="h-44 bg-white/50 rounded-3xl animate-pulse border border-slate-100" />)}
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {MOCK_LOGS[selectedUserId]?.map((log) => (
                      <Card key={log.id} className="border-none bg-white/60 backdrop-blur-md shadow-2xl shadow-orange-950/5 rounded-[28px] overflow-hidden transition-all hover:shadow-orange-950/10">
                        <CardContent className="p-8 flex">
                          {/* Status Color Strip */}
                          <div className={cn(
                              "w-1 rounded-full",
                              log.status === "completed" ? "bg-emerald-500" : "bg-orange-500"
                          )} />
                          
                          <div className="flex-1 pl-8">
                              <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                  <div className="size-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-orange-500 transition-colors duration-500 shadow-inner">
                                    <Phone size={22} className="text-orange-500" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em] mb-1">External Decryption</p>
                                    <span className="text-xl font-black text-slate-950 tracking-tight font-mono italic">{log.callerPhone}</span>
                                  </div>
                                </div>
                                <Badge className={cn(
                                  "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2",
                                  log.status === "completed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-orange-50 text-orange-600 border-orange-100"
                                )}>
                                  {log.status}
                                </Badge>
                              </div>

                              <p className="text-base text-slate-700 leading-relaxed mb-8 font-medium italic pr-6">
                                "{log.summary}"
                              </p>

                              <div className="flex items-center gap-8 border-t border-slate-100 pt-6">
                                <div className="flex items-center gap-2.5 text-xs font-black text-orange-500 uppercase italic">
                                  <Activity size={16}/> {log.duration} SEC Session
                                </div>
                                <div className="flex items-center gap-2.5 text-xs font-black text-slate-400 uppercase tracking-tighter font-mono italic">
                                  <Clock size={16}/> TS: {new Date(log.createdAt).toLocaleTimeString()}
                                   <Zap size={10} className="text-orange-200 fill-current animate-pulse ml-1" />
                                </div>
                              </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}