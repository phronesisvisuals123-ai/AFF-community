import {initializeApp} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,onAuthStateChanged,signOut} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getFirestore,collection,addDoc,query,orderBy,limit,onSnapshot,serverTimestamp,deleteDoc,doc} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {firebaseConfig} from "./firebase-config.js";
const ADMIN_UID="7kkp1Gk3X8e2s0NhloD8x0F4AfH3", $=id=>document.getElementById(id);
const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
function status(msg,error=false){$("status").textContent=msg;$("status").classList.toggle("error",error)}
function node(tag,text){const e=document.createElement(tag);e.textContent=text||"";return e}
onAuthStateChanged(auth,user=>{
 if(!user){$("dashboard").classList.add("hidden");$("signOut").classList.add("hidden");status("Sign in to your AAF account on the public website, then return here.",true);return}
 $("signOut").classList.remove("hidden");
 if(user.uid!==ADMIN_UID){$("dashboard").classList.add("hidden");status("Access denied. This account is not the authorised AAF administrator.",true);return}
 $("dashboard").classList.remove("hidden");status("Administrator access confirmed. Welcome to AAF.");loadFeeds();
});
$("signOut").onclick=async()=>{await signOut(auth);location.href="./index.html"};
$("newsForm").addEventListener("submit",async e=>{
 e.preventDefault();const b=$("publishBtn");b.disabled=true;
 try{const title=$("title").value.trim(),body=$("body").value.trim(),imageUrl=$("imageUrl").value.trim();
 if(!title||!body)throw Error("Enter a headline and article text.");
 if(imageUrl&&!/^https:\/\//i.test(imageUrl))throw Error("Image URL must begin with https://");
 await addDoc(collection(db,"posts"),{title,body,category:$("category").value,imageUrl,authorUid:auth.currentUser.uid,createdAt:serverTimestamp()});
 $("newsForm").reset();status("News published. It should appear on the public AAF feed.");
 }catch(err){status("Could not publish: "+err.message,true)}finally{b.disabled=false}
});
let started=false;
function loadFeeds(){if(started)return;started=true;
 onSnapshot(query(collection(db,"posts"),orderBy("createdAt","desc"),limit(30)),snap=>{
  const box=$("postsList");box.replaceChildren();if(snap.empty){box.textContent="No posts yet.";return}
  snap.forEach(s=>{const data=s.data(),row=node("div","");row.className="item";const copy=node("div","");copy.append(node("b",data.title||"Untitled"),node("small",data.category||"FOOTBALL"),node("p",(data.body||"").slice(0,180)));const del=node("button","Delete");del.className="danger";del.onclick=async()=>{if(confirm("Delete this news post?"))try{await deleteDoc(doc(db,"posts",s.id))}catch(e){status(e.message,true)}};row.append(copy,del);box.append(row)})
 },e=>status("News error: "+e.message,true));
 onSnapshot(query(collection(db,"comments"),orderBy("createdAt","desc"),limit(50)),snap=>{
  const box=$("commentsList");box.replaceChildren();if(snap.empty){box.textContent="No comments yet.";return}
  snap.forEach(s=>{const data=s.data(),row=node("div","");row.className="item";const copy=node("div","");copy.append(node("b","@"+(data.username||"Fan")),node("p",data.text||""));const del=node("button","Remove comment");del.className="danger";del.onclick=async()=>{if(confirm("Remove this comment?"))try{await deleteDoc(doc(db,"comments",s.id))}catch(e){status(e.message,true)}};row.append(copy,del);box.append(row)})
 },e=>status("Comments error: "+e.message,true));
    }
