import { Router, type IRouter } from "express";
import { AnalyzeContentBody } from "@workspace/api-zod";
import { analyzeTrust, type ContentType } from "../lib/trust-engine";

const router: IRouter = Router();

const EXAMPLES = [
  {
    content_type: "email",
    label: "Phishing email impersonating bank",
    sample_content:
      "Dear Valued Costumer, Your account has been compromised! Act immediately to verify your credentials. Click here to restore access: http://paypa1-secure-login.xyz/verify. We require your bank account number and OTP within 24 hours or your account will be suspended. URGENT: Final warning — do not delay! Regards, PayPal Security Team",
    expected_risk: "High",
  },
  {
    content_type: "job_ad",
    label: "Work-from-home job scam",
    sample_content:
      "AMAZING OPPORTUNITY!! Earn $500 per day working from home — no experience needed! Guaranteed income of $3,500 per week. You will handle package reshipping for our international clients. Pay your own background check fee ($50) to get started. Wire funds to our account as part of training. Limited time offer — act now before positions fill!",
    expected_risk: "High",
  },
  {
    content_type: "url",
    label: "Suspicious shortened URL",
    sample_content:
      "Please verify your account by visiting: https://bit.ly/3xK9mZ or http://amaz0n-account-verify.click/login?token=abc123",
    expected_risk: "High",
  },
  {
    content_type: "message",
    label: "Legitimate business message",
    sample_content:
      "Hi, this is a reminder that your scheduled meeting with the finance team is tomorrow at 10 AM. The agenda has been shared via email. For questions or inquiries, please contact the coordinator directly. Privacy policy and terms of service are available on our registered company website.",
    expected_risk: "Low",
  },
  {
    content_type: "contract",
    label: "One-sided service contract",
    sample_content:
      "By signing this agreement you waive all rights to dispute charges. The company accepts no liability for any damages. This contract includes mandatory arbitration for all disputes. Personal guarantee required from the signatory. Automatic renewal applies unless cancelled 90 days in advance. No refund under any circumstances.",
    expected_risk: "High",
  },
];

// Artificial delay so the UI loading state is visible during demo
function artificialDelay(): Promise<number> {
  const delayMs = 300 + Math.floor(Math.random() * 500); // 300–800 ms
  return new Promise((resolve) => setTimeout(() => resolve(delayMs), delayMs));
}

router.get("/analyze/examples", (_req, res) => {
  res.json(EXAMPLES);
});

router.post("/analyze", async (req, res) => {
  const parseResult = AnalyzeContentBody.safeParse(req.body);

  if (!parseResult.success) {
    const details = parseResult.error.errors.map(
      (e) => `${e.path.join(".")}: ${e.message}`,
    );
    req.log.warn({ details }, "Invalid analysis request body");
    res.status(400).json({ error: "Invalid request body", details });
    return;
  }

  const { content, content_type } = parseResult.data;
  // Optional lang field — not in the Zod schema, read directly from body
  const lang: "ar" | "en" = req.body?.lang === "en" ? "en" : "ar";

  req.log.info({ content_type, content_length: content.length }, "Analyzing content");

  const start = Date.now();
  await artificialDelay();
  const analysisResult = await analyzeTrust(content, content_type as ContentType, lang);
  const analysis_time_ms = Date.now() - start;

  req.log.info(
    { trust_score: analysisResult.trust_score, risk: analysisResult.risk, analysis_time_ms },
    "Analysis complete",
  );

  res.json({ ...analysisResult, analysis_time_ms });

});

export default router;
