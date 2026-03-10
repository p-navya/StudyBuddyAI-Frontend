import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FileText, Download, ArrowLeft, Sparkles, Check, Briefcase, GraduationCap, User, Mail, Link as LinkIcon, Github, Linkedin, Plus, Trash2, Upload, Cpu, Scan } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { apiRequest } from '../../config/api';

const AiLoader = ({ message = "Optimizing your resume..." }) => {
    const [step, setStep] = useState(0);
    const steps = [
        "Connecting to StudyBuddy AI...",
        "Rewriting Content for Impact...",
        "Optimizing for ATS Scanners...",
        "Applying Professional Formatting...",
        "Finalizing Document..."
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setStep(prev => (prev + 1) % steps.length);
        }, 2000);
        return () => clearInterval(interval);
    }, [steps.length]);

    return (
        <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center p-6">
            <div className="relative flex flex-col items-center">
                <div className="w-20 h-20 bg-teal-600 rounded-2xl flex items-center justify-center shadow-2xl mb-6 relative">
                    <Scan className="w-10 h-10 text-white animate-pulse" />
                    <div className="absolute left-0 right-0 h-0.5 bg-white/60 top-0 animate-[scan_2s_ease-in-out_infinite]" />
                </div>
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">{message}</h2>
                <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-teal-600 animate-spin" />
                    <p className="text-teal-700 font-bold text-xs tracking-widest uppercase">{steps[step]}</p>
                </div>
            </div>
            <style>{`@keyframes scan { 0%, 100% { top: 0%; } 50% { top: 100%; } }`}</style>
        </div>
    );
};

const ResumePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const resumeRef = useRef();
    const fileInputReviewRef = useRef(null); // Added for AI review file input
    const [step, setStep] = useState('selection'); // selection, form, preview
    const [isGenerating, setIsGenerating] = useState(false);

    const [selectedTemplate, setSelectedTemplate] = useState('traditional');
    const [formData, setFormData] = useState({
        fullName: 'NAVYA PACHIGOLLA',
        title: 'AIML ENGINEER | FULL STACK WEB DEVELOPER',
        email: 'navyadhritii@gmail.com',
        phone: '+91 934XXXXXX',
        address: 'Hyderabad, India',
        profilePic: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&h=200&auto=format&fit=crop',
        linkedin: 'linkedin.com/in/p-navyaa',
        portfolio: 'navya-portfolio-eta.vercel.app/',
        github: 'github.com/p-navya',
        summary: 'B. Tech student in CSE specializing in Artificial Intelligence and Machine Learning at Malla Reddy University. Interned at Arthicus as an AI/ML Tool Engineer, working on UI/UX designs, websites, and automation tools. Skilled in Python, Full-stack Development and AI tools with a passion for building impactful solutions and solving real-world problems through innovation and technology.',
        skills: {
            languages: 'Python, Java',
            backend: 'Node.js, Flask',
            databases: 'MySQL/SQLite/Workbench, MongoDB, Firebase',
            deployment: 'Vercel, Git',
            frontend: 'HTML, CSS/Tailwind CSS/ShadCN, JavaScript, React.js/Vite',
            ai: 'Artificial Intelligence, Machine Learning',
            design: 'Canva, Figma'
        },
        experience: [
            {
                role: 'AI/ML Intern',
                company: 'Arthicus Global Pvt. Ltd.',
                location: 'Hyderabad, India',
                period: 'October 2024 – Present',
                highlights: [
                    'Developed AI-driven tools including an AI Warehouse Assistant, Ticketing System, and CRM Portal; revamped the company website for better performance and user experience.',
                    'Represented the company at HYSEA, showcasing projects and networking with tech professionals.'
                ]
            }
        ],
        projects: [
            {
                name: 'AI WAREHOUSE ASSISTANT (ARTI BOT)',
                description: 'An intelligent assistant for warehouse management, leveraging AI to optimize inventory tracking, automate stock updates, and provide actionable insights for efficient operations.'
            },
            {
                name: 'TICKETING TOOL',
                description: 'A smart support system that lets clients raise tickets, enabling the support team to manage and resolve issues efficiently post-deployment.'
            }
        ],
        education: [
            {
                degree: 'B. Tech in Computer Science and Engineering (AI ML)',
                university: 'Malla Reddy University, Hyderabad, India',
                period: '2022 – 2026',
                cgpa: '9.0'
            }
        ],
        achievements: [
            'Winner of Case Presentation 2025.',
            'Salesforce Ranger (2024) certification.',
            'NPTEL Certified in Java Programming & Deep Learning (2023).'
        ],
        references: [
            { name: 'Dr. Ramesh Kumar', company: 'Malla Reddy University', role: 'HOD CSE', phone: '+91 98XXX XXXXX', email: 'hod@mallareddy.edu' }
        ]
    });

    // Handle optimized data from ATS Score Page
    useEffect(() => {
        if (location.state?.optimizedData) {
            setFormData(prev => ({
                ...prev,
                ...location.state.optimizedData,
                // Ensure skills is structured correctly if it comes as a string from AI
                skills: typeof location.state.optimizedData.skills === 'object'
                    ? location.state.optimizedData.skills
                    : prev.skills
            }));
            setStep('form');
            // Clear the state so it doesn't reset on every render
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const handleFieldChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSkillChange = (skillKey, value) => {
        setFormData(prev => ({
            ...prev,
            skills: { ...prev.skills, [skillKey]: value }
        }));
    };

    const addExperience = () => {
        setFormData(prev => ({
            ...prev,
            experience: [...prev.experience, {
                role: '',
                company: '',
                location: '',
                period: '',
                highlights: ['']
            }]
        }));
    };

    const removeExperience = (index) => {
        setFormData(prev => ({
            ...prev,
            experience: prev.experience.filter((_, i) => i !== index)
        }));
    };

    const addEducation = () => {
        setFormData(prev => ({
            ...prev,
            education: [...prev.education, {
                degree: '',
                university: '',
                period: '',
                cgpa: ''
            }]
        }));
    };

    const removeEducation = (index) => {
        setFormData(prev => ({
            ...prev,
            education: prev.education.filter((_, i) => i !== index)
        }));
    };

    const addAchievement = () => {
        setFormData(prev => ({
            ...prev,
            achievements: [...prev.achievements, '']
        }));
    };

    const removeAchievement = (index) => {
        setFormData(prev => ({
            ...prev,
            achievements: prev.achievements.filter((_, i) => i !== index)
        }));
    };

    const removeHighlight = (expIdx, hIdx) => {
        setFormData(prev => {
            const newExperience = [...prev.experience];
            newExperience[expIdx].highlights = newExperience[expIdx].highlights.filter((_, i) => i !== hIdx);
            return { ...prev, experience: newExperience };
        });
    };

    const addProject = () => {
        setFormData(prev => ({
            ...prev,
            projects: [...prev.projects, { name: '', description: '' }]
        }));
    };

    const removeProject = (index) => {
        setFormData(prev => ({
            ...prev,
            projects: prev.projects.filter((_, i) => i !== index)
        }));
    };

    const removeSkill = (skillKey) => {
        setFormData(prev => {
            const newSkills = { ...prev.skills };
            delete newSkills[skillKey];
            return { ...prev, skills: newSkills };
        });
    };

    const addSkill = () => {
        const category = prompt("Enter skill category name (e.g. Tools, Soft Skills):");
        if (category && category.trim()) {
            setFormData(prev => ({
                ...prev,
                skills: { ...prev.skills, [category.trim()]: '' }
            }));
        }
    };

    const addReference = () => {
        setFormData(prev => ({
            ...prev,
            references: [...prev.references, { name: '', company: '', role: '', phone: '', email: '' }]
        }));
    };

    const removeReference = (idx) => {
        setFormData(prev => ({
            ...prev,
            references: prev.references.filter((_, i) => i !== idx)
        }));
    };

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, profilePic: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const generatePDF = async () => {
        setIsGenerating(true);
        const element = resumeRef.current;

        // Validate element exists
        if (!element) {
            alert('Resume preview not found. Please ensure you are on the preview page.');
            setIsGenerating(false);
            return;
        }

        // Store original styles for restoration
        const originalDisplay = element.style.display || '';
        const originalVisibility = element.style.visibility || '';

        try {
            // Wait a bit to ensure all images and fonts are loaded
            await new Promise(resolve => setTimeout(resolve, 500));

            // Preload images to avoid CORS issues
            const images = element.querySelectorAll('img');
            await Promise.all(Array.from(images).map(img => {
                return new Promise((resolve) => {
                    if (img.complete) {
                        resolve();
                    } else {
                        img.onload = resolve;
                        img.onerror = () => {
                            // If image fails to load, replace with placeholder or continue
                            console.warn('Image failed to load:', img.src);
                            resolve();
                        };
                        // Timeout after 3 seconds
                        setTimeout(resolve, 3000);
                    }
                });
            }));

            // Force a reflow to ensure all styles are computed (important for production builds)
            element.offsetHeight; // Trigger reflow
            
            // Explicitly set blue separator lines with inline styles to ensure they render in production
            const blueLines = element.querySelectorAll('.bg-blue-800, [class*="bg-blue-800"]');
            blueLines.forEach((line) => {
                line.style.backgroundColor = 'rgb(30, 64, 175)';
                line.style.height = '1px';
                line.style.width = '100%';
                line.style.display = 'block';
            });

            // Convert computed styles to RGB to avoid oklch parsing
            // Process elements and convert any oklch colors to RGB inline styles
            const allElements = element.querySelectorAll('*');
            const styleBackups = new Map();
            allElements.forEach((el) => {
                try {
                    const computedStyle = window.getComputedStyle(el);
                    const colorProps = [
                        { css: 'color', js: 'color' },
                        { css: 'background-color', js: 'backgroundColor' },
                        { css: 'border-color', js: 'borderColor' },
                        { css: 'border-top-color', js: 'borderTopColor' },
                        { css: 'border-right-color', js: 'borderRightColor' },
                        { css: 'border-bottom-color', js: 'borderBottomColor' },
                        { css: 'border-left-color', js: 'borderLeftColor' }
                    ];
                    
                    colorProps.forEach(({ css, js }) => {
                        const value = computedStyle.getPropertyValue(css);
                        if (value && (value.toLowerCase().includes('oklch'))) {
                            // Skip blue separator lines - preserve them!
                            const isBlueLine = el.classList.contains('bg-blue-800') || 
                                             el.classList.toString().includes('bg-blue');
                            if (isBlueLine && css === 'background-color') {
                                // Ensure blue lines are explicitly set
                                el.style.backgroundColor = 'rgb(30, 64, 175)';
                                return; // Don't override blue lines
                            }
                            
                            // Store original if not already stored
                            if (!styleBackups.has(el)) {
                                styleBackups.set(el, {});
                            }
                            if (!styleBackups.get(el)[js]) {
                                styleBackups.get(el)[js] = el.style[js] || '';
                            }
                            
                            // Convert to RGB based on property type
                            if (css === 'background-color') {
                                el.style.backgroundColor = 'rgb(255, 255, 255)';
                            } else if (css === 'color') {
                                el.style.color = 'rgb(0, 0, 0)';
                            } else {
                                el.style[js] = 'rgb(229, 231, 235)';
                            }
                        }
                    });
                } catch {
                    // Ignore errors
                }
            });

            // Inject a global style override as additional protection
            const overrideStyleId = 'pdf-oklch-override-temp';
            let overrideStyleElement = document.getElementById(overrideStyleId);
            if (!overrideStyleElement) {
                overrideStyleElement = document.createElement('style');
                overrideStyleElement.id = overrideStyleId;
                overrideStyleElement.innerHTML = `
                    /* Override oklch colors but preserve important elements */
                    #resume-document {
                        background-color: rgb(255, 255, 255) !important;
                        color: rgb(0, 0, 0) !important;
                    }
                    #resume-document a {
                        color: rgb(30, 64, 175) !important;
                    }
                    /* Preserve blue separator lines - these are important! */
                    #resume-document .bg-blue-800,
                    #resume-document [class*="bg-blue-800"],
                    #resume-document div[class*="bg-blue"],
                    #resume-document div.bg-blue-800 {
                        background-color: rgb(30, 64, 175) !important;
                        height: 1px !important;
                        width: 100% !important;
                        display: block !important;
                    }
                `;
                document.head.insertBefore(overrideStyleElement, document.head.firstChild);
            }
            
            // Wait longer in production for styles to fully apply and force another reflow
            await new Promise(resolve => setTimeout(resolve, 200));
            element.offsetHeight; // Force another reflow after styles are injected

            // Ensure element is visible and properly sized before capture
            // Force the element to be visible and ensure it's rendered at full size
            element.style.display = 'block';
            element.style.visibility = 'visible';
            
            // Wait for layout to settle
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const elementRect = element.getBoundingClientRect();
            // Use the actual rendered size, but ensure we capture the full width
            // The element should be 210mm = ~794px at 96 DPI
            const elementWidth = element.scrollWidth || elementRect.width || 794;
            const elementHeight = element.scrollHeight || elementRect.height;
            
            // At 96 DPI: 210mm = 794px, so at scale 2 it should be ~1588px
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: false,
                logging: false,
                backgroundColor: '#ffffff',
                width: elementWidth,
                height: elementHeight,
                windowWidth: elementWidth,
                windowHeight: elementHeight,
                x: 0,
                y: 0,
                scrollX: 0,
                scrollY: 0,
                foreignObjectRendering: false, // Disable to avoid parsing issues with modern CSS
                onclone: (clonedDoc) => {
                    // Function to replace oklch colors with RGB equivalents
                    const replaceOklch = (text) => {
                        if (!text || typeof text !== 'string') return text;
                        // More comprehensive regex that handles nested parentheses and various formats
                        // Match oklch( with any content inside, handling nested parentheses
                        let result = text;
                        let changed = true;
                        let iterations = 0;
                        const maxIterations = 10; // Prevent infinite loops
                        
                        while (changed && iterations < maxIterations) {
                            const before = result;
                            // Match oklch( followed by content that may include nested parentheses
                            result = result.replace(/oklch\s*\([^()]*(?:\([^()]*\)[^()]*)*\)/gi, () => {
                                return 'rgb(107, 114, 128)'; // Safe fallback color
                            });
                            changed = (before !== result);
                            iterations++;
                        }
                        
                        // Also handle any remaining oklch references with a simpler pattern
                        result = result.replace(/oklch[^;)]*/gi, 'rgb(107, 114, 128)');
                        
                        return result;
                    };

                    // Remove all external stylesheet links that might contain oklch
                    const linkTags = clonedDoc.querySelectorAll('link[rel="stylesheet"]');
                    linkTags.forEach(link => {
                        try {
                            link.remove();
                        } catch {
                            // Ignore removal errors
                        }
                    });

                    // Inject a high-compatibility PDF stylesheet
                    const style = clonedDoc.createElement('style');
                    style.innerHTML = `
                        /* Force standard color space for PDF renderer */
                        #resume-document, #resume-document * { 
                            color-scheme: light !important; 
                            -webkit-print-color-adjust: exact !important;
                            color-adjust: exact !important;
                            print-color-adjust: exact !important;
                            font-display: block !important;
                        }
                        /* Preserve blue separator lines */
                        #resume-document .bg-blue-800,
                        #resume-document [class*="bg-blue-800"] {
                            background-color: rgb(30, 64, 175) !important;
                            -webkit-print-color-adjust: exact !important;
                            color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                    `;
                    clonedDoc.head.appendChild(style);

                    // Process all stylesheets in the cloned document - remove rules with oklch
                    try {
                        const clonedStyleSheets = Array.from(clonedDoc.styleSheets || []);
                        clonedStyleSheets.forEach((sheet) => {
                            try {
                                const rules = Array.from(sheet.cssRules || []);
                                // Process rules in reverse to safely remove them
                                for (let i = rules.length - 1; i >= 0; i--) {
                                    const rule = rules[i];
                                    try {
                                        const cssText = rule.cssText || '';
                                        if (cssText.includes('oklch') || cssText.includes('OKLCH')) {
                                            // Try to remove the rule
                                            try {
                                                sheet.deleteRule(i);
                                            } catch {
                                                // If we can't delete, try to modify it
                                                if (rule.style) {
                                                    const styleProps = ['color', 'background-color', 'border-color', 
                                                                       'border-top-color', 'border-right-color', 
                                                                       'border-bottom-color', 'border-left-color',
                                                                       'outline-color', 'text-decoration-color'];
                                                    styleProps.forEach(prop => {
                                                        try {
                                                            const value = rule.style.getPropertyValue(prop);
                                                            if (value && (value.includes('oklch') || value.includes('OKLCH'))) {
                                                                rule.style.removeProperty(prop);
                                                            }
                                                        } catch {
                                                            // Ignore property access errors
                                                        }
                                                    });
                                                }
                                            }
                                        } else if (rule.style) {
                                            // Check and replace oklch in individual style properties
                                            const styleProps = ['color', 'background-color', 'border-color', 
                                                               'border-top-color', 'border-right-color', 
                                                               'border-bottom-color', 'border-left-color'];
                                            styleProps.forEach(prop => {
                                                try {
                                                    const value = rule.style.getPropertyValue(prop);
                                                    if (value && (value.includes('oklch') || value.includes('OKLCH'))) {
                                                        rule.style.setProperty(prop, 'rgb(107, 114, 128)', 'important');
                                                    }
                                                } catch {
                                                    // Ignore property access errors
                                                }
                                            });
                                        }
                                    } catch {
                                        // Ignore rule processing errors
                                    }
                                }
                            } catch {
                                // Ignore stylesheet access errors (cross-origin, etc.)
                            }
                        });
                    } catch {
                        // Ignore if styleSheets can't be accessed
                    }

                    // Aggressive cleanup of modern CSS functions that crash html2canvas
                    const styles = clonedDoc.getElementsByTagName('style');
                    for (let i = 0; i < styles.length; i++) {
                        try {
                            let content = styles[i].innerHTML || styles[i].textContent || '';
                            if (content.includes('oklch') || content.includes('OKLCH')) {
                                content = replaceOklch(content);
                                // Also remove other modern color functions
                                content = content.replace(/color-mix\([^)]+\)/gi, 'rgb(107, 114, 128)');
                                content = content.replace(/lab\([^)]+\)/gi, 'rgb(107, 114, 128)');
                                content = content.replace(/lch\([^)]+\)/gi, 'rgb(107, 114, 128)');
                                styles[i].innerHTML = content;
                            }
                        } catch {
                            // If style is corrupting, try to clear it
                            try {
                                styles[i].innerHTML = '';
                            } catch {
                                // If we can't clear it, remove the style tag
                                styles[i].parentNode?.removeChild(styles[i]);
                            }
                        }
                    }

                    // Strip oklch from inline styles and computed styles
                    const allElements = clonedDoc.querySelectorAll('*');
                    allElements.forEach(el => {
                        try {
                            // Handle inline style attribute
                            const styleAttr = el.getAttribute('style');
                            if (styleAttr && (styleAttr.includes('oklch') || styleAttr.includes('OKLCH'))) {
                                let newStyle = replaceOklch(styleAttr);
                                // Remove any remaining oklch references
                                newStyle = newStyle.replace(/oklch\([^)]+\)/gi, 'rgb(107, 114, 128)');
                                el.setAttribute('style', newStyle);
                            }

                            // Handle computed styles that might have oklch
                            try {
                                const computedStyle = clonedDoc.defaultView?.getComputedStyle(el);
                                if (computedStyle) {
                                    const colorProps = ['color', 'backgroundColor', 'borderColor', 'borderTopColor', 
                                                      'borderRightColor', 'borderBottomColor', 'borderLeftColor',
                                                      'outlineColor', 'textDecorationColor'];
                                    colorProps.forEach(prop => {
                                        const value = computedStyle.getPropertyValue(prop);
                                        if (value && (value.includes('oklch') || value.includes('OKLCH'))) {
                                            // Skip blue separator lines - preserve them!
                                            const isBlueLine = el.classList.contains('bg-blue-800') || 
                                                             el.classList.toString().includes('bg-blue');
                                            if (isBlueLine && prop === 'backgroundColor') {
                                                el.style.setProperty('backgroundColor', 'rgb(30, 64, 175)', 'important');
                                                return;
                                            }
                                            el.style.setProperty(prop, 'rgb(107, 114, 128)', 'important');
                                        }
                                    });
                                }
                            } catch {
                                // Ignore computed style errors
                            }
                        } catch {
                            // Continue if element can't be processed
                        }
                    });

                    // Ensure all images have proper loading
                    clonedDoc.querySelectorAll('img').forEach(img => {
                        if (!img.complete || img.naturalWidth === 0) {
                            // Replace broken images with a placeholder or remove
                            img.style.display = 'none';
                        }
                    });

                    // Explicitly set blue separator lines in cloned document (critical for production)
                    const clonedBlueLines = clonedDoc.querySelectorAll('.bg-blue-800, [class*="bg-blue-800"], div[class*="bg-blue"]');
                    clonedBlueLines.forEach((line) => {
                        line.style.backgroundColor = 'rgb(30, 64, 175)';
                        line.style.height = '1px';
                        line.style.width = '100%';
                        line.style.display = 'block';
                        line.style.marginBottom = '8px';
                    });
                }
            });

            // Validate canvas was created successfully
            if (!canvas || canvas.width === 0 || canvas.height === 0) {
                throw new Error('Failed to capture resume content. Canvas is empty.');
            }

            const imgData = canvas.toDataURL('image/png', 1.0);
            
            // Validate image data
            if (!imgData || imgData === 'data:,') {
                throw new Error('Failed to convert canvas to image data.');
            }

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true
            });

            const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
            const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            
            // Add safe print margins around the page so text is never flush
            // with the physical edge (some printers/viewers clip at 0mm).
            const marginLeft = 10; // mm
            const marginRight = 10; // mm
            const marginTop = 10; // mm
            const usableWidth = pdfWidth - marginLeft - marginRight;

            // Calculate mm per pixel based on the usable content width instead of full page width.
            const mmPerPixel = usableWidth / imgWidth;
            const imgHeightMm = imgHeight * mmPerPixel;
            
            // Scale to fit within the usable width while maintaining aspect ratio.
            const scaledWidth = usableWidth;
            const scaledHeight = imgHeightMm;
            
            // Debug logging (remove in production if needed)
            console.log('PDF Generation:', {
                elementWidth: elementWidth,
                elementHeight: elementHeight,
                canvasWidth: imgWidth,
                canvasHeight: imgHeight,
                pdfWidth: pdfWidth,
                scaledWidth: scaledWidth,
                scaledHeight: scaledHeight
            });

            // Build a text-only representation of the resume so the exported PDF
            // still contains selectable text for ATS/parsing, even though the visual
            // layout is rendered as an image.
            try {
                const lines = [];
                if (formData.fullName) lines.push(formData.fullName);
                if (formData.title) lines.push(formData.title);
                lines.push('');

                const contactParts = [];
                if (formData.email) contactParts.push(`Email: ${formData.email}`);
                if (formData.phone) contactParts.push(`Phone: ${formData.phone}`);
                if (formData.address) contactParts.push(`Location: ${formData.address}`);
                if (formData.linkedin) contactParts.push(`LinkedIn: ${formData.linkedin}`);
                if (formData.github) contactParts.push(`GitHub: ${formData.github}`);
                if (formData.portfolio) contactParts.push(`Portfolio: ${formData.portfolio}`);
                if (contactParts.length) {
                    lines.push(contactParts.join(' | '));
                    lines.push('');
                }

                if (formData.summary) {
                    lines.push('Summary');
                    lines.push(formData.summary);
                    lines.push('');
                }

                if (formData.skills && typeof formData.skills === 'object') {
                    lines.push('Skills');
                    Object.entries(formData.skills).forEach(([key, value]) => {
                        if (value) {
                            lines.push(`${key}: ${value}`);
                        }
                    });
                    lines.push('');
                }

                if (Array.isArray(formData.experience) && formData.experience.length) {
                    lines.push('Experience');
                    formData.experience.forEach(exp => {
                        const headerParts = [];
                        if (exp.role) headerParts.push(exp.role);
                        if (exp.company) headerParts.push(exp.company);
                        if (exp.location) headerParts.push(exp.location);
                        if (exp.period) headerParts.push(exp.period);
                        if (headerParts.length) lines.push(headerParts.join(' | '));
                        if (Array.isArray(exp.highlights)) {
                            exp.highlights
                                .filter(Boolean)
                                .forEach(h => lines.push(`- ${h}`));
                        }
                        lines.push('');
                    });
                }

                if (Array.isArray(formData.projects) && formData.projects.length) {
                    lines.push('Projects');
                    formData.projects.forEach(proj => {
                        if (!proj) return;
                        const nameLine = proj.name ? proj.name : '';
                        const descLine = proj.description ? proj.description : '';
                        if (nameLine) lines.push(nameLine);
                        if (descLine) lines.push(`- ${descLine}`);
                        if (nameLine || descLine) lines.push('');
                    });
                }

                if (Array.isArray(formData.education) && formData.education.length) {
                    lines.push('Education');
                    formData.education.forEach(ed => {
                        const headerParts = [];
                        if (ed.degree) headerParts.push(ed.degree);
                        if (ed.university) headerParts.push(ed.university);
                        if (ed.period) headerParts.push(ed.period);
                        if (ed.cgpa) headerParts.push(`CGPA: ${ed.cgpa}`);
                        if (headerParts.length) lines.push(headerParts.join(' | '));
                    });
                    lines.push('');
                }

                if (Array.isArray(formData.achievements) && formData.achievements.length) {
                    lines.push('Achievements');
                    formData.achievements
                        .filter(Boolean)
                        .forEach(a => lines.push(`- ${a}`));
                    lines.push('');
                }

                if (Array.isArray(formData.references) && formData.references.length) {
                    lines.push('References');
                    formData.references.forEach(ref => {
                        if (!ref) return;
                        const parts = [];
                        if (ref.name) parts.push(ref.name);
                        if (ref.role) parts.push(ref.role);
                        if (ref.company) parts.push(ref.company);
                        if (ref.phone) parts.push(`Phone: ${ref.phone}`);
                        if (ref.email) parts.push(`Email: ${ref.email}`);
                        if (parts.length) lines.push(parts.join(' | '));
                    });
                }

                const plainText = lines.join('\n');
                if (plainText.trim().length > 0) {
                    pdf.setFontSize(10);
                    pdf.setTextColor(0, 0, 0);
                    // Draw the text first so it sits "under" the image visually,
                    // but remains extractable in the PDF content stream.
                    pdf.text(plainText, marginLeft, marginTop, {
                        maxWidth: usableWidth
                    });
                }
            } catch (textError) {
                console.warn('Failed to embed text layer for PDF:', textError);
            }

            // Only split into multiple pages if content is significantly taller than one page
            // Use a larger buffer to avoid unnecessary page breaks for single-page resumes
            if (scaledHeight > pdfHeight + 10) {
                const totalPages = Math.ceil(scaledHeight / pdfHeight);
                
                for (let i = 0; i < totalPages; i++) {
                    if (i > 0) {
                        pdf.addPage();
                    }
                    
                    // Calculate which portion of the image to show on this page
                    const pageStartY = (i * pdfHeight) / mmPerPixel;
                    const pageEndY = Math.min((i + 1) * pdfHeight / mmPerPixel, imgHeight);
                    const pageHeightPx = pageEndY - pageStartY;
                    
                    // Create a temporary canvas for this page slice
                    const pageCanvas = document.createElement('canvas');
                    pageCanvas.width = imgWidth;
                    pageCanvas.height = Math.ceil(pageHeightPx);
                    const ctx = pageCanvas.getContext('2d');
                    
                    // Draw the portion of the image for this page
                    ctx.drawImage(
                        canvas,
                        0, Math.floor(pageStartY), // Source x, y
                        imgWidth, pageHeightPx, // Source width, height
                        0, 0, // Destination x, y
                        imgWidth, pageHeightPx // Destination width, height
                    );
                    
                    const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
                    const pageHeightMm = pageHeightPx * mmPerPixel;
                    
                    // Add image for this page at exact position (0,0) to preserve alignment
                pdf.addImage(
                        pageImgData,
                        'PNG',
                        marginLeft,
                        marginTop,
                        scaledWidth,
                        Math.min(pageHeightMm, pdfHeight - marginTop)
                    );
                }
            } else {
                // Single page - add image with left/top margins to prevent clipping on printers/PDF viewers
                pdf.addImage(imgData, 'PNG', marginLeft, marginTop, scaledWidth, Math.min(scaledHeight, pdfHeight - marginTop));
            }

            // Restore original element styles
            element.style.display = originalDisplay;
            element.style.visibility = originalVisibility;

            const fileName = formData.fullName ? `${formData.fullName.replace(/\s+/g, '_')}_Resume.pdf` : 'Resume.pdf';
            pdf.save(fileName);
        } catch (error) {
            console.error('PDF Generation Error:', error);
            const errorMessage = error.message || 'Unknown error occurred';
            alert(`Failed to generate PDF: ${errorMessage}. Please try again or use a different template.`);
        } finally {
            // Restore element styles in case of error
            if (element) {
                element.style.display = originalDisplay || '';
                element.style.visibility = originalVisibility || '';
            }
            // Remove the override style element
            const overrideStyleElement = document.getElementById('pdf-oklch-override-temp');
            if (overrideStyleElement) {
                overrideStyleElement.remove();
            }
            setIsGenerating(false);
        }
    };

    const polishField = async (field, currentValue, context = '') => {
        if (!currentValue) return;
        setIsGenerating(true);
        try {
            const prompt = `I am building my resume for a ${formData.title} role. 
            Please professionalize and polish the following ${field} text. 
            Keep it concise, high-impact, and use professional action verbs. 
            Only return the polished text itself, nothing else.
            
            Current ${field}: "${currentValue}"
            ${context ? `Context: ${context}` : ''}`;

            const data = await apiRequest('/chatbot/chat', {
                method: 'POST',
                body: JSON.stringify({
                    message: prompt,
                    mode: 'resume-builder'
                })
            });

            if (data.success) {
                const cleanedResponse = data.data.response.replace(/^["']|["']$/g, '').trim();
                handleFieldChange(field, cleanedResponse);
            }
        } catch (error) {
            console.error('AI Polish error:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const polishExperience = async (index) => {
        const exp = formData.experience[index];
        if (!exp.highlights.some(h => h.trim())) return;

        setIsGenerating(true);
        try {
            const prompt = `Rewrite these experience highlights for an ${exp.role} role to be high-impact/ATS-friendly. Return as bullet points starting with "-".
            
            Highlights:
            ${exp.highlights.join('\n')}`;

            const data = await apiRequest('/chatbot/chat', {
                method: 'POST',
                body: JSON.stringify({
                    message: prompt,
                    mode: 'resume-builder'
                })
            });

            if (data.success) {
                const newHighlights = data.data.response
                    .split('\n')
                    .map(line => line.replace(/^-\s*/, '').trim())
                    .filter(line => line.length > 0);

                const newExperience = [...formData.experience];
                newExperience[index].highlights = newHighlights;
                setFormData(prev => ({ ...prev, experience: newExperience }));
            }
        } catch (error) {
            console.error('AI Polish error:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const polishProject = async (index) => {
        const proj = formData.projects[index];
        if (!proj.description.trim()) return;
        setIsGenerating(true);
        try {
            const data = await apiRequest('/chatbot/chat', {
                method: 'POST',
                body: JSON.stringify({
                    message: `Rewrite this project description for "${proj.name}" to be impressive and technical. Keep it to 1-2 powerful sentences. Only return the polished text. \n\n Current: ${proj.description}`,
                    mode: 'resume-builder'
                })
            });
            if (data.success) {
                const newProjects = [...formData.projects];
                newProjects[index].description = data.data.response.trim();
                setFormData(prev => ({ ...prev, projects: newProjects }));
            }
        } catch (error) { console.error('AI Polish error:', error); }
        finally { setIsGenerating(false); }
    };

    const polishAchievement = async (index) => {
        const ach = formData.achievements[index];
        if (!ach.trim()) return;
        setIsGenerating(true);
        try {
            const data = await apiRequest('/chatbot/chat', {
                method: 'POST',
                body: JSON.stringify({
                    message: `Professionalize this achievement/certification to be high-impact. Keep it concise. Only return the polished text. \n\n Current: ${ach}`,
                    mode: 'resume-builder'
                })
            });
            if (data.success) {
                const newAch = [...formData.achievements];
                newAch[index] = data.data.response.trim();
                setFormData(prev => ({ ...prev, achievements: newAch }));
            }
        } catch (error) { console.error('AI Polish error:', error); }
        finally { setIsGenerating(false); }
    };

    const polishSkills = async (key) => {
        const skills = formData.skills[key];
        if (!skills.trim()) return;
        setIsGenerating(true);
        try {
            const data = await apiRequest('/chatbot/chat', {
                method: 'POST',
                body: JSON.stringify({
                    message: `Standardize and clean up these tech skills for the category "${key}". Return as a clean, properly capitalized comma-separated list. Only return the list. \n\n Skills: ${skills}`,
                    mode: 'resume-builder'
                })
            });
            if (data.success) {
                handleSkillChange(key, data.data.response.trim());
            }
        } catch (error) { console.error('AI Polish error:', error); }
        finally { setIsGenerating(false); }
    };

    const handleReviewFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check if it's a PDF file (support multiple checks)
            const isPDF = file.type === 'application/pdf' || 
                        file.type === 'application/x-pdf' ||
                        file.name.toLowerCase().endsWith('.pdf');
            
            if (!isPDF) {
                alert('Please upload a PDF file (.pdf extension required)');
                return;
            }
            
            // Check file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size exceeds 5MB limit. Please upload a smaller PDF file.');
                return;
            }
            
            navigate('/ats-score', {
                state: {
                    uploadedFile: file
                }
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-800 dark:text-gray-200 font-sans transition-all duration-500 relative">
            {isGenerating && step !== 'preview' && <AiLoader message={step === 'form' ? "Optimizing Section" : "AI is working..."} />}
            <header className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border-b border-white/20 dark:border-white/5 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => step === 'selection' ? navigate('/dashboard') : setStep('selection')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
                            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-teal-600" />
                            Resume Architect
                        </h1>
                    </div>
                    {step === 'form' && (
                        <button
                            onClick={() => setStep('preview')}
                            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg transition"
                        >
                            <FileText className="w-4 h-4" /> Final Preview
                        </button>
                    )}
                    {step === 'preview' && (
                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep('form')}
                                className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white px-4 py-2 rounded-xl font-bold transition"
                            >
                                Edit Details
                            </button>
                            <button
                                onClick={generatePDF}
                                disabled={isGenerating}
                                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg transition disabled:opacity-50"
                            >
                                {isGenerating ? 'Processing...' : <><Download className="w-4 h-4" /> Download PDF</>}
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {step === 'selection' && (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="text-center max-w-2xl mb-12">
                            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">Revamp Your Professional Identity</h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400">Transform your details into the premium format used by industry leaders.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                            <div onClick={() => setStep('template-selection')} className="group bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 hover:border-teal-500 transition-all cursor-pointer relative overflow-hidden">
                                <Sparkles className="absolute -top-4 -right-4 w-32 h-32 text-teal-600 opacity-5 group-hover:opacity-10 transition-opacity" />
                                <div className="w-14 h-14 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mb-6"><Sparkles className="w-7 h-7 text-teal-600" /></div>
                                <h3 className="text-2xl font-bold mb-2">Build Live Preview</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">Enter details and get an instant high-quality PDF in the exact format requested.</p>
                                <span className="text-teal-600 font-semibold flex items-center gap-2">Start Designing <Download className="w-4 h-4" /></span>
                            </div>
                            <div onClick={() => fileInputReviewRef.current?.click()} className="group bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 hover:border-purple-500 transition-all cursor-pointer relative overflow-hidden">
                                <FileText className="absolute -top-4 -right-4 w-32 h-32 text-purple-600 opacity-5 group-hover:opacity-100 transition-opacity" />
                                <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6"><Upload className="w-7 h-7 text-purple-600" /></div>
                                <h3 className="text-2xl font-bold mb-2">AI Review & Score</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">Upload an existing resume and let AI rewrite sections for maximum impact.</p>
                                <span className="text-purple-600 font-semibold flex items-center gap-2">Review Resume <ArrowLeft className="w-4 h-4 rotate-180" /></span>
                                <input
                                    type="file"
                                    ref={fileInputReviewRef}
                                    className="hidden"
                                    accept=".pdf"
                                    onChange={handleReviewFileChange}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {step === 'template-selection' && (
                    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Select Your Blueprint</h2>
                            <p className="text-gray-500">Choose a design that best represents your professional journey.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-5xl">
                            {/* Traditional Template */}
                            <div
                                onClick={() => { setSelectedTemplate('traditional'); setStep('form'); }}
                                className="group bg-white dark:bg-gray-800 rounded-[2.5rem] p-4 border-4 border-transparent hover:border-teal-500 shadow-2xl transition-all cursor-pointer overflow-hidden flex flex-col"
                            >
                                <div className="bg-gray-100 dark:bg-gray-900 rounded-[2rem] p-6 h-[400px] overflow-hidden flex flex-col items-center relative">
                                    <div className="w-full h-full bg-white shadow-lg origin-top scale-[0.6] flex flex-col p-8 gap-4 border border-gray-100">
                                        <div className="w-3/4 h-8 bg-gray-200 rounded animate-pulse" />
                                        <div className="w-full h-4 bg-gray-100 rounded" />
                                        <div className="w-full h-4 bg-gray-100 rounded" />
                                        <div className="w-full h-1 bg-blue-800 mt-4" />
                                        <div className="w-1/2 h-6 bg-gray-200 rounded" />
                                        <div className="space-y-2">
                                            <div className="w-full h-3 bg-gray-50 rounded" />
                                            <div className="w-full h-3 bg-gray-50 rounded" />
                                            <div className="w-full h-3 bg-gray-50 rounded" />
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-teal-600/0 group-hover:bg-teal-600/10 transition-colors flex items-center justify-center">
                                        <Check className="w-16 h-16 text-teal-600 opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-300" />
                                    </div>
                                </div>
                                <div className="p-6 text-center">
                                    <div className="inline-flex items-center gap-2 mb-2">
                                        <FileText className="w-4 h-4 text-gray-400" />
                                        <h3 className="text-xl font-black uppercase text-gray-900 dark:text-white tracking-tight">Traditional Professional</h3>
                                    </div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Balanced • Corporate • ATS-Ready</p>
                                </div>
                            </div>

                            {/* Modern AI Template */}
                            <div
                                onClick={() => { setSelectedTemplate('modern'); setStep('form'); }}
                                className="group bg-white dark:bg-gray-800 rounded-[2.5rem] p-4 border-4 border-transparent hover:border-blue-500 shadow-2xl transition-all cursor-pointer overflow-hidden flex flex-col"
                            >
                                <div className="bg-gray-100 dark:bg-gray-900 rounded-[2rem] h-[400px] overflow-hidden flex relative">
                                    <div className="w-[30%] bg-[#2d3748] h-full p-4 flex flex-col gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white/20 self-center" />
                                        <div className="w-full h-2 bg-white/10 rounded" />
                                        <div className="w-full h-2 bg-white/10 rounded" />
                                        <div className="w-full h-2 bg-white/10 rounded" />
                                    </div>
                                    <div className="flex-1 bg-white p-6 space-y-4 shadow-xl">
                                        <div className="w-1/2 h-4 bg-gray-200 rounded" />
                                        <div className="w-1/4 h-2 bg-gray-100 rounded mb-8" />
                                        <div className="w-full h-[50px] bg-gray-50 rounded" />
                                        <div className="w-full h-1 bg-gray-100" />
                                        <div className="w-full h-3 bg-gray-50 rounded" />
                                        <div className="w-full h-3 bg-gray-50 rounded" />
                                    </div>
                                    <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors flex items-center justify-center">
                                        <Check className="w-16 h-16 text-blue-600 opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-300" />
                                    </div>
                                </div>
                                <div className="p-6 text-center">
                                    <div className="inline-flex items-center gap-2 mb-2">
                                        <Sparkles className="w-4 h-4 text-blue-400" />
                                        <h3 className="text-xl font-black uppercase text-gray-900 dark:text-white tracking-tight">Modern AI Architect</h3>
                                    </div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sidebar • Image Enabled • Dynamic</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setStep('selection')} className="mt-10 text-gray-500 font-bold hover:text-teal-600 transition flex items-center gap-2 px-6 py-2 rounded-xl hover:bg-teal-50">
                            <ArrowLeft className="w-4 h-4" /> Go Back
                        </button>
                    </div>
                )}

                {step === 'form' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Form Section */}
                        <div className="space-y-8 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 h-[80vh] overflow-y-auto custom-scrollbar">
                            <div>
                                <h2 className="text-2xl font-bold mb-1">Resume Details</h2>
                                <p className="text-gray-500 text-sm">Fill in your information to generate the PDF.</p>
                            </div>

                            <div className="space-y-4">
                                <section className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-teal-600 flex items-center gap-2"><User className="w-4 h-4" /> Basic Information</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="flex items-center gap-4">
                                            {selectedTemplate === 'modern' && (
                                                <>
                                                    <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full border-2 border-teal-500 overflow-hidden relative cursor-pointer group" onClick={() => document.getElementById('pfp-upload').click()}>
                                                        {formData.profilePic ? <img src={formData.profilePic} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-teal-600"><Upload className="w-6 h-6" /></div>}
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Upload className="w-4 h-4 text-white" /></div>
                                                    </div>
                                                    <input id="pfp-upload" type="file" hidden accept="image/*" onChange={handleProfilePicChange} />
                                                </>
                                            )}
                                            <div className="flex-1">
                                                <label className="text-xs font-semibold text-gray-500">Full Name</label>
                                                <input className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 focus:ring-2 ring-teal-500 outline-none transition" value={formData.fullName} onChange={e => handleFieldChange('fullName', e.target.value)} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500">Target Role(s)</label>
                                            <input className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 focus:ring-2 ring-teal-500 outline-none transition" value={formData.title} onChange={e => handleFieldChange('title', e.target.value)} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500">Email</label>
                                                <input className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 focus:ring-2 ring-teal-500 outline-none transition text-sm" value={formData.email} onChange={e => handleFieldChange('email', e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500">Phone</label>
                                                <input className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 focus:ring-2 ring-teal-500 outline-none transition text-sm" value={formData.phone} onChange={e => handleFieldChange('phone', e.target.value)} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500">Address</label>
                                            <input className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 focus:ring-2 ring-teal-500 outline-none transition text-sm" value={formData.address} onChange={e => handleFieldChange('address', e.target.value)} />
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500">LinkedIn</label>
                                                <input className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 focus:ring-2 ring-teal-500 outline-none transition text-[10px]" value={formData.linkedin} onChange={e => handleFieldChange('linkedin', e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500">GitHub</label>
                                                <input className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 focus:ring-2 ring-teal-500 outline-none transition text-[10px]" value={formData.github} onChange={e => handleFieldChange('github', e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500">Portfolio</label>
                                                <input className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 focus:ring-2 ring-teal-500 outline-none transition text-[10px]" value={formData.portfolio} onChange={e => handleFieldChange('portfolio', e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-teal-600 flex items-center gap-2"><FileText className="w-4 h-4" /> Professional Summary</h3>
                                        <button
                                            onClick={() => polishField('summary', formData.summary)}
                                            disabled={isGenerating || !formData.summary}
                                            className="text-[10px] bg-teal-600/10 text-teal-600 px-2 py-1 rounded-lg font-bold flex items-center gap-1 hover:bg-teal-600/20 transition disabled:opacity-50"
                                        >
                                            <Sparkles className="w-3 h-3" /> AI Polish
                                        </button>
                                    </div>
                                    <textarea rows={4} className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 focus:ring-2 ring-teal-500 outline-none text-sm transition" value={formData.summary} onChange={e => handleFieldChange('summary', e.target.value)} />
                                </section>

                                <section className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                                    <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-2">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-teal-600 flex items-center gap-2"><Briefcase className="w-4 h-4" /> Professional Experience</h3>
                                        <button onClick={addExperience} className="text-xs bg-teal-600 text-white px-3 py-1 rounded-lg font-bold flex items-center gap-1 hover:bg-teal-700 transition"><Plus className="w-3 h-3" /> Add</button>
                                    </div>
                                    <div className="space-y-6">
                                        {formData.experience.map((exp, idx) => (
                                            <div key={idx} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 relative group/exp">
                                                <button onClick={() => removeExperience(idx)} className="absolute top-2 right-2 p-1 text-red-500 opacity-0 group-hover/exp:opacity-100 transition"><Trash2 className="w-4 h-4" /></button>
                                                <div className="grid grid-cols-2 gap-3 mb-3">
                                                    <input placeholder="Role" className="col-span-2 text-sm font-bold border-b border-gray-100 p-1 w-full outline-none focus:border-teal-500 bg-transparent" value={exp.role} onChange={e => {
                                                        const newExp = [...formData.experience];
                                                        newExp[idx].role = e.target.value;
                                                        setFormData(prev => ({ ...prev, experience: newExp }));
                                                    }} />
                                                    <input placeholder="Company" className="text-xs border-b border-gray-100 p-1 w-full outline-none focus:border-teal-500 bg-transparent" value={exp.company} onChange={e => {
                                                        const newExp = [...formData.experience];
                                                        newExp[idx].company = e.target.value;
                                                        setFormData(prev => ({ ...prev, experience: newExp }));
                                                    }} />
                                                    <input placeholder="Period (e.g. Oct 2024 - Present)" className="text-xs border-b border-gray-100 p-1 w-full outline-none focus:border-teal-500 bg-transparent text-right" value={exp.period} onChange={e => {
                                                        const newExp = [...formData.experience];
                                                        newExp[idx].period = e.target.value;
                                                        setFormData(prev => ({ ...prev, experience: newExp }));
                                                    }} />
                                                </div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Experience Highlights</label>
                                                    <button
                                                        onClick={() => polishExperience(idx)}
                                                        disabled={isGenerating || exp.highlights.some(h => !h.trim())}
                                                        className="text-[10px] bg-teal-600/10 text-teal-600 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 hover:bg-teal-600/20 transition disabled:opacity-50"
                                                    >
                                                        <Sparkles className="w-3 h-3" /> AI Polish Bullets
                                                    </button>
                                                </div>
                                                <div className="space-y-2">
                                                    {exp.highlights.map((h, hidx) => (
                                                        <div key={hidx} className="flex gap-2 items-center group/highlight">
                                                            <input
                                                                placeholder="Focus on achievements..."
                                                                className="flex-1 text-xs p-1 bg-gray-50 dark:bg-gray-900/50 rounded-lg outline-none focus:ring-1 ring-teal-500 transition"
                                                                value={h}
                                                                onChange={e => {
                                                                    const newExp = [...formData.experience];
                                                                    newExp[idx].highlights[hidx] = e.target.value;
                                                                    setFormData(prev => ({ ...prev, experience: newExp }));
                                                                }}
                                                            />
                                                            <button
                                                                onClick={() => removeHighlight(idx, hidx)}
                                                                className="p-1 text-red-500 opacity-0 group-hover/highlight:opacity-100 transition"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button onClick={() => {
                                                        const newExp = [...formData.experience];
                                                        newExp[idx].highlights.push('');
                                                        setFormData(prev => ({ ...prev, experience: newExp }));
                                                    }} className="text-[10px] text-teal-600 hover:underline">+ Add Bullet</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                                    <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-2">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-teal-600 flex items-center gap-2"><FileText className="w-4 h-4" /> Portfolio Projects</h3>
                                        <button onClick={addProject} className="text-xs bg-teal-600 text-white px-3 py-1 rounded-lg font-bold flex items-center gap-1 hover:bg-teal-700 transition"><Plus className="w-3 h-3" /> Add</button>
                                    </div>
                                    <div className="space-y-6">
                                        {formData.projects.map((proj, idx) => (
                                            <div key={idx} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 relative group/proj">
                                                <button onClick={() => removeProject(idx)} className="absolute top-2 right-2 p-1 text-red-500 opacity-0 group-hover/proj:opacity-100 transition"><Trash2 className="w-4 h-4" /></button>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <input
                                                            placeholder="Project Name"
                                                            className="text-sm font-bold border-b border-gray-100 p-1 w-full outline-none focus:border-teal-500 bg-transparent uppercase"
                                                            value={proj.name}
                                                            onChange={e => {
                                                                const newProjects = [...formData.projects];
                                                                newProjects[idx].name = e.target.value;
                                                                setFormData(prev => ({ ...prev, projects: newProjects }));
                                                            }}
                                                        />
                                                        <button
                                                            onClick={() => polishProject(idx)}
                                                            disabled={isGenerating || !proj.description.trim()}
                                                            className="text-[10px] bg-teal-600/10 text-teal-600 px-2 py-1 rounded-lg font-bold flex items-center gap-1 hover:bg-teal-600/20 transition disabled:opacity-50 shrink-0"
                                                        >
                                                            <Sparkles className="w-3 h-3" /> AI Polish
                                                        </button>
                                                    </div>
                                                    <textarea
                                                        placeholder="Description"
                                                        rows={2}
                                                        className="w-full text-xs p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg outline-none focus:ring-1 ring-teal-500 transition"
                                                        value={proj.description}
                                                        onChange={e => {
                                                            const newProjects = [...formData.projects];
                                                            newProjects[idx].description = e.target.value;
                                                            setFormData(prev => ({ ...prev, projects: newProjects }));
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                                    <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-2">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-teal-600 flex items-center gap-2"><GraduationCap className="w-4 h-4" /> Education</h3>
                                        <button onClick={addEducation} className="text-xs bg-teal-600 text-white px-3 py-1 rounded-lg font-bold flex items-center gap-1 hover:bg-teal-700 transition"><Plus className="w-3 h-3" /> Add</button>
                                    </div>
                                    <div className="space-y-6">
                                        {formData.education.map((edu, idx) => (
                                            <div key={idx} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 relative group/edu">
                                                <button onClick={() => removeEducation(idx)} className="absolute top-2 right-2 p-1 text-red-500 opacity-0 group-hover/edu:opacity-100 transition"><Trash2 className="w-4 h-4" /></button>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <input placeholder="Degree (e.g. B. Tech in CSE)" className="col-span-2 text-sm font-bold border-b border-gray-100 p-1 w-full outline-none focus:border-teal-500 bg-transparent" value={edu.degree} onChange={e => {
                                                        const newEdu = [...formData.education];
                                                        newEdu[idx].degree = e.target.value;
                                                        setFormData(prev => ({ ...prev, education: newEdu }));
                                                    }} />
                                                    <input placeholder="University/School" className="text-xs border-b border-gray-100 p-1 w-full outline-none focus:border-teal-500 bg-transparent" value={edu.university} onChange={e => {
                                                        const newEdu = [...formData.education];
                                                        newEdu[idx].university = e.target.value;
                                                        setFormData(prev => ({ ...prev, education: newEdu }));
                                                    }} />
                                                    <input placeholder="Period" className="text-xs border-b border-gray-100 p-1 w-full outline-none focus:border-teal-500 bg-transparent text-right" value={edu.period} onChange={e => {
                                                        const newEdu = [...formData.education];
                                                        newEdu[idx].period = e.target.value;
                                                        setFormData(prev => ({ ...prev, education: newEdu }));
                                                    }} />
                                                    <div className="col-span-2">
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase">CGPA/Percentage</label>
                                                        <input placeholder="9.0" className="text-xs border-b border-gray-100 p-1 w-full outline-none focus:border-teal-500 bg-transparent" value={edu.cgpa} onChange={e => {
                                                            const newEdu = [...formData.education];
                                                            newEdu[idx].cgpa = e.target.value;
                                                            setFormData(prev => ({ ...prev, education: newEdu }));
                                                        }} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                                    <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-2">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-teal-600 flex items-center gap-2"><Sparkles className="w-4 h-4" /> Co-Curricular & Achievements</h3>
                                        <button onClick={addAchievement} className="text-xs bg-teal-600 text-white px-3 py-1 rounded-lg font-bold flex items-center gap-1 hover:bg-teal-700 transition"><Plus className="w-3 h-3" /> Add</button>
                                    </div>
                                    <div className="space-y-3">
                                        {formData.achievements.map((ach, idx) => (
                                            <div key={idx} className="flex gap-2 items-center group/ach">
                                                <input className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2 focus:ring-2 ring-teal-500 outline-none text-sm transition" value={ach} onChange={e => {
                                                    const newAch = [...formData.achievements];
                                                    newAch[idx] = e.target.value;
                                                    setFormData(prev => ({ ...prev, achievements: newAch }));
                                                }} />
                                                <button
                                                    onClick={() => polishAchievement(idx)}
                                                    disabled={isGenerating || !ach.trim()}
                                                    className="p-2 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-xl transition disabled:opacity-50"
                                                    title="AI Polish"
                                                >
                                                    <Sparkles className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => removeAchievement(idx)} className="p-2 text-red-500 opacity-0 group-hover/ach:opacity-100 transition"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                                    <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-2">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-teal-600 flex items-center gap-2"><Sparkles className="w-4 h-4" /> Technical Skills</h3>
                                        <button onClick={addSkill} className="text-xs bg-teal-600 text-white px-3 py-1 rounded-lg font-bold flex items-center gap-1 hover:bg-teal-700 transition"><Plus className="w-3 h-3" /> Add</button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        {Object.keys(formData.skills).map(key => (
                                            <div key={key} className="group/skill relative">
                                                <div className="flex justify-between items-center mb-1">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase">{key}</label>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => polishSkills(key)}
                                                            disabled={isGenerating || !formData.skills[key].trim()}
                                                            className="text-[9px] bg-teal-600/10 text-teal-600 px-1.5 py-0.5 rounded-md font-bold flex items-center gap-1 hover:bg-teal-600/20 transition disabled:opacity-50"
                                                        >
                                                            <Sparkles className="w-3 h-3" /> Standardize
                                                        </button>
                                                        <button onClick={() => removeSkill(key)} className="p-1 text-red-500 opacity-0 group-hover/skill:opacity-100 transition"><Trash2 className="w-3 h-3" /></button>
                                                    </div>
                                                </div>
                                                <input className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2 focus:ring-2 ring-teal-500 outline-none text-sm transition" value={formData.skills[key]} onChange={e => handleSkillChange(key, e.target.value)} />
                                            </div>
                                        ))}
                                    </div>
                                </section>
                                <section className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                                    <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-2">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-teal-600 flex items-center gap-2"><Briefcase className="w-4 h-4" /> Professional References</h3>
                                        <button onClick={addReference} className="text-xs bg-teal-600 text-white px-3 py-1 rounded-lg font-bold flex items-center gap-1 hover:bg-teal-700 transition"><Plus className="w-3 h-3" /> Add</button>
                                    </div>
                                    <div className="space-y-6">
                                        {formData.references.map((ref, idx) => (
                                            <div key={idx} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 relative group/ref">
                                                <button onClick={() => removeReference(idx)} className="absolute top-2 right-2 p-1 text-red-500 opacity-0 group-hover/ref:opacity-100 transition"><Trash2 className="w-4 h-4" /></button>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <input placeholder="Name" className="text-sm font-bold border-b border-gray-100 p-1 w-full outline-none focus:border-teal-500 bg-transparent" value={ref.name} onChange={e => {
                                                        const newRefs = [...formData.references];
                                                        newRefs[idx].name = e.target.value;
                                                        setFormData(prev => ({ ...prev, references: newRefs }));
                                                    }} />
                                                    <input placeholder="Role" className="text-xs border-b border-gray-100 p-1 w-full outline-none focus:border-teal-500 bg-transparent" value={ref.role} onChange={e => {
                                                        const newRefs = [...formData.references];
                                                        newRefs[idx].role = e.target.value;
                                                        setFormData(prev => ({ ...prev, references: newRefs }));
                                                    }} />
                                                    <input placeholder="Company" className="text-xs border-b border-gray-100 p-1 w-full outline-none focus:border-teal-500 bg-transparent" value={ref.company} onChange={e => {
                                                        const newRefs = [...formData.references];
                                                        newRefs[idx].company = e.target.value;
                                                        setFormData(prev => ({ ...prev, references: newRefs }));
                                                    }} />
                                                    <input placeholder="Email" className="text-xs border-b border-gray-100 p-1 w-full outline-none focus:border-teal-500 bg-transparent" value={ref.email} onChange={e => {
                                                        const newRefs = [...formData.references];
                                                        newRefs[idx].email = e.target.value;
                                                        setFormData(prev => ({ ...prev, references: newRefs }));
                                                    }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        </div>

                        {/* Fast Preview Section */}
                        <div className="sticky top-24 h-[80vh] border border-gray-200 dark:border-gray-700 rounded-3xl shadow-2xl bg-white dark:bg-gray-900 flex flex-col">
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 border-b flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Select Template</span>
                                <div className="flex bg-gray-200 dark:bg-gray-700 p-1 rounded-xl">
                                    <button onClick={() => setSelectedTemplate('traditional')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${selectedTemplate === 'traditional' ? 'bg-white dark:bg-gray-900 shadow-sm text-teal-600' : 'text-gray-500'}`}>Traditional</button>
                                    <button onClick={() => setSelectedTemplate('modern')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${selectedTemplate === 'modern' ? 'bg-white dark:bg-gray-900 shadow-sm text-teal-600' : 'text-gray-500'}`}>Modern AI</button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-auto p-4 flex justify-center bg-gray-200/30">
                                <div className="bg-white shadow-2xl transform scale-[0.45] origin-top">
                                    <ResumeTemplate data={formData} template={selectedTemplate} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 'preview' && (
                    <div className="flex flex-col items-center animate-in fade-in duration-500">
                        <div className="mb-10 text-center">
                            <h2 className="text-3xl font-extrabold mb-2 text-gray-900 dark:text-white">Review Your Professional Resume</h2>
                            <p className="text-gray-500">The document is perfectly formatted for A4 printing and ATS systems.</p>
                        </div>
                        <div className="bg-white shadow-[0_0_50px_rgba(0,0,0,0.2)] mb-12 select-none" style={{ width: '210mm', minHeight: '297mm' }}>
                            <div ref={resumeRef}>
                                <ResumeTemplate data={formData} template={selectedTemplate} />
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

const ResumeTemplate = ({ data, template }) => {
    return template === 'modern' ? <ModernTemplate data={data} /> : <TraditionalTemplate data={data} />;
};

const TraditionalTemplate = ({ data }) => {
    return (
        <div id="resume-document" className="bg-white text-black p-[40px] font-serif leading-[1.3] text-[12px] w-[210mm] min-h-[297mm] mx-auto box-border text-left relative" style={{ color: '#000', backgroundColor: '#fff' }}>
            <header className="mb-6">
                <h1 className="text-[36px] font-bold tracking-tight mb-1 uppercase" style={{ fontFamily: 'Georgia, serif' }}>{data.fullName}</h1>
                <div className="text-[15px] font-medium text-gray-600 mb-3 tracking-wider uppercase">
                    {data.title}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-sans">
                    <a href={`mailto:${data.email}`} className="text-blue-800 underline flex items-center gap-1">{data.email}</a>
                    {data.phone && <><span className="text-gray-300">|</span> <span className="text-gray-700">{data.phone}</span></>}
                    {data.address && <><span className="text-gray-300">|</span> <span className="text-gray-700">{data.address}</span></>}
                    {data.linkedin && <><span className="text-gray-300">|</span> <a href="#" className="text-blue-800 underline">{data.linkedin}</a></>}
                    {data.portfolio && <><span className="text-gray-300">|</span> <a href="#" className="text-blue-800 underline">{data.portfolio}</a></>}
                    {data.github && <><span className="text-gray-300">|</span> <a href="#" className="text-blue-800 underline">{data.github}</a></>}
                </div>
            </header>

            <div className="mb-6">
                <h2 className="text-[13px] font-bold mb-1 uppercase tracking-wide">Summary</h2>
                <div className="h-px bg-blue-800 w-full mb-2" />
                <p className="text-justify leading-relaxed text-[12px]">{data.summary}</p>
            </div>

            <div className="mb-6">
                <h2 className="text-[13px] font-bold mb-1 uppercase tracking-wide">Technical Skills</h2>
                <div className="h-px bg-blue-800 w-full mb-2" />
                <div className="grid grid-cols-2 gap-x-12 gap-y-1 text-[11.5px]">
                    <div className="space-y-1">
                        {Object.entries(data.skills).slice(0, 4).map(([key, value]) => (
                            <div key={key}><strong className="font-bold capitalize">{key}:</strong> {value}</div>
                        ))}
                    </div>
                    <div className="space-y-1">
                        {Object.entries(data.skills).slice(4).map(([key, value]) => (
                            <div key={key}><strong className="font-bold capitalize">{key}:</strong> {value}</div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <h2 className="text-[13px] font-bold mb-1 uppercase tracking-wide">Professional Experience</h2>
                <div className="h-px bg-blue-800 w-full mb-2" />
                {data.experience.map((exp, i) => (
                    <div key={i} className="mb-3">
                        <div className="flex justify-between font-bold text-[13px]">
                            <span>{exp.role} ({exp.company}, {exp.location})</span>
                            <span className="text-[11px] uppercase">{exp.period}</span>
                        </div>
                        <ul className="list-disc ml-5 mt-1.5 space-y-1 text-[11.5px]">
                            {exp.highlights.map((bullet, j) => (
                                <li key={j} className="text-justify">{bullet}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="mb-6">
                <h2 className="text-[13px] font-bold mb-1 uppercase tracking-wide">Projects</h2>
                <div className="h-px bg-blue-800 w-full mb-2" />
                <ul className="list-disc ml-5 space-y-2 text-[11.5px]">
                    {data.projects.map((proj, i) => (
                        <li key={i}>
                            <strong className="font-bold uppercase">{proj.name}</strong>: {proj.description}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mb-6">
                <h2 className="text-[13px] font-bold mb-1 uppercase tracking-wide">Education</h2>
                <div className="h-px bg-blue-800 w-full mb-2" />
                {data.education.map((edu, i) => (
                    <div key={i} className="mb-3">
                        <div className="flex justify-between font-bold text-[13px]">
                            <span>{edu.degree}</span>
                            <span className="text-[11px] uppercase">{edu.period}</span>
                        </div>
                        <div className="mt-0.5 text-gray-700 italic">{edu.university}</div>
                        {edu.cgpa && <div className="mt-0.5 font-semibold">CGPA: {edu.cgpa}</div>}
                    </div>
                ))}
            </div>

            <div className="mb-6">
                <h2 className="text-[13px] font-bold mb-1 uppercase tracking-wide">Co-Curricular & Achievements</h2>
                <div className="h-px bg-blue-800 w-full mb-2" />
                <ul className="list-disc ml-5 space-y-1 mt-1 text-[11.5px]">
                    {data.achievements.map((ach, i) => (
                        <li key={i}>{ach}</li>
                    ))}
                </ul>
            </div>

            {data.references.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-[13px] font-bold mb-1 uppercase tracking-wide">References</h2>
                    <div className="h-px bg-blue-800 w-full mb-2" />
                    <div className="grid grid-cols-2 gap-4 text-[11px]">
                        {data.references.map((ref, i) => (
                            <div key={i}>
                                <div className="font-bold">{ref.name}</div>
                                <div>{ref.role}, {ref.company}</div>
                                <div>{ref.email} | {ref.phone}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const ModernTemplate = ({ data }) => {
    return (
        <div id="resume-document" className="bg-white text-gray-800 flex w-[210mm] min-h-[297mm] mx-auto box-border overflow-hidden" style={{ color: '#2d3748' }}>
            {/* Sidebar */}
            <div className="w-[70mm] bg-[#2d3748] text-white p-8 flex flex-col gap-10">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-40 h-40 rounded-full border-4 border-white/20 overflow-hidden bg-gray-600">
                        {data.profilePic ? <img src={data.profilePic} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl font-bold">{data.fullName[0]}</div>}
                    </div>
                    <div className="mt-4 space-y-6 w-full">
                        <div>
                            <h3 className="text-[14px] font-bold uppercase tracking-widest mb-2">Contact</h3>
                            <div className="h-px bg-white/20 w-full mb-4" />
                            <div className="space-y-4 text-[11px]">
                                <div className="flex flex-col"><span className="font-bold opacity-60 uppercase text-[9px]">Phone</span><span>{data.phone}</span></div>
                                <div className="flex flex-col"><span className="font-bold opacity-60 uppercase text-[9px]">Email</span><span className="break-all">{data.email}</span></div>
                                <div className="flex flex-col"><span className="font-bold opacity-60 uppercase text-[9px]">Address</span><span>{data.address}</span></div>
                                <div className="flex flex-col gap-1">
                                    <span className="font-bold opacity-60 uppercase text-[9px]">Socials</span>
                                    {data.linkedin && <span className="opacity-80 text-[10px] truncate">{data.linkedin}</span>}
                                    {data.github && <span className="opacity-80 text-[10px] truncate">{data.github}</span>}
                                    {data.portfolio && <span className="opacity-80 text-[10px] truncate">{data.portfolio}</span>}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[14px] font-bold uppercase tracking-widest mb-2">Education</h3>
                            <div className="h-px bg-white/20 w-full mb-4" />
                            <div className="space-y-4 text-[11px]">
                                {data.education.map((edu, i) => (
                                    <div key={i}>
                                        <div className="font-bold text-yellow-400">{edu.period}</div>
                                        <div className="font-bold leading-tight mt-1">{edu.degree}</div>
                                        <div className="opacity-70 text-[10px] mt-1 italic">{edu.university}</div>
                                        {edu.cgpa && <div className="text-[9px] mt-1 font-bold">CGPA: {edu.cgpa}</div>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[14px] font-bold uppercase tracking-widest mb-2">Expertise</h3>
                            <div className="h-px bg-white/20 w-full mb-4" />
                            <div className="space-y-2 text-[11px]">
                                {Object.values(data.skills).join(', ').split(',').map((skill, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                                        <span>{skill.trim()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[14px] font-bold uppercase tracking-widest mb-2">Achievements</h3>
                            <div className="h-px bg-white/20 w-full mb-4" />
                            <div className="space-y-3 text-[10px]">
                                {data.achievements.map((ach, i) => (
                                    <div key={i} className="opacity-80 leading-relaxed">• {ach}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-12 flex flex-col">
                <header className="mb-10">
                    <h1 className="text-[48px] font-black text-[#2d3748] uppercase leading-none mb-4">{data.fullName.split(' ')[0]}<br /><span className="font-light">{data.fullName.split(' ').slice(1).join(' ')}</span></h1>
                    <div className="text-[18px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-6">{data.title}</div>
                    <p className="text-[12px] leading-relaxed text-gray-500 text-justify border-l-4 border-gray-100 pl-4">{data.summary}</p>
                </header>

                <div className="space-y-10">
                    <section>
                        <h2 className="text-[20px] font-black uppercase tracking-wider mb-2">Experience</h2>
                        <div className="h-[2px] bg-gray-100 w-full mb-6" />
                        <div className="space-y-8">
                            {data.experience.map((exp, i) => (
                                <div key={i} className="relative pl-6 border-l-2 border-gray-100 pb-2">
                                    <div className="absolute top-0 -left-[9px] w-4 h-4 rounded-full border-2 border-gray-100 bg-white" />
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="text-[12px] font-black text-[#2d3748] uppercase">{exp.period}</div>
                                            <div className="text-[14px] font-bold text-gray-600">{exp.company}</div>
                                            <div className="text-[14px] font-medium text-blue-600 uppercase tracking-wide">{exp.role}</div>
                                        </div>
                                    </div>
                                    <ul className="space-y-2 mt-3">
                                        {exp.highlights.map((h, j) => (
                                            <li key={j} className="text-[11px] leading-relaxed text-gray-500 text-justify">{h}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-[20px] font-black uppercase tracking-wider mb-2">Projects</h2>
                        <div className="h-[2px] bg-gray-100 w-full mb-6" />
                        <div className="grid grid-cols-2 gap-6">
                            {data.projects.map((proj, i) => (
                                <div key={i}>
                                    <div className="text-[13px] font-black text-[#2d3748] uppercase mb-1">{proj.name}</div>
                                    <p className="text-[11px] text-gray-500 leading-relaxed italic">{proj.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {data.references.length > 0 && (
                        <section>
                            <h2 className="text-[20px] font-black uppercase tracking-wider mb-2">Reference</h2>
                            <div className="h-[2px] bg-gray-100 w-full mb-6" />
                            <div className="grid grid-cols-2 gap-8">
                                {data.references.map((ref, i) => (
                                    <div key={i} className="space-y-1">
                                        <div className="text-[13px] font-black text-[#2d3748] uppercase">{ref.name}</div>
                                        <div className="text-[11px] font-bold text-gray-500">{ref.company} / {ref.role}</div>
                                        <div className="text-[10px] text-gray-400">Phone: {ref.phone}</div>
                                        <div className="text-[10px] text-gray-400">Email: {ref.email}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResumePage;
