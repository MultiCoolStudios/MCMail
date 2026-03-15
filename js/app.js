import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth,
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
onAuthStateChanged,
signOut
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

import {
getFirestore,
collection,
addDoc,
query,
where,
getDocs,
orderBy,
deleteDoc,
doc,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

console.log("MCMail script loaded");

const firebaseConfig = {
apiKey: "AIzaSyAa1KLEXYAh6ojvUGsowG_SjD6Yszm2uKw",
authDomain: "mcmail-e804b.firebaseapp.com",
projectId: "mcmail-e804b",
storageBucket: "mcmail-e804b.firebasestorage.app",
messagingSenderId: "508188263974",
appId: "1:508188263974:web:cfde24019748e4461748e7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.register = async function(){

const email = document.getElementById("email").value.trim().toLowerCase();
const password = document.getElementById("password").value;

try{
await createUserWithEmailAndPassword(auth,email,password);
alert("Account created");
}catch(e){
alert(e.message);
}

}

window.login = async function(){

const email = document.getElementById("email").value.trim().toLowerCase();
const password = document.getElementById("password").value;

try{
await signInWithEmailAndPassword(auth,email,password);
window.location="inbox.html";
}catch(e){
alert(e.message);
}

}

window.logout = async function(){

await signOut(auth);
window.location="index.html";

}

window.sendMail = async function(){

const user = auth.currentUser;

if(!user){
alert("Not logged in");
return;
}

const to = document.getElementById("to").value.trim().toLowerCase();
const subject = document.getElementById("subject").value;
const body = document.getElementById("body").value;

try{

await addDoc(collection(db,"messages"),{
from:user.email,
to:to,
subject:subject,
body:body,
timestamp:serverTimestamp()
});

await enforceLimit(to);

alert("Sent!");

}catch(e){
alert(e.message);
}

}

async function enforceLimit(email){

const q = query(
collection(db,"messages"),
where("to","==",email),
orderBy("timestamp")
);

const snap = await getDocs(q);

if(snap.size > 5){

const oldest = snap.docs[0];

await deleteDoc(doc(db,"messages",oldest.id));

}

}

window.loadInbox = async function(){

const user = auth.currentUser;

if(!user) return;

const q = query(
collection(db,"messages"),
where("to","==",user.email),
orderBy("timestamp","desc")
);

const snap = await getDocs(q);

const inbox = document.getElementById("inbox");

if(!inbox) return;

inbox.innerHTML="";

snap.forEach(d=>{

const data = d.data();

const div = document.createElement("div");

div.className="message";

div.innerHTML = `
<b>From:</b> ${data.from}<br>
<b>Subject:</b> ${data.subject}<br>
<p>${data.body}</p>
`;

inbox.appendChild(div);

});

}

onAuthStateChanged(auth,(user)=>{

if(window.location.pathname.includes("inbox.html") && user){

loadInbox();

}

});
