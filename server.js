const admin = require("firebase-admin");
const path = require("path");

// 1. Firebase Initialize කිරීම
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(path.join(__dirname, "firebase-key.json")), // ෆයිල් නම නිවැරදිද බලන්න
        databaseURL: "https://aviator-lanka-game-default-rtdb.firebaseio.com" // ඔයාගේ DB URL එක දාන්න
    });
}

const db = admin.database();
const ref = db.ref("live_flight_sync");

// 2. ලූප් එක වෙනුවට Vercel එකට ඔඩ් එක එක පාරක් අප්ඩේට් කරන්න API එකක් හැදීම
module.exports = async (req, res) => {
    try {
        // ගුවන්ගත වන සීමාව සසම්භාවීව තීරණය කිරීම
        let crashPoint = (Math.random() * 5 + 1).toFixed(2);
        
        // එකපාරක් ඩේටාබේස් එකට අප්ඩේට් කිරීම
        await ref.set({
            status: "FLYING",
            multiplier: parseFloat(crashPoint),
            last_updated: new Date().toISOString()
        });

        res.status(200).json({ success: true, message: "Odds updated!", crashPoint });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
