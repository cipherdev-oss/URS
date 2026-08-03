import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, MessageSquare, RefreshCw, HelpCircle, ChevronDown, User, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

const PRESET_QUESTIONS = [
  "How does Diminishing Returns (DR) work?",
  "What is the 40% Dominance Cap?",
  "How do I qualify for the +10% Balance Gate bonus?",
  "Which activities have hard point caps?",
  "How are tie-breakers decided in student rankings?"
];

function getSmartLocalResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('diminish') || q.includes('return') || q.includes('dr') || q.includes('repeat')) {
    return `**Diminishing Returns (DR) Formula**

To encourage well-rounded involvement and prevent over-farming a single task, repeating active activities yields progressively fewer points:

- **Formula**: \`Points for N-th time = max(Floor, Base - (N - 1) * Step)\`
- **Example (Teaching Assistant)**:
  - 1st time: **15 pts** (Base)
  - 2nd time: **13 pts** (Base - Step)
  - 3rd time: **11 pts**
  - Floor: **5 pts** minimum per repetition thereafter until activity hard cap is reached.`;
  }

  if (q.includes('40%') || q.includes('dominance') || q.includes('cap') && (q.includes('pillar') || q.includes('rule') || q.includes('algorithm'))) {
    return `**40% Dominance Capping Rule**

To ensure students demonstrate well-rounded excellence across all 5 pillars rather than relying solely on a single area:

- **Rule**: A single pillar's score cannot exceed **2/3 (66.67%)** of the combined sum of the other 4 pillars.
- **Impact**: This mathematically guarantees no single pillar accounts for more than **40%** of the student's total raw score.
- **Algorithm**: The system applies a simultaneous fixed-point iteration algorithm to cap dominant pillars iteratively until full mathematical equilibrium is achieved.`;
  }

  if (q.includes('gate') || q.includes('bonus') || q.includes('multiplier') || q.includes('year hero') || q.includes('qualify')) {
    return `**Balance Gate & Bonus Multiplier**

- **Balance Gate Requirement**: To qualify for Year Hero rankings, a student must achieve at least **20 raw points** in at least **4 out of 5 pillars**.
- **Continuity Bonus Award**:
  - **Min Pillar Score (20 - 30 pts)**: Grants **+5% base bonus** + **0.5% for every point** above 20.
  - **Min Pillar Score > 30 pts**: Grants the maximum **+10% bonus** on top of the total capped score!`;
  }

  if (q.includes('hard cap') || q.includes('activity cap') || q.includes('max point') || q.includes('limit')) {
    return `**Activity Hard Point Caps**

Many repeatable activities feature strict maximum point caps:

- **Academic**: Published Papers (Cap: 60 pts), Conference Presentations (Cap: 30 pts), TA (Cap: 30 pts).
- **Leadership**: Subcommittee Member (Cap: 15 pts).
- **Arts & Sports**: Squad Member (Cap: 30 pts).
- **Tech & Innovation**: Open Source Contribution (Cap: 40 pts), Industry Certification (Cap: 20 pts).
- **Community**: Tech Workshop Organizer (Cap: 30 pts), Non-Tech Workshop Organizer (Cap: 20 pts), Peer Endorsement (Cap: 20 pts), Guest Lecture Attendance (Cap: 10 pts).`;
  }

  if (q.includes('tie') || q.includes('break') || q.includes('equal') || q.includes('same score') || q.includes('order')) {
    return `**Ranking Tie-Breaking Hierarchy (§4.4)**

When two or more students achieve identical scores, rankings are determined by:

1. **Higher Final Score** (including Balance Gate bonuses)
2. **Higher Minimum Pillar Score** (rewards well-roundedness across all 5 pillars)
3. **Earlier Submission Timestamp** (rewards prompt logging)
4. **Alphabetical Student Name** (A to Z)`;
  }

  if (q.includes('academic') || q.includes('gpa') || q.includes('paper') || q.includes('dean')) {
    return `**Academic Pillar Point Rules**

- **GPA Milestones** *(Non-stacking, awards highest tier)*:
  - Top 5%: **40 pts**
  - Top 10%: **25 pts**
  - Top 20%: **15 pts**
- **Published Research Papers**: Base 30, Step 3, Floor 15 (Hard Cap: 60 pts)
- **Conference Presentations**: Base 15, Step 2, Floor 5 (Hard Cap: 30 pts)
- **Teaching Assistant (TA)**: Base 15, Step 2, Floor 5 (Hard Cap: 30 pts)
- **Dean's List**: **20 pts**`;
  }

  if (q.includes('leadership') || q.includes('president') || q.includes('society') || q.includes('subcommittee')) {
    return `**Leadership Pillar Point Rules**

- **Student Union President**: Base 40, Step 4, Floor 20
- **Society Executive Head**: Base 30, Step 3, Floor 15
- **Batch Representative**: Base 15, Step 2, Floor 5
- **Subcommittee Member**: Base 5, Step 1, Floor 1 (Hard Cap: 15 pts)`;
  }

  if (q.includes('tech') || q.includes('hackathon') || q.includes('oss') || q.includes('certification')) {
    return `**Tech & Innovation Pillar Point Rules**

- **International Hackathon Winner**: Base 35, Step 4, Floor 18
- **National Hackathon Winner**: Base 25, Step 3, Floor 13
- **Open Source Contribution**: Base 20, Step 2, Floor 10 (Hard Cap: 40 pts)
- **Industry Certification**: **10 pts** per cert (Hard Cap: 20 pts)`;
  }

  if (q.includes('sports') || q.includes('art') || q.includes('gold') || q.includes('silver') || q.includes('squad')) {
    return `**Arts & Sports Pillar Point Rules**

- **International / National Sports**: Base 40, Step 4, Floor 20
- **Inter-faculty Gold Medal**: Base 25, Step 3, Floor 10
- **Inter-faculty Silver / Bronze**: Base 15, Step 2, Floor 5
- **Squad / Club Active Member**: Base 10, Step 1, Floor 2 (Hard Cap: 30 pts)`;
  }

  if (q.includes('community') || q.includes('peer') || q.includes('workshop') || q.includes('lecture')) {
    return `**Community Pillar Point Rules**

- **Tech Workshop Organizer**: Base 15, Step 2, Floor 5 (Hard Cap: 30 pts)
- **Non-Tech Workshop Organizer**: Base 10, Step 1, Floor 3 (Hard Cap: 20 pts)
- **Peer Endorsement**: Base 5, Step 1, Floor 1 (Hard Cap: 20 pts)
- **Guest Lecture Attendance**: Base 2, Step 0.5, Floor 1 (Hard Cap: 10 pts)`;
  }

  return `**LNBTI Student Balanced Ranking System Guide**

I can answer any questions about the 5 Pillars, point rules, formulas, and ranking algorithms:

- **5 Pillars**: Academic, Leadership, Arts & Sports, Tech & Innovation, Community.
- **Diminishing Returns**: Repeating active activities yields fewer points (\`Base - (N-1)*Step\`).
- **40% Dominance Cap**: Single pillar cannot exceed 2/3 of remaining 4 pillars.
- **Balance Gate**: Reach ≥20pts in at least 4 pillars to earn a +5% to +10% bonus boost!
- **Tie-Breakers**: 1. Final Score, 2. Minimum Pillar Score, 3. Earliest Timestamp, 4. Name.`;
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "👋 Hi! I'm your **LNBTI Scoring System Assistant**. Ask me anything about point allocations, the 5 Pillars, diminishing returns, dominance capping, or ranking rules!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-6).map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: historyPayload
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.reply || getSmartLocalResponse(query),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      console.warn("Backend chat endpoint unavailable or running static host (e.g., Netlify). Using client knowledge engine:", err);
      
      const localAnswer = getSmartLocalResponse(query);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: localAnswer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: "Chat history cleared. What else would you like to know about the point allocation system?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Helper renderer for simple markdown formatting (bold, code, lists)
  const renderFormattedText = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-1.5 text-xs leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1" />;

          // Process bold syntax **text**
          const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);

          return (
            <p key={idx} className={line.startsWith('- ') || line.startsWith('* ') ? 'pl-3 relative' : ''}>
              {(line.startsWith('- ') || line.startsWith('* ')) && (
                <span className="absolute left-0 text-blue-400 font-bold">•</span>
              )}
              {parts.map((part, pIdx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={pIdx} className="font-semibold text-slate-100">{part.slice(2, -2)}</strong>;
                }
                if (part.startsWith('`') && part.endsWith('`')) {
                  return <code key={pIdx} className="bg-slate-800 text-blue-300 font-mono text-[10px] px-1 py-0.5 rounded border border-slate-700">{part.slice(1, -1)}</code>;
                }
                return part.replace(/^[-*]\s+/, '');
              })}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(true)}
              className="group relative flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white p-3.5 rounded-full shadow-2xl border border-blue-400/30 backdrop-blur-md"
            >
              <div className="relative">
                <Bot className="w-6 h-6 text-white" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-900 animate-pulse" />
              </div>
              <span className="text-xs font-bold tracking-wide pr-1 hidden sm:inline-block">
                Scoring Assistant
              </span>
              <span className="bg-blue-400/20 text-blue-200 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border border-blue-400/30">
                AI Rules
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Chat Window Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl ring-1 ring-white/10"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-inner">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold text-slate-100 tracking-tight">
                      LNBTI Scoring Assistant
                    </h3>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono font-medium">
                      ONLINE
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Ask about point rules, caps & balance bonuses
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleClearHistory}
                  title="Clear Chat History"
                  className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close Assistant"
                  className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-950/40">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${
                    msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    }`}
                  >
                    {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[82%] rounded-2xl p-3 text-slate-200 shadow-md ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-slate-800/80 border border-slate-700/60 rounded-tl-none'
                    }`}
                  >
                    {renderFormattedText(msg.text)}
                    <div
                      className={`text-[9px] mt-1.5 text-right font-mono ${
                        msg.sender === 'user' ? 'text-blue-200/70' : 'text-slate-500'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xs shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl rounded-tl-none p-3 flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                    </div>
                    <span className="text-xs text-slate-400 ml-1">Analyzing system rules...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="px-3 py-2 bg-slate-900 border-t border-slate-800 overflow-x-auto whitespace-nowrap custom-scrollbar flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mr-1 shrink-0">
                <HelpCircle className="w-3 h-3" /> Quick:
              </span>
              {PRESET_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  disabled={isLoading}
                  className="text-[10px] text-slate-300 bg-slate-800/80 hover:bg-blue-600/20 hover:text-blue-300 hover:border-blue-500/40 border border-slate-700/60 px-2.5 py-1 rounded-full transition-all shrink-0"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Footer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about rules, caps, diminishing returns..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white p-2 rounded-xl transition-all shadow-md shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
