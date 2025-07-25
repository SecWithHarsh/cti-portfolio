import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

// --- Firebase Configuration ---
// This is your actual configuration.
const firebaseConfig = {
  apiKey: "AIzaSyAfsYeQt5IvJvFzJGSpP5YNlzr-aHc8K1Y",
  authDomain: "portfolio-5b9ca.firebaseapp.com",
  projectId: "portfolio-5b9ca",
  storageBucket: "portfolio-5b9ca.appspot.com",
  messagingSenderId: "203665591912",
  appId: "1:203665591912:web:70fdab8c24acbb7d5f75dd",
  measurementId: "G-Y254G7BNY8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// --- Helper Functions & Dummy Data ---

const initialContent = {
  about: "I am a passionate Cyber Threat Intelligence beginner, dedicated to learning the art of tracking digital adversaries and understanding the threat landscape. I'm actively developing my skills in OSINT, data analysis, and malware triage to turn information into protective intelligence. My journey is about building a foundation of knowledge to help organizations anticipate and defend against emerging cyber threats.",
  skills: [
    { name: "Threat Analysis", level: 65 },
    { name: "OSINT", level: 75 },
    { name: "Python Scripting", level: 80 },
    { name: "Log Analysis (SIEM)", level: 60 },
    { name: "Malware Triage", level: 55 },
    { name: "Network Fundamentals", level: 70 },
  ],
  projects: [
    { name: "Threat Actor Profile Study", description: "Analyzed public reports on APT28 to create a comprehensive profile of their TTPs and infrastructure.", year: "Current" },
    { name: "Phishing Kit Analysis", description: "Deconstructed a captured phishing kit to understand its operation and identify unique indicators.", year: "Current" },
    { name: "Home Lab Network Monitoring", description: "Set up a home lab with Security Onion to practice traffic analysis and alert triage.", year: "Ongoing" },
  ],
  contact: {
    email: "harsh.raj@example.dev",
    github: "https://github.com/secwithharsh",
    linkedin: "https://linkedin.com/in/harsh-raj-sec"
  },
  certs: [
    {
      name: "Security+",
      issuer: "CompTIA",
      logo: "https://cdn.worldvectorlogo.com/logos/comptia-security-ce.svg",
      imageUrl: "https://placehold.co/600x400/0a101f/cyan?text=Cert_Image",
      verifyUrl: "#verify-link-1"
    },
    {
      name: "eJPT",
      issuer: "INE",
      logo: "https://avatars.githubusercontent.com/u/4549474?s=200&v=4",
      imageUrl: "https://placehold.co/600x400/0a101f/cyan?text=Cert_Image",
      verifyUrl: "#verify-link-2"
    }
  ],
  resumeUrl: "/resume.pdf", // Placeholder for the resume file path
  whoami: {
    name: "Harsh Raj",
    handle: "SecWithHarsh",
    clearance: "LEVEL-1 // BEGINNER",
    status: "Actively learning and analyzing...",
  },
  apiKeys: {
      otx: "" // <-- Placeholder for AlienVault OTX API Key
  }
};

// --- Firebase Helper Functions ---

/**
 * Save portfolio content to Firestore
 * @param {Object} content - The portfolio content to save
 * @returns {Promise<boolean>} - Success status
 */
const saveContentToFirestore = async (content) => {
  try {
    const docRef = doc(db, 'portfolio', 'content');
    await setDoc(docRef, {
      ...content,
      lastUpdated: new Date().toISOString()
    });
    console.log('Content saved to Firestore successfully');
    return true;
  } catch (error) {
    console.error('Error saving to Firestore:', error);
    return false;
  }
};

/**
 * Load portfolio content from Firestore
 * @returns {Promise<Object|null>} - The loaded content or null if not found
 */
const loadContentFromFirestore = async () => {
  try {
    const docRef = doc(db, 'portfolio', 'content');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Remove the lastUpdated field before returning
      const { lastUpdated, ...content } = data;
      console.log('Content loaded from Firestore successfully');
      return content;
    } else {
      console.log('No content found in Firestore, using initial content');
      return null;
    }
  } catch (error) {
    console.error('Error loading from Firestore:', error);
    return null;
  }
};

// --- Custom Hooks ---

const useTypewriter = (text, speed = 50, eraseSpeed = 30, delay = 1000) => {
  const [displayText, setDisplayText] = useState('');
  const typingRef = useRef({
    index: 0,
    isErasing: false,
    text: text,
    timeoutId: null
  });

  useEffect(() => {
    // Update text in ref when it changes, and reset the animation
    typingRef.current.text = text;
    typingRef.current.index = 0;
    typingRef.current.isErasing = false;
    setDisplayText('');
    if (typingRef.current.timeoutId) clearTimeout(typingRef.current.timeoutId);
  }, [text]);

  useEffect(() => {
    if (!typingRef.current.text) return;

    const handleTyping = () => {
      let { index, isErasing, text } = typingRef.current;
      
      if (!isErasing) {
        if (index < text.length) {
          setDisplayText(prev => text.substring(0, prev.length + 1));
          typingRef.current.index++;
        } else {
          // Wait before erasing
          typingRef.current.timeoutId = setTimeout(() => {
            typingRef.current.isErasing = true;
          }, delay);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(prev => text.substring(0, prev.length - 1));
        } else {
          typingRef.current.isErasing = false;
          typingRef.current.index = 0;
        }
      }
    };
    
    const currentSpeed = typingRef.current.isErasing ? eraseSpeed : speed;
    const intervalId = setInterval(handleTyping, currentSpeed);

    return () => clearInterval(intervalId);
  }, [speed, eraseSpeed, delay, displayText, text]); // Dependency on displayText is needed to re-evaluate interval speed
  
  return displayText;
};


// --- UI Components ---

const ParticleCanvas = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let particles = [];
    const particleCount = 70;
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.color = `rgba(0, 255, 255, ${Math.random() * 0.5 + 0.2})`;
      }
      update() {
        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
        this.x += this.speedX;
        this.y += this.speedY;
      }
      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    const init = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      animationFrameId = requestAnimationFrame(animate);
    };
    init();
    animate();
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10" />;
};

const CursorTrail = () => {
  const [trail, setTrail] = useState([]);
  useEffect(() => {
    const handleMouseMove = (e) => {
      const newTrail = [...trail, { x: e.clientX, y: e.clientY, id: Date.now() }];
      if (newTrail.length > 20) newTrail.shift();
      setTrail(newTrail);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [trail]);
  return (
    <>
      {trail.map((t, index) => (
        <div
          key={t.id}
          className="fixed top-0 left-0 w-1.5 h-1.5 bg-cyan-300 rounded-full pointer-events-none -z-10"
          style={{ transform: `translate(${t.x}px, ${t.y}px)`, opacity: index / trail.length, transition: 'opacity 0.2s ease-out' }}
        />
      ))}
    </>
  );
};

const GlassCard = ({ title, children, className }) => (
  <div className={`bg-slate-900/50 backdrop-blur-md border border-cyan-400/20 rounded-lg shadow-lg shadow-cyan-500/10 p-6 ${className}`}>
    {title && <h2 className="text-2xl font-bold text-cyan-300 mb-4 tracking-widest uppercase">// {title}</h2>}
    <div className="text-slate-300 font-mono text-sm leading-relaxed">{children}</div>
  </div>
);

const SkillBar = ({ name, level }) => (
  <div className="mb-3">
    <div className="flex justify-between items-center mb-1">
      <span className="text-slate-300">{name}</span>
      <span className="text-cyan-300 text-xs">{level}%</span>
    </div>
    <div className="w-full bg-slate-700/50 rounded-full h-1.5">
      <div className="bg-cyan-400 h-1.5 rounded-full shadow-[0_0_8px_rgba(0,255,255,0.7)]" style={{ width: `${level}%` }}></div>
    </div>
  </div>
);

const ThreatFeedWidget = ({ apiKey }) => {
  const [feed, setFeed] = useState('Initializing threat feed...');
  const [pulses, setPulses] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!apiKey) {
      setFeed('OTX API Key missing...');
      return;
    }
    const fetchOtxPulses = async () => {
      setFeed('Fetching intel from OTX...');
      try {
        const response = await fetch('https://otx.alienvault.com/api/v1/pulses/subscribed', {
          headers: { 'X-OTX-API-KEY': apiKey }
        });
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          setPulses(data.results.map(p => p.name));
        } else {
          setFeed('No threat pulses found.');
        }
      } catch (error) {
        console.error("OTX Fetch Error:", error);
        setFeed('Failed to fetch OTX data.');
      }
    };
    fetchOtxPulses();
  }, [apiKey]);

  useEffect(() => {
    if (pulses.length === 0) return;
    const intervalId = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % pulses.length);
    }, 7000);
    return () => clearInterval(intervalId);
  }, [pulses]);
  
  useEffect(() => {
    if (pulses.length > 0) setFeed(pulses[currentIndex]);
  }, [currentIndex, pulses]);

  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-cyan-400/20 rounded-lg p-4 text-xs font-mono">
      <h3 className="text-cyan-400 mb-2 uppercase">// OTX Live Threat Feed</h3>
      <pre className="text-slate-400 whitespace-pre-wrap h-10">{feed}</pre>
    </div>
  );
};

const CertificateCard = ({ cert }) => {
    const [logoSrc, setLogoSrc] = useState(cert.logo);

    const getDomainFromIssuer = (issuer) => {
        return issuer.toLowerCase().replace(/ /g, '').replace(/\./g, '').replace(/,/g, '').replace(/\(.*\)/g, '') + '.com';
    }

    useEffect(() => {
        const domain = getDomainFromIssuer(cert.issuer);
        const clearbitUrl = `https://logo.clearbit.com/${domain}`;
        
        const image = new Image();
        image.src = clearbitUrl;
        image.onload = () => {
            setLogoSrc(clearbitUrl);
        };
        image.onerror = () => {
            setLogoSrc(cert.logo); // Fallback to original logo
        };

    }, [cert.issuer, cert.logo]);

    return (
        <div className="bg-slate-800/50 p-4 rounded-lg flex items-center gap-4 border border-slate-700">
            <img 
                src={logoSrc} 
                alt={`${cert.issuer} logo`} 
                className="w-16 h-16 p-1 bg-white/80 rounded-md object-contain" 
                onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/64x64/ffffff/000000?text=Logo'; }}
            />
            <div className="flex-grow">
                <h4 className="font-bold text-white">{cert.name}</h4>
                <p className="text-sm text-slate-400">{cert.issuer}</p>
                <div className="flex gap-2 mt-2">
                    <a href={cert.imageUrl} target="_blank" rel="noopener noreferrer" className="text-xs bg-cyan-600/50 hover:bg-cyan-500/80 px-2 py-1 rounded">View</a>
                    <a href={cert.verifyUrl} target="_blank" rel="noopener noreferrer" className="text-xs bg-slate-600/50 hover:bg-slate-500/80 px-2 py-1 rounded">Verify</a>
                </div>
            </div>
        </div>
    );
};


const GUI = ({ content }) => {
  const aboutText = useTypewriter(content.about, 20, 10, 3000);

  return (
    <div className="min-h-screen w-full p-4 sm:p-8 md:p-12 text-white font-sans transition-opacity duration-500">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <GlassCard title={`// ${content.whoami.name} // ${content.whoami.handle}`}>
            <p>{aboutText}<span className="animate-ping">_</span></p>
          </GlassCard>
          <GlassCard title="Projects">
            <div className="space-y-4">
              {content.projects.map((p, i) => (
                <div key={i} className="border-l-2 border-cyan-400/50 pl-4 transition-all hover:border-cyan-300">
                  <h3 className="font-bold text-slate-100">{p.name} <span className="text-xs text-slate-400 font-normal ml-2">({p.year})</span></h3>
                  <p className="text-slate-400">{p.description}</p>
                </div>
              ))}
            </div>
          </GlassCard>
           <GlassCard title="Certifications">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {content.certs.map((cert, i) => (
                <CertificateCard key={i} cert={cert} />
              ))}
            </div>
          </GlassCard>
        </div>
        <div className="lg:col-span-1 flex flex-col gap-8">
          <GlassCard title="Skill Matrix">
            {content.skills.map((s, i) => <SkillBar key={i} name={s.name} level={s.level} />)}
          </GlassCard>
          <GlassCard>
             <a 
                href={content.resumeUrl} 
                download={`HarshRaj_CTI_Resume.pdf`}
                className="block w-full text-center bg-cyan-600/80 hover:bg-cyan-500/90 transition-all duration-300 text-white font-bold py-3 px-4 rounded-lg tracking-widest uppercase"
            >
                Download Resume
            </a>
          </GlassCard>
          <GlassCard title="Contact & Comms">
            <div className="space-y-3">
              {Object.entries(content.contact).map(([key, value]) => (
                <a href={key === 'email' ? `mailto:${value}` : value} target="_blank" rel="noopener noreferrer" key={key} className="block bg-slate-800/40 p-3 rounded-md border border-slate-700/50 hover:border-cyan-400/50 hover:bg-slate-800/80 transition-all duration-300 group">
                  <div className="flex items-center gap-3">
                    <span className="text-cyan-400 uppercase text-xs tracking-wider w-20">{key}</span>
                    <span className="text-slate-300 truncate group-hover:text-white">{value.replace('https://', '')}</span>
                  </div>
                </a>
              ))}
            </div>
          </GlassCard>
          <ThreatFeedWidget apiKey={content.apiKeys.otx} />
        </div>
      </div>
      <footer className="text-center text-slate-500 text-xs font-mono mt-12 pb-4">
        <p>Press '~' to access CLI</p>
        <p className="mt-2">STATUS: {content.whoami.status}</p>
      </footer>
    </div>
  );
};

const CLI = ({ content, setContent, setCliActive }) => {
  const [history, setHistory] = useState([{type: 'system', text: 'Terminal active. Type "help" for a list of commands.'}]);
  const [input, setInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editText, setEditText] = useState('');
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history]);

  useEffect(() => {
    if (!isEditing && inputRef.current) inputRef.current.focus();
  }, [isEditing]);

  const handleCommand = useCallback((cmd) => {
    const [command, ...args] = cmd.toLowerCase().trim().split(' ');
    let output = { type: 'output', text: `command not found: ${command}` };

    switch (command) {
      case 'help':
        output.text = `Available commands:\n  whoami         - Display user information\n  view <section> - View section (about, skills, projects, certs, contact)\n  nano <section> - Edit a text section (about)\n  clear          - Clear the terminal\n  exit           - Close the terminal`;
        break;
      case 'whoami':
        output.text = JSON.stringify(content.whoami, null, 2);
        break;
      case 'view':
        const viewTarget = args[0];
        if (content[viewTarget]) {
          output.text = JSON.stringify(content[viewTarget], null, 2);
        } else {
          output.text = `Error: Section "${viewTarget}" not found.`;
        }
        break;
      case 'nano':
        const nanoTarget = args[0];
        if (content[nanoTarget] && typeof content[nanoTarget] === 'string') {
          setEditTarget(nanoTarget);
          setEditText(content[nanoTarget]);
          setIsEditing(true);
          output = null;
        } else {
          output.text = `Error: Cannot edit "${nanoTarget}". Use Admin Panel for complex data.`;
        }
        break;
      case 'clear':
        setHistory([]);
        output = null;
        break;
      case 'exit':
        setCliActive(false);
        output = null;
        break;
      default:
        break;
    }
    setHistory(prev => [...prev, {type: 'input', text: cmd}, ...(output ? [output] : [])]);
  }, [content, setCliActive]);
  
  const handleInput = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommand(input);
      setInput('');
    }
  };
  
  const handleEditorSave = () => {
      setContent(prev => ({...prev, [editTarget]: editText}));
      setHistory(prev => [...prev, {type: 'system', text: `Saved changes to ${editTarget}.`}]);
      setIsEditing(false);
  };

  const handleEditorCancel = () => {
      setHistory(prev => [...prev, {type: 'system', text: `Cancelled edit for ${editTarget}.`}]);
      setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="fixed inset-0 bg-black z-50 p-4 flex flex-col font-mono text-white">
          <div className="flex-grow flex flex-col">
            <div className="bg-gray-700 text-white p-1 text-center">Nano 2.0 - Editing: {editTarget}</div>
            <textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="w-full h-full bg-black text-lime-400 p-2 outline-none resize-none flex-grow" />
            <div className="bg-gray-700 text-white p-1 flex justify-center gap-4 text-sm">
                <span onClick={handleEditorSave} className="cursor-pointer hover:bg-white hover:text-black px-2">^S Save</span>
                <span onClick={handleEditorCancel} className="cursor-pointer hover:bg-white hover:text-black px-2">^X Cancel</span>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 p-4 flex flex-col font-mono text-white" onClick={() => inputRef.current?.focus()}>
      <div ref={scrollRef} className="flex-grow overflow-y-auto">
        {history.map((line, i) => (
          <div key={i} className="mb-2">
            {line.type === 'input' && <span className="text-cyan-400 mr-2">$&gt;</span>}
            <pre className={`whitespace-pre-wrap ${line.type === 'output' ? 'text-lime-400' : line.type === 'system' ? 'text-yellow-400' : 'text-white'}`}>{line.text}</pre>
          </div>
        ))}
      </div>
      <div className="flex items-center">
        <span className="text-cyan-400 mr-2">$&gt;</span>
        <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleInput} className="bg-transparent border-none outline-none w-full text-white" autoFocus />
      </div>
    </div>
  );
};

const AdminPanel = ({ content, setContent, setAdminOpen }) => {
  const [tempContent, setTempContent] = useState(JSON.parse(JSON.stringify(content))); // Deep copy
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  const handleFieldChange = (section, field, value) => {
    setTempContent(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };
  
  const handleTopLevelFieldChange = (field, value) => {
    setTempContent(prev => ({...prev, [field]: value}));
  };

  const handleListItemChange = (section, index, field, value) => {
    const newList = [...tempContent[section]];
    newList[index][field] = value;
    setTempContent(prev => ({ ...prev, [section]: newList }));
  };
  
  const addListItem = (section) => {
      const newItem = section === 'certs' 
          ? { name: "New Cert", issuer: "Issuer", logo: "", imageUrl: "", verifyUrl: "" }
          : { name: "New Project", description: "Description", year: new Date().getFullYear().toString() };
      setTempContent(prev => ({...prev, [section]: [...prev[section], newItem]}));
  };
  
  const removeListItem = (section, index) => {
      setTempContent(prev => ({...prev, [section]: prev[section].filter((_, i) => i !== index)}));
  };

  const handleSave = async () => {
      setIsSaving(true);
      setSaveStatus('Saving to Firestore...');
      
      try {
        const success = await saveContentToFirestore(tempContent);
        if (success) {
          setContent(tempContent);
          setSaveStatus('✓ Saved successfully!');
          setTimeout(() => {
            setAdminOpen(false);
          }, 1000);
        } else {
          setSaveStatus('✗ Failed to save to Firestore');
          // Still update local state even if Firebase fails
          setContent(tempContent);
        }
      } catch (error) {
        console.error('Save error:', error);
        setSaveStatus('✗ Error occurred while saving');
        // Still update local state even if Firebase fails
        setContent(tempContent);
      } finally {
        setIsSaving(false);
        // Clear status after 3 seconds
        setTimeout(() => setSaveStatus(''), 3000);
      }
  };
  
  const InputField = ({label, value, onChange, placeholder}) => (
      <div className="mb-2">
          <label className="block text-red-300 mb-1 text-sm">{label}</label>
          <input type="text" value={value} onChange={onChange} placeholder={placeholder} className="w-full bg-slate-900 text-slate-200 p-2 rounded border border-slate-600 focus:outline-none focus:ring-1 focus:ring-red-500" />
      </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 font-mono">
      <div className="bg-slate-800 border border-red-500 rounded-lg w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl shadow-red-500/30">
        <div className="p-4 border-b border-red-500/50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-red-400 uppercase tracking-widest">// ADMIN PANEL</h2>
          <button onClick={() => setAdminOpen(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
        </div>
        <div className="p-6 flex-grow overflow-y-auto space-y-6 text-sm">
          {/* API Keys Section */}
          <div>
            <h3 className="text-red-300 mb-2 font-bold">API KEYS</h3>
            <p className="text-xs text-slate-400 mb-2">Get your free AlienVault OTX key from otx.alienvault.com</p>
            <InputField label="AlienVault OTX API Key" value={tempContent.apiKeys.otx} onChange={e => handleFieldChange('apiKeys', 'otx', e.target.value)} />
          </div>
          {/* About Section */}
          <div>
            <label className="block text-red-300 mb-2 font-bold">ABOUT SECTION</label>
            <textarea className="w-full h-24 bg-slate-900 text-slate-200 p-2 rounded border border-slate-600 focus:outline-none focus:ring-1 focus:ring-red-500" value={tempContent.about} onChange={(e) => handleTopLevelFieldChange('about', e.target.value)} />
          </div>
          {/* Contact & Assets Section */}
          <div>
            <h3 className="text-red-300 mb-2 font-bold">CONTACT & ASSETS</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(tempContent.contact).map(key => (
                    <InputField key={key} label={key.toUpperCase()} value={tempContent.contact[key]} onChange={e => handleFieldChange('contact', key, e.target.value)} />
                ))}
            </div>
             <div className="mt-4">
                <InputField label="Resume URL" value={tempContent.resumeUrl} onChange={e => handleTopLevelFieldChange('resumeUrl', e.target.value)} placeholder="e.g., /resume.pdf" />
            </div>
          </div>
          {/* Certifications Section */}
          <div>
            <h3 className="text-red-300 mb-2 font-bold">CERTIFICATIONS</h3>
            <div className="space-y-4">
               {tempContent.certs.map((cert, i) => (
                   <div key={i} className="bg-slate-900/50 p-3 rounded border border-slate-700 relative">
                       <button onClick={() => removeListItem('certs', i)} className="absolute top-2 right-2 text-red-500 hover:text-red-300">&times;</button>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                           <InputField label="Name" value={cert.name} onChange={e => handleListItemChange('certs', i, 'name', e.target.value)} />
                           <InputField label="Issuer" value={cert.issuer} onChange={e => handleListItemChange('certs', i, 'issuer', e.target.value)} />
                           <InputField label="Logo URL (Fallback)" value={cert.logo} onChange={e => handleListItemChange('certs', i, 'logo', e.target.value)} />
                           <InputField label="Image URL" value={cert.imageUrl} onChange={e => handleListItemChange('certs', i, 'imageUrl', e.target.value)} />
                           <InputField label="Verify URL" value={cert.verifyUrl} onChange={e => handleListItemChange('certs', i, 'verifyUrl', e.target.value)} />
                       </div>
                   </div>
               ))}
            </div>
            <button onClick={() => addListItem('certs')} className="mt-2 text-sm bg-red-600/50 hover:bg-red-500/80 px-3 py-1 rounded">+ Add Certificate</button>
          </div>
        </div>
        <div className="p-4 border-t border-red-500/50 flex justify-between items-center">
          <div className="text-sm">
            {saveStatus && (
              <span className={`${saveStatus.includes('✓') ? 'text-green-400' : saveStatus.includes('✗') ? 'text-red-400' : 'text-yellow-400'}`}>
                {saveStatus}
              </span>
            )}
          </div>
          <div>
            <button onClick={() => setAdminOpen(false)} className="text-slate-300 px-4 py-2 rounded mr-2 hover:bg-slate-700">Cancel</button>
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className={`px-6 py-2 rounded font-bold ${isSaving ? 'bg-slate-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500'} text-white`}
            >
              {isSaving ? 'SAVING...' : 'SAVE & DEPLOY'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  const [content, setContent] = useState(initialContent);
  const [cliActive, setCliActive] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const adminCommandRef = useRef("");

  // Load content from Firestore on app startup
  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      try {
        const firestoreContent = await loadContentFromFirestore();
        if (firestoreContent) {
          setContent(firestoreContent);
        }
      } catch (error) {
        console.error('Error loading content on startup:', error);
        // Continue with initial content if loading fails
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '~') {
        e.preventDefault();
        setCliActive(prev => !prev);
      }
      if (e.key === 'Escape') {
        if (cliActive) setCliActive(false);
        if (adminOpen) setAdminOpen(false);
      }
      
      // Admin panel command: /admin
      if (e.key.length === 1 || e.key === '/') {
        adminCommandRef.current += e.key.toLowerCase();
      }
      
      if (adminCommandRef.current.endsWith('/admin')) {
          setAdminOpen(true);
          adminCommandRef.current = ""; // Reset command
      }
      
      // Reset command if user types something else
      setTimeout(() => {
          if (adminCommandRef.current && !'/admin'.startsWith(adminCommandRef.current)) {
              adminCommandRef.current = "";
          }
      }, 1500);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [cliActive, adminOpen]);

  return (
    <main className="bg-[#0a101f] min-h-screen overflow-x-hidden">
      <ParticleCanvas />
      <CursorTrail />
      
      {/* Loading Screen */}
      {isLoading && (
        <div className="fixed inset-0 bg-[#0a101f] z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-cyan-300 font-mono text-sm">Loading portfolio data...</p>
          </div>
        </div>
      )}
      
      <div className={`transition-all duration-500 ${cliActive || adminOpen ? 'opacity-20 blur-sm scale-95' : 'opacity-100'}`}>
        <GUI content={content} />
      </div>

      {cliActive && <CLI content={content} setContent={setContent} setCliActive={setCliActive} />}
      {adminOpen && <AdminPanel content={content} setContent={setContent} setAdminOpen={setAdminOpen} />}
    </main>
  );
}
