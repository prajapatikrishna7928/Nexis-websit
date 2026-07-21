// 📦 FIREBASE & FIRESTORE IMPORTS
import { db, auth } from "../firebase/firebase-config.js";
import { collection, getDocs, doc, deleteDoc, query, orderBy, updateDoc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// 🔐 SECURITY CORE VARIABLE CONTEXT (सिर्फ एक बार)
let loginAttempts = 0;
const MAX_ATTEMPTS = 3;
let autoLockTimer;
let masterCacheData = { reviews: [], messages: [] };

// 📡 AUTONOMOUS OPERATOR TRACKER

async function captureAdminIP() {
    try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        const ipDisplay = document.getElementById('admin-ip-display');
        if (ipDisplay) ipDisplay.innerText = `🔐 Authorized Operator IP: ${data.ip} (Secure Connection)`;
    } catch(e) {
        const ipDisplay = document.getElementById('admin-ip-display');
        if (ipDisplay) ipDisplay.innerText = `🔐 Operator IP Tunnel: Encrypted / Masked`;
    }
}

// 🛡️ FIREBASE AUTHENTICATION HANDSHAKE
window.checkAdminPassword = async function() {
    const errorMsg = document.getElementById("error-msg");
    const emailInput = document.getElementById("admin-email") ? document.getElementById("admin-email").value.trim() : "nexis.infinity@gmail.com";
    const passInput = document.getElementById("admin-pass").value;
    const loginBtn = document.getElementById("login-btn");

    // Brute force safety perimeter check
    if (loginAttempts >= MAX_ATTEMPTS) {
        if (errorMsg) errorMsg.innerText = "🚨 TERMINAL LOCKED DOWN! Excessive failure loops detected.";
        if (loginBtn) loginBtn.disabled = true;
        logAction("CRITICAL: Terminal lockdown initiated due to repeated authentication failures.");
        return;
    }

    // Injection Malicious Pattern Defense
    if (passInput.includes("=") || passInput.includes("'") || passInput.toLowerCase().includes("or")) {
        loginAttempts++;
        if (errorMsg) errorMsg.innerText = `🚨 Attack pattern detected! System defense triggers active. Attempts remaining: ${MAX_ATTEMPTS - loginAttempts}`;
        logAction(`SECURITY ALERT: Non-standard character injection signature analyzed.`);
        return;
    }

    try {
        // Firebase Auth Verification (No Hardcoded Passwords)
        await signInWithEmailAndPassword(auth, emailInput, passInput);
        if (errorMsg) errorMsg.innerText = "";
        loginAttempts = 0; // Reset attempts on success
        logAction(`SUCCESS: Firebase Auth verified for ${emailInput}. Session initialized.`);
    } catch (error) {
        loginAttempts++;
        if (errorMsg) errorMsg.innerText = `🚨 Access Denied! Invalid credentials. Attempts remaining: ${MAX_ATTEMPTS - loginAttempts}`;
        logAction(`WARN: Failed authentication sequence attempt (${loginAttempts}/${MAX_ATTEMPTS}). Error: ${error.message}`);
    }
}

// 🔄 REAL-TIME SESSION MONITORING
onAuthStateChanged(auth, (user) => {
    const loginBox = document.getElementById("login-box");
    const dashboard = document.getElementById("admin-dashboard");

    if (user) {
        // Authorized Session Active
        if (loginBox) loginBox.style.display = "none";
        if (dashboard) dashboard.style.display = "block";
        
        captureAdminIP();
        loadAdminDashboardData();
        resetInactivityTimer();
        loadAPKConfig();
    } else {
        // Session Terminated or Inactive
        if (loginBox) loginBox.style.display = "block";
        if (dashboard) dashboard.style.display = "none";
        clearTimeout(autoLockTimer);
    }
});

// ⏳ 5-MINUTE AUTOMATIC INACTIVITY AUTO-LOCK
function resetInactivityTimer() {
    clearTimeout(autoLockTimer);
    autoLockTimer = setTimeout(() => {
        alert("🔒 Security Protocol: Active session terminated due to operational inactivity.");
        adminLogout();
    }, 5 * 60 * 1000); 
}
document.addEventListener("mousemove", resetInactivityTimer);
document.addEventListener("keypress", resetInactivityTimer);

// 🚪 SECURE LOGOUT METHOD
window.adminLogout = async function() {
    try {
        const passElem = document.getElementById("admin-pass");
        if (passElem) passElem.value = "";
        clearTimeout(autoLockTimer);
        await signOut(auth);
        logAction("SUCCESS: Session actively terminated via Firebase Auth.");
    } catch (e) {
        logAction(`ERROR: Logout failed: ${e.message}`);
    }
};

// 🧼 CROSS-SITE SCRIPTING (XSS) CONTENT SANITIZATION
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function(m) {
        switch (m) {
            case '&': return '&amp;';
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '"': return '&quot;';
            case "'": return '&#039;';
            default: return m;
        }
    });
}

// 📥 BACKEND SYNCHRONIZATION DATA VAULT
async function loadAdminDashboardData() {
    try {
        const qRev = query(collection(db, "public_reviews"), orderBy("timestamp", "desc"));
        const snapRev = await getDocs(qRev);
        masterCacheData.reviews = [];
        snapRev.forEach(d => masterCacheData.reviews.push({ id: d.id, ...d.data() }));

        const qMsg = query(collection(db, "private_messages"), orderBy("timestamp", "desc"));
        const snapMsg = await getDocs(qMsg);
        masterCacheData.messages = [];
        snapMsg.forEach(d => masterCacheData.messages.push({ id: d.id, ...d.data() }));

        calculateGlobalMetrics();
        renderTables(masterCacheData.reviews, masterCacheData.messages);
        
        const syncTime = document.getElementById("sync-time");
        if (syncTime) syncTime.innerText = `Last Sync: ${new Date().toLocaleTimeString()}`;
    } catch(e) {
        logAction(`CRITICAL ERROR: Cloud vault synchronizer failure: ${e.message}`);
    }
}

// DYNAMIC ANALYTICS CALCULATIONS ENGINE
function calculateGlobalMetrics() {
    const totalReviews = masterCacheData.reviews.length;
    const totalMessages = masterCacheData.messages.length;
    
    let avg = 0;
    if (totalReviews > 0) {
        let totalStars = masterCacheData.reviews.reduce((acc, curr) => acc + (Number(curr.rating) || 5), 0);
        avg = (totalStars / totalReviews).toFixed(1);
    }
    
    const countRev = document.getElementById("count-reviews");
    const countMsg = document.getElementById("count-messages");
    const countAvg = document.getElementById("count-avg-rating");

    if (countRev) countRev.innerText = totalReviews;
    if (countMsg) countMsg.innerText = totalMessages;
    if (countAvg) countAvg.innerText = avg;
}

// DATA MATRIX COMPONENT RENDERER
function renderTables(reviewsList, messagesList) {
    const revBody = document.getElementById("reviews-table-body");
    if (revBody) {
        if(reviewsList.length === 0) {
            revBody.innerHTML = `<tr><td colspan="7" class="status-msg">No dataset matches specified filters.</td></tr>`;
        } else {
            revBody.innerHTML = reviewsList.map(r => `
                <tr>
                    <td><input type="checkbox" class="chk-public_reviews" value="${r.id}"></td>
                    <td><strong>${escapeHTML(r.userName)}</strong><br><span style="color:var(--text-sec); font-size:0.75rem;">${escapeHTML(r.userEmail)}</span></td>
                    <td><span style="color:var(--neon-blue)">${escapeHTML(r.feedbackType)}</span></td>
                    <td>${"⭐".repeat(r.rating || 5)}</td>
                    <td>${escapeHTML(r.message)}</td>
                    <td>
                        <span class="badge-status ${r.status === 'Resolved' ? 'status-resolved' : 'status-pending'}" onclick="toggleStatus('public_reviews', '${r.id}', '${r.status || 'Pending'}')">
                            ${r.status || 'Pending'}
                        </span>
                        <button class="pin-btn ${r.pinned ? 'pin-active' : ''}" onclick="togglePin('${r.id}', ${r.pinned || false})">📌</button>
                    </td>
                    <td><button class="row-delete" onclick="deleteSingleRow('public_reviews', '${r.id}')">[X]</button></td>
                </tr>
            `).join('');
        }
    }

    const msgBody = document.getElementById("messages-table-body");
    if (msgBody) {
        if(messagesList.length === 0) {
            msgBody.innerHTML = `<tr><td colspan="6" class="status-msg">No private requests available inside current pool.</td></tr>`;
        } else {
            msgBody.innerHTML = messagesList.map(m => `
                <tr>
                    <td><input type="checkbox" class="chk-private_messages" value="${m.id}"></td>
                    <td><strong>${escapeHTML(m.name)}</strong><br><span style="color:var(--text-sec); font-size:0.75rem;">${escapeHTML(m.email)}</span></td>
                    <td><span style="color:var(--neon-green)">${escapeHTML(m.subject)}</span></td>
                    <td>${escapeHTML(m.message)}</td>
                    <td>
                        <span class="badge-status ${m.status === 'Resolved' ? 'status-resolved' : 'status-pending'}" onclick="toggleStatus('private_messages', '${m.id}', '${m.status || 'Pending'}')">
                            ${m.status || 'Pending'}
                        </span>
                    </td>
                    <td><button class="row-delete" onclick="deleteSingleRow('private_messages', '${m.id}')">[X]</button></td>
                </tr>
            `).join('');
        }
    }
}

// MULTI-FILTER COMPILING PARSER
window.searchAndFilterData = function() {
    const searchVal = document.getElementById("tableSearch") ? document.getElementById("tableSearch").value.toLowerCase() : "";
    const typeFilter = document.getElementById("filterType") ? document.getElementById("filterType").value : "ALL";
    const ratingFilter = document.getElementById("filterRating") ? document.getElementById("filterRating").value : "ALL";

    const filteredReviews = masterCacheData.reviews.filter(r => {
        const matchesSearch = (r.userName || '').toLowerCase().includes(searchVal) || (r.userEmail || '').toLowerCase().includes(searchVal) || (r.message || '').toLowerCase().includes(searchVal);
        const matchesType = (typeFilter === "ALL") || (r.feedbackType === typeFilter);
        
        let matchesRating = true;
        if (ratingFilter !== "ALL") {
            if(ratingFilter === "LESS") {
                matchesRating = Number(r.rating) <= 2;
            } else {
                matchesRating = Number(r.rating) === Number(ratingFilter);
            }
        }
        return matchesSearch && matchesType && matchesRating;
    });

    const filteredMessages = masterCacheData.messages.filter(m => {
        return (m.name || '').toLowerCase().includes(searchVal) || (m.email || '').toLowerCase().includes(searchVal) || (m.message || '').toLowerCase().includes(searchVal);
    });

    renderTables(filteredReviews, filteredMessages);
}

// DYNAMIC CONTROL STRINGS
window.toggleStatus = async function(collectionName, docId, currentStatus) {
    const nextStatus = currentStatus === "Pending" ? "Resolved" : "Pending";
    try {
        await updateDoc(doc(db, collectionName, docId), { status: nextStatus });
        logAction(`METADATA UPDATE: Record ID ${docId} modified to status flag: ${nextStatus}`);
        loadAdminDashboardData();
    } catch(e) {
        alert("Operation execution timeout or permission denied.");
    }
}

window.togglePin = async function(docId, currentPinnedState) {
    try {
        await updateDoc(doc(db, "public_reviews", docId), { pinned: !currentPinnedState });
        logAction(`METADATA UPDATE: Pinned configuration toggle for object node ID: ${docId}`);
        loadAdminDashboardData();
    } catch(e) {
        alert("Operation denied by host cloud system.");
    }
}

// DATA EXPORT PROTOCOL MECHANISM (CSV Compile)
window.exportToCSV = function() {
    let csvContent = "data:text/csv;charset=utf-8,Type,User Name,Email,Category/Subject,Rating,Message\n";
    
    masterCacheData.reviews.forEach(r => {
        csvContent += `Review,"${r.userName || ''}","${r.userEmail || ''}","${r.feedbackType || ''}",${r.rating || 5},"${(r.message || '').replace(/"/g, '""')}"\n`;
    });
    masterCacheData.messages.forEach(m => {
        csvContent += `Private Inq,"${m.name || ''}","${m.email || ''}","${m.subject || ''}",N/A,"${(m.message || '').replace(/"/g, '""')}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Nexis_Data_Backup_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logAction("EXPORT EVENT: Complete system metrics compiled into structured local spreadsheet data.");
}

// DELETION WIPER SUBSYSTEM
window.deleteSingleRow = async function(collectionName, docId) {
    if (confirm("⚠️ Permanent destruction warning: Scrub this single record node from database vault?")) {
        try {
            await deleteDoc(doc(db, collectionName, docId));
            logAction(`DELETION EVENT: Safely eliminated item sequence key ID: ${docId}`);
            loadAdminDashboardData();
        } catch(e) {
            alert("Execution dropped or permission denied.");
        }
    }
}

window.toggleSelectAll = function(collectionName) {
    const mainChk = collectionName === 'public_reviews' ? document.getElementById("selectAllReviews") : document.getElementById("selectAllMessages");
    const subBoxes = document.querySelectorAll(`.chk-${collectionName}`);
    if (mainChk) subBoxes.forEach(box => box.checked = mainChk.checked);
}

window.bulkDelete = async function(collectionName) {
    const selectedBoxes = document.querySelectorAll(`.chk-${collectionName}:checked`);
    if(selectedBoxes.length === 0) {
        alert("Operation error: Select checkboxes to trigger massive purge sequence.");
        return;
    }

    if(confirm(`🚨 DANGER: Perform absolute structural wipe over ${selectedBoxes.length} dataset rows?`)) {
        logAction(`PURGE SEQUENCE: Mass drop command issued inside collection namespace: ${collectionName}`);
        for(let box of selectedBoxes) {
            try {
                await deleteDoc(doc(db, collectionName, box.value));
            } catch(e) {}
        }
        alert("🧹 Data node space cleared!");
        loadAdminDashboardData();
    }
}

// SECURE AUDIT LOGGER PIPELINE
function logAction(msg) {
    const logBox = document.getElementById("audit-logs");
    if(logBox) {
        const timestamp = new Date().toLocaleTimeString();
        logBox.innerHTML += `<div>[${timestamp}] ${msg}</div>`;
        logBox.scrollTop = logBox.scrollHeight;
    }
}
// ==========================================
// 📱 MODULE 3: APK VERSION MANAGER LOGIC
// ==========================================

// 📥 1. Load Current APK Settings from Firestore
async function loadAPKConfig() {
    try {
        const docRef = doc(db, "settings", "app_config");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const verElem = document.getElementById("apk-version");
            const urlElem = document.getElementById("apk-url");
            const sizeElem = document.getElementById("apk-size");
            const logElem = document.getElementById("apk-changelog");
            const badgeElem = document.getElementById("current-apk-badge");

            if (verElem) verElem.value = data.version || "";
            if (urlElem) urlElem.value = data.downloadUrl || "";
            if (sizeElem) sizeElem.value = data.fileSize || "";
            if (logElem) logElem.value = data.changelog || "";
            if (badgeElem) badgeElem.innerText = `Current: ${data.version || 'v1.0.0'}`;
        }
    } catch (e) {
        console.error("APK Config Fetch Error:", e);
    }
}

// 💾 2. Save New APK Settings to Firestore
window.saveAPKConfig = async function() {
    const version = document.getElementById("apk-version").value.trim();
    const downloadUrl = document.getElementById("apk-url").value.trim();
    const fileSize = document.getElementById("apk-size").value.trim();
    const changelog = document.getElementById("apk-changelog").value.trim();

    if (!version || !downloadUrl) {
        alert("⚠️ Please fill in both Version Number and Download URL!");
        return;
    }

    try {
        await setDoc(doc(db, "settings", "app_config"), {
            version: version,
            downloadUrl: downloadUrl,
            fileSize: fileSize,
            changelog: changelog,
            updatedAt: new Date().toISOString()
        }, { merge: true });

        alert("🎉 APK Configuration Updated Successfully!");
        if (typeof logAction === "function") {
            logAction(`CONFIG UPDATE: New APK metadata saved -> Version: ${version}`);
        }
        loadAPKConfig();
    } catch (e) {
        alert("❌ Failed to update APK settings.");
        console.error("Save Error:", e);
    }
};
