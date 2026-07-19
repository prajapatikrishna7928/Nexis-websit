import { db } from "./firebase-config.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// फ़ंक्शन जो डेटा को क्लाउड डेटाबेस (Firestore) में भेजेगा
async function saveFeedbackToCloud(name, email, type, content) {
    try {
        const docRef = await addDoc(collection(db, "user_feedback"), {
            userName: name,
            userEmail: email,
            feedbackType: type,
            message: content,
            timestamp: new Date()
        });
        console.log("Data written with ID: ", docRef.id);
        return true;
    } catch (e) {
        console.error("Error adding document: ", e);
        return false;
    }
}

// इसे ग्लोबल विंडो ऑब्जेक्ट में डाल रहे हैं ताकि HTML इसे डायरेक्ट एक्सेस कर सके
window.saveFeedbackToCloud = saveFeedbackToCloud;
