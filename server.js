const admin = require("firebase-admin");
// Realtime Database එක Vercel එකට හඳුන්වා දීම (මෙන්න මේ පේළිය අනිවාර්යයි)
require("firebase-admin/database"); 
const path = require("path");

// 1. Firebase Initialize කිරීම
try {
    admin.initializeApp({
        credential: admin.credential.cert(path.join(__dirname, "firebase-key.json")),
        databaseURL: "https://aviator-lanka-game-default-rtdb.firebaseio.com"
    });
} catch (e) {
    // Already initialized
}

const db = admin.database();
const ref = db.ref("live_flight_sync");

// 2. Vercel Endpoint
module.exports = async (req, res) => {
    try {
        // Random crash point එකක් හැදීම
        let crashPoint = (Math.random() * 5 + 1).toFixed(2);
        
        // Database එකට ඩේටා යැවීම
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
