import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Phone, 
  Send, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Lock, 
  Sparkles, 
  ChevronRight, 
  AlertCircle, 
  Package, 
  Check, 
  User, 
  Award,
  Leaf,
  MessageCircle
} from 'lucide-react';
import bundleImg from './assets/images/bundle_complex.jpg';
import capsulesImg from './assets/images/capsules_box.jpg';
import teaImg from './assets/images/uro_tea_box.jpg';

export default function App() {
  // Assessment diagnostic form state
  const [step, setStep] = useState(1);
  const [assessment, setAssessment] = useState<{ q1: string; q2: string; q3: string }>({
    q1: '',
    q2: '',
    q3: '',
  });

  // Lead Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [selectedPackage, setSelectedPackage] = useState<string>('bundle'); // 'bundle' | 'capsules' | 'tea'
  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [orderRef, setOrderRef] = useState('');

  // Automatic Phone Formatting Logic: +998 (XX) XXX-XX-XX
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    // Strip non-digits
    let digits = rawVal.replace(/\D/g, '');

    // Strip leading 998 if typed or pasted
    if (digits.startsWith('998')) {
      digits = digits.slice(3);
    }

    // Max 9 operator/number digits in Uzbekistan
    digits = digits.slice(0, 9);

    let formatted = '+998';
    if (digits.length > 0) {
      formatted += ' (' + digits.slice(0, 2);
    }
    if (digits.length >= 2) {
      formatted += ') ';
    }
    if (digits.length > 2) {
      formatted += digits.slice(2, 5);
    }
    if (digits.length >= 5) {
      formatted += '-';
    }
    if (digits.length > 5) {
      formatted += digits.slice(5, 7);
    }
    if (digits.length >= 7) {
      formatted += '-';
    }
    if (digits.length > 7) {
      formatted += digits.slice(7, 9);
    }

    setPhone(formatted);
    if (phoneError) setPhoneError('');
  };

  // Assessment Option Selector
  const handleOptionSelect = (key: 'q1' | 'q2' | 'q3', value: string) => {
    setAssessment(prev => ({ ...prev, [key]: value }));
    if (step < 3) {
      setStep(prev => prev + 1);
    } else {
      setStep(4); // Finished diagnostic
      // Smooth scroll to lead form
      const el = document.getElementById('lead-form');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Form Submission Handler
  // Form Submission Handler
    // Form Submission Handler
  const sendLeadData = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone digits (must be exactly 9 digits after +998)
    const rawDigits = phone.replace(/\D/g, '').replace(/^998/, '');
    if (rawDigits.length !== 9) {
      setPhoneError('Илтимос, телефон рақамингизни тўлиқ киритинг (+998 (XX) XXX-XX-XX)');
      return;
    }
    setPhoneError('');

    // Extract URL search parameters (UTM-метки)
    const urlParams = new URLSearchParams(window.location.search);
    const subid = urlParams.get('subid') || '';
    const campaign = urlParams.get('campaign') || urlParams.get('utm_campaign') || '';
    const adset = urlParams.get('adset') || urlParams.get('utm_content') || '';
    const creative = urlParams.get('creative') || urlParams.get('utm_term') || '';

    const generatedRef = 'ARS-' + Math.floor(100000 + Math.random() * 900000);
    setOrderRef(generatedRef);

    const clientName = name.trim() || 'Кўрсатилмаган';
    const cleanPhone = `+998${rawDigits}`;

    // Формируем структуру строго под amoCRM заказчика
    const payload = [
      {
        name: `Заявка с сайта META: ${clientName}`,
        pipeline_id: 11185138, // ID вашей воронки WEB META
        custom_fields_values: [
          {
            field_name: "Click ID",
            values: [{ value: subid }]
          },
          {
            field_name: "Campaign ID",
            values: [{ value: campaign }]
          },
          {
            field_name: "Adset ID",
            values: [{ value: adset }]
          },
          {
            field_name: "Creative ID",
            values: [{ value: creative }]
          },
          {
            field_name: "Landing ID",
            values: [{ value: generatedRef }]
          },
          {
            field_name: "Partner Lead ID",
            values: [{ value: selectedPackage }]
          },
          {
            field_name: "Источник трафика",
            values: [{ value: "Meta-Facebook/Instagram" }]
          }
        ],
        _embedded: {
          contacts: [
            {
              first_name: clientName,
              custom_fields_values: [
                {
                  field_code: "PHONE",
                  values: [
                    {
                      value: cleanPhone,
                      enum_code: "WORK"
                    }
                  ]
                }
              ]
            }
          ]
        }
      }
    ];

    setIsSubmitting(true);

    try {
      // Отправляем напрямую на эндпоинт заказчика
      const response = await fetch('https://amocrm.ru', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Добавили Bearer и выданный токен
          'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjQwNjQ0NjE4MzI3MGY1MmJmTzc5ZmQ4YzNlOTY0NTE5MTIyMmUxNWJkNWIzZmY2NzRmYTYyOGY4OWI2YTEwZGJiZjY2ZjY1ZTJkMmQzNjM0In0.eyJhdWQiOiJhYjUwZmFlMS04YWJiLTQ4ODktODA6Ni1mNTA4MTAwZGNkODUiLCJqdGkiOiI0MDY0NDYxODMyNzBmNTJiZjc3OWZkOGMzZTk2NDUxOTEyMjJlMTViZDViM3ZmNjc0ZmE2MjhmODliNmExMGRiYmY2NmY2NWUyZDJkMzYzNCIsImlhdCI6MTc4NjQzNTE4MSwibmJmIjoxNzg2NDM1MTgxLCJleHAiOjE4MTc5NDI0MDAsInN1YiI6IjEyNzE3NjQ2IiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjMyNzA5MTQyLCJiYXNlX2RvbWFpbiI6ImFtb2NybS5ydSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJjcm0iXSwiaGFzaF91dWlkIjoiM2MzMDliY2EtZWYxZC00YWVjLWFhNTItNDY5OTExMjg0Njc4IiwiYXBpX2RvbWFpbiI6ImFwaS1iLmFtb2NybS5ydSJ9.JPaHsfrWKaBoAvVaLnP5hot3wvt7HRju8_-YqCT4rFEgfoh39RzLEam0mIowLvrFiOX8N3OBizTnqmmWfoQ3ZPu-wm7Kho25MhyaO9175bGsYcfnBOxiXU5NcWL1dGTAf55g34NLYoE-a_orYt2f2JSYJdhhkeETx3mvA9cyX5F8-zmUGDaGlQwZl5d937oeGEEerLNhdB5PJ-zLiG_4eX3xbGOaiHHz9Rw0k4T-CewiQj9BmExiJ0GcTtzBUMMYmzk6tfKsBJBewjAGoOu3ukhF7mbPGNbFXKfMSxjHGRcRP8UV6V4AShC3JO_k0ZxJmWN6WBs_w-O53GDukQ5CVg'
        },
        body: JSON.stringify(payload),
      });

      console.log('amoCRM complex lead response status:', response.status);
    } catch (err) {
      console.warn('amoCRM lead dispatch error:', err);
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };



  const scrollToForm = (pkg?: string) => {
    if (pkg) setSelectedPackage(pkg);
    const el = document.getElementById('lead-form');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-gray-100 flex flex-col font-sans selection:bg-[#39FF14] selection:text-black pb-20 md:pb-0">
      
      {/* 1. NAVIGATION HEADER */}
      <header className="sticky top-0 z-50 bg-[#0D0D0D]/90 backdrop-blur-md border-b border-neutral-800 px-4 lg:px-8 py-3.5 transition-all">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-[#39FF14]/40 flex items-center justify-center shadow-[0_0_15px_rgba(57,255,20,0.2)] group-hover:shadow-[0_0_20px_rgba(57,255,20,0.5)] transition-all">
              <Shield className="w-5 h-5 text-[#39FF14]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-wider text-white flex items-center gap-1">
                ARSENAL <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] inline-block animate-ping"></span>
              </span>
              <span className="text-[10px] uppercase text-gray-400 font-medium tracking-tight">DayPharm Official</span>
            </div>
          </a>

          {/* Contact Links */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            <a 
              href="tel:+998555164848" 
              className="flex items-center gap-2 bg-neutral-900/90 border border-neutral-700 hover:border-[#39FF14]/60 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-white hover:text-[#39FF14] transition-all"
            >
              <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#39FF14]" />
              <span className="whitespace-nowrap">+998 55 516-48-48</span>
            </a>

            <a 
              href="https://t.me/daypharm" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 bg-[#0088cc]/20 border border-[#0088cc]/40 hover:bg-[#0088cc]/30 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#0088cc] hover:text-white transition-all"
            >
              <Send className="w-4 h-4" />
              <span>@daypharm</span>
            </a>
          </div>

        </div>
      </header>

      {/* COMPLIANCE TOP BAR */}
      <div className="bg-neutral-900/70 border-b border-neutral-800 py-1.5 px-4 text-center text-[11px] text-gray-400 font-medium">
        <span>БАД. Эркаклар саломатлигини қўллаб-қувватлаш учун.</span>
      </div>

      {/* 2. HERO / FIRST SCREEN */}
      <section className="relative pt-6 sm:pt-10 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-[#39FF14]/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-5 text-left">
            
            {/* Doctor recommendation tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-[#39FF14]/30 text-xs font-semibold text-gray-200">
              <Sparkles className="w-3.5 h-3.5 text-[#39FF14]" />
              <span>Тошкентлик мутахассислар тавсияси</span>
            </div>

            {/* Headline (Uzbek Cyrillic) */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Эркаклар саломатлигини <span className="text-[#39FF14] underline decoration-[#39FF14]/40 underline-offset-4">40 ёшдан кейин</span> қандай сақлаш керак?
            </h1>

            {/* Subheadline */}
            <p className="text-sm sm:text-base lg:text-lg text-gray-300 leading-relaxed font-normal">
              Тошкентлик шифокорлар тавсияси ва организмни қўллаб-қувватлашнинг хавфсиз, табиий йўли.
            </p>

            {/* Key Value Props Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="flex items-center gap-2.5 bg-neutral-900/80 border border-neutral-800 p-2.5 rounded-xl text-xs sm:text-sm text-gray-200">
                <CheckCircle2 className="w-4 h-4 text-[#39FF14] shrink-0" />
                <span>100% Табиий ва хавфсиз таркиб</span>
              </div>
              <div className="flex items-center gap-2.5 bg-neutral-900/80 border border-neutral-800 p-2.5 rounded-xl text-xs sm:text-sm text-gray-200">
                <Truck className="w-4 h-4 text-[#39FF14] shrink-0" />
                <span>Caravan Express орқали 24-48 соатда</span>
              </div>
              <div className="flex items-center gap-2.5 bg-neutral-900/80 border border-neutral-800 p-2.5 rounded-xl text-xs sm:text-sm text-gray-200">
                <Lock className="w-4 h-4 text-[#39FF14] shrink-0" />
                <span>Махфий, ёпиқ ўрамда етказиш</span>
              </div>
              <div className="flex items-center gap-2.5 bg-neutral-900/80 border border-neutral-800 p-2.5 rounded-xl text-xs sm:text-sm text-gray-200">
                <Award className="w-4 h-4 text-[#39FF14] shrink-0" />
                <span>Сертификатланган маҳсулот</span>
              </div>
            </div>

            {/* Hero CTA Button */}
            <div className="pt-2">
              <button
                onClick={() => scrollToForm()}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#39FF14] text-black font-extrabold text-base sm:text-lg hover:bg-[#32e012] transition-all transform active:scale-95 shadow-[0_0_30px_rgba(57,255,20,0.45)] hover:shadow-[0_0_45px_rgba(57,255,20,0.7)] flex items-center justify-center gap-3 cursor-pointer group"
              >
                <span>Бепул консултация олиш</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-[11px] text-gray-400 mt-2 font-medium">
                * Мутахассис 5-15 дақиқа ичида бепул боғланади
              </p>
            </div>

          </div>

          {/* Hero Right Showcase Image */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl bg-neutral-900/80 border border-neutral-800 p-4 sm:p-5 shadow-2xl backdrop-blur-xl">
              
              {/* Product Badge */}
              <div className="absolute top-6 left-6 z-10 bg-[#39FF14] text-black text-xs font-black px-3 py-1 rounded-lg uppercase tracking-wider shadow-md">
                Расми Гувоҳнома
              </div>

              {/* Showcase Image */}
              <div className="rounded-2xl overflow-hidden bg-black/80 border border-neutral-800 aspect-4/3 relative group p-1">
                <img 
                  src={bundleImg} 
                  alt="Arsenal Capsules va Arsenal Uro Tea" 
                  className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Product Price Badges */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-left">
                <div className="bg-black/80 border border-neutral-800 p-3 rounded-xl">
                  <div className="text-[11px] text-gray-400">Arsenal Capsules</div>
                  <div className="text-xs text-gray-300 font-semibold">30 капсула</div>
                  <div className="text-sm font-extrabold text-[#39FF14] mt-0.5">700 000 UZS</div>
                </div>
                <div className="bg-black/80 border border-neutral-800 p-3 rounded-xl">
                  <div className="text-[11px] text-gray-400">Arsenal Uro Tea</div>
                  <div className="text-xs text-gray-300 font-semibold">15 фито пакет</div>
                  <div className="text-sm font-extrabold text-[#39FF14] mt-0.5">150 000 UZS</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 3. INTERACTIVE ASSESSMENT DIAGNOSTIC BOX */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full" id="assessment">
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 sm:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
          
          <div className="flex items-center justify-between mb-6 border-b border-neutral-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#39FF14]/10 border border-[#39FF14]/40 flex items-center justify-center text-[#39FF14]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">Тезкор Диагностика ва Мутахассис Таҳлили</h2>
                <p className="text-xs text-gray-400">3 та саволга жавоб беринг ва индивидуал консултация олинг</p>
              </div>
            </div>
            
            <div className="text-xs font-bold px-2.5 py-1 rounded-full bg-neutral-800 text-[#39FF14]">
              {step <= 3 ? `Савол ${step} / 3` : 'Тайёр!'}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-neutral-800 h-2 rounded-full mb-6 overflow-hidden">
            <div 
              className="bg-[#39FF14] h-full transition-all duration-300 shadow-[0_0_10px_#39FF14]"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>

          {/* QUESTION 1 */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in text-left">
              <h3 className="text-base sm:text-xl font-bold text-white">
                1. Сизни қайси аломатлар кўпроқ безовта қилмоқда?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  'Тунда тез-тез ҳожатга чиқиш',
                  'Сийиш пайтида ноқулайлик',
                  'Эркаклик қувватининг пасайиши'
                ].map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect('q1', option)}
                    className="p-4 rounded-2xl bg-black/60 border border-neutral-800 hover:border-[#39FF14] hover:bg-[#39FF14]/10 text-left font-medium text-xs sm:text-sm text-gray-200 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <span>{option}</span>
                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-[#39FF14] shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* QUESTION 2 */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in text-left">
              <h3 className="text-base sm:text-xl font-bold text-white">
                2. Муаммо қанча вақтдан бери давом этяпти?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['1 ойгача', 'Бир неча ой', '1 йилдан ортиқ'].map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect('q2', option)}
                    className="p-4 rounded-2xl bg-black/60 border border-neutral-800 hover:border-[#39FF14] hover:bg-[#39FF14]/10 text-left font-medium text-xs sm:text-sm text-gray-200 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <span>{option}</span>
                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-[#39FF14] shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* QUESTION 3 */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in text-left">
              <h3 className="text-base sm:text-xl font-bold text-white">
                3. Ёшингиз?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['30-45', '46-60', '60+'].map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect('q3', option)}
                    className="p-4 rounded-2xl bg-black/60 border border-neutral-800 hover:border-[#39FF14] hover:bg-[#39FF14]/10 text-left font-medium text-xs sm:text-sm text-gray-200 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <span>{option} ёш</span>
                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-[#39FF14] shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* COMPLETED ASSESSMENT SUMMARY */}
          {step === 4 && (
            <div className="space-y-4 text-left animate-fade-in">
              <div className="p-4 rounded-2xl bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#39FF14] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">Таҳлил якунланди!</h4>
                  <p className="text-xs text-gray-300 mt-1">
                    Сизнинг аломатларингиз бўйича мутахассисимиз организмни табиий қўллаб-қувватлаш бўйича бепул тавсия беради. Тўлиқ консултация учун рақамингизни қолдиринг.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1 text-xs text-gray-300">
                <span className="bg-neutral-800 px-3 py-1 rounded-full">Аломат: <strong className="text-white">{assessment.q1}</strong></span>
                <span className="bg-neutral-800 px-3 py-1 rounded-full">Муддат: <strong className="text-white">{assessment.q2}</strong></span>
                <span className="bg-neutral-800 px-3 py-1 rounded-full">Ёш: <strong className="text-white">{assessment.q3}</strong></span>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* 4. MAIN LEAD CAPTURE FORM */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full" id="lead-form">
        <div className="bg-gradient-to-b from-neutral-900 to-black border-2 border-[#39FF14]/40 rounded-3xl p-6 sm:p-10 shadow-[0_0_50px_rgba(57,255,20,0.15)] relative">
          
          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#39FF14]/10 text-[#39FF14] text-xs font-bold uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5" />
              <span>Бепул ва Махфий Консултация</span>
            </div>

            <h2 className="text-xl sm:text-3xl font-extrabold text-white leading-tight">
              Маслаҳат бепул. Буюртмани расмийлаштириш ва консултация учун маълумотларингизни қолдиринг.
            </h2>

            <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto leading-relaxed">
              Мутахассис сиз билан 5-15 дақиқа ичида боғланади. Етказиб бериш Caravan Express орқали 24-48 соат ичида бутун Ўзбекистон бўйлаб амалга оширилади.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={sendLeadData} className="space-y-5 text-left max-w-md mx-auto">
            
            {/* Selected Package Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-[#39FF14]" />
                <span>Танланган Топлам:</span>
              </label>

              <div className="space-y-2">
                
                {/* Bundle Option */}
                <label 
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    selectedPackage === 'bundle' 
                      ? 'bg-[#39FF14]/10 border-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.2)]' 
                      : 'bg-neutral-900 border-neutral-800 text-gray-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="package" 
                      value="bundle" 
                      checked={selectedPackage === 'bundle'} 
                      onChange={() => setSelectedPackage('bundle')} 
                      className="accent-[#39FF14] w-4 h-4"
                    />
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                        <span>ТОПЛИ ТОПЛАМ (2 Капсула + 1 Уро Чой)</span>
                        <span className="bg-[#39FF14] text-black text-[9px] font-black px-1.5 py-0.5 rounded">ТАВСИЯ</span>
                      </div>
                      <div className="text-[11px] text-gray-400">Тўлиқ қўллаб-қувватлаш курси</div>
                    </div>
                  </div>
                  <div className="text-sm font-extrabold text-[#39FF14] whitespace-nowrap">1 550 000 UZS</div>
                </label>

                {/* Single Capsules Option */}
                <label 
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    selectedPackage === 'capsules' 
                      ? 'bg-[#39FF14]/10 border-[#39FF14]' 
                      : 'bg-neutral-900 border-neutral-800 text-gray-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="package" 
                      value="capsules" 
                      checked={selectedPackage === 'capsules'} 
                      onChange={() => setSelectedPackage('capsules')} 
                      className="accent-[#39FF14] w-4 h-4"
                    />
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-white">1 Ўрам Arsenal Capsules</div>
                      <div className="text-[11px] text-gray-400">30 капсула</div>
                    </div>
                  </div>
                  <div className="text-sm font-extrabold text-white whitespace-nowrap">700 000 UZS</div>
                </label>

              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#39FF14]" />
                <span>Сизнинг исмингиз</span>
              </label>
              <input 
                type="text" 
                placeholder="Масалан: Азизбек" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-black border border-neutral-800 text-white placeholder-gray-500 focus:outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14] text-sm font-medium transition-all"
              />
            </div>

            {/* Phone Input with Mask */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#39FF14]" />
                <span>Телефон рақамингиз *</span>
              </label>
              <input 
                type="tel" 
                value={phone}
                onChange={handlePhoneChange}
                placeholder="+998 (90) 123-45-67"
                className={`w-full px-4 py-3.5 rounded-xl bg-black border text-white placeholder-gray-500 focus:outline-none text-base font-extrabold tracking-wider transition-all ${
                  phoneError ? 'border-red-500 focus:ring-red-500' : 'border-neutral-800 focus:border-[#39FF14] focus:ring-[#39FF14]'
                }`}
              />
              {phoneError && (
                <div className="flex items-center gap-1.5 text-red-400 text-xs mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{phoneError}</span>
                </div>
              )}
            </div>

            {/* CTA Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-2xl bg-[#39FF14] text-black font-extrabold text-base sm:text-lg hover:bg-[#32e012] transition-all transform active:scale-95 shadow-[0_0_30px_rgba(57,255,20,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Жўнатилмоқда...</span>
              ) : (
                <>
                  <span>Тасдиқлаш ва бепул консултация олиш</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 pt-1">
              <Lock className="w-3 h-3 text-[#39FF14]" />
              <span>Сизнинг маълумотларингиз сир тутилади ва учинчи шахсларга берилмайди.</span>
            </div>

          </form>

        </div>
      </section>

      {/* 5. BUNDLE OFFER SECTION (Pre-framing pricing) */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-left">
        <div className="text-center mb-8 space-y-2">
          <h2 className="text-xl sm:text-3xl font-extrabold text-white">
            Расмий Нархлар Ва Афзалли Топламлар
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">
            Энг кўп танланадиган комплекс тавсияларни кўриб чиқинг
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Package 1: Single Capsule */}
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 flex flex-col justify-between hover:border-neutral-700 transition-all">
            <div>
              <div className="w-full h-48 rounded-2xl overflow-hidden mb-4 bg-black/80 border border-neutral-800 p-2">
                <img src={capsulesImg} alt="Arsenal Capsules 30 caps" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Капсула</div>
              <h3 className="text-lg font-bold text-white mt-1">Arsenal Capsules</h3>
              <p className="text-xs text-gray-400 mt-1">30 та капсула - 1 ойлик қўллаб-қувватлаш учун</p>
              
              <div className="my-5">
                <div className="text-2xl font-black text-white">700 000 UZS</div>
                <div className="text-[11px] text-gray-400">1 ўрам нархи</div>
              </div>

              <ul className="space-y-2 text-xs text-gray-300 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#39FF14]" />
                  <span>30 та капсула</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#39FF14]" />
                  <span>Табиий таркиб</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => scrollToForm('capsules')}
              className="w-full py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition-all cursor-pointer"
            >
              Буюртма бериш
            </button>
          </div>

          {/* Package 2: MAIN BUNDLE (BEST VALUE) */}
          <div className="bg-gradient-to-b from-neutral-900 via-neutral-900 to-black border-2 border-[#39FF14] rounded-3xl p-6 flex flex-col justify-between relative shadow-[0_0_30px_rgba(57,255,20,0.25)] transform md:-translate-y-2">
            
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#39FF14] text-black font-black text-[10px] uppercase tracking-widest px-4 py-1 rounded-full shadow-md whitespace-nowrap">
              Энг оммабоп топлам
            </div>

            <div>
              <div className="w-full h-48 rounded-2xl overflow-hidden mb-4 bg-black/80 border border-neutral-800 mt-2 p-2">
                <img src={bundleImg} alt="Arsenal Topli Toplam" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <div className="text-xs font-bold text-[#39FF14] uppercase tracking-wider">Комплекс Курс</div>
              <h3 className="text-xl font-black text-white mt-1">ТОПЛИ ТОПЛАМ</h3>
              <p className="text-xs text-gray-300 mt-1">2 Ўрам Capsules + 1 Ўрам Arsenal Uro Tea</p>
              
              <div className="my-5 bg-black/60 border border-neutral-800 p-3 rounded-2xl">
                <div className="text-3xl font-black text-[#39FF14]">1 550 000 UZS</div>
                <div className="text-[11px] text-gray-300 font-semibold mt-0.5">Максимал эффект ва афзаллик</div>
              </div>

              <ul className="space-y-2.5 text-xs text-gray-200 mb-6">
                <li className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#39FF14]" />
                  <span>2 Та Arsenal Capsules (60 капсула)</span>
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#39FF14]" />
                  <span>1 Та Arsenal Uro Tea (15 фито пакет)</span>
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#39FF14]" />
                  <span>Бепул етказиб бериш (Caravan Express)</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => scrollToForm('bundle')}
              className="w-full py-3.5 rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-black font-black text-sm shadow-[0_0_20px_rgba(57,255,20,0.4)] transition-all cursor-pointer"
            >
              Топламни танлаш
            </button>
          </div>

          {/* Package 3: Tea Only */}
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 flex flex-col justify-between hover:border-neutral-700 transition-all">
            <div>
              <div className="w-full h-48 rounded-2xl overflow-hidden mb-4 bg-black/80 border border-neutral-800 p-2">
                <img src={teaImg} alt="Arsenal Uro Tea 15 paket" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Фито Чой</div>
              <h3 className="text-lg font-bold text-white mt-1">Arsenal Uro Tea</h3>
              <p className="text-xs text-gray-400 mt-1">15 фито пакет - ўсимлик чойи</p>
              
              <div className="my-5">
                <div className="text-2xl font-black text-white">150 000 UZS</div>
                <div className="text-[11px] text-gray-400">1 ўрам нархи</div>
              </div>

              <ul className="space-y-2 text-xs text-gray-300 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#39FF14]" />
                  <span>15 фито пакет</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#39FF14]" />
                  <span>Табиий гиёҳлар йиғиндиси</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => scrollToForm('tea')}
              className="w-full py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition-all cursor-pointer"
            >
              Буюртма бериш
            </button>
          </div>

        </div>
      </section>

      {/* 6. REFERENCES, REVIEWS & CERTIFICATION SECTION */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-left border-t border-neutral-800/80">
        
        {/* Section Header */}
        <div className="text-center mb-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#39FF14]/10 text-[#39FF14] text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            <span>Ишонч ва Тавсиялар</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-white">
            Мутахассис ва Харидорлар Фикрлари
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-lg mx-auto">
            Организмни қўллаб-қувватлашда "Arsenal" маҳсулотларини танлаган юртдошларимиз ва мутахассисларнинг хулосалари
          </p>
        </div>

        {/* Doctor / Specialist Reference Card */}
        <div className="mb-8 bg-gradient-to-r from-neutral-900 via-black to-neutral-900 border border-[#39FF14]/30 rounded-3xl p-6 sm:p-8 relative shadow-[0_0_30px_rgba(57,255,20,0.1)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="w-16 h-16 rounded-2xl bg-neutral-800 border border-[#39FF14]/40 flex items-center justify-center shrink-0 text-[#39FF14] shadow-md">
              <Shield className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#39FF14] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Тошкентлик шифокор-мутахассислар тавсияси</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed italic">
                "40 ёшдан ошган ҳар бир эркак учун организмини ва сийдик-таносил тизимини мунтазам қўллаб-қувватлаш жуда муҳим. 'Arsenal' комплекси табиий ўсимлик таркиби ва хавфсизлиги билан ажралиб туради. У организмга тетиклик бағишлайди ва эркаклик саломатлигини мустаҳкамлашга ёрдам беради."
              </p>
              <div className="text-xs font-bold text-white pt-1">
                — DayPharm Мутахассислар Кенгаши
              </div>
            </div>
          </div>
        </div>

        {/* Customer References Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          
          <div className="bg-neutral-900/80 border border-neutral-800 p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-neutral-700 transition-all">
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-[#39FF14]">
                {[...Array(5)].map((_, i) => (
                  <CheckCircle2 key={i} className="w-3.5 h-3.5 fill-[#39FF14]" />
                ))}
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                "Тунда тез-тез ҳожатга чиқиш безовта қилар эди. 2 ҳафта давомида Арсенал капсуласи ва уро чойини биргаликда истеъмол қилдим. Жуда яхши енгиллик сезилди, тетиклик ортди."
              </p>
            </div>
            <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px] text-gray-400">
              <span className="font-bold text-white">Жамшид Р., 48 ёш</span>
              <span>Тошкент ш.</span>
            </div>
          </div>

          <div className="bg-neutral-900/80 border border-neutral-800 p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-neutral-700 transition-all">
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-[#39FF14]">
                {[...Array(5)].map((_, i) => (
                  <CheckCircle2 key={i} className="w-3.5 h-3.5 fill-[#39FF14]" />
                ))}
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                "Caravan Express орқали 1 кунда етказиб беришди. Ўрам ёпиқ ва мутлақо махфий келгани жуда маъқул бўлди. Таркиби табиий бўлгани учун танлаган эдим, натижаси аъло."
              </p>
            </div>
            <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px] text-gray-400">
              <span className="font-bold text-white">Бахтиёр М., 52 ёш</span>
              <span>Самарқанд</span>
            </div>
          </div>

          <div className="bg-neutral-900/80 border border-neutral-800 p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-neutral-700 transition-all">
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-[#39FF14]">
                {[...Array(5)].map((_, i) => (
                  <CheckCircle2 key={i} className="w-3.5 h-3.5 fill-[#39FF14]" />
                ))}
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                "Топли Топлам олдим. Уро Чой билан капсула жуда яхши мос келар экан. Энергия беради ва ўзимни анча тетик ҳис қиляпман. Раҳмат DayPharm!"
              </p>
            </div>
            <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px] text-gray-400">
              <span className="font-bold text-white">Отабек К., 44 ёш</span>
              <span>Наманган</span>
            </div>
          </div>

        </div>

        {/* Quality Certification References Banner */}
        <div className="bg-black/80 border border-neutral-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-300">
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-[#39FF14] shrink-0" />
            <div>
              <span className="font-bold text-white block">Ўзбекистон Мувофиқлик Сертификати Мавжуд</span>
              <span className="text-[11px] text-gray-400">Маҳсулот стандартларга ва сифат талабларига тўлиқ жавоб беради.</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-[#39FF14]">
            <CheckCircle2 className="w-4 h-4" />
            <span>БАД. Сертификатланган.</span>
          </div>
        </div>

      </section>

      {/* 7. TRUST & BENEFITS GRID */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full border-t border-neutral-800/80">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          
          <div className="bg-neutral-900/60 border border-neutral-800 p-4 rounded-2xl">
            <Leaf className="w-6 h-6 text-[#39FF14] mb-2" />
            <h4 className="text-xs sm:text-sm font-bold text-white">100% Табиий</h4>
            <p className="text-[11px] text-gray-400 mt-1">Сараланган табиий ўсимлик таркиби</p>
          </div>

          <div className="bg-neutral-900/60 border border-neutral-800 p-4 rounded-2xl">
            <Truck className="w-6 h-6 text-[#39FF14] mb-2" />
            <h4 className="text-xs sm:text-sm font-bold text-white">Caravan Express</h4>
            <p className="text-[11px] text-gray-400 mt-1">24-48 соатда бутун Ўзбекистон бўйлаб</p>
          </div>

          <div className="bg-neutral-900/60 border border-neutral-800 p-4 rounded-2xl">
            <Lock className="w-6 h-6 text-[#39FF14] mb-2" />
            <h4 className="text-xs sm:text-sm font-bold text-white">100% Махфий</h4>
            <p className="text-[11px] text-gray-400 mt-1">Ёпиқ ва номсиз ўрамда етказиб берилади</p>
          </div>

          <div className="bg-neutral-900/60 border border-neutral-800 p-4 rounded-2xl">
            <Award className="w-6 h-6 text-[#39FF14] mb-2" />
            <h4 className="text-xs sm:text-sm font-bold text-white">Сертификатланган</h4>
            <p className="text-[11px] text-gray-400 mt-1">Барча расмий мувофиқлик сертификатлари мавжуд</p>
          </div>

        </div>
      </section>

      {/* SUCCESS SUBMISSION MODAL */}
      {isSubmitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-neutral-900 border border-[#39FF14]/50 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-[0_0_50px_rgba(57,255,20,0.3)]">
            
            <div className="w-16 h-16 rounded-full bg-[#39FF14]/20 border border-[#39FF14] flex items-center justify-center mx-auto text-[#39FF14] animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#39FF14] tracking-widest uppercase">Буюртма Рақами: {orderRef}</span>
              <h3 className="text-xl sm:text-2xl font-black text-white">Раҳмат! Буюртмангиз қабул қилинди</h3>
            </div>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Мутахассисимиз <strong className="text-[#39FF14]">5-15 дақиқа ичида</strong> сиз кўрсатган телефон рақамига боғланади ва барча саволларингизга бепул жавоб беради.
            </p>

            <div className="p-3.5 rounded-2xl bg-black/60 border border-neutral-800 text-xs text-left space-y-1 text-gray-300">
              <div><strong>Телефон:</strong> {phone}</div>
              <div><strong>Исм:</strong> {name || 'Кўрсатилмаган'}</div>
            </div>

            <button
              onClick={() => setIsSubmitted(false)}
              className="w-full py-3.5 rounded-xl bg-[#39FF14] text-black font-extrabold text-sm hover:bg-[#32e012] transition-all cursor-pointer"
            >
              Ойнани ёпиш
            </button>

          </div>
        </div>
      )}

      {/* 7. FIXED MOBILE QUICK CALL / CTA BAR (FOR INSTAGRAM BROWSERS) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0D0D0D]/95 backdrop-blur-lg border-t border-neutral-800 p-2.5 px-4 flex items-center justify-between gap-2 shadow-2xl">
        <a 
          href="tel:+998555164848"
          className="flex items-center justify-center gap-1.5 bg-neutral-900 border border-neutral-700 px-3 py-2.5 rounded-xl text-xs font-bold text-white shrink-0"
        >
          <Phone className="w-4 h-4 text-[#39FF14]" />
          <span>Қўнғироқ</span>
        </a>

        <button
          onClick={() => scrollToForm()}
          className="flex-1 py-2.5 px-3 rounded-xl bg-[#39FF14] text-black font-extrabold text-xs shadow-[0_0_15px_rgba(57,255,20,0.4)] flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>Бепул Консултация</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 8. FIXED LEGAL FOOTER */}
      <footer className="mt-auto bg-black border-t border-neutral-900 py-8 px-4 text-center text-xs text-gray-400 space-y-3">
        <div className="max-w-4xl mx-auto leading-relaxed">
          <p className="font-medium">
            DayPharm МЧЖ. Расмий рақам: <a href="tel:+998555164848" className="text-gray-300 underline">+998 55 516-48-48</a>. Telegram: <a href="https://t.me/daypharm" target="_blank" rel="noopener noreferrer" className="text-[#0088cc] underline">@daypharm</a>. Маҳсулот сертификатланган. БАД. Дори воситаси эмас. Эркаклар саломатлигини қўллаб-қувватлаш учун.
          </p>
        </div>
        <div className="text-[10px] text-gray-400">
          © {new Date().getFullYear()} DayPharm. Барча ҳуқуқлар ҳимояланган.
        </div>
      </footer>

    </div>
  );
}
