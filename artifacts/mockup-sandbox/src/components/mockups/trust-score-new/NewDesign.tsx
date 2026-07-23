import React, { useState, useEffect } from "react";
import {
  Shield,
  MessageSquare,
  Briefcase,
  Link as LinkIcon,
  Mail,
  FileText,
  Camera,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Zap,
  Paperclip,
  Upload,
  Search,
  ArrowLeft
} from "lucide-react";

export default function NewDesign() {
  const [activeTab, setActiveTab] = useState("رسالة");
  const [inputMode, setInputMode] = useState("نص");

  const tabs = [
    { id: "رسالة", icon: MessageSquare, label: "رسالة" },
    { id: "إعلان وظيفة", icon: Briefcase, label: "إعلان وظيفة" },
    { id: "رابط", icon: LinkIcon, label: "رابط" },
    { id: "بريد إلكتروني", icon: Mail, label: "بريد إلكتروني" },
    { id: "عقد", icon: FileText, label: "عقد" },
  ];

  const examples = ["رسالة تصيد", "إعلان مزيف", "عقد مشبوه"];
  const inputModes = ["نص", "رابط", "PDF"];

  return (
    <div 
      dir="rtl" 
      className="min-h-[100dvh] w-full font-['Cairo'] text-[#F8F9FA] overflow-x-hidden selection:bg-[#9D4EDD] selection:text-white"
      style={{ backgroundColor: "#0D1117" }}
    >
      {/* Background Glow */}
      <div className="fixed top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-[#7B2CBF]/20 to-transparent blur-[120px] pointer-events-none rounded-full" />
      
      {/* 1. Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#30363D]/80 bg-[#0D1117]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7B2CBF] to-[#9D4EDD] flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-['Plus_Jakarta_Sans'] font-bold text-xl tracking-tight">TrustScore</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-sm font-medium text-[#8B949E] hover:text-[#F8F9FA] transition-colors">
              العربية
            </button>
            <button className="text-sm font-medium border border-[#30363D]/80 hover:bg-[#161B22] px-4 py-2 rounded-xl transition-all">
              تحليل المحتوى
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24 max-w-6xl mx-auto px-6 flex flex-col items-center gap-24 relative z-10">
        
        {/* 2. Hero Section */}
        <section className="text-center max-w-3xl flex flex-col items-center gap-6">
          <div
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight">
              لا تنخدع.
              <br />
              <span className="bg-gradient-to-r from-[#7B2CBF] to-[#9D4EDD] text-transparent bg-clip-text">
                اعرف قبل أن تثق.
              </span>
            </h1>
          </div>
          
          <p 
            className="text-[#8B949E] text-lg md:text-xl leading-relaxed max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both"
          >
            يرسل المحتالون 3.4 مليار بريد إلكتروني مزيف يومياً. الصق أي رسالة مشبوهة أو إعلان وظيفة أو رابط — واحصل على حكم فوري.
          </p>
          
          <button
            className="mt-4 bg-gradient-to-r from-[#7B2CBF] to-[#9D4EDD] text-white px-10 py-4 rounded-2xl font-bold text-lg flex items-center gap-2 shadow-[0_0_30px_rgba(157,78,221,0.4)] hover:shadow-[0_0_40px_rgba(157,78,221,0.6)] transition-all hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both"
          >
            افحص بمحرك الثقة <Zap className="w-5 h-5 fill-current" />
          </button>
        </section>

        {/* 3. Analyzer Card */}
        <section 
          className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both"
        >
          <div 
            className="rounded-3xl border border-[#30363D]/80 p-6 md:p-8 shadow-2xl"
            style={{ backgroundColor: "#161B22" }}
          >
            {/* Tabs */}
            <div className="flex flex-wrap border-b border-[#30363D]/80 mb-6 pb-2 gap-2">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-t-xl text-sm md:text-base font-bold transition-all relative
                      ${isActive ? 'text-[#F8F9FA]' : 'text-[#8B949E] hover:text-[#F8F9FA] hover:bg-[#1C2128]'}`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#9D4EDD]' : ''}`} />
                    {tab.label}
                    {isActive && (
                      <div 
                        className="absolute bottom-[-2px] left-0 right-0 h-0.5 bg-gradient-to-r from-[#7B2CBF] to-[#9D4EDD]"
                      />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Input Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
              <div className="flex bg-[#0D1117] rounded-xl p-1 border border-[#30363D]/80">
                {inputModes.map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setInputMode(mode)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all
                      ${inputMode === mode ? 'bg-[#1C2128] text-white shadow-sm' : 'text-[#8B949E] hover:text-white'}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              
              <button 
                disabled
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0D1117] border border-[#30363D]/50 text-[#8B949E] text-sm opacity-60 cursor-not-allowed"
              >
                <Camera className="w-4 h-4" />
                مسح صورة
                <span className="text-[10px] bg-[#1C2128] px-2 py-0.5 rounded-full border border-[#30363D]/80">(قريباً)</span>
              </button>
            </div>

            {/* Textarea Area */}
            <div className="relative group">
              <div className="absolute top-4 right-4 text-[#8B949E]">
                <Paperclip className="w-5 h-5" />
              </div>
              <textarea 
                className="w-full h-48 bg-[#0D1117] rounded-2xl border border-[#30363D]/80 p-5 pr-12 text-[#F8F9FA] placeholder:text-[#8B949E]/70 focus:outline-none focus:border-[#7B2CBF]/50 focus:ring-1 focus:ring-[#7B2CBF]/50 transition-all resize-none text-lg"
                placeholder="الصق النص أو الرابط هنا للتحليل..."
                dir="rtl"
              />
            </div>

            {/* Examples Row */}
            <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-2">
              <span className="text-sm text-[#8B949E] whitespace-nowrap">جرب أمثلة:</span>
              {examples.map((ex, i) => (
                <button 
                  key={i}
                  className="whitespace-nowrap px-4 py-1.5 rounded-full bg-[#1C2128] border border-[#30363D]/80 text-sm hover:bg-[#30363D]/50 transition-colors text-[#F8F9FA]"
                >
                  {ex}
                </button>
              ))}
            </div>

            {/* Submit CTA */}
            <button className="w-full mt-6 bg-gradient-to-r from-[#7B2CBF] to-[#9D4EDD] text-white h-14 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(157,78,221,0.3)] hover:shadow-[0_4px_30px_rgba(157,78,221,0.5)] transition-all">
              افحص بمحرك الثقة <Zap className="w-5 h-5 fill-current" />
            </button>
          </div>
        </section>

        {/* 4. Results Dashboard (Demo) */}
        <section 
          className="w-full max-w-4xl flex flex-col gap-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold">نتيجة التحليل (مثال توضيحي)</h2>
            <div className="h-[1px] flex-1 bg-[#30363D]/80" />
          </div>

          <div className="grid md:grid-cols-[1fr_2fr] gap-6">
            
            {/* Score Card */}
            <div className="rounded-3xl border border-[#30363D]/80 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden" style={{ backgroundColor: "#161B22" }}>
              <div className="absolute top-0 left-0 w-full h-1 bg-[#FF4D4D]" />
              <h3 className="text-[#8B949E] font-medium mb-6">مؤشر الثقة</h3>
              
              <div className="relative w-48 h-24 overflow-hidden flex justify-center">
                {/* Background Arc */}
                <div className="absolute w-48 h-48 rounded-full border-[16px] border-[#1C2128]" />
                
                {/* Colored Arc (animated) */}
                <div 
                  className="absolute w-48 h-48 rounded-full border-[16px] border-transparent border-t-[#FF4D4D] border-r-[#FF4D4D]"
                  style={{ transformOrigin: "center", transform: `rotate(${-180 + (18 / 100) * 180}deg)`, transition: "transform 1.5s ease-out" }}
                />
                
                <div className="absolute bottom-0 flex flex-col items-center">
                  <span className="text-5xl font-black text-[#FF4D4D]">18</span>
                  <span className="text-xs text-[#8B949E] mt-1 font-['Plus_Jakarta_Sans'] tracking-widest">/ 100</span>
                </div>
              </div>
              
              <div className="mt-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#FF4D4D]/10 text-[#FF4D4D] text-sm font-bold border border-[#FF4D4D]/20">
                <AlertTriangle className="w-4 h-4" />
                خطر مرتفع جداً
              </div>
            </div>

            {/* Details Column */}
            <div className="flex flex-col gap-4">
              
              {/* Decision Banner */}
              <div className="rounded-2xl border p-5 flex items-start gap-4" style={{ backgroundColor: "rgba(255,77,77,0.1)", borderColor: "rgba(255,77,77,0.3)" }}>
                <div className="mt-1">
                  <XCircle className="w-6 h-6 text-[#FF4D4D]" />
                </div>
                <div>
                  <h3 className="text-[#FF4D4D] font-bold text-lg mb-1">القرار المقترح</h3>
                  <p className="text-[#F8F9FA] text-xl font-bold">تجنب الضغط على هذا الرابط فوراً</p>
                </div>
              </div>

              {/* Red Flags Chips */}
              <div className="rounded-2xl border border-[#30363D]/80 p-5" style={{ backgroundColor: "#161B22" }}>
                <h3 className="text-[#8B949E] font-medium mb-4 text-sm">العلامات التحذيرية المكتشفة:</h3>
                <div className="flex flex-wrap gap-2">
                  {["استعجال غير مبرر", "المرسل غير معروف", "طلب بيانات حساسة", "روابط مشبوهة"].map((flag, idx) => (
                    <div 
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold border"
                      style={{ backgroundColor: "rgba(255,77,77,0.15)", borderColor: "rgba(255,77,77,0.3)", color: "#FF4D4D" }}
                    >
                      <span>🚩</span> {flag}
                    </div>
                  ))}
                </div>
              </div>

              {/* Analysis Explanation */}
              <div className="rounded-2xl border border-[#30363D]/80 p-5" style={{ backgroundColor: "#1C2128" }}>
                <p className="text-sm leading-relaxed text-[#8B949E]">
                  <strong className="text-[#F8F9FA]">تحليل الذكاء الاصطناعي:</strong> هذه الرسالة تتبع نمطاً كلاسيكياً للتصيد الاحتيالي. يتم استخدام لغة تخويفية (تم إيقاف حسابك) لإجبارك على اتخاذ إجراء سريع. الرابط المرفق لا ينتمي للنطاق الرسمي للبنك، بل يحاول تقليده لسرقة بيانات الدخول الخاصة بك.
                </p>
              </div>

            </div>
          </div>

          {/* Next Steps */}
          <div className="mt-2 rounded-2xl border border-dashed p-5 flex flex-col md:flex-row items-center gap-4 justify-between" style={{ borderColor: "#28A745", backgroundColor: "rgba(40,167,69,0.05)" }}>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-[#28A745]" />
              <p className="text-[#F8F9FA] font-bold text-lg">الخطوة التالية: قم بحظر الرقم وتواصل مع البنك عبر قنواته الرسمية.</p>
            </div>
            <button className="px-5 py-2.5 rounded-xl bg-[#28A745] text-white font-bold text-sm hover:bg-[#28A745]/90 transition-colors shrink-0">
              كيف أحمي نفسي؟
            </button>
          </div>
        </section>

        {/* 5. How It Works */}
        <section className="w-full max-w-5xl mt-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">كيف يعمل TrustScore؟</h2>
            <p className="text-[#8B949E]">ثلاث خطوات بسيطة تحميك من الاحتيال الرقمي</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { num: "١", title: "الصق أو ارفع", desc: "انسخ أي رسالة، رابط، أو ارفع ملف PDF للتحليل الفوري.", icon: Upload },
              { num: "٢", title: "تحليل فوري", desc: "يقوم محرك الذكاء الاصطناعي الخاص بنا بفحص المحتوى بحثاً عن علامات التلاعب.", icon: Search },
              { num: "٣", title: "احصل على حكمك", desc: "نتيجة واضحة بنسبة مئوية ونصائح عملية للخطوات القادمة.", icon: Shield },
            ].map((step, i) => (
              <div key={i} className="rounded-3xl border border-[#30363D]/80 p-8 flex flex-col items-center text-center hover:bg-[#1C2128] transition-colors" style={{ backgroundColor: "#161B22" }}>
                <div className="w-14 h-14 rounded-2xl bg-[#0D1117] border border-[#30363D]/80 flex items-center justify-center mb-6 relative">
                  <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br from-[#7B2CBF] to-[#9D4EDD] text-white flex items-center justify-center font-bold font-['Plus_Jakarta_Sans'] shadow-lg">{step.num}</span>
                  <step.icon className="w-6 h-6 text-[#8B949E]" />
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-[#8B949E] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* 6. Footer */}
      <footer className="border-t border-[#30363D]/80 bg-[#161B22] py-8 mt-12 relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#9D4EDD]" />
            <span className="font-['Plus_Jakarta_Sans'] font-bold tracking-tight">TrustScore</span>
            <span className="text-[#8B949E] text-sm ml-2 mr-2"> — نحمي الناس من الخداع الرقمي.</span>
          </div>
          <div className="text-[#8B949E] text-sm font-['Plus_Jakarta_Sans']">
            © 2024 TrustScore Hackathon Demo.
          </div>
        </div>
      </footer>
    </div>
  );
}
