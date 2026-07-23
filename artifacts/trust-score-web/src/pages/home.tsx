import React, { useState, useEffect, useRef } from 'react';
import { useAnalyzeContent, useGetAnalysisExamples } from '@workspace/api-client-react';
import type { AnalysisResult, AnalysisInputContentType, AnalysisInputInputMode, AnalysisExample } from '@workspace/api-client-react';
import * as pdfjsLib from 'pdfjs-dist';
import {
  Shield, MessageSquare, Briefcase, Link as LinkIcon, Mail, FileText,
  Camera, CheckCircle, AlertTriangle, XCircle, Zap, Paperclip, Upload, Search, X
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

// ─── TrustGauge ────────────────────────────────────────────────────────────────
const TrustGauge = ({ score }: { score: number }) => {
  const [animated, setAnimated] = useState(0);
  const color = score >= 70 ? '#28A745' : score >= 40 ? '#FFC107' : '#FF4D4D';

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setAnimated(Math.round(ease * score));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [score]);

  const r = 80, sw = 14;
  const circ = Math.PI * r;
  const offset = circ - (animated / 100) * circ;

  return (
    <div className="relative w-48 h-28 flex flex-col items-center justify-end mx-auto overflow-hidden">
      <svg className="w-full h-full overflow-visible" viewBox="0 0 200 110">
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#1C2128" strokeWidth={sw} strokeLinecap="round" />
        <path
          d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke={color}
          strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.07s linear' }}
        />
      </svg>
      <div className="absolute bottom-2 flex flex-col items-center">
        <span className="text-5xl font-black" style={{ color }}>{animated}</span>
        <span className="text-xs text-[#8B949E] tracking-widest">/ 100</span>
      </div>
    </div>
  );
};

// ─── AnalyzingSpinner ───────────────────────────────────────────────────────────
const AnalyzingSpinner = ({ steps }: { steps: string[] }) => {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 700);
    return () => clearInterval(id);
  }, [steps.length]);
  return (
    <div className="flex flex-col items-center py-16 gap-8">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4" style={{ borderColor: '#1C2128' }} />
        <div className="absolute inset-0 rounded-full border-4 border-t-[#9D4EDD] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
      </div>
      <div className="space-y-3 w-full max-w-xs">
        {steps.map((s, i) => (
          <div key={i} className={`flex items-center gap-3 transition-all duration-300 ${i <= step ? 'opacity-100' : 'opacity-25'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${i < step ? 'bg-[#9D4EDD]' : i === step ? 'border border-[#9D4EDD] bg-[#9D4EDD]/10' : 'bg-[#1C2128]'}`}>
              {i < step ? <CheckCircle className="w-4 h-4 text-white" /> : i === step ? <div className="w-2 h-2 bg-[#9D4EDD] rounded-full animate-pulse" /> : null}
            </div>
            <span className={`text-sm font-medium ${i === step ? 'text-[#9D4EDD]' : i < step ? 'text-[#F8F9FA]' : 'text-[#8B949E]'}`}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── RedFlagChips ───────────────────────────────────────────────────────────────
const RedFlagChips = ({ flags, noFlagsText }: { flags: string[]; noFlagsText: string }) => {
  const [visible, setVisible] = useState(flags);
  useEffect(() => setVisible(flags), [flags]);
  if (!visible.length) return <p className="text-sm italic" style={{ color: '#8B949E' }}>{noFlagsText}</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {visible.map(f => (
        <div key={f} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold border"
          style={{ backgroundColor: 'rgba(255,77,77,0.15)', borderColor: 'rgba(255,77,77,0.3)', color: '#FF4D4D' }}>
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate max-w-[220px]">{f}</span>
          <button onClick={() => setVisible(v => v.filter(x => x !== f))} className="ml-1 opacity-70 hover:opacity-100">
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
};

// ─── Results Dashboard ──────────────────────────────────────────────────────────
const ResultsDashboard = ({ result, t }: { result: AnalysisResult; t: ReturnType<typeof useLanguage>['t'] }) => {
  const score = result.trust_score;
  const isHigh = result.risk === 'High';
  const isMedium = result.risk === 'Medium';
  const riskColor = isHigh ? '#FF4D4D' : isMedium ? '#FFC107' : '#28A745';
  const riskBg = isHigh ? 'rgba(255,77,77,0.1)' : isMedium ? 'rgba(255,193,7,0.1)' : 'rgba(40,167,69,0.1)';
  const riskBorder = isHigh ? 'rgba(255,77,77,0.3)' : isMedium ? 'rgba(255,193,7,0.3)' : 'rgba(40,167,69,0.3)';
  const riskLabel = isHigh ? t.results.highRisk : isMedium ? t.results.mediumRisk : t.results.lowRisk;
  const ActionIcon = isHigh ? XCircle : isMedium ? AlertTriangle : CheckCircle;
  const action = isHigh ? t.actions.block : isMedium ? t.actions.verify : t.actions.safe;

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="grid md:grid-cols-[220px_1fr] gap-5">

        {/* Score Card */}
        <div className="rounded-3xl border p-6 flex flex-col items-center justify-center text-center relative overflow-hidden"
          style={{ backgroundColor: '#161B22', borderColor: '#30363D' }}>
          <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: riskColor }} />
          <p className="text-sm font-medium mb-4" style={{ color: '#8B949E' }}>{t.results.trustScore}</p>
          <TrustGauge score={score} />
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-bold border"
            style={{ backgroundColor: riskBg, borderColor: riskBorder, color: riskColor }}>
            <ActionIcon className="w-4 h-4" />
            {riskLabel}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Decision Banner */}
          <div className="rounded-2xl border p-5 flex items-start gap-4"
            style={{ backgroundColor: riskBg, borderColor: riskBorder }}>
            <ActionIcon className="w-6 h-6 shrink-0 mt-0.5" style={{ color: riskColor }} />
            <div>
              <p className="font-bold text-base" style={{ color: riskColor }}>{action.label}</p>
              <p className="text-[#F8F9FA] font-semibold mt-0.5">{result.recommendation}</p>
            </div>
          </div>

          {/* Red Flags */}
          <div className="rounded-2xl border p-5" style={{ backgroundColor: '#161B22', borderColor: '#30363D' }}>
            <p className="text-sm font-medium mb-3" style={{ color: '#8B949E' }}>{t.results.redFlags}</p>
            <RedFlagChips flags={result.red_flags} noFlagsText={t.results.noRedFlags} />
          </div>

          {/* AI Explanation */}
          <div className="rounded-2xl border p-5" style={{ backgroundColor: '#1C2128', borderColor: '#30363D' }}>
            <p className="text-sm leading-relaxed" style={{ color: '#8B949E' }}>
              <strong style={{ color: '#F8F9FA' }}>{t.results.explanation}: </strong>
              {result.explanation}
            </p>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="rounded-2xl border border-dashed p-5 flex flex-col md:flex-row items-center gap-4 justify-between"
        style={{ borderColor: isHigh ? '#FF4D4D' : '#28A745', backgroundColor: isHigh ? 'rgba(255,77,77,0.04)' : 'rgba(40,167,69,0.05)' }}>
        <div className="flex items-center gap-3">
          <ActionIcon className="w-6 h-6 shrink-0" style={{ color: isHigh ? '#FF4D4D' : '#28A745' }} />
          <p className="font-bold" style={{ color: '#F8F9FA' }}>{action.desc}</p>
        </div>
      </div>
    </div>
  );
};

// ─── Home Page ──────────────────────────────────────────────────────────────────
export default function Home() {
  const { t, lang, setLang } = useLanguage();
  const [contentType, setContentType] = useState<AnalysisInputContentType>('message');
  const [inputMode, setInputMode] = useState<AnalysisInputInputMode>('text');
  const [content, setContent] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState('');
  const [validationError, setValidationError] = useState('');
  const analyzerRef = useRef<HTMLElement>(null);
 const resultsRef = useRef<HTMLDivElement>(null);

  const { data: examples } = useGetAnalysisExamples();
  const analyzeMutation = useAnalyzeContent();

  // Arabic labels + sample content for API examples (API always returns English keys)
  const exampleLabelsAr: Record<string, string> = {
    'Phishing email impersonating bank': 'بريد تصيّد ينتحل هوية بنك',
    'Work-from-home job scam': 'احتيال وظيفة عن بُعد',
    'Suspicious shortened URL': 'رابط مشبوه مختصر',
    'Legitimate business message': 'رسالة عمل موثوقة',
    'One-sided service contract': 'عقد خدمة بشروط مجحفة',
  };
  const exampleContentAr: Record<string, string> = {
    'Phishing email impersonating bank':
      'عزيزي العميل، تم اختراق حسابك المصرفي! يجب عليك التحقق من هويتك فوراً لإعادة تفعيل الحساب. انقر هنا لاستعادة الوصول: http://albilad-secure-verify.xyz/login. نطلب منك رقم بطاقتك وكلمة المرور خلال 24 ساعة وإلا سيتم إغلاق حسابك نهائياً. تحذير عاجل — لا تتأخر! مع التحية، فريق الدعم الأمني.',
    'Work-from-home job scam':
      'فرصة ذهبية!! اربح 2000 ريال يومياً من المنزل — لا خبرة مطلوبة! دخل مضمون 14,000 ريال أسبوعياً. ستقوم باستلام وإعادة إرسال الطرود لعملائنا الدوليين. ادفع رسوم الفحص الأمني (200 ريال) للبدء. حوّل الأموال لحسابنا كجزء من التدريب. عرض محدود — تصرف الآن قبل امتلاء المقاعد!',
    'Suspicious shortened URL':
      'يرجى التحقق من حسابك عبر الرابط التالي: https://bit.ly/2xR8mK أو قم بزيارة: http://amaz0n-sa-account-verify.click/login?token=xyz789',
    'Legitimate business message':
      'مرحباً، هذا تذكير بأن اجتماعكم المجدول مع فريق المالية سيكون غداً الساعة 10 صباحاً. تم مشاركة جدول الأعمال عبر البريد الإلكتروني. للاستفسارات يرجى التواصل مع المنسق مباشرة. سياسة الخصوصية والشروط والأحكام متاحة على الموقع الرسمي للشركة.',
    'One-sided service contract':
      'بتوقيع هذا العقد تتنازل عن كافة حقوقك في الاعتراض على الرسوم. الشركة غير مسؤولة عن أي أضرار من أي نوع. يتضمن العقد تحكيماً إلزامياً لجميع النزاعات. ضمان شخصي مطلوب من الموقّع. يُجدَّد تلقائياً ما لم يُلغَ قبل 90 يوماً من انتهائه. لا استرداد للمبالغ تحت أي ظرف من الظروف.',
  };
  const getExampleLabel = (label: string) =>
    lang === 'ar' ? (exampleLabelsAr[label] ?? label) : label;
  const getExampleContent = (label: string, originalContent: string) =>
    lang === 'ar' ? (exampleContentAr[label] ?? originalContent) : originalContent;
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const contentTypes = [
    { id: 'message' as const, label: t.contentTypes.message, icon: MessageSquare },
    { id: 'job_ad' as const, label: t.contentTypes.job_ad, icon: Briefcase },
    { id: 'url' as const, label: t.contentTypes.url, icon: LinkIcon },
    { id: 'email' as const, label: t.contentTypes.email, icon: Mail },
    { id: 'contract' as const, label: t.contentTypes.contract, icon: FileText },
  ];

  const inputModes = [
    { id: 'text' as const, label: t.inputModes.text },
    { id: 'url' as const, label: t.inputModes.url },
    { id: 'pdf' as const, label: t.inputModes.pdf },
  ];

  const progressSteps = [t.progress.reading, t.progress.identifying, t.progress.scoring, t.progress.building, t.progress.finalizing];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    let file: File | null = null;
    if ('dataTransfer' in e) {
      e.preventDefault(); setIsDragging(false);
      if (e.dataTransfer.files?.[0]) file = e.dataTransfer.files[0];
    } else if (e.target.files?.[0]) file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { setExtractionError(t.pdfError); return; }
    setIsExtracting(true); setExtractionError('');
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const tc = await page.getTextContent();
        text += tc.items.map((item: any) => item.str).join(' ') + '\n';
      }
      if (!text.trim()) throw new Error('empty');
      setContent(text); setInputMode('text');
    } catch { setExtractionError(t.pdfExtractError); }
    finally { setIsExtracting(false); }
  };

  const scrollToResults = () =>
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);

  const handleExampleClick = (ex: AnalysisExample) => {
    const exContent = getExampleContent(ex.label, ex.sample_content);
    setContentType(ex.content_type as AnalysisInputContentType);
    setInputMode('text'); setContent(exContent);
    setValidationError(''); setResult(null);
    analyzeMutation.mutate(
      { data: { content: exContent, content_type: ex.content_type as AnalysisInputContentType, input_mode: 'text', lang } as never },
      { onSuccess: res => { setResult(res); scrollToResults(); } }
    );
  };

  const handleAnalyze = () => {
    if (!content.trim()) { setValidationError(t.validationError); return; }
    setValidationError(''); setResult(null);
    analyzeMutation.mutate(
      { data: { content, content_type: contentType, input_mode: inputMode, lang } as never },
      { onSuccess: res => { setResult(res); scrollToResults(); } }
    );
  };

  const scrollToAnalyzer = () => analyzerRef.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen text-[#F8F9FA] flex flex-col"
      style={{ backgroundColor: '#0D1117', fontFamily: lang === 'ar' ? "'Cairo', sans-serif" : "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center top, rgba(123,44,191,0.18) 0%, transparent 70%)', zIndex: 0 }} />

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b"
        style={{ backgroundColor: 'rgba(13,17,23,0.85)', borderColor: 'rgba(48,54,61,0.8)' }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={scrollToAnalyzer} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7B2CBF, #9D4EDD)' }}>
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>TrustScore</span>
          </button>
          <div className="flex items-center gap-3">
            {/* EN / AR pill toggle */}
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="flex items-center rounded-xl border overflow-hidden text-sm font-bold transition-all hover:brightness-110"
              style={{ borderColor: 'rgba(48,54,61,0.8)' }}
              aria-label="Switch language"
            >
              <span className="px-3 py-1.5 transition-all"
                style={{
                  backgroundColor: lang === 'ar' ? '#9D4EDD' : 'transparent',
                  color: lang === 'ar' ? '#fff' : '#8B949E',
                }}>AR</span>
              <span className="px-3 py-1.5 transition-all"
                style={{
                  backgroundColor: lang === 'en' ? '#9D4EDD' : 'transparent',
                  color: lang === 'en' ? '#fff' : '#8B949E',
                }}>EN</span>
            </button>
            <button
              onClick={scrollToAnalyzer}
              className="text-sm font-medium px-4 py-2 rounded-xl border transition-all hover:bg-white/5"
              style={{ borderColor: 'rgba(48,54,61,0.8)', color: '#F8F9FA' }}
            >{t.analyzeContent}</button>
          </div>
        </div>
      </nav>

      <main className="flex flex-col items-center pt-32 pb-24 px-6 gap-20 relative z-10">

        {/* ── Hero ── */}
        <section className="text-center max-w-3xl flex flex-col items-center gap-6">
          <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight">
            {t.hero.line1}<br />
            <span style={{ background: 'linear-gradient(90deg, #7B2CBF, #9D4EDD)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {t.hero.line2}
            </span>
          </h1>
          <p className="text-lg md:text-xl leading-relaxed max-w-2xl" style={{ color: '#8B949E' }}>
            {t.hero.subtitle}
          </p>
          <button
            onClick={scrollToAnalyzer}
            className="mt-2 text-white px-10 py-4 rounded-2xl font-bold text-lg flex items-center gap-2 transition-all hover:-translate-y-0.5"
            style={{
              background: 'linear-gradient(90deg, #7B2CBF, #9D4EDD)',
              boxShadow: '0 0 30px rgba(157,78,221,0.4)'
            }}
          >
            {t.hero.cta} <Zap className="w-5 h-5 fill-current" />
          </button>
        </section>

        {/* ── Analyzer Card ── */}
        <section id="analyzer" ref={analyzerRef} className="w-full max-w-4xl scroll-mt-24">
          <div className="rounded-3xl border p-6 md:p-8 shadow-2xl"
            style={{ backgroundColor: '#161B22', borderColor: 'rgba(48,54,61,0.8)' }}>

            {/* Content-type tabs */}
            <div className="flex flex-wrap border-b pb-2 mb-6 gap-1" style={{ borderColor: 'rgba(48,54,61,0.8)' }}>
              {contentTypes.map(tab => {
                const Icon = tab.icon;
                const active = contentType === tab.id;
                return (
                  <button key={tab.id} onClick={() => setContentType(tab.id)}
                    className="relative flex items-center gap-2 px-4 py-3 rounded-t-xl text-sm font-bold transition-all"
                    style={{ color: active ? '#F8F9FA' : '#8B949E' }}>
                    <Icon className={`w-4 h-4 ${active ? 'text-[#9D4EDD]' : ''}`} />
                    {tab.label}
                    {active && <div className="absolute bottom-[-2px] left-0 right-0 h-0.5 rounded-full"
                      style={{ background: 'linear-gradient(90deg, #7B2CBF, #9D4EDD)' }} />}
                  </button>
                );
              })}
            </div>

            {/* Input mode + scan */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex rounded-xl p-1 border" style={{ backgroundColor: '#0D1117', borderColor: 'rgba(48,54,61,0.8)' }}>
                {inputModes.map(mode => (
                  <button key={mode.id} onClick={() => { setInputMode(mode.id); setValidationError(''); }}
                    className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      backgroundColor: inputMode === mode.id ? '#1C2128' : 'transparent',
                      color: inputMode === mode.id ? '#F8F9FA' : '#8B949E'
                    }}>{mode.label}</button>
                ))}
              </div>
              <button disabled className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm opacity-50 cursor-not-allowed"
                style={{ backgroundColor: '#0D1117', borderColor: 'rgba(48,54,61,0.5)', color: '#8B949E' }}>
                <Camera className="w-4 h-4" />
                {t.scanImage}
                <span className="text-[10px] px-2 py-0.5 rounded-full border"
                  style={{ backgroundColor: '#1C2128', borderColor: 'rgba(48,54,61,0.8)' }}>{t.comingSoon}</span>
              </button>
            </div>

            {/* Input area */}
            <div className="mb-5">
              {inputMode === 'text' && (
                <div className="relative">
                  <Paperclip className={`absolute top-4 ${lang === 'ar' ? 'left-4' : 'right-4'} w-5 h-5`} style={{ color: '#8B949E' }} />
                  <textarea
                    value={content}
                    onChange={e => { setContent(e.target.value); setValidationError(''); }}
                    placeholder={t.textPlaceholder}
                    className="w-full h-44 rounded-2xl border p-5 text-base resize-none focus:outline-none focus:ring-1 transition-all"
                    style={{
                      backgroundColor: '#0D1117',
                      borderColor: validationError ? '#FF4D4D' : 'rgba(48,54,61,0.8)',
                      color: '#F8F9FA',
                    }}
                    dir={lang === 'ar' ? 'rtl' : 'ltr'}
                  />
                  <div className="absolute bottom-3 right-3 text-xs font-mono" style={{ color: '#8B949E' }}>
                    {content.length} {t.chars}
                  </div>
                </div>
              )}
              {inputMode === 'url' && (
                <input
                  value={content}
                  onChange={e => { setContent(e.target.value); setValidationError(''); }}
                  placeholder={t.urlPlaceholder}
                  className="w-full h-14 rounded-2xl border px-5 text-base focus:outline-none focus:ring-1 transition-all"
                  style={{ backgroundColor: '#0D1117', borderColor: validationError ? '#FF4D4D' : 'rgba(48,54,61,0.8)', color: '#F8F9FA' }}
                  dir="ltr"
                />
              )}
              {inputMode === 'pdf' && (
                <div
                  className={`border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all ${isDragging ? 'scale-[0.99]' : ''}`}
                  style={{ borderColor: isDragging ? '#9D4EDD' : 'rgba(48,54,61,0.8)', backgroundColor: isDragging ? 'rgba(157,78,221,0.05)' : '#0D1117' }}
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileSelect}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <input type="file" id="file-upload" className="hidden" accept="application/pdf" onChange={handleFileSelect} />
                  <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: isDragging ? '#9D4EDD' : '#8B949E' }} />
                  <p className="font-medium text-[#F8F9FA]">{isExtracting ? t.pdfExtracting : t.pdfDrop}</p>
                  <p className="text-sm mt-1" style={{ color: '#8B949E' }}>{t.pdfSubtext}</p>
                  {extractionError && <p className="text-sm font-medium mt-3" style={{ color: '#FF4D4D' }}>{extractionError}</p>}
                </div>
              )}
              {validationError && (
                <p className="text-sm mt-2 flex items-center gap-1.5" style={{ color: '#FF4D4D' }}>
                  <AlertTriangle className="w-4 h-4" /> {validationError}
                </p>
              )}
            </div>

            {/* Examples */}
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#8B949E' }}>{t.tryExample}</p>
              <div className="flex flex-wrap gap-2">
                {examples?.map(ex => (
                  <button key={ex.label} onClick={() => handleExampleClick(ex)}
                    className="px-4 py-1.5 rounded-full border text-sm transition-all hover:bg-white/5"
                    style={{ backgroundColor: '#1C2128', borderColor: 'rgba(48,54,61,0.8)', color: '#F8F9FA' }}>
                    {getExampleLabel(ex.label)}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleAnalyze}
              disabled={!content.trim() || analyzeMutation.isPending || isExtracting}
              className="w-full text-white h-14 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
              style={{ background: 'linear-gradient(90deg, #7B2CBF, #9D4EDD)', boxShadow: '0 4px 20px rgba(157,78,221,0.3)' }}
            >
              {analyzeMutation.isPending ? t.analyzingBtn : t.analyzeBtn} <Zap className="w-5 h-5 fill-current" />
            </button>

            {analyzeMutation.isError && (
              <div className="mt-4 p-4 rounded-2xl border flex items-start gap-3"
                style={{ backgroundColor: 'rgba(255,77,77,0.1)', borderColor: 'rgba(255,77,77,0.3)' }}>
                <XCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#FF4D4D' }} />
                <div>
                  <p className="font-medium" style={{ color: '#FF4D4D' }}>{t.analysisFailed}</p>
                  <p className="text-sm opacity-80" style={{ color: '#8B949E' }}>{t.analysisFailedSub}</p>
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="mt-8" ref={resultsRef}>
            {analyzeMutation.isPending && (
              <div className="rounded-3xl border p-8" style={{ backgroundColor: '#161B22', borderColor: 'rgba(48,54,61,0.8)' }}>
                <AnalyzingSpinner steps={progressSteps} />
              </div>
            )}
            {result && !analyzeMutation.isPending && (
              <div style={{ animation: 'fadeUp 0.5s ease-out' }}>
                <ResultsDashboard result={result} t={t} />
              </div>
            )}
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="w-full max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">{t.howItWorks.title}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Upload, title: t.howItWorks.step1Title, desc: t.howItWorks.step1Desc },
              { icon: Search, title: t.howItWorks.step2Title, desc: t.howItWorks.step2Desc },
              { icon: Shield, title: t.howItWorks.step3Title, desc: t.howItWorks.step3Desc },
            ].map((step, i) => (
              <div key={i} className="rounded-3xl border p-8 flex flex-col items-center text-center transition-colors hover:bg-[#1C2128]"
                style={{ backgroundColor: '#161B22', borderColor: 'rgba(48,54,61,0.8)' }}>
                <div className="w-14 h-14 rounded-2xl border flex items-center justify-center mb-6 relative"
                  style={{ backgroundColor: '#0D1117', borderColor: 'rgba(48,54,61,0.8)' }}>
                  <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full text-white flex items-center justify-center font-bold shadow-lg text-sm"
                    style={{ background: 'linear-gradient(135deg,#7B2CBF,#9D4EDD)' }}>
                    {lang === 'ar' ? ['١', '٢', '٣'][i] : ['1', '2', '3'][i]}
                  </span>
                  <step.icon className="w-6 h-6" style={{ color: '#8B949E' }} />
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="leading-relaxed" style={{ color: '#8B949E' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t py-8 relative z-10" style={{ backgroundColor: '#161B22', borderColor: 'rgba(48,54,61,0.8)' }}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" style={{ color: '#9D4EDD' }} />
            <span className="font-bold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>TrustScore</span>
            <span className="text-sm mx-2" style={{ color: '#8B949E' }}>{t.footer}</span>
          </div>
          <p className="text-sm" style={{ color: '#8B949E', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            © {new Date().getFullYear()} TrustScore Hackathon Demo.
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
