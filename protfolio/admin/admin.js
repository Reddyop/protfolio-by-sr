// admin/admin.js
import { auth, db } from '../firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, addDoc, getDocs, deleteDoc, doc, setDoc, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- Auth Logic ---
const loginScreen = document.getElementById('login-screen');
const dashboard = document.getElementById('dashboard');

onAuthStateChanged(auth, (user) => {
    if (user) {
        loginScreen.style.display = 'none';
        dashboard.style.display = 'flex';
        loadAllData();
    } else {
        loginScreen.style.display = 'flex';
        dashboard.style.display = 'none';
    }
});

document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const pass = e.target.password.value;
    signInWithEmailAndPassword(auth, email, pass).catch(err => alert(err.message));
});

window.handleLogout = () => signOut(auth);

// --- Data Loading ---
async function loadAllData() {
    loadProjects();
    loadBlogs();
    loadMessages();
    loadContent();
}

// 1. Projects
async function loadProjects() {
    const list = document.getElementById('projects-list');
    list.innerHTML = 'Loading...';
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    list.innerHTML = '';
    snapshot.forEach(d => {
        const data = d.data();
        list.innerHTML += `
            <tr>
                <td>${data.title}</td>
                <td>${data.tech}</td>
                <td><button onclick="window.deleteItem('projects', '${d.id}')" style="color: #ff4444;">Delete</button></td>
            </tr>`;
    });
}

document.getElementById('add-project-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    await addDoc(collection(db, "projects"), {
        title: f.title.value,
        description: f.description.value,
        tech: f.tech.value,
        imageUrl: f.imageUrl.value,
        liveLink: f.liveLink.value,
        githubLink: f.githubLink.value,
        createdAt: serverTimestamp()
    });
    closeModal('project-modal');
    f.reset();
    loadProjects();
});

// 2. Blog
async function loadBlogs() {
    const list = document.getElementById('blog-list');
    const q = query(collection(db, "blog"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    list.innerHTML = '';
    snapshot.forEach(d => {
        const data = d.data();
        list.innerHTML += `
            <tr>
                <td>${data.title}</td>
                <td>${new Date(data.createdAt?.seconds * 1000).toLocaleDateString()}</td>
                <td><button onclick="window.deleteItem('blog', '${d.id}')" style="color: #ff4444;">Delete</button></td>
            </tr>`;
    });
}

document.getElementById('add-blog-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    await addDoc(collection(db, "blog"), {
        title: f.title.value,
        subtitle: f.subtitle.value,
        content: f.content.value,
        readingTime: f.readingTime.value,
        createdAt: serverTimestamp()
    });
    closeModal('blog-modal');
    f.reset();
    loadBlogs();
});

// 3. Messages
async function loadMessages() {
    const container = document.getElementById('messages-list');
    const q = query(collection(db, "messages"), orderBy("sentAt", "desc"));
    const snapshot = await getDocs(q);
    container.innerHTML = '';
    snapshot.forEach(d => {
        const data = d.data();
        container.innerHTML += `
            <div class="glass-card">
                <h4>${data.name} <span style="font-size:0.8rem; color:#888">(${data.email})</span></h4>
                <p>${data.message}</p>
                <small>${new Date(data.sentAt?.seconds * 1000).toLocaleString()}</small>
            </div>`;
    });
}

// 4. Site Content
async function loadContent() {
    const docRef = await getDocs(collection(db, "site_content"));
    docRef.forEach(d => {
        if(d.id === 'homepage') {
            const data = d.data();
            document.getElementById('edit-tagline').value = data.heroTagline || '';
            document.getElementById('edit-about').value = data.aboutText || '';
        }
    });
}

document.getElementById('content-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await setDoc(doc(db, "site_content", "homepage"), {
        heroTagline: document.getElementById('edit-tagline').value,
        aboutText: document.getElementById('edit-about').value
    });
    alert("Content Updated");
});

// Global Delete (attached to window for HTML access)
window.deleteItem = async (col, id) => {
    if(confirm('Are you sure?')) {
        await deleteDoc(doc(db, col, id));
        if(col === 'projects') loadProjects();
        if(col === 'blog') loadBlogs();
    }
};