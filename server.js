require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { GoogleGenAI } = require('@google/genai');
const path = require('path');

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '20kb' }));
app.use('/api/', rateLimit({ windowMs: 60000, limit: 60, standardHeaders: true, legacyHeaders: false }));
app.use(express.static(path.join(__dirname, 'public')));

function generateSmartReply(prompt) {
  const p = String(prompt || '').trim();
  const lower = p.toLowerCase();

  const isHindi = /(kaise|kya|banao|bana do|chahiye|karo|kar do|krdo|namaste|dhanyawad|shukriya|kaun|batao|kripya|invoice kaise|madad|paise|haal|theek)/i.test(lower);

  // Greetings
  if (/^(hi|hello|hey|hola|greetings|namaste|hlo|helo)\b/i.test(lower) || /^(kya haal|kaise ho)/i.test(lower)) {
    if (isHindi) {
      return `Namaste! Main hoon **FlowPilot AI**, aapka business aur workflow assistant. 💼\n\nMain aapki in cheezon me madad kar sakta hoon:\n- 📋 **Invoices & Billing**: Invoices banana, payment terms set karna aur pricing strategy.\n- ✉️ **Client Follow-ups**: Payment reminder email aur message templates.\n- 🚀 **Workflow Planning**: Freelance ya business projects ko step-by-step organize karna.\n- 💡 **Idea & Brainstorming**: Client proposals aur business growth ideas.\n\nBataiye, aaj main aapki kya madad kar sakta hoon?`;
    }
    return `Hello! I'm **FlowPilot AI**, your business workflow assistant. 💼\n\nHere is how I can assist you:\n- 📋 **Invoices & Billing**: Drafting invoice descriptions, pricing strategies, and payment terms.\n- ✉️ **Client Follow-ups**: Polite payment reminder email templates and message drafts.\n- 🚀 **Workflow Planning**: Organizing freelance and client projects into actionable steps.\n- 💡 **Brainstorming**: Business ideas, proposals, and operations planning.\n\nWhat would you like to work on today?`;
  }

  // Invoice / Billing / Pricing
  if (/(invoice|bill|billing|charge|pricing|rate|quote|estimate|banao)/i.test(lower)) {
    if (isHindi) {
      return `### 📑 Invoice & Billing Guide\n\nAap naya invoice directly create kar sakte hain:\n\n1. **Invoices Section me jayein**:\n   - Left menu me **Invoices** par click karein.\n   - **＋ New invoice** button dabayein.\n2. **Details bharein**:\n   - Client ka naam, email, kaam ki description aur amount (INR) dalein.\n   - Due date select karein aur **Save invoice** par click karein.\n3. **Best Practice**:\n   - Naye clients ke liye hamesha **30% se 50% advance deposit** lein.\n   - Invoice status ko aap **Draft ➔ Sent ➔ Paid** me ek click se update kar sakte hain.\n\n*Agar aapko kisi project ke liye scope ya description likhwani hai, toh mujhe batayein!*`;
    }
    return `### 📑 Invoicing & Billing Guide\n\nHere is the best way to handle your billing in FlowPilot:\n\n1. **Create an Invoice**:\n   - Click on the **Invoices** tab on the left sidebar.\n   - Click **＋ New invoice**.\n   - Fill in client name, service description, amount (INR), and due date.\n2. **Payment Terms Best Practices**:\n   - Use **Due on Receipt** or **Net 15**.\n   - For new clients, always request a **30%–50% upfront deposit**.\n3. **Status Tracking**:\n   - Once sent, you can toggle the status (Draft ➔ Sent ➔ Paid ➔ Overdue) with one click in the Invoices tab.\n\n*Need an invoice line-item breakdown or service description? Let me know your project details!*`;
  }

  // Payment Reminders / Overdue
  if (/(remind|reminder|overdue|late|unpaid|chase|follow[\s-]?up|taqaza)/i.test(lower)) {
    if (isHindi) {
      return `### ✉️ Payment Follow-up Templates\n\nAap in templates ka use kar sakte hain:\n\n#### 1. Polite Reminder (Gentle - 2-3 Din Pehle Ya Baad)\n> **Subject**: Quick follow-up: Invoice #{Number} regarding {Project Name}\n>\n> Namaste {Client Name},\n>\n> Asha hai aap badhiya honge.\n>\n> Yeh ek gentle reminder hai **Invoice #{Number}** (Rashi: **₹{Amount}**) ke sambandh me.\n> Kripya check karein aur payment transfer ki status update karein. Agar invoice dobara chahiye ho toh batayein.\n>\n> Shukriya,\n> {Aapka Naam}\n\n#### 2. WhatsApp / Quick Message Template\n> "Hi {Client Name}, hope you are doing well! Just a quick reminder about invoice #{Number} for ₹{Amount}. Could you please let me know when this will be processed? Thank you!"`;
    }
    return `### ✉️ Payment Reminder Templates\n\n#### Template 1: Friendly Check-in\n> **Subject**: Friendly check-in regarding Invoice #{Number}\n>\n> Hi {Client Name},\n>\n> Hope you're having a great week!\n>\n> Just following up on **Invoice #{Number}** for **₹{Amount}**, which was due on {Due Date}.\n>\n> Could you please check with your accounts team and confirm once processed? Let me know if you need any additional details.\n>\n> Best regards,\n> {Your Name}\n\n#### Template 2: WhatsApp / Slack Quick Note\n> "Hi {Client Name}, quick reminder on Invoice #{Number} (₹{Amount}). Please let me know once the payment is initiated. Thanks!"`;
  }

  // Project management / Workflow
  if (/(workflow|plan|organize|system|step|process|manage|agency|freelance|idea)/i.test(lower)) {
    if (isHindi) {
      return `### 🚀 Step-by-Step Project Workflow\n\nApne client projects ko smooth rakhne ke liye yeh 4-step process follow karein:\n\n1. **Requirement & Scope Lock**: Kaam shuru karne se pehle client se clear deliverables aur revision limit finalize karein.\n2. **Advance Deposit**: Kaam start karne se pehle 30-50% advance lein.\n3. **Weekly Progress**: Har milestone par client ko updates dein taaki koi misunderstanding na ho.\n4. **Final Invoice & Delivery**: **FlowPilot Invoices** tab me final invoice generate karein aur payment milte hi final assets hand over karein.`;
    }
    return `### 🚀 Recommended Client Project Workflow\n\n1. **Scope Definition**: Lock down deliverables, timeline, and revision limits upfront.\n2. **Milestone Billing**: Split projects into phases (e.g., 40% upfront deposit, 30% midway, 30% on completion).\n3. **Regular Checkpoints**: Share brief progress updates every few days to keep client aligned.\n4. **Final Invoicing & Handover**: Generate the invoice in **FlowPilot AI**, verify payment, and deliver final production files.`;
  }

  // General response
  if (isHindi) {
    return `### FlowPilot AI Response\n\nAapke sawaal **"${p}"** ke liye:\n\n1. **Next Step**: Apne goal ko 2-3 aasan steps me divide karein.\n2. **Finance & Records**: Agar yeh kisi client project se juda hai, toh left sidebar me **Invoices** section me jakar record add kar lijiye.\n3. **Communication**: Agar client ke liye koi proposal, quotation ya email draft karwana ho, toh mujhe batayein, main poora draft likh doonga.\n\n*Aap mujhse koi bhi email, invoice text, ya business workflow puch sakte hain!*`;
  }

  return `### FlowPilot AI Response\n\nRegarding **"${p}"**:\n\n1. **Clarify Objective**: Break the goal down into specific milestones and measurable deliverables.\n2. **Organize Records**: If this involves client billing, track it under the **Invoices** section on the left.\n3. **Take Action**: Draft the necessary proposals or outlines to move forward immediately.\n\n💡 *Need me to write a proposal, draft an email, or build a checklist for this? Just ask!*`;
}

app.get('/api/health', (_req, res) => {
  const key = (process.env.GEMINI_API_KEY || '').trim();
  const configured = Boolean(key && !key.includes('PUT_NEW_ROTATED_KEY_HERE') && !key.includes('your_gemini_api_key_here'));
  res.json({ ok: true, geminiConfigured: configured });
});

app.post('/api/chat', async (req, res) => {
  try {
    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
    if (!message) return res.status(400).json({ error: 'Message is required.' });
    if (message.length > 8000) return res.status(413).json({ error: 'Message is too long.' });

    const key = (process.env.GEMINI_API_KEY || '').trim();
    const isRealKey = Boolean(key && !key.includes('PUT_NEW_ROTATED_KEY_HERE') && !key.includes('your_gemini_api_key_here') && key.length > 15);

    if (isRealKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: key });
        const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
        const out = await ai.models.generateContent({
          model,
          contents: message,
          config: {
            systemInstruction: 'You are FlowPilot AI, a helpful business workflow assistant. Give accurate, practical answers with clear steps.'
          }
        });
        if (out && out.text) {
          return res.json({ reply: out.text });
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed, falling back to smart assistant:', geminiErr.message);
      }
    }

    // Smart assistant fallback ensures chat ALWAYS returns a helpful response
    const reply = generateSmartReply(message);
    res.json({ reply });
  } catch (e) {
    console.error('Chat error:', e.message);
    res.json({ reply: generateSmartReply(req.body?.message || '') });
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, '0.0.0.0', () => console.log(`FlowPilot AI at http://localhost:${port}`));
