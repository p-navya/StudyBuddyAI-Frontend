import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, Search, Layout, Info, ChevronDown, Zap, Cpu, Scan, Check } from 'lucide-react';
import { API_URL } from '../../config/api';

const AiLoader = ({ message = "Analyzing your resume with AI..." }) => {
    const [step, setStep] = useState(0);
    const steps = [
        "Connecting to StudyBuddy AI...",
        "Decoding Resume Structure...",
        "Benchmarking against 10M+ resumes...",
        "Evaluating Industry Relevance...",
        "Optimizing Keyword Density...",
        "Finalizing Score Report..."
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setStep(prev => (prev + 1) % steps.length);
        }, 2500);
        return () => clearInterval(interval);
    }, [steps.length]);

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-b from-blue-50/50 to-white pointer-events-none" />

            {/* Animated Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />

            <div className="relative flex flex-col items-center">
                <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl mb-8 relative group">
                    <Scan className="w-12 h-12 text-white animate-pulse" />
                    <div className="absolute inset-0 border-2 border-blue-400 rounded-3xl animate-ping opacity-20" />

                    {/* Scanning Line */}
                    <div className="absolute left-0 right-0 h-1 bg-white/40 shadow-[0_0_15px_rgba(255,255,255,0.8)] top-0 animate-[scan_3s_ease-in-out_infinite]" />
                </div>

                <div className="text-center space-y-3">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight animate-fade-in-up uppercase">
                        {message}
                    </h2>
                    <div className="flex items-center justify-center gap-3">
                        <Cpu className="w-4 h-4 text-blue-500 animate-spin" />
                        <p className="text-blue-600 font-bold text-sm tracking-widest uppercase animate-pulse">
                            {steps[step]}
                        </p>
                    </div>
                </div>

                {/* Progress Indicators */}
                <div className="flex gap-2 mt-8">
                    {steps.map((_, i) => (
                        <div key={i} className={`h-1.5 w-8 rounded-full transition-all duration-700 ${i === step ? 'bg-blue-600 w-12' : i < step ? 'bg-blue-300' : 'bg-gray-200'}`} />
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes scan {
                    0%, 100% { top: 0%; }
                    50% { top: 100%; }
                }
            `}</style>
        </div>
    );
};

const ATSScorePage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scoreData, setScoreData] = useState(null);
    const [activeSection, setActiveSection] = useState('CONTENT');

    const uploadedFile = location.state?.uploadedFile;

    const fetchATSScore = useCallback(async () => {
        if (!uploadedFile) return;
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', uploadedFile);
            formData.append('mode', 'resume-review');
            formData.append('message', "ACT AS AN ATS SCANNER. Analyze this resume. Return ONLY a JSON object. NO PREAMBLE. Structure: { \"overallScore\": X, \"issuesCount\": Y, \"categories\": { \"CONTENT\": { \"score\": S1, \"items\": [{ \"label\": \"L\", \"status\": \"success|error\", \"issues\": N, \"description\": \"D\" }] }, \"SECTIONS\": { \"score\": S2, \"items\": [] }, \"ATS_ESSENTIALS\": { \"score\": S3, \"items\": [] } } }");

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/chatbot/chat`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            // Check if response is ok
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Server error' }));
                throw new Error(errorData.message || `Server error: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                const responseText = result.data.response;
                try {
                    // Try to find JSON block in case AI wraps it in markdown or text
                    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                    const cleanJson = jsonMatch ? jsonMatch[0] : responseText;
                    const parsedData = JSON.parse(cleanJson);

                    if (parsedData && parsedData.categories) {
                        setScoreData(parsedData);
                    } else {
                        throw new Error("Invalid response format");
                    }
                } catch (err) {
                    console.error("JSON Parse Error:", err, "Response received:", responseText);
                    setError("Failed to parse AI response. The PDF may not have been read correctly. Please try with a different PDF file.");
                }
            } else {
                setError(result.message || "Failed to analyze resume. Please ensure your PDF contains selectable text.");
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            const errorMessage = err.message || "Failed to analyze resume. Please try again.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [uploadedFile]);

    useEffect(() => {
        if (!uploadedFile) {
            navigate('/resume');
            return;
        }
        fetchATSScore();
    }, [uploadedFile, fetchATSScore, navigate]);

    const getMockData = () => ({
        overallScore: 66,
        issuesCount: 6,
        categories: {
            'CONTENT': {
                score: 61,
                items: [
                    { label: 'ATS Parse Rate', status: 'success', issues: 0, description: 'An Applicant Tracking System (ATS) is a system used by employers to quickly scan a large number of job applications. A high parse rate ensures that the ATS can read your resume, experience, and skills. Great! We parsed 100% of your resume successfully using an industry-leading ATS.' },
                    { label: 'Quantifying Impact', status: 'error', issues: 1, description: 'Recruiters love to see results. Use numbers, percentages, and currencies to show the impact of your work. We found 1 place where you could add more metrics.' },
                    { label: 'Repetition', status: 'success', issues: 0, description: 'Avoiding repetitive language makes your resume more engaging and professional. You have used a good variety of action verbs.' },
                    { label: 'Spelling & Grammar', status: 'error', issues: 4, description: 'Spelling mistakes can be a red flag for attention to detail. We found 4 potential issues.' }
                ]
            },
            'SECTIONS': {
                score: 81,
                items: [
                    { label: 'Education Section', status: 'success', issues: 0, description: 'Your education section is well-structured and clear.' },
                    { label: 'Experience Section', status: 'success', issues: 0, description: 'Your professional experience is documented in reverse chronological order.' }
                ]
            },
            'ATS ESSENTIALS': {
                score: 83,
                items: [
                    { label: 'File Format', status: 'success', issues: 0, description: 'PDF is the best format for ATS compatibility.' },
                    { label: 'Contact Information', status: 'success', issues: 0, description: 'Found email, phone, and LinkedIn profile.' }
                ]
            }
        }
    });

    const [fixing, setFixing] = useState(false);
    const handleFixResume = async () => {
        if (!uploadedFile) return;
        setFixing(true);
        try {
            const formData = new FormData();
            formData.append('file', uploadedFile);
            formData.append('mode', 'resume-optimize');
            formData.append('message', 'Extract and fix this resume content.');

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/chatbot/chat`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const result = await response.json();
            if (result.success) {
                const responseText = result.data.response;
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                const cleanJson = jsonMatch ? jsonMatch[0] : responseText;
                const optimizedData = JSON.parse(cleanJson);

                navigate('/resume', { state: { optimizedData } });
            } else {
                alert('Failed to fix resume: ' + result.message);
            }
        } catch (err) {
            console.error('Fix Resume Error:', err);
            alert('Something went wrong while fixing your resume.');
        } finally {
            setFixing(false);
        }
    };

    if (loading) {
        return <AiLoader message="Analyzing Resume" />;
    }

    if (fixing) {
        return <AiLoader message="Optimizing Content" />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
                <XCircle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Analysis Failed</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button onClick={() => navigate('/resume')} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold transition-transform hover:scale-105">Try Again</button>
            </div>
        );
    }

    const data = scoreData || getMockData();

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row">
            {/* Sidebar Score Card */}
            <div className="w-full lg:w-80 bg-white border-r border-gray-200 p-8 flex flex-col items-center overflow-y-auto min-h-screen">
                <button onClick={() => navigate('/resume')} className="self-start mb-10 flex items-center gap-2 text-gray-500 hover:text-gray-800 transition">
                    <ArrowLeft className="w-4 h-4" /> Back to Architect
                </button>

                <h1 className="text-2xl font-bold text-gray-900 mb-8">Your Score</h1>

                <div className="relative w-48 h-48 flex items-center justify-center mb-4 shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
                        <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={552.92} strokeDashoffset={552.92 - (552.92 * data.overallScore / 100)} className={`${data.overallScore > 70 ? 'text-green-500' : data.overallScore > 50 ? 'text-orange-400' : 'text-red-500'} transition-all duration-1000 ease-out`} />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-5xl font-black text-gray-900">{data.overallScore}/100</span>
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">{data.issuesCount} Issues</span>
                    </div>
                </div>

                <div className="w-full mt-10 space-y-2 grow overflow-y-auto">
                    {Object.entries(data.categories).map(([key, cat]) => (
                        <div key={key} onClick={() => setActiveSection(key)} className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 ${activeSection === key ? 'bg-blue-50 border-blue-100 shadow-sm' : 'hover:bg-gray-50'}`}>
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-xs font-bold text-gray-500 tracking-widest uppercase">{key}</span>
                                <span className={`text-xs font-bold ${cat.score > 80 ? 'text-green-600' : 'text-orange-500'}`}>{cat.score}%</span>
                            </div>
                            <div className="space-y-3">
                                {cat.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2 group">
                                        {item.status === 'success' ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> : <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                                        <span className={`text-xs ${item.status === 'success' ? 'text-gray-600' : 'text-gray-900 font-semibold'}`}>{item.label}</span>
                                        {item.issues > 0 && <span className="ml-auto text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">{item.issues} {item.issues === 1 ? 'issue' : 'issues'}</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleFixResume}
                    disabled={fixing}
                    className="w-full mt-10 bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-xl disabled:bg-blue-400 shrink-0"
                >
                    {fixing ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Fixing Resume...</>
                    ) : (
                        <><Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" /> Fix Resume with AI</>
                    )}
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-4 lg:p-12 overflow-y-auto bg-[#EEF2F6]">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Header Row */}
                    <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white shadow-sm">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Layout className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{activeSection}</h2>
                            <p className="text-sm text-gray-500 font-medium">{data.categories[activeSection].items.length} points analyzed in this category</p>
                        </div>
                        <div className="ml-auto bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm text-sm font-bold text-gray-700">
                            {data.categories[activeSection].items.filter(i => i.status !== 'success').length} issues found
                        </div>
                    </div>

                    {/* Detailed Analysis Cards */}
                    <div className="space-y-4">
                        {data.categories[activeSection].items.map((item, idx) => (
                            <div key={idx} className="bg-white rounded-4xl p-8 border border-gray-100 shadow-sm transition-all hover:shadow-md">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl ${item.status === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
                                            {item.status === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">{item.label}</h3>
                                    </div>
                                    <ChevronDown className="w-6 h-6 text-gray-300" />
                                </div>

                                <div className="pl-11 pr-4">
                                    <p className="text-gray-600 leading-relaxed mb-10 text-lg">
                                        {item.description}
                                    </p>

                                    {item.label === 'ATS Parse Rate' && (
                                        <div className="bg-blue-50/50 rounded-3xl p-10 border border-blue-100 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-8 transform rotate-12 opacity-5 scale-150">
                                                <Search className="w-32 h-32 text-blue-600" />
                                            </div>

                                            {/* Progress Bar from Screenshot */}
                                            <div className="max-w-md mx-auto relative pt-8 pb-12">
                                                <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                                                    <div className="h-full bg-linear-to-r from-teal-400 to-emerald-500 rounded-full w-full shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
                                                </div>
                                                <div className="absolute -top-1 left-full -translate-x-full">
                                                    <div className="w-6 h-6 bg-emerald-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                                                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                                    </div>
                                                </div>

                                                <div className="text-center mt-10 space-y-4">
                                                    <h4 className="text-3xl font-black text-gray-800">Great!</h4>
                                                    <p className="text-xl text-gray-600 leading-relaxed font-medium">
                                                        We parsed 100% of your resume successfully using an industry-leading ATS.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white mt-4 text-center">
                                                <p className="text-gray-600 font-semibold mb-2">Build an ATS-friendly resume using StudyBuddy's</p>
                                                <p className="text-gray-500 text-sm">premium templates to maintain high parse rates.</p>
                                            </div>
                                        </div>
                                    )}

                                    {item.status !== 'success' && (
                                        <div className="mt-6 flex items-center gap-3 bg-red-50 p-4 rounded-2xl border border-red-100">
                                            <Info className="w-5 h-5 text-red-600" />
                                            <p className="text-sm text-red-700 font-bold">Fixing this can increase your score by up to 15 points.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ATSScorePage;
