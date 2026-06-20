// index.js - Frontend Game Client Configuration & Engine

// ==========================================
// 1. FIREBASE CONFIGURATION & INITIALIZATION
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyCIKJwwBi4iAYsFmm4WDsJKrQ1xmssQWVg",
    authDomain: "aviator-lanka-game.firebaseapp.com",
    databaseURL: "https://aviator-lanka-game-default-rtdb.firebaseio.com",
    projectId: "aviator-lanka-game",
    storageBucket: "aviator-lanka-game.firebasestorage.app",
    messagingSenderId: "670278344623",
    appId: "1:670278344623:web:f299dc03f11a8e9feb195a"
};

// Firebase ආරම්භ කිරීම
firebase.initializeApp(firebaseConfig);
const rtdb = firebase.database();

// ==========================================
// 2. GLOBAL GAME STATES & VARIABLES
// ==========================================
let syncStatus = "CRASHED"; 
let syncMultiplier = 1.00;
let traceX = 0;
let traceY = 0;
let particles = [];
let localGameInterval = null;

// DOM Elements
const canvas = document.getElementById("game-canvas"); 
const ctx = canvas ? canvas.getContext("2d") : null;
const plane = document.getElementById("airplane-sprite"); 
const activeSystemLogs = ["WAITING FOR NEXT ROUND", "PREPARING ENGINE", "CONNECTING TO SERVER"];

if (canvas) {
    canvas.width = 800;
    canvas.height = 400;
}

// ==========================================
// 3. CORE LIVE GAME ENGINE (SYNCHRONIZER)
// ==========================================
function listenToGlobalGameEngine() {
    console.log("📡 Connecting to Live Flight Sync Engine...");

    // සර්වර් එකෙන් යාවත්කාලීන වන 'live_game_engine' Node එක Listen කිරීම
    rtdb.ref("live_game_engine").on("value", (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        // දැනට ධාවනය වන පැරණි ලූපයක් ඇත්නම් එය නවත්වන්න
        if (localGameInterval) clearInterval(localGameInterval);

        syncStatus = data.status; 
        const serverStartTime = data.start_time;
        const totalDuration = data.duration_ms;
        const targetCrashPoint = data.crash_point;

        if (syncStatus === "FLYING") {
            handleRoundTransitionReset();
            if (typeof playOscillatorSoundSystem === "function") {
                playOscillatorSoundSystem(550, "triangle", 0.15);
            }

            // සර්වර් එකේ කාලය සමඟ මිලි තත්පර 30කට වරක් (High FPS) ක්‍රීඩාව Update කරන ලූප් එක
            localGameInterval = setInterval(() => {
                let now = Date.now();
                let elapsedTime = now - serverStartTime; // යානය පියාසර කර ඇති මුළු කාලය (ms)

                // සර්වර් එකේ දී ඇති මුළු කාලය අවසන් නම් වෙබ් අඩවියෙන්ද යානය Crash කරන්න
                if (elapsedTime >= totalDuration) {
                    syncStatus = "CRASHED";
                    clearInterval(localGameInterval);
                    return;
                }

                // 🧮 සර්වර් එකේ නව කාලයට අනුව බ්‍රවුසර් එක තුළ Odds සුමටව වැඩි කිරීමේ සූත්‍රය:
                let progress = elapsedTime / totalDuration;
                syncMultiplier = 1.00 + (progress * (targetCrashPoint - 1.00));

                // අගය සර්වර් එකේ උපරිම Crash Point එක ඉක්මවා යාම වැළැක්වීම
                if (syncMultiplier >= targetCrashPoint) {
                    syncMultiplier = targetCrashPoint;
                }

                // UI එකට ලයිව් Odds ප්‍රමාණය යාවත්කාලීන කිරීම
                const multTextEl = document.getElementById("multiplier-text");
                if (multTextEl) {
                    multTextEl.innerHTML = `<span style="color:white; font-weight:900; font-size:48px;">${syncMultiplier.toFixed(2)}x</span>`;
                }
                
                // ✈️ ගුවන් යානයේ පිහිටීම (X, Y Coordinates) ගණනය කිරීම
                if (canvas) {
                    traceX = Math.min((syncMultiplier - 1.0) * 80, canvas.width - 60);
                    let baseY = canvas.height - 30 - ((syncMultiplier - 1.0) * 32);
                    traceY = Math.max(baseY, 30);
                    let finalAngle = -Math.atan2((canvas.height - 30 - traceY), traceX) * 0.15;

                    // පැරණි Script එකේ ඇති සජීවීකරණ (Animation) ශ්‍රිතයන් ධාවනය කිරීම
                    if (typeof drawFlightTrajectoryPath === "function") drawFlightTrajectoryPath();
                    if (typeof processAutoCashoutAutomationTracking === "function") processAutoCashoutAutomationTracking();
                    if (typeof renderScoreboardInterface === "function") renderScoreboardInterface();
                    if (typeof updateLiveUncashedButtons === "function") updateLiveUncashedButtons();

                    if (plane) {
                        plane.style.transform = `rotate(${finalAngle}rad)`;
                    }
                    
                    // දුම් සහ අංශු (Particles) සෑදීම
                    if (Math.random() < 0.6) {
                        particles.push({ x: traceX - 5, y: traceY + 12, size: Math.random() * 3 + 1.5, opacity: 0.7 });
                    }
                }
            }, 30); 
        } 
        else if (syncStatus === "CRASHED") {
            // 💥 යානය Crash වූ පසු පෙන්විය යුතු දේ
            syncMultiplier = targetCrashPoint;
            const multTextEl = document.getElementById("multiplier-text");
            if (multTextEl) {
                multTextEl.innerHTML = `
                    <span style="color:var(--primary, #ff3b30); font-weight:900; font-size:20px;">💥 FLEW AWAY</span><br>
                    <span style="font-size:36px; color:#7c839a; font-weight:900;">${syncMultiplier.toFixed(2)}x</span>
                `;
            }
            
            if (typeof playOscillatorSoundSystem === "function") playOscillatorSoundSystem(130, "sawtooth", 0.45);
            if (typeof triggerExplosionSparksSpit === "function") triggerExplosionSparksSpit(traceX, traceY);
            if (typeof processLossBreakdownEndCycle === "function") processLossBreakdownEndCycle();

            // Crash Animation එක දිගටම පවත්වාගෙන යාම
            localGameInterval = setInterval(() => {
                if (typeof animateExplosionDebrisFrame === "function") animateExplosionDebrisFrame();
            }, 30);
        }
    });
}

// ==========================================
// 4. AUXILIARY INTERFACE & GAME FUNCTIONS
// ==========================================
function handleRoundTransitionReset() {
    particles = [];
    traceX = 0;
    traceY = 0;
    if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    console.log("🔄 Round transition reset complete.");
}

// ගේම් එක වෙබ් පිටුව ලෝඩ් වූ සැනින් ආරම්භ කිරීම
document.addEventListener("DOMContentLoaded", () => {
    listenToGlobalGameEngine();
});
