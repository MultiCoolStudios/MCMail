import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged }
from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

import {
getFirestore,
collection,
addDoc,
query,
where,
getDocs,
deleteDoc,
doc,
orderBy,
serverTimestamp
}
from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

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

const email = document.getElementById("email").value.toLowerCase();
const password = document.getElementById("password").value;

await createUserWithEmailAndPassword(auth,email,password);

alert("Account created");

}

window.login = async function(){

const email = document.getElementById("email").value.toLowerCase();
const password = document.getElementById("password").value;

await signInWithEmailAndPassword(auth,email,password);

window.location="inbox.html"

}

window.sendMail = async function(){

const user = auth.currentUser;

const to = document.getElementById("to").value.toLowerCase();
const subject = document.getElementById("subject").value;
const body = document.getElementById("body").value;

await addDoc(collection(db,"messages"),{

from:user.email,
to:to,
subject:subject,
body:body,
timestamp:serverTimestamp()

});

limitMessages(user.email);

alert("Sent");

}

async function limitMessages(email){

const q = query(
collection(db,"messages"),
where("to","==",email),
orderBy("timestamp")
);

const snap = await getDocs(q);

if(snap.size > 5){

await deleteDoc(doc(db,"messages",snap.docs[0].id));

}

}

window.loadInbox = async function(){

const user = auth.currentUser;

const q = query(
collection(db,"messages"),
where("to","==",user.email)
);

const snap = await getDocs(q);

const inbox = document.getElementById("inbox");

inbox.innerHTML="";

snap.forEach(docu=>{

const data = docu.data();

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

if(user && window.location.pathname.includes("inbox")){
loadInbox();
}

});
