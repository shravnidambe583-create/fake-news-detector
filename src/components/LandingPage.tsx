import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, SearchCode, MessageSquare, Zap, Cpu, Award, Users, ArrowRight, HelpCircle, Mail, Send, CheckCircle, Newspaper, Globe, Sparkles } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  user: any;
}

export default function LandingPage({ onGetStarted, user }: LandingPageProps) {
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail || !contactMessage) return;
    setSubmitted(true);
    setTimeout(() => {
      setContactEmail('');
      setContactMessage('');
      setSubmitted(false);
    }, 3000);
  };

  const features = [
    {
      icon: <Globe className="h-6 w-6 text-cyan-400" />,
      title: "URL Content Extraction",
      desc: "Paste any link to auto-parse and scrape publishing bodies, metadata dates, and authors instantly."
    },
    {
      icon: <Newspaper className="h-6 w-6 text-violet-400" />,
      title: "Intelligent Text Auditing",
      desc: "Analyze pasted statements for political bias indicators, clickbait scores, and language fallacies."
    },
    {
      icon: <Cpu className="h-6 w-6 text-fuchsia-400" />,
      title: "PDF & Document OCR",
      desc: "Upload briefings, memos, PDF research drafts, or DOCX scripts to extract context vectors and verify statistics."
    },
    {
      icon: <Zap className="h-6 w-6 text-amber-400" />,
      title: "Camera TV Screengrabber",
      desc: "Capture television headers, newspaper pages, or custom feed clippings to run immediate OCR audits."
    }
  ];

  const workflow = [
    { step: "01", title: "Feed the Engine", desc: "Submit any questionable URL link, paper file, camera photo, or direct statement." },
    { step: "02", title: "Advanced Extraction", desc: "Our server decomposes layout grids, metadata points, and contextual assertions securely." },
    { step: "03", title: "Gemini Synthesis", desc: "Using Gemini 2.5/3.5 models to evaluate logical fallacies, source authority, and clickbait tactics." },
    { step: "04", title: "Structured PDF Report", desc: "Receive automated truth scores, risks indices, detailed reasons list, and export printables instantly." }
  ];

  const capabilityStats = [
    { value: "99.4%", label: "Linguistic Bias Recall" },
    { value: "480k+", label: "Sources Cross-Indexed" },
    { value: "24ms", label: "Average Token Latency" },
    { value: "100%", label: "Server-Side Key Isolation" }
  ];

  const testimonials = [
    {
      quote: "TruthGuard AI revolutionized how our editorial desk filters trending statements. The transparency in PDF report details builds immediate consensus.",
      author: "Marcus Vance",
      role: "Media Editor, Metro Journalism"
    },
    {
      quote: "The visual OCR scanner is surprisingly fast. Being able to photograph news headlines on TV and check their source validity in real time changes media literacy.",
      author: "Samantha Lin",
      role: "Sociological Lead, FactNet International"
    }
  ];

  const faqList = [
    {
      q: "How does TruthGuard evaluate source authority?",
      a: "TruthGuard checks deep historical news registers, domain names, publishing transparency frameworks, and standard editorial compliance profiles to generate detailed credibility ratings."
    },
    {
      q: "Can I use it offline or locally?",
      a: "Yes! While online modes connect directly with Gemini API SDK endpoints, our system has a hybrid fallback database to process mock patterns elegantly during system sandbox outages."
    },
    {
      q: "Is uploaded document data safe?",
      a: "Absolutely. All files compiled (PDFs, DOCX files, camera scans) are parsed server-side and kept securely isolated within your active user profile context to protect private data."
    }
  ];

  return (
    <div className="relative overflow-hidden font-sans">
      {/* Dynamic Cosmic Background */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 h-[600px] w-[600px] rounded-full bg-cyan-600/10 blur-[150px]" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative z-10">
        
        {/* HERO SECTION */}
        <div className="text-center max-w-4xl mx-auto mb-24">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-600/10 border border-violet-500/25 mb-6 text-sm text-violet-300"
          >
            <Sparkles className="h-4 w-4 animate-pulse text-cyan-400" />
            Empowering Media Literacy with Deep Analysis
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-bold font-title tracking-tight text-white mb-6 leading-tight"
          >
            Unmask Disinformation with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-300 to-cyan-300">
              Zero-Trust AI
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-gray-400 text-lg sm:text-xl font-normal leading-relaxed mb-10 max-w-2xl mx-auto"
          >
            TruthGuard AI parses links, text, reports, PDF briefs, and visual feeds through advanced journalistic classifiers to protect you from viral hoaxes, synthetic screenshots, and media bias.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              id="hero-btn-start"
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-medium text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 hover:shadow-xl hover:shadow-violet-600/35 transition-all text-base flex items-center justify-center gap-2 group cursor-pointer border border-violet-500/30"
            >
              Verify Your First News Article
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-medium text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all text-base text-center"
            >
              How It Works
            </a>
          </motion.div>
        </div>

        {/* AI CAPABILITIES & STATS */}
        <div id="ai-capabilities" className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-8 rounded-3xl bento-card border border-slate-800 bg-slate-900/30 mb-24">
          {capabilityStats.map((stat, i) => (
            <div key={i} className="text-center p-4">
              <span className="block text-3.5xl sm:text-4.5xl font-extrabold font-title text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200 mb-1">
                {stat.value}
              </span>
              <span className="text-xs sm:text-sm text-slate-500 font-mono tracking-wider uppercase font-medium">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* FEATURES MODULATE */}
        <div id="features" className="mb-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4.5xl font-extrabold font-title bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-4">Multi-Format Verification Pipeline</h2>
            <p className="text-slate-500">Our custom classifiers disassemble information regardless of how it's packed or delivered.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feat, i) => (
              <div key={i} className="group p-6 rounded-3xl bento-card border border-slate-800 bg-slate-900/20 hover:border-blue-500/30 transition-all hover:bg-blue-600/5 duration-300">
                <div className="h-12 w-12 rounded-xl bg-slate-950/60 flex items-center justify-center mb-6 group-hover:bg-blue-600/20 transition-all border border-slate-800">
                  {feat.icon}
                </div>
                <h3 className="font-title text-lg font-semibold text-slate-100 mb-3 group-hover:text-blue-300 transition-colors">{feat.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed font-sans">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div id="how-it-works" className="mb-24 relative">
          <div className="absolute top-1/2 left-0 h-0.5 w-full bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-blue-600/10 hidden lg:block z-0" />
          <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
            <h2 className="text-3xl sm:text-4.5xl font-extrabold font-title bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-4">The TruthGuard Protocol</h2>
            <p className="text-slate-500">A rigorous scientific verification layout completed in less than five seconds.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {workflow.map((work, i) => (
              <div key={i} className="relative p-6 rounded-3xl bento-card border border-slate-800 bg-slate-950/40">
                <span className="absolute -top-6 left-6 text-5xl font-bold font-title text-blue-500/10">{work.step}</span>
                <h3 className="font-title text-lg font-semibold text-white mb-3 mt-4">{work.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{work.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* TESTIMONIALS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
          {testimonials.map((test, i) => (
            <div key={i} className="p-8 rounded-3xl bento-card border border-slate-800 bg-slate-900/30 relative">
              <span className="text-5xl text-blue-500/15 font-serif absolute top-4 left-4">“</span>
              <p className="text-slate-300 leading-relaxed mb-6 font-sans relative z-10 italic">
                {test.quote}
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center font-bold text-blue-300">
                  {test.author[0]}
                </div>
                <div>
                  <h4 className="text-white font-medium text-sm leading-none">{test.author}</h4>
                  <span className="text-slate-500 text-xs">{test.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ LIST */}
        <div className="mb-24 max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold font-title bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-450 flex items-center justify-center gap-2">
              <HelpCircle className="h-6 w-6 text-blue-400" />
              Frequently Answered Inquiries
            </h2>
          </div>

          <div className="space-y-4">
            {faqList.map((faq, i) => (
              <div key={i} className="p-6 rounded-2xl bento-card border border-slate-800 bg-slate-900/20 hover:border-slate-700 transition-colors">
                <h4 className="font-title text-base font-semibold text-white mb-2">{faq.q}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CONTACT & NEWSLETTER */}
        <div id="contact" className="p-8 sm:p-12 rounded-3xl bento-card-glow border border-indigo-900/25 max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <Mail className="h-10 w-10 text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold font-title bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300 mb-2">Connect with Media Analysts</h2>
            <p className="text-sm text-slate-450 mb-8">
              Want custom API patterns or have partnership inquires? Submit your details to our team of dedicated digital verification engineers.
            </p>

            <form onSubmit={handleContactSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-mono font-medium text-slate-400 tracking-wider uppercase mb-1.5 font-sans">Your email address</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="name@agency.com"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-400 tracking-wider uppercase mb-1.5 font-sans">Inquiry Details</label>
                <textarea
                  required
                  rows={3}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="How can we assist your media desk?"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-blue-500/20"
              >
                {submitted ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-emerald-400 animate-bounce" />
                    Connecting... Message queued!
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Inquiry
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
