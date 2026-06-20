// server.js - Aviator Live Game Engine Backend
const axios = require("axios");

// 🔗 ඔබේ index.js එකේ ඇති 'live_game_engine' Node එකටම දත්ත යවන සැබෑ Firebase URL එක
const firebaseURL = "https://aviator-lanka-game-default-rtdb.firebaseio.com/live_game_engine.json";

async function startNewRound() {
    try {
        // 1. මේ රවුන්ඩ් එකේ Crash Point එක සසම්භාවීව (Random) තීරණය කිරීම (1.01x - 15.00x)
        let crashPoint = parseFloat((1.01 + Math.pow(Math.random(), 3) * 14).toFixed(2));

        // 2. ඔඩ් එක 1.00 ඉඳන් Crash Point එකට යන්න ගතවන කාලය මිලි තත්පර වලින් (Duration)
        // (index.js එකේ ඇති ෆෝමියුලා එකටම ගැලපෙන ලෙස: පියවරකට 150ms බැගින් 0.02ක වැඩිවීමක්)
        let totalSteps = (crashPoint - 1.00) / 0.02;
        let durationMs = Math.max(totalSteps * 150, 500); // අවම කාලය මිලි තත්පර 500ක් ලෙස

        console.log(`✈️ New Flight Started: Will crash at ${crashPoint}x in ${(durationMs / 1000).toFixed(2)}s`);

        // 3. Firebase එකට එකපාරක් විස්තර යැවීම (index.js එක බලාපොරොත්තු වන විචල්‍යයන්)
        let startTime = Date.now();
        let data = {
            status: "FLYING",
            crash_point: crashPoint,
            start_time: startTime,
            duration_ms: durationMs
        };

        await axios.put(firebaseURL, data);

        // 4. ෆ්ලයිට් එක ඉවර වෙනකම් (යානය පියාසර කරන කාලය පුරා) සර්වර් එක බලාගෙන ඉන්නවා
        await new Promise(resolve => setTimeout(resolve, durationMs));

        // 5. නියමිත වෙලාව ආ පසු Crash වුණා කියලා Firebase එක අප්ඩේට් කිරීම
        console.log(`💥 Crashed at ${crashPoint}x!`);
        await axios.put(firebaseURL, {
            status: "CRASHED",
            crash_point: crashPoint,
            start_time: startTime,
            duration_ms: durationMs
        });

        // මීළඟ රවුන්ඩ් එක ආරම්භ වීමට පෙර තත්පර 5ක විවේක කාලයක් (Countdown එක සඳහා)
        console.log("⏳ Next round will start in 5 seconds...");
        await new Promise(resolve => setTimeout(resolve, 5000));

        // නැවතත් මුල සිට රවුන්ඩ් එකක් ස්ටාර්ට් කිරීම
        startNewRound();

    } catch (error) {
        console.error("❌ Firebase Sync Error:", error.message);
        // දෝෂයක් ආවොත් සර්වර් එක නතර නොකර තත්පර 3කින් නැවත උත්සාහ කරයි
        setTimeout(startNewRound, 3000);
    }
}

// Render එකේ Web Service එකක් ලෙස රන් වන විට Port එකක් Listen නොකළහොත් ඇතිවන Error එක වැළැක්වීම
const express = require("express");
const app = express();
const PORT = process.env.PORT || 10000;
app.get("/", (req, res) => res.send("Aviator Lanka Game Engine is Running Live!"));
app.listen(PORT, () => {
    console.log(`💻 Dummy Web Port listening on port ${PORT}`);
    // සර්වර් එන්ජිම ක්‍රියාත්මක කිරීම
    startNewRound();
});
