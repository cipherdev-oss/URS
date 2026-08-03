import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to initialize GenAI lazily
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

const SYSTEM_INSTRUCTION = `
You are the official AI Assistant for the LNBTI Student Balanced Ranking System & Point Allocation Engine.
Your job is to answer questions from students, faculty, and administrators about how points are awarded, calculated, capped, and ranked.

### SYSTEM SCORING RULES SUMMARY:

1. **The 5 Pillars**:
   - **Academic**: GPA Milestones (Top 5% = 40pts, Top 10% = 25pts, Top 20% = 15pts - Non-stacking!), Published Papers (Base 30, Step 3, Floor 15, Cap 60), Conference Presentations (Base 15, Step 2, Floor 5, Cap 30), TA (Base 15, Step 2, Floor 5, Cap 30), Dean's List (20pts).
   - **Leadership**: Student Union President (Base 40, Step 4, Floor 20), Society Exec Head (Base 30, Step 3, Floor 15), Batch Rep (Base 15, Step 2, Floor 5), Subcommittee Member (Base 5, Step 1, Floor 1, Cap 15).
   - **Arts & Sports**: Intl/National Sports (Base 40, Step 4, Floor 20), Inter-faculty Gold (Base 25, Step 3, Floor 10), Silver/Bronze (Base 15, Step 2, Floor 5), Squad Member (Base 10, Step 1, Floor 2, Cap 30).
   - **Tech & Innovation**: Intl Hackathon Winner (Base 35, Step 4, Floor 18), National Winner (Base 25, Step 3, Floor 13), OSS Contribution (Base 20, Step 2, Floor 10, Cap 40), Industry Certification (10pts, Cap 20).
   - **Community**: Tech Workshop Organizer (Base 15, Step 2, Floor 5, Cap 30), Non-Tech Workshop Organizer (Base 10, Step 1, Floor 3, Cap 20), Peer Endorsement (Base 5, Step 1, Floor 1, Cap 20), Guest Lecture Attendance (Base 2, Step 0.5, Floor 1, Cap 10).

2. **Diminishing Returns (DR) Formula**:
   - Repeating an active/passive activity gives fewer points each time.
   - Points for N-th repetition = max(Floor, Base - (N - 1) * Step).
   - This rewards consistency while encouraging breadth across activities.

3. **GPA Non-Stacking Rule**:
   - Academic GPA tiers (top 5%, 10%, 20%) are non-stacking. The system only awards points for the highest tier achieved.

4. **Activity Point Hard Caps**:
   - Many activities feature hard point caps (e.g. Industry Certifications capped at 20pts max). Once total points for that activity reach the hard cap, no additional points are earned and further entries are blocked.

5. **40% Dominance Capping Rule**:
   - Prevents a student from winning purely by maxing out a single pillar.
   - A single pillar's score cannot exceed 2/3 (66.67%) of the combined score of the other 4 pillars (meaning no single pillar can account for more than 40% of the total raw score).
   - The system iteratively adjusts capped pillar scores until mathematical equilibrium is reached.

6. **Balance Gate & Multiplier Bonus**:
   - To pass the Balance Gate, a student must achieve at least 20 raw points in AT LEAST 4 out of 5 pillars.
   - If passed:
     - Minimum Pillar Score 20 - 30 pts: Grants +5% base bonus + 0.5% per point above 20.
     - Minimum Pillar Score > 30 pts: Grants the maximum +10% bonus on total capped score!

7. **Tie-Breaking Order (§4.4)**:
   1. Higher Final Score
   2. Higher Minimum Pillar Score (rewards well-rounded students)
   3. Earlier Submission Timestamp (rewards prompt logging)
   4. Alphabetical Student Name

Be clear, concise, encouraging, and accurate. Format your responses with bullet points, bold headers, and structured markup where helpful.
`;

// Chat API Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const ai = getGenAI();

    if (!ai) {
      // Fallback rule-based response generator when process.env.GEMINI_API_KEY is not configured
      const msgLower = message.toLowerCase();
      let fallbackText = "";

      if (msgLower.includes("diminish") || msgLower.includes("return") || msgLower.includes("dr")) {
        fallbackText = `**Diminishing Returns (DR) Formula**:\n\nFor repeating activities, points decrease with each repetition according to:\n\`Points for Nth time = max(Floor, Base - (N - 1) * Step)\`\n\nThis rewards sustained involvement while discouraging over-grinding a single task!`;
      } else if (msgLower.includes("cap") || msgLower.includes("dominance") || msgLower.includes("40%")) {
        fallbackText = `**40% Dominance Capping Rule**:\n\nNo single pillar can exceed 2/3 of the sum of all other 4 pillars (effectively max 40% of overall raw score). The system iteratively reduces over-dominant pillar scores to ensure well-rounded excellence across all 5 pillars!`;
      } else if (msgLower.includes("gate") || msgLower.includes("bonus") || msgLower.includes("balance")) {
        fallbackText = `**Balance Gate & Bonus Multiplier**:\n\n- **Requirement**: Earn at least **20 raw points** in at least **4 out of 5 pillars**.\n- **Bonus Award**: Earn between **+5% and +10%** boost to your total capped score based on your lowest pillar score!`;
      } else if (msgLower.includes("tie") || msgLower.includes("rank") || msgLower.includes("break")) {
        fallbackText = `**Tie-Breaking Hierarchy**:\n\n1. Higher Final Score\n2. Higher Minimum Pillar Score\n3. Earlier Submission Timestamp\n4. Student Name Alphabetical Order`;
      } else {
        fallbackText = `**LNBTI Student Balanced Ranking System Assistant**\n\nI can help answer any questions about point allocations, the 5 pillars (Academic, Leadership, Arts & Sports, Tech, Community), diminishing returns, 40% dominance caps, and balance gate bonuses!\n\nFeel free to ask a specific question like:\n- *"How is the 40% dominance cap calculated?"*\n- *"What activities have hard point caps?"*\n- *"How do I qualify for the +10% Balance Gate bonus?"*`;
      }

      return res.json({ reply: fallbackText });
    }

    // Format chat history for Gemini chat or generateContent
    const chat = ai.chats.create({
      model: "gemini-3.6-flash",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    if (Array.isArray(history) && history.length > 0) {
      for (const turn of history) {
        if (turn.role === 'user' || turn.role === 'model') {
          // Send prior context if desired or rely on current prompt
        }
      }
    }

    const response = await chat.sendMessage({ message });
    return res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ 
      error: "Failed to generate AI response", 
      details: error?.message || "Internal server error" 
    });
  }
});

// Start Express + Vite Server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
