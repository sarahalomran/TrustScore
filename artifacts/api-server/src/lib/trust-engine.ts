/**
 * Trust Analysis Engine — AI-powered via OpenAI
 * Falls back to heuristics if AI is unavailable.
 */

import OpenAI from "openai";

export type ContentType = "message" | "job_ad" | "url" | "email" | "contract";
export type InputMode = "text" | "url" | "pdf";
export type RiskLevel = "Low" | "Medium" | "High";
export type SuggestedAction = "safe" | "verify" | "ignore";

export interface TrustAnalysisResult {
  trust_score: number;
  risk: RiskLevel;
  red_flags: string[];
  explanation: string;
  recommendation: string;
  suggested_action: SuggestedAction;
  analysis_time_ms: number;
}

// ---------------------------------------------------------------------------
// OpenAI client (lazy — only initialised when first needed)
// ---------------------------------------------------------------------------
let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY not set");
    // Groq keys start with "gsk_" — use Groq's OpenAI-compatible endpoint
    const isGroq = apiKey.startsWith("gsk_");
    _openai = new OpenAI({
      apiKey,
      ...(isGroq ? { baseURL: "https://api.groq.com/openai/v1" } : {}),
    });
  }
  return _openai;
}

// ---------------------------------------------------------------------------
// AI analysis
// ---------------------------------------------------------------------------
function buildSystemPrompt(lang: "ar" | "en"): string {
  if (lang === "en") {
    return `You are TrustScore, an expert cybersecurity AI specialising in detecting scams, phishing, fraud, and social engineering.

Analyse the given content and respond ONLY with a valid JSON object — no markdown, no text outside JSON.

JSON schema:
{
  "trust_score": <integer 0-100, 100 = fully trusted>,
  "risk": <"Low" | "Medium" | "High">,
  "red_flags": <string[] of up to 8 specific red flags found IN ENGLISH, empty array if none>,
  "explanation": <2-4 sentence explanation IN ENGLISH — cite exact phrases or patterns found>,
  "recommendation": <1-2 sentence actionable recommendation IN ENGLISH>,
  "suggested_action": <"safe" | "verify" | "ignore">
}

Scoring: 75-100 → Low (safe), 45-74 → Medium (verify), 0-44 → High (ignore).
Red flag examples: urgency tactics, impersonating known brands, requesting sensitive data, suspicious URLs, unrealistic financial promises, advance-fee schemes, spelling anomalies.

IMPORTANT: red_flags, explanation, and recommendation MUST be in English only. Never use Chinese, Japanese, or Korean characters.`;
  }

  return `أنت TrustScore، خبير ذكاء اصطناعي متخصص في الأمن السيبراني واكتشاف عمليات الاحتيال والتصيد الاحتيالي والهندسة الاجتماعية.

حلل المحتوى المُعطى وأجب فقط بكائن JSON صحيح — بدون markdown أو أي نص خارج JSON.

مخطط JSON المطلوب:
{
  "trust_score": <عدد صحيح 0-100، 100 = موثوق تمامًا>,
  "risk": <"Low" | "Medium" | "High">,
  "red_flags": <مصفوفة نصوص بالعربية فقط تصف المؤشرات الخطرة، حتى 8 مؤشرات، أو مصفوفة فارغة>,
  "explanation": <شرح بالعربية فقط من 2-4 جمل — استشهد بعبارات أو أنماط وجدتها>,
  "recommendation": <توصية بالعربية فقط من 1-2 جملة للمستخدم>,
  "suggested_action": <"safe" | "verify" | "ignore">
}

دليل التقييم: 75-100 → خطر منخفض (safe)، 45-74 → خطر متوسط (verify)، 0-44 → خطر عالٍ (ignore).
أمثلة على المؤشرات: "أساليب الاستعجال"، "انتحال هوية جهات معروفة"، "طلب بيانات حساسة"، "روابط مشبوهة"، "وعود مالية غير واقعية"، "رسوم مسبقة".

قواعد مهمة:
1. red_flags و explanation و recommendation يجب أن تكون بالعربية فقط.
2. لا تستخدم حروفاً صينية أو يابانية أو كورية تحت أي ظرف.
3. risk و suggested_action تبقى بالإنجليزية كما هو محدد.`;
}

async function analyzeWithAI(
  content: string,
  contentType: ContentType,
  lang: "ar" | "en" = "ar"
): Promise<Omit<TrustAnalysisResult, "analysis_time_ms">> {
  const openai = getOpenAI();

  const userMessage = `Content type: ${contentType}\n\nContent:\n${content}`;

  const response = await openai.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 1024,
    messages: [
      { role: "system", content: buildSystemPrompt(lang) },
      { role: "user", content: userMessage },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw);

  // Normalise and validate
  const trust_score = Math.max(0, Math.min(100, Math.round(Number(parsed.trust_score) || 50)));
  const risk: RiskLevel =
    parsed.risk === "Low" || parsed.risk === "Medium" || parsed.risk === "High"
      ? parsed.risk
      : trust_score >= 75 ? "Low" : trust_score >= 45 ? "Medium" : "High";
  const suggested_action: SuggestedAction =
    parsed.suggested_action === "safe" || parsed.suggested_action === "verify" || parsed.suggested_action === "ignore"
      ? parsed.suggested_action
      : risk === "Low" ? "safe" : risk === "Medium" ? "verify" : "ignore";

  // Strip any CJK (Chinese/Japanese/Korean) characters the model might inject
  const stripCJK = (s: string) => s.replace(/[\u3000-\u9fff\uac00-\ud7af\uf900-\ufaff]/g, "").trim();

  return {
    trust_score,
    risk,
    red_flags: Array.isArray(parsed.red_flags)
      ? parsed.red_flags.slice(0, 8).map((f: unknown) => stripCJK(String(f))).filter(Boolean)
      : [],
    explanation: stripCJK(String(parsed.explanation || "")),
    recommendation: stripCJK(String(parsed.recommendation || "")),
    suggested_action,
  };
}

// ---------------------------------------------------------------------------
// Heuristic fallback (kept from original engine — English-only signals)
// ---------------------------------------------------------------------------
interface SignalMatch { label: string; penalty: number }

const URGENCY: Array<{ p: RegExp; l: string; v: number }> = [
  { p: /\bact now\b/i, l: "Urgency: 'act now'", v: 12 },
  { p: /\blimited time\b/i, l: "Urgency: limited time", v: 10 },
  { p: /\burgent(ly)?\b/i, l: "Urgency: urgent", v: 11 },
  { p: /\bfinal (warning|notice)\b/i, l: "Urgency: final warning", v: 13 },
];
const FINANCIAL: Array<{ p: RegExp; l: string; v: number }> = [
  { p: /\bgift card(s)?\b/i, l: "Financial: gift card request", v: 25 },
  { p: /\bwire transfer\b/i, l: "Financial: wire transfer", v: 22 },
  { p: /\bsend money\b/i, l: "Financial: send money", v: 20 },
  { p: /\bcryptocurrency|bitcoin\b/i, l: "Financial: crypto payment", v: 18 },
];
const PERSONAL: Array<{ p: RegExp; l: string; v: number }> = [
  { p: /\bSSN\b|\bsocial security\b/i, l: "Data: SSN request", v: 20 },
  { p: /\bpassword\b/i, l: "Data: password request", v: 18 },
  { p: /\bOTP\b|\bone.?time.?password\b/i, l: "Data: OTP request", v: 17 },
];
const URL_SIGNALS: Array<{ p: RegExp; l: string; v: number }> = [
  { p: /https?:\/\/\d{1,3}\.\d{1,3}/i, l: "URL: IP address host", v: 22 },
  { p: /\b(bit\.ly|tinyurl|t\.co)\b/i, l: "URL: shortener used", v: 18 },
  { p: /\.(tk|ml|ga|cf|gq|xyz)\//i, l: "URL: suspicious TLD", v: 16 },
];

function heuristicScore(content: string): Omit<TrustAnalysisResult, "analysis_time_ms"> {
  const allSignals = [...URGENCY, ...FINANCIAL, ...PERSONAL, ...URL_SIGNALS];
  const matches: SignalMatch[] = allSignals
    .filter(s => s.p.test(content))
    .map(s => ({ label: s.l, penalty: s.v }));

  const penalty = matches.reduce((sum, m) => sum + m.penalty, 0);
  const trust_score = Math.max(0, Math.min(100, 100 - penalty));
  const risk: RiskLevel = trust_score >= 75 ? "Low" : trust_score >= 45 ? "Medium" : "High";
  const suggested_action: SuggestedAction = risk === "Low" ? "safe" : risk === "Medium" ? "verify" : "ignore";
  const red_flags = matches.sort((a, b) => b.penalty - a.penalty).slice(0, 8).map(m => m.label);

  return {
    trust_score,
    risk,
    red_flags,
    explanation:
      red_flags.length === 0
        ? "No suspicious patterns detected. The content appears low-risk."
        : `Detected ${red_flags.length} suspicious signal(s): ${red_flags.join("; ")}.`,
    recommendation:
      risk === "Low"
        ? "This content appears trustworthy. Exercise normal caution."
        : risk === "Medium"
        ? "Proceed with caution. Verify the sender through an independent channel."
        : "Do not engage. Block the sender and report if possible.",
    suggested_action,
  };
}

// ---------------------------------------------------------------------------
// Public API — exported function used by the route
// ---------------------------------------------------------------------------
export async function analyzeTrust(
  content: string,
  contentType: ContentType,
  lang: "ar" | "en" = "ar"
): Promise<Omit<TrustAnalysisResult, "analysis_time_ms">> {
  try {
    return await analyzeWithAI(content, contentType, lang);
  } catch (err) {
    console.error("[trust-engine] AI failed, using heuristics:", err);
    return heuristicScore(content);
  }
}
