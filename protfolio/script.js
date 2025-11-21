// script.js
import { db } from './firebase-config.js';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- GSAP Animations ---
gsap.registerPlugin(ScrollTrigger);

// Loader
window.addEventListener("load", () => {
    const tl = gsap.timeline();
    tl.to(".loader-text", { opacity: 0, duration: 0.5, delay: 0.5 })
      .to("#loader", { height: 0, duration: 0.8, ease: "power4.inOut" })
      .from(".hero-content > *", { y: 50, opacity: 0, duration: 1, stagger: 0.2, ease: "power3.out" });
});

// Cursor Follower
const cursorDot = document.querySelector(".cursor-dot");
const cursorOutline = document.querySelector(".cursor-outline");

window.addEventListener("mousemove", (e) => {
    const posX = e.clientX;
    const posY = e.clientY;
    
    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;
    
    cursorOutline.animate({ left: `${posX}px`, top: `${posY}px` }, { duration: 500, fill: "forwards" });
});

// Scroll Animations
gsap.utils.toArray("section").forEach(section => {
    gsap.from(section.querySelectorAll(".section-title, .glass-card"), {
        scrollTrigger: {
            trigger: section,
            start: "top 80%",
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out"
    });
});

// --- Firebase Logic ---

// 1. Fetch Projects
const projectsContainer = document.getElementById("projects-container");
async function loadProjects() {
    try {
        const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        projectsContainer.innerHTML = ""; 
        
        if(querySnapshot.empty) {
            projectsContainer.innerHTML = "<p>No projects added yet.</p>";
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const card = document.createElement("div");
            card.className = "glass-card";
            card.innerHTML = `
                ${data.imageUrl ? `<img src="${data.imageUrl}" style="width:100%; height:200px; object-fit:cover; border-radius:8px; margin-bottom:15px;">` : ''}
                <h3>${data.title}</h3>
                <p style="color:var(--text-dim); font-size:0.9rem; margin:10px 0;">${data.description}</p>
                <div style="margin-bottom:15px;">
                    ${data.tech.split(',').map(t => `<span class="skill-tag" style="font-size:0.8rem">${t.trim()}</span>`).join('')}
                </div>
                <div style="display:flex; gap:10px;">
                    ${data.liveLink ? `<a href="${data.liveLink}" target="_blank" class="btn" style="padding:8px 20px; font-size:0.8rem;">Live</a>` : ''}
                    ${data.githubLink ? `<a href="${data.githubLink}" target="_blank" style="color:white; padding:8px;">GitHub</a>` : ''}
                </div>
            `;
            projectsContainer.appendChild(card);
        });
    } catch (e) {
        console.error("Error loading projects:", e);
    }
}

// 2. Fetch Blog
const blogContainer = document.getElementById("blog-container");
async function loadBlog() {
    try {
        const q = query(collection(db, "blog"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        blogContainer.innerHTML = "";

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const card = document.createElement("div");
            card.className = "glass-card";
            card.innerHTML = `
                <div style="font-size:0.8rem; color:var(--primary);">${new Date(data.createdAt?.seconds * 1000).toLocaleDateString()}</div>
                <h3 style="margin:10px 0;">${data.title}</h3>
                <p style="color:var(--text-dim);">${data.subtitle}</p>
                <br>
                <span style="font-size:0.8rem;">⏱ ${data.readingTime} min read</span>
            `;
            blogContainer.appendChild(card);
        });
    } catch (e) {
        console.error("Error loading blog:", e);
    }
}

// 3. Fetch Site Content (Dynamic Hero/About)
async function loadSiteContent() {
    try {
        const contentSnapshot = await getDocs(collection(db, "site_content"));
        contentSnapshot.forEach(doc => {
            if(doc.id === 'homepage') {
                const data = doc.data();
                if(data.heroTagline) document.getElementById("hero-tagline").textContent = data.heroTagline;
                if(data.aboutText) document.getElementById("about-text").textContent = data.aboutText;
            }
        });
    } catch (e) { console.log("Using default content"); }
}

// 4. Contact Form
document.getElementById("contact-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector("button");
    const originalText = btn.innerText;
    btn.innerText = "Sending...";
    
    try {
        await addDoc(collection(db, "messages"), {
            name: document.getElementById("contact-name").value,
            email: document.getElementById("contact-email").value,
            message: document.getElementById("contact-message").value,
            sentAt: serverTimestamp()
        });
        alert("Message sent successfully!");
        e.target.reset();
    } catch (error) {
        alert("Error sending message.");
    } finally {
        btn.innerText = originalText;
    }
});

// Init
loadProjects();
loadBlog();
loadSiteContent();