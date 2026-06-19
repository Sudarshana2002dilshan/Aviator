const admin = require("firebase-admin");
const path = require("path");

// 1. Firebase Initialize කිරීම (සරල සහ නිවැරදි ක්‍රමය)
try {
    admin.initializeApp({
        credential: admin.credential.cert(path.join(__dirname, "firebase-key.json")), // ඔයාගේ json ෆයිල් එකේ නම මෙතන තියෙන්නේ
        databaseURL: "https://aviator-lanka-game-default-rtdb.firebaseio.com" // ඔයාගේ DB URL එක
    });
} catch (e) {
    // දැනටමත් initialize වෙලා තිබුණොත් error එක ignore කරන්න
}

const db = admin.database();
const ref = db.ref("live_flight_sync");

// 2. Vercel එකට ඔඩ් එක එක පාරක් අප්ඩේට් කරන්න දෙන API එක
module.exports = async (req, res) => {
    try {
        // ගුවන්ගත වන සීමාව සසම්භාවීව (Random) තීරණය කිරීම
        let crashPoint = (Math.random() * 5 + 1).toFixed(2);
        
        // ඩේටාබේස් එකට අප්ඩේට් කිරීම
        await ref.set({
            status: "FLYING",
            multiplier: parseFloat(crashPoint),
            last_updated: new Date().toISOString()
        });

        res.status(200).json({ success: true, message: "Odds updated successfully!", crashPoint });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
