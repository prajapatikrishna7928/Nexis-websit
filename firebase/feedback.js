import { db } from "./firebase-config.js";
import { collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 1. Intelligence Hub (Feedback & Rating) को डेटाबेस में सेव करना
async function handleHubSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const btn = form.querySelector('button[type="submit"]') || form.querySelector('button');
    const originalText = btn.innerText;
    
    btn.innerText = "Submitting...";
    btn.disabled = true;

    // फॉर्म के इनपुट्स से वैल्यू निकालना
    const name = form.querySelector('input[type="text"]')?.value || "Anonymous";
    const email = form.querySelector('input[type="email"]')?.value || "Not Provided";
    const selects = form.querySelectorAll('select');
    const type = selects[0]?.value || "General Feedback";
    const rating = selects[1]?.value || "5";
    const message = form.querySelector('textarea')?.value || "";

    if (!message.trim()) {
        alert("Please write a message first!");
        btn.innerText = originalText;
        btn.disabled = false;
        return;
    }

    try {
        await addDoc(collection(db, "public_reviews"), {
            userName: name,
            userEmail: email,
            feedbackType: type,
            rating: Number(rating),
            message: message,
            timestamp: new Date()
        });
        alert("🎉 Thank you! Your review has been submitted successfully.");
        form.reset();
        loadLiveReviews(); // लिस्ट तुरंत रिफ्रेश करें
    } catch (e) {
        console.error("Error saving review: ", e);
        alert("Firebase Connection Error: कृपया चेक करें कि आपकी API Keys सही हैं और Firestore Database चालू है।");
    }
    
    btn.innerText = originalText;
    btn.disabled = false;
}

// 2. Contact Hub का प्राइवेट मैसेज सेव करना
async function handleContactSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const btn = form.querySelector('button[type="submit"]') || form.querySelector('button');
    const originalText = btn.innerText;
    
    btn.innerText = "Sending...";
    btn.disabled = true;

    const name = form.querySelector('input[type="text"]')?.value || "User";
    const email = form.querySelector('input[type="email"]')?.value || "";
    const subject = form.querySelector('select')?.value || "General Inquiry";
    const message = form.querySelector('textarea')?.value || "";

    if (!email.trim() || !message.trim()) {
        alert("Please fill in your email and message!");
        btn.innerText = originalText;
        btn.disabled = false;
        return;
    }

    try {
        await addDoc(collection(db, "private_messages"), {
            name, email, subject, message, timestamp: new Date()
        });
        alert("🚀 Message Sent! We will get back to you soon.");
        form.reset();
    } catch (e) {
        console.error("Error sending message: ", e);
        alert("Failed to send message. Please try again later.");
    }
    
    btn.innerText = originalText;
    btn.disabled = false;
}

// 3. डेटाबेस से लाइव रिव्यू लाकर स्क्रीन पर दिखाना
async function loadLiveReviews() {
    const container = document.getElementById('live-reviews-box');
    if (!container) return;

    try {
        const q = query(collection(db, "public_reviews"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        let reviewsHTML = "";

        if (querySnapshot.empty) {
            reviewsHTML = `<p style="color: #9CA3AF; text-align: center; font-size: 0.9rem;">No reviews yet. Be the first to share your experience!</p>`;
        } else {
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const stars = "⭐".repeat(data.rating || 5);
                reviewsHTML += `
                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); padding: 18px; margin-bottom: 12px; border-radius: 12px; text-align: left; max-width: 600px; margin-left: auto; margin-right: auto; backdrop-filter: blur(10px);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <strong style="color: #fff; font-size: 1rem;">${data.userName}</strong>
                            <span style="font-size: 0.75rem; background: rgba(59, 130, 246, 0.15); color: #60A5FA; padding: 3px 10px; border-radius: 20px; border: 1px solid rgba(59,130,246,0.2);">${data.feedbackType}</span>
                        </div>
                        <div style="color: #FBBF24; margin-bottom: 8px; font-size: 0.85rem;">${stars}</div>
                        <p style="margin: 0; color: #D1D5DB; font-style: italic; font-size: 0.95rem; line-height: 1.4;">"${data.message}"</p>
                    </div>
                `;
            });
        }

        container.innerHTML = `<h4 style="color: #fff; margin-bottom: 20px; text-align: center;">👥 Live User Reviews & Ratings</h4>` + reviewsHTML;
    } catch (e) {
        console.log("Firebase API Keys अभी नहीं डाली गई हैं या डेटाबेस टेस्ट मोड में नहीं है।");
    }
}

// ग्लोबल फंक्शन्स बनाना ताकि HTML सीधे इन्हें एक्सेस कर सके
window.handleHubSubmit = handleHubSubmit;
window.handleContactSubmit = handleContactSubmit;
window.loadLiveReviews = loadLiveReviews;

// पेज लोड होते ही रिव्यू अपने आप आ जाएं
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(loadLiveReviews, 1000);
});
