document.addEventListener("DOMContentLoaded", () => {
    const gateScreen = document.getElementById("gate-screen");
    const enterBtn = document.getElementById("enter-btn");
    const enterMutedBtn = document.getElementById("enter-muted-btn");
    
    // Catching local hardware video track asset element
    const bgVideo = document.getElementById("bg-video");

    const nameInput = document.getElementById("guest-name");
    const msgInput = document.getElementById("guest-msg");
    const submitBtn = document.getElementById("submit-comment-btn");
    const feedDisplay = document.getElementById("comments-display-feed");

    const datePortal = document.getElementById("date-portal-overlay");
    const dateAccept = document.getElementById("date-accept-btn");
    const dateDecline = document.getElementById("date-decline-btn");

    // --- DATABASE CONFIGURATION LINK ---
    const BIN_ID = "YOUR_JSONBIN_BIN_ID_HERE"; 
    const API_KEY = "YOUR_JSONBIN_MASTER_KEY_HERE";
    const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

    let comments = [];

    function dismissGate() {
        gateScreen.style.opacity = "0";
        setTimeout(() => {
            gateScreen.style.display = "none";
        }, 500);
    }

    // Enter with Audio Initialization Trigger
    enterBtn.addEventListener("click", () => {
        dismissGate();
        if (bgVideo) {
            bgVideo.currentTime = 40; // Force asset index initialization exactly at 40s
            bgVideo.volume = 0.40;    // Sets uniform ambient mix levels
            bgVideo.play().catch(err => console.log("Video track playback error:", err));
        }
    });

    enterMutedBtn.addEventListener("click", () => {
        dismissGate();
        console.log("System initialized with audio tracking suppressed.");
    });

    // --- ADMINISTRATIVE HIDDEN LINK MONITOR ---
    function checkHashRoute() {
        if (window.location.hash === "#date-req1992") {
            datePortal.style.display = "flex";
        }
    }

    window.addEventListener("hashchange", checkHashRoute);
    checkHashRoute();

    dateAccept.addEventListener("click", () => {
        datePortal.style.display = "none";
        window.location.hash = "";
        alert("Authentication confirmed. Access request loop initialized.");
    });

    dateDecline.addEventListener("click", () => {
        datePortal.style.display = "none";
        window.location.hash = "";
    });

    // --- RENDERING PARSER ---
    function renderComments() {
        feedDisplay.innerHTML = "";
        if (comments.length === 0) {
            feedDisplay.innerHTML = `<div class="ghost-text" style="padding:10px; text-align:center;">No entries in the log buffer yet.</div>`;
            return;
        }
        
        comments.forEach(c => {
            const postCard = document.createElement("div");
            postCard.className = "log-entry-item";
            postCard.innerHTML = `
                <div class="log-meta">
                    <strong>${escapeHTML(c.name)}</strong> 
                    <span class="log-time">[${escapeHTML(c.timestamp)}]</span>
                </div>
                <div class="log-message">${escapeHTML(c.message)}</div>
            `;
            feedDisplay.appendChild(postCard);
        });
    }

    // --- DATA STREAM SYNC ENGAGEMENT PACKETS ---
    async function loadPublicComments() {
        if (BIN_ID.includes("YOUR_")) {
            feedDisplay.innerHTML = `<div class="log-entry-item"><div class="log-message" style="color:#ffaa00;">⚠️ Local Mode: Insert your JSONBin Keys into script.js to activate global tracking database.</div></div>`;
            if (localStorage.getItem("global_guestbook_feed")) {
                comments = JSON.parse(localStorage.getItem("global_guestbook_feed"));
            } else {
                comments = [{ name: "System_Core", message: "Database is in local simulation mode.", timestamp: "07/06/2026" }];
            }
            renderComments();
            return;
        }

        try {
            const response = await fetch(`${API_URL}/latest`, {
                headers: { "X-Master-Key": API_KEY }
            });
            const data = await response.json();
            comments = data.record || [];
            renderComments();
        } catch (error) {
            console.error("Error reading database sync channel:", error);
            feedDisplay.innerHTML = `<div class="ghost-text" style="color:red; padding:10px;">Transmission Failure. Reset stream block.</div>`;
        }
    }

    async function savePublicComments(newCommentArray) {
        if (BIN_ID.includes("YOUR_")) {
            localStorage.setItem("global_guestbook_feed", JSON.stringify(newCommentArray));
            return;
        }

        try {
            await fetch(API_URL, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-Master-Key": API_KEY
                },
                body: JSON.stringify(newCommentArray)
            });
        } catch (error) {
            console.error("Error pushing matrix sync packet:", error);
            alert("Terminal connection drop. Unable to save signature broadcast.");
        }
    }

    submitBtn.addEventListener("click", async () => {
        const name = nameInput.value.trim();
        const msg = msgInput.value.trim();

        if (!name || !msg) {
            alert("Both handle fields and transmission matrix sectors must be filled.");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerText = "TRANSMITTING...";

        const newComment = {
            name: name,
            message: msg,
            timestamp: new Date().toLocaleDateString()
        };

        comments.unshift(newComment);
        
        await savePublicComments(comments);
        renderComments();

        msgInput.value = "";
        submitBtn.disabled = false;
        submitBtn.innerText = "SUBMIT TO TERMINAL";
    });

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&', '<': '<', '>': '>', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    loadPublicComments();
});