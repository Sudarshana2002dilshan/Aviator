// Firebase Admin ඕනේ නැහැ, සාමාන්‍ය fetch එක විතරයි පාවිච්චි කරන්නේ
module.exports = async (req, res) => {
    try {
        // Random crash point එකක් හැදීම
        let crashPoint = (Math.random() * 5 + 1).toFixed(2);
        
        // Firebase Realtime Database එකේ REST API URL එක
        const firebaseURL = "https://aviator-lanka-game-default-rtdb.firebaseio.com/live_flight_sync.json";

        const data = {
            status: "FLYING",
            multiplier: parseFloat(crashPoint),
            last_updated: new Date().toISOString()
        };

        // Firebase එකට කෙලින්ම PUT Request එකක් මඟින් ඩේටා යැවීම
        const response = await fetch(firebaseURL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`Firebase error: ${response.statusText}`);
        }

        res.status(200).json({ success: true, message: "Odds updated via REST API!", crashPoint });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
