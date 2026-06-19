const admin = require("firebase-admin");
// ඔයාගේ Firebase සේවා ගිණුම් විස්තර මෙතනට දාන්න (Service Account Key)
admin.initializeApp({
  databaseURL: "https://aviator-lanka-game-default-rtdb.firebaseio.com"
});

const db = admin.database();
const ref = db.ref("live_flight_sync");

async function startAviatorEngine() {
  while (true) {
    // 1. Countdown කාලය (තත්පර 5ක් ලෑස්ති වෙන්න දෙනවා)
    for (let c = 5; c >= 0; c -= 0.1) {
      await ref.set({ status: "COUNTDOWN", countdownTime: c, multiplier: 1.0 });
      await new Promise(r => setTimeout(r, 100));
    }

    // 2. ගුවන්ගත වන උපරිම සීමාව (Crash Point) සසම්භාවීව (Random) තීරණය කිරීම
    let crashPoint = Math.random() < 0.1 ? 1.00 : (Math.random() * 5 + 1).toFixed(2);
    let currentMultiplier = 1.00;

    // 3. පියාසර කරන කොටස (Flying Mode)
    while (currentMultiplier < crashPoint) {
      currentMultiplier += 0.02; // ඔඩ් එක වැඩි වන වේගය
      await ref.set({ status: "FLYING", multiplier: currentMultiplier, crashPoint: parseFloat(crashPoint) });
      await new Promise(r => setTimeout(r, 50)); // වේගය පාලනය
    }

    // 4. කඩා වැටීම (Crashed)
    await ref.set({ status: "CRASHED", multiplier: currentMultiplier });
    
    // ඉතිහාසයට එකතු කිරීම (History)
    const historyRef = db.ref("live_flight_sync/history");
    await historyRef.push(currentMultiplier);

    await new Promise(r => setTimeout(r, 3000)); // තත්පර 3ක් ප්‍රදර්ශනය කර තැබීම
  }
}

startAviatorEngine();
