import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { formatTimeIST, formatDateIST, getCurrentTimeIST, INDIA_TIMEZONE } from './utils/timezone';

// Add custom CSS for animations
const customStyles = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
    20%, 40%, 60%, 80% { transform: translateX(10px); }
  }
  .animate-shake {
    animation: shake 0.5s ease-in-out;
  }
  
  @keyframes waterJelly {
    0%, 100% { 
      transform: translateY(0px) rotate(0deg);
      border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
    }
    25% { 
      transform: translateY(-5px) rotate(0.5deg);
      border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
    }
    50% { 
      transform: translateY(0px) rotate(1deg);
      border-radius: 50% 60% 30% 60% / 30% 60% 70% 40%;
    }
    75% { 
      transform: translateY(-3px) rotate(-0.5deg);
      border-radius: 60% 30% 60% 40% / 70% 40% 50% 60%;
    }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 255, 0.3); }
    50% { box-shadow: 0 0 40px rgba(0, 255, 255, 0.6), 0 0 60px rgba(0, 255, 255, 0.3); }
  }
  
  @keyframes attackHeat {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.8; }
  }
  
  .water-jelly {
    animation: waterJelly 6s ease-in-out infinite;
  }
  
  .float-animation {
    animation: float 3s ease-in-out infinite;
  }
  
  .glow-effect {
    animation: glow 2s ease-in-out infinite alternate;
  }
  
  .attack-heat {
    animation: attackHeat 3s ease-in-out infinite;
  }
  
  /* Dark Theme (Default) - Eye-friendly */
  .theme-dark {
    --bg-primary: #1a1d29;
    --bg-secondary: rgba(30, 35, 50, 0.8);
    --bg-tertiary: rgba(30, 35, 50, 0.9);
    --text-primary: #e2e8f0;
    --text-secondary: #cbd5e1;
    --text-accent: #7dd3fc;
    --border-primary: rgba(226, 232, 240, 0.1);
    --border-accent: rgba(125, 211, 252, 0.3);
    --glass-bg: rgba(30, 35, 50, 0.8);
    --glass-bg-intense: rgba(30, 35, 50, 0.9);
  }
  
  /* Light Theme - Eye-friendly */
  .theme-light {
    --bg-primary: #fefefe;
    --bg-secondary: rgba(248, 250, 252, 0.9);
    --bg-tertiary: rgba(241, 245, 249, 0.95);
    --text-primary: #334155;
    --text-secondary: #64748b;
    --text-accent: #0369a1;
    --border-primary: rgba(51, 65, 85, 0.1);
    --border-accent: rgba(3, 105, 161, 0.2);
    --glass-bg: rgba(248, 250, 252, 0.9);
    --glass-bg-intense: rgba(241, 245, 249, 0.95);
  }
  
  .glass-morphism {
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    background: var(--glass-bg);
    border: 1px solid var(--border-primary);
    box-shadow: 
      0 8px 32px 0 rgba(31, 38, 135, 0.37),
      inset 0 1px 0 rgba(255, 255, 255, 0.1),
      0 0 0 1px rgba(255, 255, 255, 0.05);
  }
  
  .glass-morphism-intense {
    backdrop-filter: blur(20px) saturate(200%);
    -webkit-backdrop-filter: blur(20px) saturate(200%);
    background: var(--glass-bg-intense);
    border: 1px solid var(--border-accent);
    box-shadow: 
      0 12px 40px 0 rgba(0, 255, 255, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1),
      0 0 0 1px var(--border-accent);
  }
  
  @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
  
  body {
    font-family: 'Inter', sans-serif;
  }
  
  .font-mono {
    font-family: 'Fira Code', monospace;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = customStyles;
  document.head.appendChild(styleSheet);
}

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
  softSkills: [
    { name: "Problem Solving", level: 85 },
    { name: "Critical Thinking", level: 80 },
    { name: "Team Collaboration", level: 75 },
    { name: "Adaptability", level: 90 },
    { name: "Communication", level: 78 },
  ],
  projects: [
    { 
      name: "Threat Actor Profile Study", 
      description: "Analyzed public reports on APT28 to create a comprehensive profile of their TTPs and infrastructure.", 
      year: "Current",
      hasDemo: false
    },
    { 
      name: "Phishing Kit Analysis", 
      description: "Deconstructed a captured phishing kit to understand its operation and identify unique indicators.", 
      year: "Current",
      hasDemo: false
    },
    { 
      name: "IOC Hunter Pro", 
      description: "Interactive threat hunting simulation with real-time IOC detection and analysis capabilities.", 
      year: "Live Demo",
      hasDemo: true,
      demoType: "ioc-hunter"
    },
    { 
      name: "Home Lab Network Monitoring", 
      description: "Set up a home lab with Security Onion to practice traffic analysis and alert triage.", 
      year: "Ongoing",
      hasDemo: false
    },
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
      
      // Ensure critical project properties are preserved
      const mergedContent = {
        ...initialContent,  // Start with initial content as base
        ...content,         // Override with Firestore data
        projects: content.projects?.map(project => {
          // Find matching project in initial content to preserve hasDemo/demoType
          const initialProject = initialContent.projects.find(p => p.name === project.name);
          return {
            ...project,
            hasDemo: initialProject?.hasDemo || project.hasDemo || false,
            demoType: initialProject?.demoType || project.demoType
          };
        }) || initialContent.projects  // Fallback to initial projects if Firestore projects is empty
      };
      
      console.log('Content loaded from Firestore successfully');
      return mergedContent;
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

const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  const [timezone, setTimezone] = useState(INDIA_TIMEZONE);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    try {
      if (timezone === 'UTC') {
        const utcOptions = {
          timeZone: 'UTC',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        };
        return {
          time: date.toLocaleTimeString('en-US', { ...utcOptions, timeZoneName: 'short' }).split(' ')[0],
          date: date.toLocaleDateString('en-US', utcOptions),
          zone: 'UTC'
        };
      } else {
        return {
          time: formatTimeIST(date),
          date: formatDateIST(date),
          zone: 'IST'
        };
      }
    } catch (error) {
      console.warn('Error formatting time:', error);
      return {
        time: date.toLocaleTimeString(),
        date: date.toLocaleDateString(),
        zone: 'LOCAL'
      };
    }
  };

  const { time: currentTime, date: currentDate, zone } = formatTime(time);

  return (
    <div className="glass-morphism rounded-xl p-4 text-xs font-mono hover:glass-morphism-intense transition-all duration-300">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-cyan-400 uppercase">// System Time</h3>
        <button 
          onClick={() => setTimezone(prev => prev === 'UTC' ? INDIA_TIMEZONE : 'UTC')}
          className="text-xs glass-morphism hover:bg-slate-600/50 px-2 py-1 rounded text-cyan-300 transition-all duration-200"
        >
          {zone}
        </button>
      </div>
      <div className="space-y-1">
        <div className="text-cyan-300 text-lg font-bold tracking-wider">{currentTime}</div>
        <div className="text-slate-400">{currentDate}</div>
        <div className="text-green-400 text-xs animate-pulse">● SYSTEM ACTIVE</div>
      </div>
    </div>
  );
};

const ThreatLevel = ({ threatFeedData }) => {
  const [level, setLevel] = useState('LOW');
  const [color, setColor] = useState('text-green-400');
  const [reason, setReason] = useState('Normal operations');

  useEffect(() => {
    const levels = [
      { level: 'LOW', color: 'text-green-400', bg: 'bg-green-400/20', reasons: ['Normal operations', 'No active threats', 'Systems secure'] },
      { level: 'ELEVATED', color: 'text-yellow-400', bg: 'bg-yellow-400/20', reasons: ['Suspicious activity detected', 'Monitoring increased', 'Potential phishing'] },
      { level: 'HIGH', color: 'text-orange-400', bg: 'bg-orange-400/20', reasons: ['Active threat detected', 'Multiple IOCs found', 'Malware signatures'] },
      { level: 'CRITICAL', color: 'text-red-400', bg: 'bg-red-400/20', reasons: ['Breach detected', 'APT activity', 'Zero-day exploit'] }
    ];
    
    // Determine threat level based on feed data
    let selectedLevel;
    if (threatFeedData && threatFeedData.includes('APT')) {
      selectedLevel = levels[3]; // CRITICAL
    } else if (threatFeedData && (threatFeedData.includes('malware') || threatFeedData.includes('ransomware'))) {
      selectedLevel = levels[2]; // HIGH
    } else if (threatFeedData && (threatFeedData.includes('phishing') || threatFeedData.includes('suspicious'))) {
      selectedLevel = levels[1]; // ELEVATED
    } else {
      // Random selection for demonstration if no specific threats
      selectedLevel = levels[Math.floor(Math.random() * levels.length)];
    }
    
    setLevel(selectedLevel.level);
    setColor(selectedLevel.color);
    setReason(selectedLevel.reasons[Math.floor(Math.random() * selectedLevel.reasons.length)]);
  }, [threatFeedData]);

  return (
    <div className="glass-morphism rounded-xl p-4 text-xs font-mono hover:glass-morphism-intense transition-all duration-300">
      <h3 className="text-cyan-400 mb-2 uppercase">// Threat Level</h3>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-3 h-3 rounded-full ${color.replace('text-', 'bg-')} animate-pulse`}></div>
        <span className={`font-bold ${color}`}>{level}</span>
      </div>
      <div className="text-slate-400 text-xs mb-1">
        {reason}
      </div>
      <div className="text-slate-500 text-xs">
        Monitoring: {Math.floor(Math.random() * 1000 + 500)} endpoints
      </div>
    </div>
  );
};

const NetworkStatus = () => {
  const [stats, setStats] = useState({
    connections: 42,
    bandwidth: '156.7',
    latency: '12ms'
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats({
        connections: Math.floor(Math.random() * 100 + 20),
        bandwidth: (Math.random() * 200 + 50).toFixed(1),
        latency: Math.floor(Math.random() * 50 + 5) + 'ms'
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-morphism rounded-xl p-4 text-xs font-mono hover:glass-morphism-intense transition-all duration-300">
      <h3 className="text-cyan-400 mb-2 uppercase">// Network Status</h3>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="text-slate-400">Connections:</span>
          <span className="text-cyan-300">{stats.connections}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Bandwidth:</span>
          <span className="text-cyan-300">{stats.bandwidth} Mbps</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Latency:</span>
          <span className="text-cyan-300">{stats.latency}</span>
        </div>
      </div>
    </div>
  );
};

const ParticleCanvas = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let particles = [];
    const particleCount = 50; // Reduced particle count for less visual noise
    
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.3; // Smaller, subtler particles
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        // Softer, warmer colors that are easier on the eyes
        const colors = [
          `rgba(139, 191, 244, ${Math.random() * 0.3 + 0.1})`, // Soft blue
          `rgba(165, 180, 252, ${Math.random() * 0.3 + 0.1})`, // Lavender
          `rgba(196, 181, 253, ${Math.random() * 0.3 + 0.1})`, // Light purple
          `rgba(167, 243, 208, ${Math.random() * 0.3 + 0.1})`, // Mint green
          `rgba(254, 202, 202, ${Math.random() * 0.3 + 0.1})`, // Soft pink
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.pulse = Math.random() * Math.PI * 2;
      }
      update() {
        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
        this.x += this.speedX;
        this.y += this.speedY;
        this.pulse += 0.01; // Slower, gentler pulsing
      }
      draw() {
        const pulsedSize = this.size + Math.sin(this.pulse) * 0.2; // Reduced pulse intensity
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, pulsedSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Subtle glow effect
        ctx.shadowBlur = 8; // Reduced glow
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0;
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
      
      // Draw connections between nearby particles
      particles.forEach((particle, i) => {
        particle.update();
        particle.draw();
        
        // Draw lines between nearby particles
        particles.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150) {
            ctx.strokeStyle = `rgba(0, 255, 255, ${0.1 * (1 - distance / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      });
      
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

const ThemeToggle = ({ isDarkMode, setIsDarkMode }) => {
  return (
    <button
      onClick={() => setIsDarkMode(!isDarkMode)}
      className="fixed top-4 right-4 z-40 glass-morphism rounded-full p-3 hover:glass-morphism-intense transition-all duration-300 group"
      title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-6 h-6">
        {isDarkMode ? (
          <div className="text-yellow-400 group-hover:rotate-180 transition-transform duration-500">☀️</div>
        ) : (
          <div className="text-blue-400 group-hover:rotate-180 transition-transform duration-500">🌙</div>
        )}
      </div>
    </button>
  );
};

const MitreAttackHeatmap = ({ isVisible, setIsVisible, isDarkMode }) => {
  const [selectedTactic, setSelectedTactic] = useState(null);
  
  const mitreTactics = [
    { id: 'TA0001', name: 'Initial Access', techniques: 12, heat: 85, color: 'bg-red-500' },
    { id: 'TA0002', name: 'Execution', techniques: 8, heat: 75, color: 'bg-orange-500' },
    { id: 'TA0003', name: 'Persistence', techniques: 15, heat: 90, color: 'bg-red-600' },
    { id: 'TA0004', name: 'Privilege Escalation', techniques: 10, heat: 70, color: 'bg-yellow-500' },
    { id: 'TA0005', name: 'Defense Evasion', techniques: 20, heat: 95, color: 'bg-red-700' },
    { id: 'TA0006', name: 'Credential Access', techniques: 14, heat: 80, color: 'bg-orange-600' },
    { id: 'TA0007', name: 'Discovery', techniques: 16, heat: 65, color: 'bg-yellow-600' },
    { id: 'TA0008', name: 'Lateral Movement', techniques: 9, heat: 60, color: 'bg-green-500' },
    { id: 'TA0009', name: 'Collection', techniques: 11, heat: 55, color: 'bg-green-600' },
    { id: 'TA0010', name: 'Exfiltration', techniques: 7, heat: 45, color: 'bg-blue-500' },
    { id: 'TA0011', name: 'Command and Control', techniques: 13, heat: 70, color: 'bg-purple-500' },
    { id: 'TA0040', name: 'Impact', techniques: 6, heat: 40, color: 'bg-blue-600' }
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-morphism-intense rounded-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-cyan-400 font-mono uppercase tracking-wider">
            // MITRE ATT&CK Heatmap
          </h2>
          <button
            onClick={() => setIsVisible(false)}
            className="text-slate-400 hover:text-white text-2xl transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {mitreTactics.map((tactic) => (
            <div
              key={tactic.id}
              className={`glass-morphism rounded-lg p-4 cursor-pointer transition-all duration-300 hover:scale-105 border-2 attack-heat ${
                selectedTactic?.id === tactic.id ? 'border-cyan-400' : 'border-transparent'
              }`}
              onClick={() => setSelectedTactic(tactic)}
              style={{ 
                background: `linear-gradient(135deg, ${tactic.color}20, ${tactic.color}40)`,
                borderColor: selectedTactic?.id === tactic.id ? '#0dcaf0' : 'transparent'
              }}
            >
              <div className="text-center">
                <div className={`w-full h-2 ${tactic.color} rounded-full mb-2 opacity-${Math.floor(tactic.heat/10)*10}`}></div>
                <h3 className="font-mono text-xs text-slate-200 mb-1">{tactic.id}</h3>
                <p className="text-xs text-slate-300 font-semibold">{tactic.name}</p>
                <div className="flex justify-between mt-2 text-xs">
                  <span className="text-slate-400">{tactic.techniques} techniques</span>
                  <span className="text-cyan-300">{tactic.heat}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {selectedTactic && (
          <div className="glass-morphism rounded-lg p-4 border border-cyan-400/30">
            <h3 className="text-lg font-bold text-cyan-300 mb-2">{selectedTactic.name}</h3>
            <p className="text-slate-300 text-sm mb-2">
              Tactic ID: <span className="text-cyan-400 font-mono">{selectedTactic.id}</span>
            </p>
            <p className="text-slate-300 text-sm mb-2">
              Techniques: <span className="text-orange-400">{selectedTactic.techniques}</span> | 
              Heat Level: <span className="text-red-400">{selectedTactic.heat}%</span>
            </p>
            <p className="text-slate-400 text-xs">
              This tactic represents methods adversaries use during the {selectedTactic.name.toLowerCase()} phase of their attack lifecycle.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const CTIQuiz = ({ isVisible, setIsVisible, isDarkMode }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  const questions = [
    {
      question: "What does IOC stand for in cybersecurity?",
      options: ["Internet Operations Center", "Indicator of Compromise", "Internal Ops Command", "Integrated Online Control"],
      correct: 1,
      explanation: "IOC stands for Indicator of Compromise - digital artifacts that suggest malicious activity."
    },
    {
      question: "Which MITRE ATT&CK tactic focuses on maintaining access to systems?",
      options: ["Initial Access", "Persistence", "Discovery", "Impact"],
      correct: 1,
      explanation: "Persistence tactics help adversaries maintain their foothold in systems across restarts and credential changes."
    },
    {
      question: "What is the primary purpose of OSINT in CTI?",
      options: ["Hacking systems", "Gathering public intelligence", "Creating malware", "Network penetration"],
      correct: 1,
      explanation: "OSINT (Open Source Intelligence) involves collecting information from publicly available sources for threat analysis."
    },
    {
      question: "Which file format is commonly used for sharing threat intelligence?",
      options: ["PDF", "STIX/TAXII", "Excel", "Word"],
      correct: 1,
      explanation: "STIX (Structured Threat Information eXpression) and TAXII are industry standards for threat intelligence sharing."
    },
    {
      question: "What does APT stand for in cybersecurity?",
      options: ["Application Protection Tool", "Advanced Persistent Threat", "Automated Patch Technology", "Active Prevention Technique"],
      correct: 1,
      explanation: "APT stands for Advanced Persistent Threat - sophisticated, long-term cyberattacks typically by nation-states."
    }
  ];

  const handleAnswer = (selectedOption) => {
    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);
    
    if (selectedOption === questions[currentQuestion].correct) {
      setScore(score + 1);
    }
    
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setAnswers([]);
    setShowResults(false);
    setQuizStarted(false);
  };

  const getScoreMessage = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 80) return "Outstanding! You'd make a great SOC analyst! 🏆";
    if (percentage >= 60) return "Good knowledge! Keep learning CTI fundamentals! 👍";
    if (percentage >= 40) return "Getting there! Study more threat intelligence! 📚";
    return "Keep practicing! CTI mastery takes time! 💪";
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-morphism-intense rounded-2xl p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-cyan-400 font-mono uppercase tracking-wider">
            // CTI Knowledge Quiz
          </h2>
          <button
            onClick={() => setIsVisible(false)}
            className="text-slate-400 hover:text-white text-2xl transition-colors"
          >
            ✕
          </button>
        </div>

        {!quizStarted ? (
          <div className="text-center">
            <div className="text-6xl mb-4">🧠</div>
            <h3 className="text-xl font-bold text-slate-200 mb-4">Test Your CTI Knowledge!</h3>
            <p className="text-slate-400 mb-6">
              Answer {questions.length} questions about Cyber Threat Intelligence and see if you have what it takes to be a SOC analyst!
            </p>
            <button
              onClick={() => setQuizStarted(true)}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Start Quiz
            </button>
          </div>
        ) : showResults ? (
          <div className="text-center">
            <div className="text-6xl mb-4">
              {score >= questions.length * 0.8 ? '🏆' : score >= questions.length * 0.6 ? '👍' : '📚'}
            </div>
            <h3 className="text-2xl font-bold text-cyan-300 mb-4">Quiz Complete!</h3>
            <div className="bg-slate-800/50 rounded-lg p-6 mb-6">
              <p className="text-3xl font-bold text-white mb-2">
                {score} / {questions.length}
              </p>
              <p className="text-lg text-slate-300 mb-4">
                {Math.round((score / questions.length) * 100)}% Correct
              </p>
              <p className="text-cyan-400 font-semibold text-lg">
                {getScoreMessage()}
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={resetQuiz}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300"
              >
                Try Again
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-slate-400">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                <span className="text-sm text-cyan-400">
                  Score: {score}
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-slate-200 mb-6">
              {questions[currentQuestion].question}
            </h3>

            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className="w-full text-left p-4 glass-morphism rounded-lg hover:glass-morphism-intense transition-all duration-300 hover:scale-102 hover:border-cyan-400/50"
                >
                  <span className="text-cyan-400 font-mono mr-3">{String.fromCharCode(65 + index)}.</span>
                  <span className="text-slate-300">{option}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const IOCHunterDemo = ({ isVisible, setIsVisible, isDarkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIOC, setSelectedIOC] = useState(null);

  const mockIOCs = [
    {
      indicator: "185.220.101.182",
      type: "IP Address",
      threat: "Malicious C2 Server",
      confidence: 95,
      firstSeen: new Date('2025-01-15T10:30:00+05:30').toLocaleDateString('en-IN', { 
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }),
      source: "AlienVault OTX",
      tags: ["APT28", "Command & Control", "Infrastructure"],
      details: "Known C2 server associated with APT28 campaigns targeting government entities."
    },
    {
      indicator: "evil-malware.exe",
      type: "File Hash",
      threat: "Ransomware Payload",
      confidence: 88,
      firstSeen: new Date('2025-01-20T14:15:00+05:30').toLocaleDateString('en-IN', { 
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }),
      source: "VirusTotal",
      tags: ["Ransomware", "BlackCat", "Encryption"],
      details: "BlackCat ransomware variant with advanced evasion capabilities."
    },
    {
      indicator: "phishing-bank-secure.com",
      type: "Domain",
      threat: "Phishing Infrastructure",
      confidence: 92,
      firstSeen: new Date('2025-01-18T09:45:00+05:30').toLocaleDateString('en-IN', { 
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }),
      source: "Internal Feeds",
      tags: ["Phishing", "Financial", "Credential Theft"],
      details: "Phishing domain mimicking legitimate banking services to steal credentials."
    },
    {
      indicator: "d41d8cd98f00b204e9800998ecf8427e",
      type: "MD5 Hash",
      threat: "Trojan Backdoor",
      confidence: 78,
      firstSeen: new Date('2025-01-22T16:20:00+05:30').toLocaleDateString('en-IN', { 
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }),
      source: "Hybrid Analysis",
      tags: ["Backdoor", "Persistence", "Remote Access"],
      details: "Trojan providing persistent remote access to compromised systems."
    }
  ];

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    setTimeout(() => {
      const results = mockIOCs.filter(ioc => 
        ioc.indicator.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ioc.threat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ioc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setSearchResults(results.length > 0 ? results : mockIOCs);
      setIsSearching(false);
    }, 1500);
  };

  const getThreatColor = (confidence) => {
    if (confidence >= 90) return 'text-red-400';
    if (confidence >= 70) return 'text-orange-400';
    if (confidence >= 50) return 'text-yellow-400';
    return 'text-green-400';
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-morphism-intense rounded-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-cyan-400 font-mono uppercase tracking-wider">
            // IOC Hunter Pro - Live Demo
          </h2>
          <button
            onClick={() => setIsVisible(false)}
            className="text-slate-400 hover:text-white text-2xl transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search IOCs, threats, or tags (e.g., 'APT28', 'ransomware', '185.220')"
              className="flex-1 bg-slate-900/50 text-slate-200 p-3 rounded-lg border border-cyan-400/30 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-600 disabled:to-slate-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 font-mono"
            >
              {isSearching ? '🔍 HUNTING...' : '🎯 HUNT'}
            </button>
          </div>
          
          {isSearching && (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-cyan-400 font-mono">Scanning threat intelligence feeds...</p>
            </div>
          )}
        </div>

        {searchResults.length > 0 && !isSearching && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-200 border-b border-cyan-400/30 pb-2">
                Threat Indicators ({searchResults.length})
              </h3>
              {searchResults.map((ioc, index) => (
                <div
                  key={index}
                  className={`glass-morphism rounded-lg p-4 cursor-pointer transition-all duration-300 hover:scale-102 border-2 ${
                    selectedIOC?.indicator === ioc.indicator ? 'border-cyan-400' : 'border-transparent'
                  }`}
                  onClick={() => setSelectedIOC(ioc)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-mono text-sm text-cyan-300">{ioc.type}</p>
                      <p className="font-bold text-slate-200 break-all">{ioc.indicator}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${getThreatColor(ioc.confidence)}`}>
                        {ioc.confidence}%
                      </div>
                      <div className="text-xs text-slate-400">confidence</div>
                    </div>
                  </div>
                  <p className="text-sm text-orange-400 mb-2">{ioc.threat}</p>
                  <div className="flex flex-wrap gap-1">
                    {ioc.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {selectedIOC && (
              <div className="glass-morphism rounded-lg p-6">
                <h3 className="text-lg font-bold text-cyan-300 mb-4">Threat Analysis</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-400 uppercase tracking-wide">Indicator</label>
                    <p className="font-mono text-cyan-300 break-all">{selectedIOC.indicator}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 uppercase tracking-wide">Threat Type</label>
                    <p className="text-orange-400 font-semibold">{selectedIOC.threat}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 uppercase tracking-wide">Confidence Level</label>
                    <div className="flex items-center gap-2">
                      <div className={`text-lg font-bold ${getThreatColor(selectedIOC.confidence)}`}>
                        {selectedIOC.confidence}%
                      </div>
                      <div className="flex-1 bg-slate-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            selectedIOC.confidence >= 90 ? 'bg-red-400' :
                            selectedIOC.confidence >= 70 ? 'bg-orange-400' :
                            selectedIOC.confidence >= 50 ? 'bg-yellow-400' : 'bg-green-400'
                          }`}
                          style={{ width: `${selectedIOC.confidence}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 uppercase tracking-wide">Source</label>
                    <p className="text-slate-300">{selectedIOC.source}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 uppercase tracking-wide">First Seen</label>
                    <p className="text-slate-300">{selectedIOC.firstSeen}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 uppercase tracking-wide">Tags</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedIOC.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs bg-cyan-600/20 text-cyan-300 px-2 py-1 rounded-full border border-cyan-400/30"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 uppercase tracking-wide">Analysis</label>
                    <p className="text-slate-300 text-sm leading-relaxed">{selectedIOC.details}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {searchResults.length === 0 && !isSearching && searchTerm && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-slate-400">No indicators found. Try searching for 'APT28' or 'ransomware'</p>
          </div>
        )}
      </div>
    </div>
  );
};

const GlassCard = ({ title, children, className, variant = "default", intense = false }) => {
  const variants = {
    default: intense 
      ? "glass-morphism-intense" 
      : "glass-morphism",
    accent: intense 
      ? "glass-morphism-intense border-blue-400/40 shadow-blue-500/20" 
      : "glass-morphism border-blue-400/20 shadow-blue-500/10",
    warm: intense 
      ? "glass-morphism-intense border-purple-400/40 shadow-purple-500/20" 
      : "glass-morphism border-purple-400/20 shadow-purple-500/10"
  };

  return (
    <div className={`${variants[variant]} rounded-xl p-6 transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] hover:border-opacity-40 ${className}`}>
      {title && (
        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent mb-4 tracking-widest uppercase font-mono">
          // {title}
        </h2>
      )}
      <div className="text-slate-300 font-mono text-sm leading-relaxed">{children}</div>
    </div>
  );
};

const SystemMetrics = () => {
  const [metrics, setMetrics] = useState({
    cpu: 0,
    memory: 0,
    disk: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 100),
        disk: Math.floor(Math.random() * 100)
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const MetricBar = ({ label, value, color = "cyan" }) => (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">{label}</span>
        <span className={`text-${color}-300`}>{value}%</span>
      </div>
      <div className="w-full bg-slate-700/50 rounded-full h-1">
        <div 
          className={`bg-${color}-400 h-1 rounded-full transition-all duration-1000 shadow-[0_0_4px_rgba(0,255,255,0.5)]`} 
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="glass-morphism rounded-xl p-4 text-xs font-mono hover:glass-morphism-intense transition-all duration-300">
      <h3 className="text-cyan-400 mb-3 uppercase">// System Metrics</h3>
      <MetricBar label="CPU Usage" value={metrics.cpu} color="cyan" />
      <MetricBar label="Memory" value={metrics.memory} color="green" />
      <MetricBar label="Disk I/O" value={metrics.disk} color="yellow" />
    </div>
  );
};

const SkillBar = ({ name, level, isDarkMode }) => {
  const getSkillColor = (skillName) => {
    const skillColors = {
      "Threat Analysis": "from-rose-400 to-pink-400",
      "OSINT": "from-sky-400 to-blue-400", 
      "Python Scripting": "from-emerald-400 to-green-400",
      "Log Analysis (SIEM)": "from-violet-400 to-purple-400",
      "Malware Triage": "from-amber-400 to-orange-400",
      "Network Fundamentals": "from-indigo-400 to-blue-400",
      "Problem Solving": "from-teal-400 to-cyan-400",
      "Critical Thinking": "from-purple-400 to-violet-400",
      "Team Collaboration": "from-pink-400 to-rose-400",
      "Adaptability": "from-blue-400 to-sky-400",
      "Communication": "from-yellow-400 to-amber-400"
    };
    return skillColors[skillName] || "from-sky-400 to-blue-400";
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{name}</span>
        <span className="text-sky-400 text-sm font-mono">{level}%</span>
      </div>
      <div className={`w-full rounded-full h-2 overflow-hidden ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-300/50'}`}>
        <div 
          className={`bg-gradient-to-r ${getSkillColor(name)} h-2 rounded-full shadow-lg transition-all duration-1000 ease-out`}
          style={{ width: `${level}%` }}
        >
          <div className="h-full bg-gradient-to-r from-white/20 to-transparent rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

const ThreatFeedWidget = ({ apiKey, onFeedUpdate }) => {
  const [feed, setFeed] = useState('Initializing threat feed...');
  const [pulses, setPulses] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    if (!apiKey) {
      setFeed('OTX API Key missing...');
      setIsLoading(false);
      return;
    }
    const fetchOtxPulses = async () => {
      setFeed('Fetching intel from OTX...');
      setIsLoading(true);
      try {
        const response = await fetch('https://otx.alienvault.com/api/v1/pulses/subscribed', {
          headers: { 'X-OTX-API-KEY': apiKey }
        });
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const threatNames = data.results.map(p => p.name);
          setPulses(threatNames);
          setLastUpdate(new Date());
        } else {
          setFeed('No threat pulses found.');
        }
      } catch (error) {
        console.error("OTX Fetch Error:", error);
        // Fallback to dummy threat data for demonstration
        const dummyThreats = [
          'APT28 Infrastructure Update',
          'Phishing Campaign Targeting Financial Sector',
          'Ransomware Family Analysis: BlackCat',
          'Suspicious Domain Registration Activity',
          'Malware Sample: Emotet Variant Detected',
          'Social Engineering Campaign Analysis',
          'IOC Update: New C2 Servers Identified'
        ];
        setPulses(dummyThreats);
        setFeed('Using demo threat data...');
        setLastUpdate(new Date());
      } finally {
        setIsLoading(false);
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
    if (pulses.length > 0) {
      const currentThreat = pulses[currentIndex];
      setFeed(currentThreat);
      // Notify parent component about feed update for threat level integration
      if (onFeedUpdate) {
        onFeedUpdate(currentThreat);
      }
    }
  }, [currentIndex, pulses, onFeedUpdate]);

  return (
    <div className="glass-morphism-intense rounded-xl p-4 text-xs font-mono water-jelly glow-effect">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-cyan-400 uppercase">// OTX Live Threat Feed</h3>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
          ) : (
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          )}
          {lastUpdate && (
            <span className="text-slate-500 text-xs">
              {getCurrentTimeIST()}
            </span>
          )}
        </div>
      </div>
      <div className="mb-2">
        <pre className="text-slate-300 whitespace-pre-wrap min-h-[2rem] max-h-[3rem] overflow-hidden">{feed}</pre>
      </div>
      {pulses.length > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-slate-500 text-xs">
            {currentIndex + 1} of {pulses.length} threats
          </span>
          <div className="flex gap-1">
            {pulses.slice(0, 5).map((_, i) => (
              <div
                key={i}
                className={`w-1 h-1 rounded-full ${
                  i === currentIndex % 5 ? 'bg-cyan-400' : 'bg-slate-600'
                }`}
              ></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CertificateCard = ({ cert }) => {
    const [logoSrc, setLogoSrc] = useState(cert.logo);
    const [isHovered, setIsHovered] = useState(false);

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
        <div 
            className="bg-slate-800/50 p-4 rounded-lg flex items-center gap-4 border border-slate-700 transition-all duration-300 hover:border-cyan-400/50 hover:bg-slate-800/80 hover:shadow-lg hover:shadow-cyan-500/10 group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative">
                <img 
                    src={logoSrc} 
                    alt={`${cert.issuer} logo`} 
                    className={`w-16 h-16 p-1 bg-white/80 rounded-md object-contain transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`} 
                    onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/64x64/ffffff/000000?text=Logo'; }}
                />
                {isHovered && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                        <span className="text-black text-xs">✓</span>
                    </div>
                )}
            </div>
            <div className="flex-grow">
                <h4 className="font-bold text-white group-hover:text-cyan-300 transition-colors">{cert.name}</h4>
                <p className="text-sm text-slate-400">{cert.issuer}</p>
                <div className="flex gap-2 mt-2">
                    <a href={cert.imageUrl} target="_blank" rel="noopener noreferrer" className="text-xs bg-cyan-600/50 hover:bg-cyan-500/80 px-2 py-1 rounded transition-all duration-200 hover:scale-105">
                        👁️ View
                    </a>
                    <a href={cert.verifyUrl} target="_blank" rel="noopener noreferrer" className="text-xs bg-slate-600/50 hover:bg-slate-500/80 px-2 py-1 rounded transition-all duration-200 hover:scale-105">
                        🔗 Verify
                    </a>
                </div>
            </div>
        </div>
    );
};


const GUI = ({ content, isDarkMode, setIsDarkMode }) => {
  const aboutText = useTypewriter(content.about, 20, 10, 3000);
  const [currentThreatFeed, setCurrentThreatFeed] = useState('');
  const [showMitreHeatmap, setShowMitreHeatmap] = useState(false);
  const [showCTIQuiz, setShowCTIQuiz] = useState(false);
  const [showIOCDemo, setShowIOCDemo] = useState(false);

  const handleFeedUpdate = (feedData) => {
    setCurrentThreatFeed(feedData);
  };

  const handleProjectDemo = (demoType) => {
    if (demoType === 'ioc-hunter') {
      setShowIOCDemo(true);
    }
  };

  return (
    <div className={`min-h-screen w-full p-4 sm:p-8 md:p-12 transition-all duration-500 ${
      isDarkMode ? 'theme-dark text-white' : 'theme-light text-slate-900'
    }`} style={{ backgroundColor: isDarkMode ? '#1a1d29' : '#fefefe' }}>
      
      <ThemeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

      {/* Interactive Features Toolbar */}
      <div className="fixed top-4 left-4 z-40 flex flex-col gap-2">
        <button
          onClick={() => setShowMitreHeatmap(true)}
          className="glass-morphism rounded-lg p-3 hover:glass-morphism-intense transition-all duration-300 group"
          title="View MITRE ATT&CK Heatmap"
        >
          <div className="text-red-400 group-hover:scale-110 transition-transform">🗺️</div>
        </button>
        <button
          onClick={() => setShowCTIQuiz(true)}
          className="glass-morphism rounded-lg p-3 hover:glass-morphism-intense transition-all duration-300 group"
          title="Take CTI Quiz"
        >
          <div className="text-yellow-400 group-hover:scale-110 transition-transform">🧠</div>
        </button>
      </div>

      {/* Hero/Intro Section - Priority for HR */}
      <div className="max-w-7xl mx-auto mb-8">
        <GlassCard 
          title={`${content.whoami.name} // ${content.whoami.handle}`} 
          variant="default" 
          intense={true}
          className="water-jelly glow-effect"
        >
          <div className="flex items-start gap-6">
            <div className="flex-grow">
              <div className="mb-6">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-3 float-animation">
                  {content.whoami.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 mb-3">
                  <span className="text-xl font-mono text-cyan-300 tracking-wide">@{content.whoami.handle}</span>
                  <span className="px-3 py-2 bg-gradient-to-r from-green-900/60 to-emerald-900/60 border border-green-400/40 rounded-lg text-green-300 text-sm font-mono glow-effect">
                    {content.whoami.clearance}
                  </span>
                  <span className="px-3 py-2 bg-gradient-to-r from-blue-900/60 to-cyan-900/60 border border-cyan-400/40 rounded-lg text-cyan-300 text-sm font-mono">
                    {content.whoami.status}
                  </span>
                </div>
              </div>
              <div className={`text-lg leading-relaxed mb-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {aboutText}<span className="animate-ping text-cyan-400">_</span>
              </div>
              
              {/* Quick Contact Buttons for HR */}
              <div className="flex flex-wrap gap-3">
                {Object.entries(content.contact).map(([key, value]) => (
                  <a 
                    href={key === 'email' ? `mailto:${value}` : value} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    key={key} 
                    className="px-4 py-2 glass-morphism rounded-lg border border-cyan-400/30 hover:border-cyan-400/60 transition-all duration-300 group"
                  >
                    <span className="text-cyan-400 uppercase text-xs tracking-wider font-semibold group-hover:text-white">
                      {key}
                    </span>
                  </a>
                ))}
                <a 
                  href={content.resumeUrl} 
                  download={`HarshRaj_CTI_Resume.pdf`}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600/80 to-cyan-600/80 hover:from-purple-500/90 hover:to-cyan-500/90 rounded-lg transition-all duration-300 font-semibold transform hover:scale-105 glow-effect"
                >
                  📄 Resume
                </a>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="w-32 h-32 bg-gradient-to-br from-cyan-400/30 via-blue-500/30 to-purple-600/30 rounded-2xl border-2 border-cyan-400/40 flex items-center justify-center shadow-2xl shadow-cyan-500/30 water-jelly glow-effect">
                <div className="text-cyan-400 text-5xl">👤</div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Skills Section - Important for HR */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <GlassCard title="Technical Skills" variant="accent" intense={true} className="float-animation">
            {content.skills.map((s, i) => <SkillBar key={i} name={s.name} level={s.level} isDarkMode={isDarkMode} />)}
          </GlassCard>
          
          <GlassCard title="Soft Skills" variant="warm" intense={true} className="float-animation">
            {content.softSkills?.map((s, i) => <SkillBar key={i} name={s.name} level={s.level} isDarkMode={isDarkMode} />) || 
              <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Loading soft skills...</p>
            }
          </GlassCard>
          
          <GlassCard title="Certifications" variant="warm" intense={true} className="float-animation">
            <div className="grid grid-cols-1 gap-4">
              {content.certs.map((cert, i) => (
                <CertificateCard key={i} cert={cert} />
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Projects Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <GlassCard title="Featured Projects" variant="accent" className="water-jelly">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.projects.map((p, i) => (
              <div key={i} className="glass-morphism p-4 rounded-lg border border-blue-400/30 transition-all hover:border-blue-300/60 hover:shadow-lg hover:shadow-blue-500/20">
                <div className="mb-3">
                  <h3 className={`font-bold text-base mb-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{p.name}</h3>
                  <div className="flex gap-2 items-center mb-2">
                    <span className="text-xs text-blue-300 font-semibold bg-blue-900/40 px-3 py-1 rounded-full">
                      {p.year}
                    </span>
                    {p.hasDemo && (
                      <button
                        onClick={() => handleProjectDemo(p.demoType)}
                        className="text-xs bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-3 py-1 rounded-full transition-all duration-300 transform hover:scale-105 font-semibold"
                      >
                        🚀 TRY LIVE
                      </button>
                    )}
                  </div>
                </div>
                <p className={`leading-relaxed text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{p.description}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Technical Dashboard - Lower Priority for HR */}
      <div className="max-w-7xl mx-auto mb-6">
        <ThreatFeedWidget apiKey={content.apiKeys.otx} onFeedUpdate={handleFeedUpdate} />
      </div>

      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <LiveClock />
          <ThreatLevel threatFeedData={currentThreatFeed} />
          <NetworkStatus />
          <SystemMetrics />
        </div>
      </div>
      
      <footer className={`text-center text-xs font-mono mt-12 pb-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>
        <div className="flex justify-center items-center gap-4 mb-3">
          <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse"></div>
          <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
            Press <span className="text-cyan-400 font-semibold">'~'</span> to access CLI | 
            Type <span className="text-purple-400 font-semibold">'/admin'</span> for admin panel
          </p>
          <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-pulse"></div>
        </div>
        <p className="mt-2">STATUS: <span className="text-green-400">{content.whoami.status}</span></p>
        <p className="text-xs mt-2">
          © {new Date().getFullYear()} <span className="text-cyan-400">Harsh Raj</span> | 
          <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-semibold">CTI Portfolio v2.0</span>
        </p>
      </footer>

      {/* Interactive Modals */}
      <MitreAttackHeatmap isVisible={showMitreHeatmap} setIsVisible={setShowMitreHeatmap} isDarkMode={isDarkMode} />
      <CTIQuiz isVisible={showCTIQuiz} setIsVisible={setShowCTIQuiz} isDarkMode={isDarkMode} />
      <IOCHunterDemo isVisible={showIOCDemo} setIsVisible={setShowIOCDemo} isDarkMode={isDarkMode} />
    </div>
  );
};

const CLI = ({ content, setContent, setCliActive }) => {
  const [history, setHistory] = useState([{type: 'system', text: 'Terminal active. Type "help" for a list of commands.'}]);
  const [input, setInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editText, setEditText] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authAttempts, setAuthAttempts] = useState(0);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history]);

  useEffect(() => {
    if (!isEditing && inputRef.current) inputRef.current.focus();
  }, [isEditing]);

  const authenticateUser = (password) => {
    // Simple authentication - in production, use proper authentication
    const adminPassword = "cti2025"; // Change this to a secure password
    if (password === adminPassword) {
      setIsAuthenticated(true);
      setAuthAttempts(0);
      return true;
    } else {
      setAuthAttempts(prev => prev + 1);
      if (authAttempts >= 2) {
        setHistory(prev => [...prev, {type: 'system', text: 'Too many failed attempts. Access denied.'}]);
        setTimeout(() => setCliActive(false), 2000);
      }
      return false;
    }
  };

  const handleCommand = useCallback((cmd) => {
    const [command, ...args] = cmd.toLowerCase().trim().split(' ');
    let output = { type: 'output', text: `command not found: ${command}` };

    switch (command) {
      case 'help':
        output.text = `Available commands:\n  whoami         - Display user information\n  view <section> - View section (about, skills, projects, certs, contact)\n  nano <section> - Edit a text section (requires authentication)\n  auth <password> - Authenticate for editing privileges\n  logout         - Remove authentication\n  clear          - Clear the terminal\n  exit           - Close the terminal`;
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
      case 'auth':
        const password = args[0];
        if (!password) {
          output.text = 'Usage: auth <password>';
        } else {
          if (authenticateUser(password)) {
            output.text = 'Authentication successful. Edit privileges granted.';
          } else {
            output.text = `Authentication failed. Attempts remaining: ${2 - authAttempts}`;
          }
        }
        break;
      case 'logout':
        setIsAuthenticated(false);
        output.text = 'Logged out. Edit privileges revoked.';
        break;
      case 'nano':
        const nanoTarget = args[0];
        if (!isAuthenticated) {
          output.text = 'Error: Authentication required. Use "auth <password>" to gain edit privileges.';
        } else if (content[nanoTarget] && typeof content[nanoTarget] === 'string') {
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
  }, [content, setCliActive, isAuthenticated, authAttempts]);
  
  const handleInput = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommand(input);
      setInput('');
    }
  };
  
  const handleEditorSave = async () => {
      const updatedContent = {...content, [editTarget]: editText};
      setContent(updatedContent);
      
      // Also save to Firestore if authenticated
      try {
        await saveContentToFirestore(updatedContent);
        setHistory(prev => [...prev, {type: 'system', text: `Saved changes to ${editTarget} and synced to cloud.`}]);
      } catch (error) {
        setHistory(prev => [...prev, {type: 'system', text: `Saved changes to ${editTarget} locally. Cloud sync failed.`}]);
      }
      
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
            <div className="bg-gray-700 text-white p-1 text-center flex justify-between items-center">
              <span>Nano 2.0 - Editing: {editTarget}</span>
              <span className="text-green-400 text-xs">🔒 AUTHENTICATED</span>
            </div>
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
      <div className="flex justify-between items-center mb-4 border-b border-cyan-400/30 pb-2">
        <span className="text-cyan-400">CTI Terminal v2.0</span>
        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <span className="text-green-400 text-xs">🔒 AUTHENTICATED</span>
          )}
          <span className="text-slate-400 text-xs">
            {getCurrentTimeIST()}
          </span>
        </div>
      </div>
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
  const [tempContent, setTempContent] = useState(() => {
    // Deep copy with fallback values
    const copy = JSON.parse(JSON.stringify(content));
    return {
      ...copy,
      apiKeys: copy.apiKeys || { otx: '' },
      contact: copy.contact || {},
      skills: copy.skills || [],
      projects: copy.projects || [],
      certs: copy.certs || []
    };
  });
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
          : section === 'projects'
          ? { name: "New Project", description: "Description", year: new Date().getFullYear().toString() }
          : section === 'skills'
          ? { name: "New Skill", level: 50 }
          : { label: "New Contact", value: "", type: "text" }; // Default for contacts
      setTempContent(prev => ({...prev, [section]: [...prev[section], newItem]}));
  };
  
  const addContactItem = () => {
      const contactKey = prompt("Enter contact type (e.g., 'twitter', 'website', 'phone'):");
      if (contactKey && contactKey.trim()) {
          const key = contactKey.toLowerCase().trim();
          setTempContent(prev => ({
              ...prev, 
              contact: {
                  ...prev.contact,
                  [key]: ""
              }
          }));
      }
  };
  
  const removeContactItem = (contactKey) => {
      setTempContent(prev => {
          const newContact = {...prev.contact};
          delete newContact[contactKey];
          return {...prev, contact: newContact};
      });
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
  
  const InputField = ({label, value, onChange, placeholder, type = "text"}) => (
      <div className="mb-2">
          <label className="block text-red-300 mb-1 text-sm">{label}</label>
          <input 
            type={type} 
            value={value || ''} 
            onChange={onChange} 
            placeholder={placeholder} 
            className="w-full bg-slate-900 text-slate-200 p-2 rounded border border-slate-600 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all duration-200" 
            autoComplete="off"
          />
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
            <InputField 
              label="AlienVault OTX API Key" 
              value={tempContent.apiKeys.otx} 
              onChange={e => handleFieldChange('apiKeys', 'otx', e.target.value)} 
              placeholder="Enter your OTX API key here..."
              type="password"
            />
          </div>
          {/* About Section */}
          <div>
            <label className="block text-red-300 mb-2 font-bold">ABOUT SECTION</label>
            <textarea 
              className="w-full h-24 bg-slate-900 text-slate-200 p-2 rounded border border-slate-600 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all duration-200" 
              value={tempContent.about || ''} 
              onChange={(e) => handleTopLevelFieldChange('about', e.target.value)}
              placeholder="Enter your professional bio/about section..."
            />
          </div>
          {/* Contact & Assets Section */}
          <div>
            <h3 className="text-red-300 mb-2 font-bold">CONTACT & ASSETS</h3>
            <div className="space-y-4">
                {Object.keys(tempContent.contact).map(key => (
                    <div key={key} className="bg-slate-900/50 p-3 rounded border border-slate-700 relative">
                        <button 
                            onClick={() => removeContactItem(key)} 
                            className="absolute top-2 right-2 text-red-500 hover:text-red-300 text-lg font-bold"
                            title="Remove contact"
                        >
                            &times;
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="mb-2">
                                <label className="block text-red-300 mb-1 text-sm">Contact Type</label>
                                <input 
                                    type="text" 
                                    value={key.toUpperCase()} 
                                    disabled
                                    className="w-full bg-slate-800 text-slate-400 p-2 rounded border border-slate-600 cursor-not-allowed" 
                                />
                            </div>
                            <InputField 
                                label="Contact Value" 
                                value={tempContent.contact[key]} 
                                onChange={e => handleFieldChange('contact', key, e.target.value)}
                                placeholder={`Enter ${key} URL/address`}
                            />
                        </div>
                    </div>
                ))}
            </div>
            <button 
                onClick={addContactItem} 
                className="mt-2 text-sm bg-red-600/50 hover:bg-red-500/80 px-3 py-1 rounded"
            >
                + Add Contact Method
            </button>
             <div className="mt-4">
                <InputField label="Resume URL" value={tempContent.resumeUrl} onChange={e => handleTopLevelFieldChange('resumeUrl', e.target.value)} placeholder="e.g., /resume.pdf" />
            </div>
          </div>
          {/* Skills Section */}
          <div>
            <h3 className="text-red-300 mb-2 font-bold">SKILLS</h3>
            <div className="space-y-4">
               {tempContent.skills.map((skill, i) => (
                   <div key={i} className="bg-slate-900/50 p-3 rounded border border-slate-700 relative">
                       <button onClick={() => removeListItem('skills', i)} className="absolute top-2 right-2 text-red-500 hover:text-red-300">&times;</button>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                           <InputField label="Skill Name" value={skill.name} onChange={e => handleListItemChange('skills', i, 'name', e.target.value)} />
                           <InputField label="Skill Level (%)" value={skill.level} onChange={e => handleListItemChange('skills', i, 'level', parseInt(e.target.value) || 0)} type="number" />
                       </div>
                   </div>
               ))}
            </div>
            <button onClick={() => addListItem('skills')} className="mt-2 text-sm bg-red-600/50 hover:bg-red-500/80 px-3 py-1 rounded">+ Add Skill</button>
          </div>
          {/* Projects Section */}
          <div>
            <h3 className="text-red-300 mb-2 font-bold">PROJECTS</h3>
            <div className="space-y-4">
               {tempContent.projects.map((project, i) => (
                   <div key={i} className="bg-slate-900/50 p-3 rounded border border-slate-700 relative">
                       <button onClick={() => removeListItem('projects', i)} className="absolute top-2 right-2 text-red-500 hover:text-red-300">&times;</button>
                       <div className="space-y-2">
                           <InputField label="Project Name" value={project.name} onChange={e => handleListItemChange('projects', i, 'name', e.target.value)} />
                           <div className="mb-2">
                               <label className="block text-red-300 mb-1 text-sm">Project Description</label>
                               <textarea 
                                   className="w-full h-20 bg-slate-900 text-slate-200 p-2 rounded border border-slate-600 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all duration-200" 
                                   value={project.description} 
                                   onChange={e => handleListItemChange('projects', i, 'description', e.target.value)} 
                               />
                           </div>
                           <InputField label="Year" value={project.year} onChange={e => handleListItemChange('projects', i, 'year', e.target.value)} />
                       </div>
                   </div>
               ))}
            </div>
            <button onClick={() => addListItem('projects')} className="mt-2 text-sm bg-red-600/50 hover:bg-red-500/80 px-3 py-1 rounded">+ Add Project</button>
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

const AdminAuth = ({ setAdminAuthOpen, setAdminOpen }) => {
  const [password, setPassword] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const handleAuth = () => {
    const adminPassword = "SecWithHarsh2025"; // More secure password
    if (password === adminPassword) {
      setAdminAuthOpen(false);
      setAdminOpen(true);
      setError('');
    } else {
      setAttempts(prev => prev + 1);
      setError(`Access Denied. Attempts: ${attempts + 1}/3`);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      
      if (attempts >= 2) {
        setError('Maximum attempts exceeded. Access locked.');
        setTimeout(() => {
          setAdminAuthOpen(false);
        }, 2000);
      }
    }
    setPassword('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAuth();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-mono">
      <div className={`bg-slate-900 border-2 border-red-500/50 rounded-lg p-8 max-w-md w-full shadow-2xl shadow-red-500/20 ${isShaking ? 'animate-shake' : ''}`}>
        <div className="text-center mb-6">
          <div className="text-red-400 text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-red-400 uppercase tracking-widest mb-2">RESTRICTED ACCESS</h2>
          <p className="text-slate-400 text-sm">Administrative privileges required</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-red-300 mb-2 text-sm font-bold">SECURITY PASSPHRASE</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter administrative passphrase..."
              className="w-full bg-black/50 text-green-400 p-3 rounded border border-red-500/30 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono tracking-wider"
              autoFocus
            />
          </div>
          
          {error && (
            <div className="bg-red-900/30 border border-red-500/50 rounded p-3">
              <p className="text-red-300 text-sm text-center">{error}</p>
            </div>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={() => setAdminAuthOpen(false)}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 py-3 px-4 rounded font-bold transition-colors"
            >
              CANCEL
            </button>
            <button
              onClick={handleAuth}
              disabled={attempts >= 3}
              className={`flex-1 py-3 px-4 rounded font-bold transition-colors ${
                attempts >= 3 
                  ? 'bg-slate-600 text-slate-500 cursor-not-allowed' 
                  : 'bg-red-600 hover:bg-red-500 text-white'
              }`}
            >
              ACCESS
            </button>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-slate-500 text-xs">
            Unauthorized access attempts are logged and monitored
          </p>
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
  const [adminAuthOpen, setAdminAuthOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
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
        if (adminAuthOpen) setAdminAuthOpen(false);
      }
      
      // Admin panel command: /admin (now requires authentication)
      if (e.key.length === 1 || e.key === '/') {
        adminCommandRef.current += e.key.toLowerCase();
      }
      
      if (adminCommandRef.current.endsWith('/admin')) {
          setAdminAuthOpen(true); // Open auth modal instead of admin panel directly
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
  }, [cliActive, adminOpen, adminAuthOpen]);

  return (
    <main className={`min-h-screen overflow-x-hidden transition-all duration-500 ${isDarkMode ? 'theme-dark' : 'theme-light'}`} 
          style={{ backgroundColor: isDarkMode ? '#1a1d29' : '#fefefe' }}>
      <ParticleCanvas />
      <CursorTrail />
      
      {/* Loading Screen */}
      {isLoading && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
          <div className="text-center">
            <div className="relative mb-8">
              <div className="animate-spin w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto"></div>
              <div className="absolute inset-0 animate-ping w-12 h-12 border border-cyan-400/30 rounded-full mx-auto"></div>
            </div>
            <div className="space-y-2">
              <p className="text-cyan-300 font-mono text-lg font-bold">INITIALIZING CTI PORTFOLIO</p>
              <div className="flex justify-center space-x-1">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
              <p className={`font-mono text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                &gt; Fetching intelligence from the dark corners of the internet...
              </p>
              <div className={`w-64 rounded-full h-1 mx-auto mt-4 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-300'}`}>
                <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-1 rounded-full animate-pulse" style={{width: '75%'}}></div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className={`transition-all duration-500 ${cliActive || adminOpen || adminAuthOpen ? 'opacity-20 blur-sm scale-95' : 'opacity-100'}`}>
        <GUI content={content} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      </div>

      {cliActive && <CLI content={content} setContent={setContent} setCliActive={setCliActive} />}
      {adminAuthOpen && <AdminAuth setAdminAuthOpen={setAdminAuthOpen} setAdminOpen={setAdminOpen} />}
      {adminOpen && <AdminPanel content={content} setContent={setContent} setAdminOpen={setAdminOpen} />}
    </main>
  );
}
