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
import Particles from "@/components/Particles";

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
    <div className="relative flex h-screen w-full overflow-hidden bg-background font-sans text-foreground selection:bg-primary/20">
      
      {/* Particles Background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <Particles
          particleCount={500}
          particleSpread={12}
          speed={0.05}
          particleColors={["#ffffff", "#a0a0a0", "#666666"]}
          particleBaseSize={80}
          sizeRandomness={0.6}
          cameraDistance={25}
          alphaParticles
          moveParticlesOnHover
          particleHoverFactor={0.4}
          className="opacity-70"
        />
      </div>

      <aside className="relative z-10 w-72 border-r border-border bg-sidebar/50 backdrop-blur-xl flex flex-col shadow-2xl shadow-black/20">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-linear-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/40 transition-all duration-500 hover:shadow-primary/60">
              <Zap size={22} className="text-foreground fill-current" />
            </div>
            <span className="text-lg font-black tracking-tight text-foreground">Bharathi<span className="text-primary">.ai</span></span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5">
          <div className="relative px-3 mb-6">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input 
              placeholder="Search directory..." 
              className="w-full bg-secondary/40 border border-border rounded-xl py-2 pl-9 pr-4 text-xs focus:ring-4 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/50 text-foreground" 
            />
          </div>

          <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-2">Fleet Active</p>
          {MOCK_USERS.map((u) => (
            <button
              key={u.id}
              onClick={() => setSelectedUserId(u.id)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300",
                selectedUserId === u.id 
                  ? "bg-primary text-foreground shadow-xl shadow-primary/40 -translate-y-0.5" 
                  : "hover:bg-secondary/50 text-foreground hover:text-accent"
              )}
            >
              <div className={cn(
                "size-8 rounded-lg flex items-center justify-center text-xs font-bold border-2 transition-all",
                selectedUserId === u.id ? "bg-foreground text-primary border-foreground" : "bg-secondary border-border text-primary"
              )}>
                {u.initials}
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-semibold leading-none mb-1">{u.name}</p>
                <p className={cn("text-[10px] font-mono opacity-70", selectedUserId === u.id ? "text-primary/80" : "text-muted-foreground")}>{u.phone}</p>
              </div>
            </button>
          ))}
        </nav>
      </aside>
      <div className="relative z-10 flex-1 flex flex-col min-w-0">
        <header className="h-20 flex items-center justify-between px-10 border-b border-border bg-sidebar/30 backdrop-blur-xl">
          <div className="flex flex-col">
             <h2 className="text-[10px] font-black text-primary uppercase tracking-widest">Analytics Terminal</h2>
             <p className="text-xl font-black text-foreground">Active Interceptions</p>
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground bg-secondary/50 hover:bg-secondary transition-all duration-300">
                <Filter size={14}/> Filter Nodes
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <div className="flex items-center gap-3 p-1 rounded-lg bg-secondary/50 hover:bg-secondary transition-all duration-300 group">
                  <Avatar className="size-8 rounded-lg">
                    <AvatarFallback className="bg-primary text-foreground text-[10px] font-black">SA</AvatarFallback>
                  </Avatar>
                  <ChevronDown size={14} className="text-muted-foreground mr-2 group-hover:text-foreground transition-colors" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-3 rounded-xl border-border p-2 shadow-2xl shadow-black/40 bg-card">
                <DropdownMenuLabel className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-3 py-2">Account Node</DropdownMenuLabel>
                <DropdownMenuItem className="rounded-lg focus:bg-secondary focus:text-primary cursor-pointer gap-3 py-3 font-semibold text-foreground transition-colors">
                  <Settings size={16}/> Configuration
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem onClick={handleLogout} className="rounded-lg focus:bg-destructive/20 focus:text-destructive cursor-pointer gap-3 py-3 font-semibold text-destructive transition-colors">
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
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="h-full flex flex-col items-center justify-center"
              >
                <div className="mb-6 relative">
                  <ShieldCheck size={72} strokeWidth={1} className="text-muted-foreground/40 drop-shadow-lg" />
                  <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full -z-10 animate-pulse" />
                </div>
                <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase">Decryption Protocol</h3>
                <p className="text-sm font-medium mt-1 text-muted-foreground">Please select an active node from the sidebar.</p>
              </motion.div>
            ) : (
              <motion.div
                key={selectedUserId}
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="max-w-4xl mx-auto space-y-8"
              >
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map(i => (
                      <div 
                        key={i} 
                        className="h-44 bg-secondary/40 rounded-xl animate-pulse border border-border"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {MOCK_LOGS[selectedUserId]?.map((log, idx) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.1 }}
                      >
                        <Card className="border border-border bg-card/60 backdrop-blur-md shadow-xl shadow-black/20 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
                          <CardContent className="p-8 flex">
                            {/* Status Color Strip */}
                            <motion.div 
                              className={cn(
                                "w-1.5 rounded-full",
                                log.status === "completed" ? "bg-green-500" : "bg-primary"
                              )}
                              initial={{ height: 0 }}
                              animate={{ height: '100%' }}
                              transition={{ duration: 0.5, delay: idx * 0.1 + 0.1 }}
                            />
                            
                            <div className="flex-1 pl-8">
                                <div className="flex justify-between items-start mb-6">
                                  <div className="flex items-center gap-4">
                                    <div className="size-12 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/30 group-hover:bg-primary/30 transition-colors duration-500 shadow-inner">
                                      <Phone size={22} className="text-primary" />
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">External Decryption</p>
                                      <span className="text-lg font-black text-foreground tracking-tight font-mono">{log.callerPhone}</span>
                                    </div>
                                  </div>
                                  <Badge className={cn(
                                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                    log.status === "completed" 
                                      ? "bg-green-500/20 text-green-300 border-green-500/30" 
                                      : "bg-primary/20 text-primary border-primary/30"
                                  )}>
                                    {log.status}
                                  </Badge>
                                </div>

                                <p className="text-base text-foreground/80 leading-relaxed mb-8 font-medium pr-6">
                                  "{log.summary}"
                                </p>

                                <div className="flex items-center gap-8 border-t border-border pt-6">
                                  <div className="flex items-center gap-2.5 text-xs font-semibold text-primary uppercase">
                                    <Activity size={16}/> {log.duration} SEC Session
                                  </div>
                                  <div className="flex items-center gap-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-tighter font-mono">
                                    <Clock size={16}/> TS: {new Date(log.createdAt).toLocaleTimeString()}
                                    <motion.div 
                                      animate={{ opacity: [0.5, 1, 0.5] }}
                                      transition={{ duration: 2, repeat: Infinity }}
                                    >
                                      <Zap size={10} className="text-primary/60 fill-current ml-1" />
                                    </motion.div>
                                  </div>
                                </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
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
