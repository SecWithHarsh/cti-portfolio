import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import * as Tone from 'tone';

// --- STYLES (Embedded for portability) ---
const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&family=Inter:wght@400;500;700&display=swap');
    
    :root {
        --background: #080808;
        --text-primary: #BDBDBD;
        --text-secondary: #666666;
        --accent: #FF4D00;
        --surface-glass: rgba(10, 10, 10, 0.5);
        --border-glass: rgba(255, 77, 0, 0.3);
    }

    html, body, #root {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background-color: var(--background);
        color: var(--text-primary);
        font-family: 'Inter', sans-serif;
    }

    #entry-screen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--background);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 100;
        transition: opacity 1s ease;
        cursor: pointer;
    }
    
    .boot-text {
        font-family: 'Roboto Mono', monospace;
        font-size: 1rem;
        color: var(--text-secondary);
        margin-bottom: 2rem;
    }

    #enter-btn {
        font-family: 'Roboto Mono', monospace;
        font-size: 1rem;
        color: var(--accent);
        background: transparent;
        border: 1px solid var(--accent);
        padding: 1rem 2rem;
        cursor: pointer;
        opacity: 0;
        animation: fadeIn 2s ease 1s forwards;
        transition: all 0.25s ease;
    }
    #enter-btn:hover {
        background-color: rgba(255, 77, 0, 0.1);
        box-shadow: 0 0 15px var(--accent);
    }
    @keyframes fadeIn { to { opacity: 1; } }

    #info-panel {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.95);
        width: 90%;
        max-width: 700px;
        height: 80%;
        max-height: 750px;
        background: var(--surface-glass);
        backdrop-filter: blur(15px);
        -webkit-backdrop-filter: blur(15px);
        border: 1px solid var(--border-glass);
        border-radius: 8px;
        z-index: 10;
        opacity: 0;
        transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.5s ease;
        pointer-events: none;
    }
    #info-panel:not(.hidden) {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
        pointer-events: all;
    }
    
    .panel-content { padding: 2.5rem; height: 100%; overflow-y: auto; }
    
    .close-btn {
        position: absolute;
        top: 1rem;
        right: 1.5rem;
        background: none;
        border: none;
        color: var(--text-secondary);
        font-size: 2.5rem;
        cursor: pointer;
        line-height: 1;
        transition: all 0.25s;
    }
    .close-btn:hover { color: var(--accent); transform: rotate(90deg); }

    #info-content h2 { font-family: 'Roboto Mono', monospace; color: var(--accent); font-size: 1.5rem; margin-bottom: 2rem; }
    .info-item { margin-bottom: 2rem; border-bottom: 1px solid var(--border-glass); padding-bottom: 1.5rem; }
    .info-item:last-child { border-bottom: none; }
    .info-item h3 { color: var(--text-primary); font-size: 1.2rem; }
    .info-item p { font-size: 0.95rem; line-height: 1.7; }
    .info-item ul { list-style: none; padding-left: 0; }
    .info-item ul li { position: relative; padding-left: 20px; margin-bottom: 8px; }
    .info-item ul li::before { content: '▹'; position: absolute; left: 0px; color: var(--accent); }
    .info-tags { margin-top: 1rem; display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .info-tags span { font-family: 'Roboto Mono', monospace; background-color: rgba(255, 77, 0, 0.1); color: var(--accent); padding: 5px 10px; border-radius: 15px; font-size: 0.8rem; }
    .info-links a { display: inline-block; margin-top: 1rem; margin-right: 0.5rem; border: 1px solid var(--accent); padding: 8px 15px; border-radius: 4px; transition: all 0.25s; }
    .info-links a:hover { background-color: rgba(255, 77, 0, 0.1); }
`;

// --- FIREBASE SETUP ---
const firebaseConfig = {
    apiKey: "AIzaSyAfsYeQt5IvJvFzJGSpP5YNlzr-aHc8K1Y",
    authDomain: "portfolio-5b9ca.firebaseapp.com",
    projectId: "portfolio-5b9ca",
    storageBucket: "portfolio-5b9ca.appspot.com",
    messagingSenderId: "203665591912",
    appId: "1:203665591912:web:70fdab8c24acbb7d5f75dd",
    measurementId: "G-Y254G7BNY8"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- 3D COMPONENTS ---
const Artifact = () => {
    const meshRef = useRef();
    useFrame(({ clock }) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += 0.001;
            meshRef.current.rotation.y += 0.002;
            meshRef.current.material.uniforms.time.value = clock.getElapsedTime();
        }
    });

    const shaderMaterial = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 1.0 },
            color: { value: new THREE.Color(0xFF4D00) }
        },
        vertexShader: `
            uniform float time;
            varying vec2 vUv;
            void main() {
                vUv = uv;
                vec3 pos = position;
                float noise = sin(pos.y * 4.0 + time) * 0.1 + sin(pos.x * 4.0 + time) * 0.1;
                pos += normal * noise;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform vec3 color;
            varying vec2 vUv;
            void main() {
                float intensity = 1.0 - step(0.01, abs(sin(vUv.y * 20.0 + time * 2.0) * 0.5));
                gl_FragColor = vec4(color * intensity, intensity * 0.5);
            }
        `,
        wireframe: true,
        transparent: true
    }), []);

    return <mesh ref={meshRef} material={shaderMaterial}><icosahedronGeometry args={[2, 4]} /></mesh>;
};

const Glyph = ({ position, data, onClick }) => {
    const [hovered, setHovered] = useState(false);
    const meshRef = useRef();

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.01;
        }
    });

    return (
        <group position={position}>
            <mesh
                ref={meshRef}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                onClick={() => onClick(data)}
            >
                <octahedronGeometry args={[0.4, 0]} />
                <meshStandardMaterial color={hovered ? '#FF4D00' : '#BDBDBD'} wireframe />
            </mesh>
            <Text
                position={[0, -0.7, 0]}
                fontSize={0.2}
                color="#BDBDBD"
                fontFamily="Roboto Mono"
                visible={hovered}
            >
                {`//${data.title.toUpperCase()}`}
            </Text>
        </group>
    );
};

// --- MAIN SCENE ---
const Scene = ({ onNodeClick }) => {
    const glyphData = [
        { id: 'profile', title: 'Profile', contentKey: 'profile', note: 'C4' },
        { id: 'skills', title: 'Skills', contentKey: 'skills', note: 'D4' },
        { id: 'projects', title: 'Case Studies', contentKey: 'projects', note: 'E4' },
        { id: 'certs', title: 'Authorizations', contentKey: 'certs', note: 'F4' },
        { id: 'contact', title: 'Contact', contentKey: 'contact', note: 'G4' },
        { id: 'resume', title: 'Resume', contentKey: 'resume', note: 'A4' },
    ];
    const radius = 5;

    return (
        <Canvas camera={{ position: [0, 0, 12], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} color="#FF4D00" intensity={1.5} />
            <Artifact />
            {glyphData.map((data, i) => {
                const angle = (i / glyphData.length) * 2 * Math.PI;
                const x = radius * Math.cos(angle);
                const y = radius * Math.sin(angle);
                return <Glyph key={data.id} position={[x, y, 0]} data={data} onClick={onNodeClick} />;
            })}
            <OrbitControls enableDamping dampingFactor={0.05} enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.2} />
        </Canvas>
    );
};

// --- APP COMPONENT ---
export default function App() {
    const [isInitialized, setInitialized] = useState(false);
    const [isPanelOpen, setPanelOpen] = useState(false);
    const [panelContent, setPanelContent] = useState('');
    const [localData, setLocalData] = useState({ projects: [], certs: [] });
    const synth = useRef(null);

    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = styles;
        document.head.appendChild(style);
    }, []);

    const initExperience = async () => {
        await Tone.start();
        synth.current = new Tone.Synth({
            oscillator: { type: "fmsine", harmonicity: 1.5 },
            envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.5 },
        }).toDestination();
        playSound('C3');
        
        const entryScreen = document.getElementById('entry-screen');
        entryScreen.style.opacity = '0';
        setTimeout(() => {
            entryScreen.style.display = 'none';
            setInitialized(true);
        }, 1000);
        
        fetchAllData();
    };

    const playSound = (note) => {
        if (synth.current) synth.current.triggerAttackRelease(note, "8n");
    };

    const fetchAllData = async () => {
        const projectsSnapshot = await getDocs(collection(db, 'projects'));
        const projects = projectsSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
        const certsSnapshot = await getDocs(collection(db, 'certifications'));
        const certs = certsSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
        setLocalData({ projects, certs });
    };

    const handleNodeClick = (node) => {
        playSound(node.note);
        renderPanelContent(node.contentKey);
        setPanelOpen(true);
    };
    
    const renderPanelContent = (key) => {
        let html = '';
        switch (key) {
            case 'profile':
                html = `<h2>// ANALYST_PROFILE</h2><div class="info-item"><p>Driven by a deep-seated curiosity to understand the 'why' and 'how' behind digital threats...</p></div>`;
                break;
            case 'skills':
                html = `<h2>// CORE_COMPETENCIES</h2><div class="info-item"><h3>CTI Fundamentals</h3><ul><li>Intelligence Lifecycle</li><li>Threat Modeling (STRIDE)</li><li>IOC/IOA Analysis</li><li>MITRE ATT&CK Framework</li></ul></div><div class="info-item"><h3>Technical Foundations</h3><ul><li>Python for Data Analysis</li><li>Network Traffic Analysis (Wireshark)</li><li>OSINT Techniques</li><li>SIEM/Log Analysis Concepts</li></ul></div>`;
                break;
            case 'projects':
                html = `<h2>// CASE_STUDIES</h2>`;
                localData.projects.forEach(data => { html += `<div class="info-item"><h3>${data.title}</h3><p>${data.description}</p><div class="info-tags">${data.tags ? data.tags.map(tag => `<span>${tag}</span>`).join('') : ''}</div><div class="info-links">${data.links ? data.links.map(link => `<a href="${link.url}" target="_blank">${link.text}</a>`).join('') : ''}</div></div>`; });
                break;
            case 'certs':
                html = `<h2>// AUTHORIZATIONS</h2>`;
                localData.certs.forEach(data => { html += `<div class="info-item"><h3>${data.name}</h3><p>ID: ${data.code}</p><div class="info-links">${data.verificationUrl ? `<a href="${data.verificationUrl}" target="_blank">Verify</a>` : ''}${data.imageUrl ? `<a href="#" class="view-image-btn" data-img-src="${data.imageUrl}">View Image</a>` : ''}</div></div>`; });
                break;
            case 'contact':
                html = `<h2>// ESTABLISH_CONTACT</h2><div class="info-item"><p>I am actively seeking entry-level opportunities...</p><div class="info-links"><a href="mailto:contact@secwithharsh.dev">Email Me</a></div></div>`;
                break;
            case 'resume':
                html = `<h2>// DOWNLOAD_RESUME</h2><div class="info-item"><p>My full resume is available for download.</p><div class="info-links"><a href="Harsh_Raj_Resume.pdf" download>Download Now</a></div></div>`;
                break;
        }
        setPanelContent(html);
    };

    return (
        <>
            <div id="entry-screen">
                <div className="boot-text">Awaiting user interaction to initialize audio context...</div>
                <div className="glitch" data-text="[ESTABLISHING_CONNECTION]">[ESTABLISHING_CONNECTION]</div>
                <button id="enter-btn" onClick={initExperience}>Initialize Interface</button>
            </div>
            
            {isInitialized && <Scene onNodeClick={handleNodeClick} />}
            
            <div id="info-panel" className={!isPanelOpen ? 'hidden' : ''}>
                <div className="panel-content">
                    <button id="close-panel-btn" className="close-btn" onClick={() => setPanelOpen(false)}>&times;</button>
                    <div id="info-content" dangerouslySetInnerHTML={{ __html: panelContent }}></div>
                </div>
            </div>
        </>
    );
}
