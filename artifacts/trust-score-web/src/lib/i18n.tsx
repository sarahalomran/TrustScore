import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ar';

export const translations = {
  en: {
    analyzeContent: 'Analyze Content',
    hero: {
      line1: "Don't get fooled.",
      line2: 'Know before you trust.',
      subtitle: 'Scammers send 3.4 billion fake emails daily. Paste any suspicious message, job ad, or link — get an instant trust verdict.',
      cta: 'Check Something Now →',
    },
    contentTypes: {
      message: 'Message',
      job_ad: 'Job Ad',
      url: 'Link',
      email: 'Email',
      contract: 'Contract',
    },
    inputModes: {
      text: 'Text',
      url: 'URL',
      pdf: 'PDF',
    },
    scanImage: 'Scan Image',
    comingSoon: 'Coming Soon',
    textPlaceholder: 'Paste your content here to analyze for risks, manipulation, or scams...',
    urlPlaceholder: 'https://example.com/suspicious-link',
    pdfDrop: 'Drop PDF here or click to browse',
    pdfSubtext: 'Only text will be extracted for analysis',
    pdfExtracting: 'Extracting text...',
    pdfError: 'Please select a valid PDF file.',
    pdfExtractError: 'Failed to extract text from PDF. Please try pasting the content directly.',
    tryExample: 'Try an Example',
    analyzeBtn: 'Analyze Content →',
    analyzingBtn: 'Analyzing...',
    validationError: 'Please enter content to analyze',
    analysisFailed: 'Analysis failed.',
    analysisFailedSub: 'Please try again or use a shorter text snippet.',
    chars: 'chars',
    progress: {
      reading: 'Reading content...',
      identifying: 'Identifying signals...',
      scoring: 'Scoring risk...',
      building: 'Building report...',
      finalizing: 'Finalizing...',
    },
    results: {
      redFlags: 'Risk Signals Detected',
      noRedFlags: 'No risk signals detected',
      explanation: 'Analysis Explanation',
      trustScore: 'Trust Score',
      lowRisk: '✅ Low Risk',
      mediumRisk: '⚠️ Medium Risk',
      highRisk: '🚫 High Risk',
    },
    actions: {
      safe: { label: '✅ Safe to proceed', desc: 'This content appears legitimate. Proceed with normal caution.' },
      verify: { label: '⚠️ Verify before acting', desc: 'Double-check sender identity and any links before taking action.' },
      block: { label: '🚫 Do not engage', desc: 'Do not click links, provide information, or engage with this content.' },
    },
    howItWorks: {
      title: 'How TrustScore Works',
      step1Title: '1. Paste or Upload',
      step1Desc: 'Upload or paste your suspicious message, email, job ad, link, or contract securely into our analyzer.',
      step2Title: '2. Instant Analysis',
      step2Desc: 'Our specialized engine scans over 20+ trust signals, psychological triggers, and known manipulation patterns in seconds.',
      step3Title: '3. Get Your Verdict',
      step3Desc: 'Receive a clear, color-coded trust score with actionable next steps and specifically identified red flags.',
    },
    footer: '🛡️ TrustScore — Protecting people from digital deception.',
    langToggle: 'العربية',
  },
  ar: {
    analyzeContent: 'تحليل المحتوى',
    hero: {
      line1: 'لا تنخدع.',
      line2: 'اعرف قبل أن تثق.',
      subtitle: 'يرسل المحتالون 3.4 مليار بريد إلكتروني مزيف يومياً. الصق أي رسالة مشبوهة أو إعلان وظيفة أو رابط — واحصل على حكم فوري.',
      cta: '← افحص الآن',
    },
    contentTypes: {
      message: 'رسالة',
      job_ad: 'إعلان وظيفة',
      url: 'رابط',
      email: 'بريد إلكتروني',
      contract: 'عقد',
    },
    inputModes: {
      text: 'نص',
      url: 'رابط',
      pdf: 'PDF',
    },
    scanImage: 'مسح صورة',
    comingSoon: 'قريباً',
    textPlaceholder: 'الصق المحتوى هنا لتحليله بحثاً عن المخاطر أو التلاعب أو الاحتيال...',
    urlPlaceholder: 'https://example.com/رابط-مشبوه',
    pdfDrop: 'أفلت ملف PDF هنا أو انقر للتصفح',
    pdfSubtext: 'سيتم استخراج النص فقط للتحليل',
    pdfExtracting: 'جاري استخراج النص...',
    pdfError: 'الرجاء اختيار ملف PDF صالح.',
    pdfExtractError: 'فشل استخراج النص من PDF. يرجى لصق المحتوى مباشرةً.',
    tryExample: 'جرّب مثالاً',
    analyzeBtn: '← تحليل المحتوى',
    analyzingBtn: 'جاري التحليل...',
    validationError: 'الرجاء إدخال المحتوى المراد تحليله',
    analysisFailed: 'فشل التحليل.',
    analysisFailedSub: 'يرجى المحاولة مرة أخرى أو استخدام نص أقصر.',
    chars: 'حرف',
    progress: {
      reading: 'قراءة المحتوى...',
      identifying: 'تحديد الإشارات...',
      scoring: 'تقييم المخاطر...',
      building: 'إعداد التقرير...',
      finalizing: 'الإنهاء...',
    },
    results: {
      redFlags: 'مؤشرات الخطر المكتشفة',
      noRedFlags: 'لم تُكتشف أي مؤشرات خطر',
      explanation: 'شرح التحليل',
      trustScore: 'درجة الثقة',
      lowRisk: '✅ خطر منخفض',
      mediumRisk: '⚠️ خطر متوسط',
      highRisk: '🚫 خطر عالٍ',
    },
    actions: {
      safe: { label: '✅ آمن للمتابعة', desc: 'يبدو هذا المحتوى شرعياً. تابع بحذر طبيعي.' },
      verify: { label: '⚠️ تحقق قبل التصرف', desc: 'تحقق من هوية المرسل وأي روابط قبل اتخاذ أي إجراء.' },
      block: { label: '🚫 لا تتفاعل', desc: 'لا تنقر على الروابط أو تقدم معلومات أو تتفاعل مع هذا المحتوى.' },
    },
    howItWorks: {
      title: 'كيف يعمل TrustScore',
      step1Title: '١. الصق أو ارفع',
      step1Desc: 'ارفع أو الصق رسالتك المشبوهة أو بريدك الإلكتروني أو إعلان الوظيفة أو الرابط أو العقد بأمان في أداة التحليل.',
      step2Title: '٢. تحليل فوري',
      step2Desc: 'يفحص محركنا المتخصص أكثر من 20 إشارة ثقة ومحفزات نفسية وأنماط تلاعب معروفة في ثوانٍ.',
      step3Title: '٣. احصل على حكمك',
      step3Desc: 'احصل على درجة ثقة واضحة ومرمزة بالألوان مع خطوات عمل قابلة للتنفيذ ومؤشرات خطر محددة.',
    },
    footer: '🛡️ TrustScore — نحمي الناس من الخداع الرقمي.',
    langToggle: 'English',
  },
} as const;

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: typeof translations['en'];
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'ar',
  setLang: () => {},
  t: translations.ar,
  isRTL: true,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('ar');

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang], isRTL: lang === 'ar' }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
