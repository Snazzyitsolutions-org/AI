
import express from "express"
import { config } from "../../config.js"
import {
  generateAssistantReply,
  generateDrafts,
  generateLeadReply,
} from "./messageWriter.service.js"

const router = express.Router()
const aiRouter = express.Router()

function ollamaErrorMessage(error) {
  const detail = typeof error?.message === "string" ? error.message : "";

  if (detail.includes("llama-server binary not found")) {
    return "Ollama is running, but its model runner is missing. Restart or reinstall Ollama, then try again.";
  }

  if (detail.includes("model") && detail.includes("not found")) {
    return `Ollama model "${config.ollamaModel}" is not installed. Set OLLAMA_MODEL to an installed model or install the configured model.`;
  }

  if (error?.cause?.code === "ECONNREFUSED") {
    return "Could not connect to Ollama. Start Ollama and check OLLAMA_URL.";
  }

  return "Could not generate a reply with Ollama. Check the Ollama server and configured model.";
}

aiRouter.post("/generate-reply", async (req, res) => {
  const {
    prompt,
    tone,
    language,
    contactName,
    companyName,
    leadStage,
  } = req.body || {};
  const validTones = ["closer", "professional", "friendly", "urgent", "consultative"];
  const validLanguages = ["English", "Hindi", "Hinglish"];
  const contextFields = [contactName, companyName, leadStage];

  if (
    typeof prompt !== "string" ||
    !prompt.trim() ||
    prompt.trim().length > 2000 ||
    !validTones.includes(tone) ||
    !validLanguages.includes(language) ||
    contextFields.some((value) => typeof value !== "string" || value.length > 200)
  ) {
    return res.status(400).json({ message: "Please check the prompt and options." });
  }

  try {
    const reply = await generateLeadReply({
      prompt: prompt.trim(),
      tone,
      language,
      contactName,
      companyName,
      leadStage,
    });

    res.set("Cache-Control", "no-store");
    return res.json({ reply, model: config.ollamaModel });
  } catch (error) {
    console.error("Lead reply generation failed:", error.message);
    return res.status(502).json({ message: ollamaErrorMessage(error) });
  }
});


router.post("/talk", async (req, res) => {
  const { message, history = [] } = req.body || {};

  if (
    typeof message !== "string" ||
    !message.trim() ||
    message.trim().length > 1500 ||
    !Array.isArray(history) ||
    history.length > 10 ||
    history.some(
      (entry) =>
        !entry ||
        !["user", "assistant"].includes(entry.role) ||
        typeof entry.content !== "string" ||
        !entry.content.trim() ||
        entry.content.length > 1500,
    ) ||
    history.reduce(
      (total, entry) => total + (typeof entry?.content === "string" ? entry.content.length : 0),
      0,
    ) > 6000
  ) {
    return res.status(400).json({ error: "Please check the message and conversation history." });
  }

  try {
    const reply = await generateAssistantReply({
      message: message.trim(),
      history,
    });
    res.set("Cache-Control", "no-store");
    return res.json({ reply });
  } catch (error) {
    console.error("Voice assistant reply failed:", error.message);
    return res.status(502).json({
      error: "Could not get a reply from Ollama. Check that Ollama is running and try again.",
    });
  }
});

router.post("/draft-message", async (req, res) => {
  const { prompt, format, tone, language } = req.body || {};

  const validFormats = [
  "quick_message",
  "email",
  "business_letter",
  "announcement",
  "support_reply",
  "social_post",
];
  const validTones = ["professional", "friendly", "confident", "polite"];
  const validLanguages = ["English", "Hindi", "Hinglish"];

  if (
    typeof prompt !== "string" ||
    !prompt.trim() ||
    prompt.trim().length > 2000 ||
    !validFormats.includes(format) ||
    !validTones.includes(tone) ||
    !validLanguages.includes(language)
  ) {
    return res.status(400).json({ error: "Please check the prompt and options." });
  }

  try {
    const drafts = await generateDrafts({
      prompt: prompt.trim(),
      format,
      tone,
      language,
    });

    res.set("Cache-Control", "no-store");
    return res.json({ drafts });
  } catch (error) {
    console.error("Draft generation failed:", error.message);
    return res.status(502).json({ error: "Could not generate drafts. Please try again." });
  }
});

export default router
export { aiRouter }