import React, { useState, useRef, useEffect } from 'react';
import { Globe, FileText, Upload, Camera, AlertCircle, Sparkles, Loader2, Link2, Copy, Play, Monitor, RefreshCw, FlipHorizontal } from 'lucide-react';
import { SourceType, VerificationReport } from '../types';

interface VerifyModuleProps {
  onAnalysisSuccess: (report: VerificationReport) => void;
  user: any;
}

export default function VerifyModule({ onAnalysisSuccess, user }: VerifyModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<SourceType>('url');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Input fields
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [extractedDocText, setExtractedDocText] = useState('');

  // Camera fields
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  // Stop camera helper
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [cameraStream]);

  // Start HTML5 Camera
  const startCamera = async () => {
    setCapturedPhoto(null);
    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      setCameraStream(stream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn("Camera stream locked or block in iframe: ", err);
      setErrorMsg("Camera device could not be opened. Simulating high-fidelity visual camera frames instead.");
    }
  };

  // Capture image frame
  const captureSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedPhoto(dataUrl);
        stopCamera();
      }
    } else {
      // Simulate frame snapshot in iframe sandbox context with placeholder textocr
      setCapturedPhoto("https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop&q=60");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  // Simulate server-side file text loader API
  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
    setLoading(true);
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = async (e) => {
      const excerpt = e.target?.result as string;
      try {
        const res = await fetch("/api/extract-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: selectedFile.name, fileContent: excerpt?.substring(0, 500) })
        });
        const data = await res.json();
        if (res.ok && data.text) {
          setExtractedDocText(data.text);
        } else {
          setExtractedDocText(`[Extracted text from doc: ${selectedFile.name}]\nDocument uploaded for analytical checks...`);
        }
      } catch (err) {
        setExtractedDocText(`[Extracted text from doc: ${selectedFile.name}]\nFailed processing text extraction.`);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(selectedFile.slice(0, 1000));
  };

  const triggerVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    let verifyContent = "";
    let metadata: any = {};

    if (activeSubTab === 'url') {
      if (!urlInput.trim()) {
        setLoading(false);
        return setErrorMsg('URL address field cannot be left blank');
      }
      verifyContent = urlInput;
      metadata = { title: `Analytical audit on domain root ${urlInput.replace('https://', '').replace('http://', '').split('/')[0]}` };
    } else if (activeSubTab === 'text') {
      if (!textInput.trim() || textInput.length < 20) {
        setLoading(false);
        return setErrorMsg('Pasted statement must be at least 20 characters for linguistic evaluations.');
      }
      verifyContent = textInput;
    } else if (activeSubTab === 'file') {
      if (!file) {
        setLoading(false);
        return setErrorMsg('Please choose/drop a PDF or Docx report first');
      }
      verifyContent = extractedDocText || `Analyzed text payload from document file ${file.name}`;
      metadata = { fileName: file.name };
    } else if (activeSubTab === 'image' || activeSubTab === 'camera') {
      if (!capturedPhoto) {
        setLoading(false);
        return setErrorMsg('Please capture a visual snapshot or drag similar feed banners first.');
      }
      verifyContent = capturedPhoto; // passes base64 content
      metadata = { fileName: "Visual_Scanner_Buffer.jpg" };
    }

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activeSubTab,
          content: verifyContent,
          metadata
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Misinformation audit failed on processing node.");
      }

      // Attach any server-supplied safety/key fallback warning
      const reportWithFallback = {
        ...data.report,
        fallbackWarning: data.fallbackWarning || ""
      };

      // Transition to report details display page
      onAnalysisSuccess(reportWithFallback);
    } catch (err: any) {
      setErrorMsg(err.message || "Factual checks timed out. Please review server.ts logs.");
    } finally {
      setLoading(false);
    }
  };

  // Simulated visual capture triggers
  const triggerSimulatedPhoto = (theme: string) => {
    const simulationMatrix: Record<string, string> = {
      newspaper: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop&q=60",
      social: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=60",
      tv: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=60"
    };
    
    setCapturedPhoto(simulationMatrix[theme]);
    setErrorMsg('');
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto font-sans">
      
      {/* Dynamic Headers */}
      <div className="border-b border-slate-800/85 pb-4">
        <h1 className="text-2.5xl font-extrabold font-title bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 flex items-center gap-2.5">
          <Globe className="h-6 w-6 text-blue-450" />
          News Verification Module
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Deconstruct articles, evaluate visual screengrabs, audit PDF drafts, or inspect political bias with advanced machine checking.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 flex items-start gap-2 leading-relaxed">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* PIPELINE TAB SELECTORS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          id="btn-subtab-url"
          onClick={() => { setActiveSubTab('url'); setErrorMsg(''); }}
          className={`py-4 px-4 rounded-2xl text-xs font-mono tracking-wider font-bold flex flex-col items-center gap-2.5 transition-all border ${
            activeSubTab === 'url' 
              ? 'bg-blue-600/15 border-blue-500 text-blue-300 shadow-md shadow-blue-500/5' 
              : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:bg-slate-900/70 hover:text-white'
          }`}
        >
          <Link2 className="h-5 w-5 text-blue-400" />
          URL LINK SCRAPER
        </button>

        <button
          id="btn-subtab-text"
          onClick={() => { setActiveSubTab('text'); setErrorMsg(''); }}
          className={`py-4 px-4 rounded-2xl text-xs font-mono tracking-wider font-bold flex flex-col items-center gap-2.5 transition-all border ${
            activeSubTab === 'text' 
              ? 'bg-blue-600/15 border-blue-500 text-blue-300 shadow-md shadow-blue-500/5' 
              : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:bg-slate-900/70 hover:text-white'
          }`}
        >
          <FileText className="h-5 w-5 text-purple-400" />
          PASTED STATEMENTS
        </button>

        <button
          id="btn-subtab-file"
          onClick={() => { setActiveSubTab('file'); setErrorMsg(''); }}
          className={`py-4 px-4 rounded-2xl text-xs font-mono tracking-wider font-bold flex flex-col items-center gap-2.5 transition-all border ${
            activeSubTab === 'file' 
              ? 'bg-blue-600/15 border-blue-500 text-blue-300 shadow-md shadow-blue-500/5' 
              : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:bg-slate-900/70 hover:text-white'
          }`}
        >
          <Upload className="h-5 w-5 text-emerald-400" />
          DOCUMENT UPLOADE
        </button>

        <button
          id="btn-subtab-camera"
          onClick={() => { setActiveSubTab('camera'); setErrorMsg(''); }}
          className={`py-4 px-4 rounded-2xl text-xs font-mono tracking-wider font-bold flex flex-col items-center gap-2.5 transition-all border ${
            activeSubTab === 'camera' 
              ? 'bg-blue-600/15 border-blue-500 text-blue-300 shadow-md shadow-blue-500/5' 
              : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:bg-slate-900/70 hover:text-white'
          }`}
        >
          <Camera className="h-5 w-5 text-cyan-400" />
          VISUAL CAMERA/OCR
        </button>
      </div>

      {/* CORE WORKSPACE PANEL */}
      <div className="bento-card p-6 sm:p-8 border border-slate-800 bg-slate-905/40">
        <form onSubmit={triggerVerify} className="space-y-6">
          
          {/* 1. URL SCRAPER INPUT PANEL */}
          {activeSubTab === 'url' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-500 font-medium uppercase tracking-widest mb-2">
                  Target Article URL
                </label>
                <div className="relative">
                  <span className="source-icon absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Globe className="h-4.5 w-4.5" />
                  </span>
                  <input
                    id="verify-input-url"
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://weeklynews-daily.com/ecological-scares..."
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-sans"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed italic">
                Note: Standard news feeds or metadata points are crawled from this domain, stripping cookies or dynamic javascript traps automatically.
              </p>
            </div>
          )}

          {/* 2. TEXT PASTES INPUT PANEL */}
          {activeSubTab === 'text' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-500 font-medium uppercase tracking-widest mb-2 font-sans">
                  Statement Context
                </label>
                <textarea
                  id="verify-input-text"
                  rows={6}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste doubtful article paragraphs here... (Min 20 characters)"
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500 rounded-2xl px-4 py-3.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                <span>Linguistic tracking metrics enabled</span>
                <span>{textInput.length} characters</span>
              </div>
            </div>
          )}

          {/* 3. FILE UPLOADER PORTAL */}
          {activeSubTab === 'file' && (
            <div className="space-y-4">
              <label className="block text-xs font-mono text-slate-500 font-medium uppercase tracking-widest mb-1 font-sans">
                 briefing files upload (PDF, DOCX, TXT)
              </label>
              
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-600/10' 
                    : file 
                      ? 'border-blue-500/40 bg-blue-600/5' 
                      : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
                }`}
              >
                <input
                  id="file-element-input"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                />
                
                <Upload className="h-10 w-10 text-slate-500 mx-auto mb-4 animate-[bounce_2s_infinite]" />
                <p className="text-sm font-semibold text-slate-200">
                  {file ? `File locked: ${file.name}` : "Drag and drop document here"}
                </p>
                <p className="text-xs text-slate-500 mt-1 mb-4">or browser local files up to 20MB</p>
                
                <button
                  type="button"
                  onClick={() => document.getElementById('file-element-input')?.click()}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
                >
                  Browse Files
                </button>
              </div>

              {extractedDocText && (
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs font-mono max-h-[120px] overflow-y-auto leading-relaxed text-slate-400">
                  <span className="text-[10px] font-bold text-blue-400 block mb-1">Extracted Text Preview:</span>
                  {extractedDocText}
                </div>
              )}
            </div>
          )}

          {/* 4. VISUAL CAMERA/OCR SCANNER */}
          {activeSubTab === 'camera' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                  Live OCR Visual Input
                </span>
                
                {/* Simulated frame generators under sandbox environment */}
                <div className="flex gap-2 text-[11px] items-center">
                  <span className="text-slate-500 font-mono">Sandbox Emulators:</span>
                  <button
                    type="button"
                    onClick={() => triggerSimulatedPhoto('newspaper')}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs cursor-pointer"
                  >
                    Newspaper Grid
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerSimulatedPhoto('social')}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs cursor-pointer"
                  >
                    Feed Screenshot
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerSimulatedPhoto('tv')}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs cursor-pointer"
                  >
                    TV Broadcast
                  </button>
                </div>
              </div>

              {/* CAMERA INTERACTIVE VIEWS */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-950/80 border border-slate-800 h-[320px] flex items-center justify-center">
                {capturedPhoto ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
                    <img
                      src={capturedPhoto}
                      alt="Captured screenshot"
                      className="max-h-full max-w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => { setCapturedPhoto(null); startCamera(); }}
                        className="py-1.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Retake Photo
                      </button>
                    </div>
                  </div>
                ) : cameraActive ? (
                  <div className="absolute inset-0">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    {/* Scanner scanning visual overlay */}
                    <div className="absolute inset-x-0 h-0.5 bg-blue-400 opacity-60 top-[5%] animate-[bounce_3s_infinite]" />
                    
                    <div className="absolute bottom-4 inset-x-0 flex justify-center">
                      <button
                        type="button"
                        onClick={captureSnapshot}
                        className="h-14 w-14 rounded-full border-4 border-slate-100 bg-blue-600 hover:bg-blue-500 hover:scale-105 transition-all shadow-lg flex items-center justify-center"
                      >
                        <div className="h-10 w-10 rounded-full bg-white/20" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <Camera className="h-12 w-12 text-slate-600 mx-auto mb-4 animate-pulse" />
                    <p className="text-sm text-slate-400 mb-4">Camera input deactivated or sandbox security enabled.</p>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-2 mx-auto shadow-md"
                    >
                      <Camera className="h-4 w-4" />
                      Activate Camera Capture
                    </button>
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}

          {/* ACTION BUTTON SUBMISSIONS */}
          <button
            id="verify-btn-execute"
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-500 text-white font-semibold text-sm hover:from-blue-500 hover:to-purple-400 hover:shadow-xl hover:shadow-blue-600/35 transition-all flex items-center justify-center gap-2 cursor-pointer border border-blue-500/20"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-white" />
                Gemini Synthesizing claim vectors...
              </>
            ) : (
              <>
                <Sparkles className="h-4.5 w-4.5 text-cyan-300" />
                Launch TrustGuard Fact-Check
              </>
            )}
          </button>

        </form>
      </div>

    </div>
  );
}
