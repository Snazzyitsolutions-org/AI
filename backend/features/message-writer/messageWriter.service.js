import { config } from "../../config.js";

const FORMAT_NAMES = {
  quick_message: "short message for SMS, WhatsApp, or chat",
  email: "business email",
  business_letter: "formal business letter",
  announcement: "business announcement",
  support_reply: "customer support reply",
  social_post: "social media post",
};

const ASSISTANT_SYSTEM_PROMPT =
  "You are Snazzy IT Solutions' helpful website voice assistant. Answer the visitor's actual question directly and use recent conversation context to understand follow-ups. Help with websites, apps, support, and project consultations. Reply naturally in the visitor's language, including Hindi or Hinglish when appropriate. Keep spoken replies clear and concise, usually 1-3 sentences. If a request is ambiguous, ask one specific clarifying question instead of guessing. Only state facts you know; do not invent prices, service details, timelines, or claim a consultation is booked. If you do not know something, say so briefly and offer a useful next step.";

async function requestOllama(endpoint, requestOptions) {
  const response = await fetch(`${config.ollamaUrl}/api/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: config.ollamaModel, ...requestOptions }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Ollama returned ${response.status}: ${details}`);
  }

  return response.json();
}

async function generateDrafts({ prompt, format, tone, language }) {
  const selectedFormat = FORMAT_NAMES[format] || "business message";
  const languageInstruction =
    language === "Hinglish"
      ? `Write natural Hinglish. Write Hindi words in Devanagari and English words in Latin letters. Mix both scripts in every draft.
Keep English words such as "offer", "customers", and "special" in Latin letters; do not write them as "ऑफर", "कस्टमर्स", or "स्पेशल".
Example: "सभी customers को Diwali की शुभकामनाएँ! इस मौके पर हमारे पास आपके लिए एक खास offer है।"
Do not write Hindi words in Latin letters. Do not use Bengali or other scripts.`
      : language === "Hindi"
        ? "Write in clear, natural Hindi using Devanagari."
        : "Write in clear, natural English.";

  const data = await requestOllama("generate", {
    think: false,
    stream: false,
    prompt: `Write exactly three distinct ${selectedFormat} drafts based on the user's request.

User's request:
${prompt}

Requirements:
- ${languageInstruction}
- Keep the wording clear, natural, and grammatically correct.
- If the language is Hindi, write only in Devanagari—not Romanized Hindi or Hinglish.
- Use a ${tone} tone. Keep each draft concise and focused on the user's intended message.
- Give the three drafts different wording while preserving exactly the same facts and intent.
- Never add details just to make drafts different. If the request provides little information, keep the drafts short and vary only the phrasing.
- Do not invent facts, qualifications, benefits, application steps, contact instructions, services, promises, dates, prices, or names.
- Use a placeholder such as [Name] only when a necessary detail is missing.
- Avoid filler greetings and closings unless they suit the selected format.
- If the language is Hindi, write in Devanagari.
- For Hinglish, use Devanagari for Hindi words and English letters for English words. Include common English words naturally, such as ‘work’ or ‘team’; don’t write the whole draft in Hindi or English.
- For a business email, include a concise subject line.
- Use simple, natural, everyday Hindi. Avoid literal translations, unnatural formal phrases, and placeholders such as [Name] unless the user specifically asks for a personalized message.
- Do not claim that details were received, saved, shared, or sent, or that someone will follow up, unless the user's request explicitly says this has happened.
- Return only the three drafts, numbered 1, 2, and 3. Do not add an introduction or commentary`,
    system:
      "You are a careful business-writing assistant. Preserve the user's meaning, use plain language, and never claim that a message was sent.",
    options: { temperature: 0.2, num_predict: 1026 },
  });

  const drafts = data.response?.trim();

  if (!drafts) {
    throw new Error("Ollama returned an empty response.");
  }

  return drafts;
}

async function generateAssistantReply({ message, history = [] }) {
  const data = await requestOllama("chat", {
    stream: false,
    think: false,
    messages: [
      { role: "system", content: ASSISTANT_SYSTEM_PROMPT },
      ...history,
      { role: "user", content: message },
    ],
    options: { temperature: 0.2, num_predict: 192 },
  });
  const reply = data.message?.content?.trim();

  if (!reply) {
    throw new Error("Ollama returned an empty response.");
  }

  return reply;
}

async function generateLeadReply({
  prompt,
  tone,
  language,
  contactName,
  companyName,
  leadStage,
}) {
  const languageInstruction =
    language === "Hinglish"
      ? "Write natural Hinglish, using Devanagari for Hindi words and Latin letters for English words."
      : language === "Hindi"
        ? "Write in clear, natural Hindi using Devanagari."
        : "Write in clear, natural English.";

  const data = await requestOllama("generate", {
    think: false,
    stream: false,
    prompt: `Write one concise WhatsApp reply based on the user's instructions.

Replying to: ${contactName}
Company: ${companyName}
Lead stage: ${leadStage}
User's instructions: ${prompt}

Requirements:
- Use a ${tone} tone.
- ${languageInstruction}
- Preserve the user's intent and do not invent facts, prices, promises, or actions.
- Return only the reply, without quotation marks or commentary.`,
    system:
      "You write concise, helpful business replies. Follow the requested tone and language while preserving the user's intent.",
    options: { temperature: 0.3, num_predict: 512 },
  });
  const reply = data.response?.trim();

  if (!reply) {
    throw new Error("Ollama returned an empty response.");
  }

  return reply;
}

export { generateAssistantReply, generateDrafts, generateLeadReply }