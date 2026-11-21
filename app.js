import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig, WHATSAPP_CHANNEL_URL } from "./firebase-config.js";

const $ = (id) => document.getElementById(id);
const configured = firebaseConfig.apiKey !== "PASTE_API_KEY_HERE" && firebaseConfig.projectId !== "PASTE_PROJECT_ID";
let auth, db, currentUser = null, currentProfile = null, registerMode = false;

$("whatsappSide").href = WHATSAPP_CHANNEL_URL;
$("whatsappFooter").href = WHATSAPP_CHANNEL_URL;

function showAuth() { $("authModal").classList.add("show"); $("authMessage").textContent = ""; }
function closeAuth() { $("authModal").classList.remove("show"); }
$("authOpen").addEventListener("click", showAuth);
$("communitySignIn").addEventListener("click", showAuth);
$("authClose").addEventListener("click", closeAuth);
$("authModal").addEventListener("click", e => { if (e.target === $("authModal")) closeAuth(); });

$("authSwitch").addEventListener("click", () => {
  registerMode = !registerMode;
  $("authTitle").innerHTML = registerMode ? "CREATE <em>ACCOUNT</em>" : "SIGN <em>IN</em>";
  $("usernameLabel").classList.toggle("hidden", !registerMode);
  $("username").required = registerMode;
  $("authSubmit").textContent = registerMode ? "CREATE ACCOUNT ↗" : "SIGN IN ↗";
  $("switchText").textContent = registerMode ? "Already a member?" : "New to AAF?";
  $("authSwitch").textContent = registerMode ? "Sign in" : "Create an account";
  $("password").autocomplete = registerMode ? "new-password" : "current-password";
  $("authMessage").textContent = "";
});

function setAuthMessage(message, isError = false) {
  $("authMessage").textContent = message;
  $("authMessage").style.color = isError ? "#ff9b8e" : "var(--green)";
}

if (!configured) {
  setAuthMessage("Firebase is not connected yet. Add your web configuration in firebase-config.js.", true);
} else {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

  onAuthStateChanged(auth, async user => {
    currentUser = user;
    currentProfile = null;
    if (user) {
      const snap = await getDoc(doc(db, "users", user.uid));
      currentProfile = snap.exists() ? snap.data() : { username: user.email?.split("@")[0] || "Fan" };
      $("authOpen").textContent = "Sign out";
      $("authOpen").onclick = async () => { await signOut(auth); };
      $("userAvatar").textContent = (currentProfile.username || "F").charAt(0).toUpperCase();
      $("commentInput").disabled = false;
      $("commentForm").querySelector("button").disabled = false;
      $("commentInput").placeholder = `Share your take, ${currentProfile.username}...`;
      closeAuth();
    } else {
      $("authOpen").textContent = "Sign in";
      $("authOpen").onclick = showAuth;
      $("userAvatar").textContent = "G";
      $("commentInput").disabled = true;
      $("commentForm").querySelector("button").disabled = true;
      $("commentInput").placeholder = "Sign in to share your football take...";
    }
  });

  $("authForm").addEventListener("submit", async e => {
    e.preventDefault();
    const email = $("email").value.trim();
    const password = $("password").value;
    $("authSubmit").disabled = true;
    try {
      if (registerMode) {
        const username = $("username").value.trim();
        if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) throw new Error("Username must be 3–20 characters (letters, numbers or underscore).");
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", credential.user.uid), {
          username, email, createdAt: serverTimestamp(), points: 0
        });
        setAuthMessage("Account created. Welcome to AAF!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setAuthMessage("Signed in successfully.");
      }
    } catch (err) { setAuthMessage(err.message || "Something went wrong.", true); }
    finally { $("authSubmit").disabled = false; }
  });

  const newsQuery = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(12));
  onSnapshot(newsQuery, snap => {
    const feed = $("newsFeed");
    if (snap.empty) return;
    feed.innerHTML = "";
    snap.forEach(postDoc => {
      const post = postDoc.data();
      const article = document.createElement("article");
      article.className = "news-item";
      const category = document.createElement("small"); category.textContent = (post.category || "FOOTBALL").toUpperCase();
      const title = document.createElement("h4"); title.textContent = post.title || "Football update";
      const body = document.createElement("p"); body.textContent = post.body || "";
      article.append(category, title, body);
      if (post.imageUrl) {
        const img = document.createElement("img"); img.src = post.imageUrl; img.alt = post.title || "Football news"; img.loading = "lazy";
        img.style.cssText = "width:100%;max-height:180px;object-fit:cover;border-radius:4px;margin-top:12px";
        article.append(img);
      }
      feed.append(article);
    });
  }, err => console.error("News feed error:", err));

  const commentsQuery = query(collection(db, "comments"), orderBy("createdAt", "desc"), limit(30));
  onSnapshot(commentsQuery, snap => {
    const feed = $("discussionFeed");
    if (snap.empty) return;
    feed.innerHTML = "";
    snap.forEach(commentDoc => {
      const data = commentDoc.data();
      const item = document.createElement("div"); item.className = "comment-item";
      const name = document.createElement("b"); name.textContent = "@" + (data.username || "Fan");
      const message = document.createElement("p"); message.textContent = data.text || "";
      item.append(name, message); feed.append(item);
    });
  }, err => console.error("Comments feed error:", err));

  $("commentForm").addEventListener("submit", async e => {
    e.preventDefault();
    const text = $("commentInput").value.trim();
    if (!currentUser || !currentProfile || !text) return;
    const button = $("commentForm").querySelector("button");
    button.disabled = true;
    try {
      await addDoc(collection(db, "comments"), {
        uid: currentUser.uid,
        username: currentProfile.username,
        text,
        createdAt: serverTimestamp()
      });
      $("commentInput").value = "";
    } catch (err) { alert("Could not post comment: " + err.message); }
    finally { button.disabled = false; }
  });
}

// Small active-section indicator
const sections = [...document.querySelectorAll("main section[id]")];
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      $("sectionName").textContent = entry.target.id.replace("-", " ").toUpperCase();
      document.querySelectorAll(".side-nav a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id));
    }
  });
}, { rootMargin: "-35% 0px -55% 0px" });
sections.forEach(section => observer.observe(section));
      
