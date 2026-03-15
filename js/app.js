// eat balls if youre seeing this
const firebaseConfig = {
  apiKey: "AIzaSyA0TPTeJnQzftZSSfYq_26eYYZutdY_FTo",
  authDomain: "chat-83daa.firebaseapp.com",
  projectId: "chat-83daa",
  storageBucket: "chat-83daa.firebasestorage.app",
  messagingSenderId: "250842235620",
  appId: "1:250842235620:web:72f1601e3c275e327ea2f1"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
function register() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    auth.createUserWithEmailAndPassword(email, password)
        .then(() => alert('Registered!'))
        .catch(e => alert(e.message));
}

function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    auth.signInWithEmailAndPassword(email, password)
        .then(() => window.location.href = 'inbox.html')
        .catch(e => alert(e.message));
}

function logout() {
    auth.signOut().then(() => window.location.href='index.html');
}
auth.onAuthStateChanged(user => {
  if (!user) return;
  const messagesDiv = document.getElementById('messages');
  if (!messagesDiv) return;

  db.collection('messages')
    .where('to', '==', user.email)
    .orderBy('timestamp', 'desc')
    .onSnapshot(snapshot => {
      messagesDiv.innerHTML = '';
      snapshot.forEach(doc => {
        const msg = doc.data();
        messagesDiv.innerHTML += `<div class="message">
          <b>From:</b> ${msg.from}<br>
          <b>Subject:</b> ${msg.subject}<br>
          <p>${msg.body}</p><hr>
        </div>`;
      });
    });
});

function sendMessage() {
    const user = auth.currentUser;
    if (!user) return alert('Not logged in');

    const to = document.getElementById('to').value;
    const subject = document.getElementById('subject').value;
    const body = document.getElementById('body').value;

    db.collection('messages').add({
        from: user.email,
        to,
        subject,
        body,
        timestamp: firebase.firestore.Timestamp.now()
    }).then(() => {
        alert('Message sent!');
        cleanupMessages(user.email);
        window.location.href='inbox.html';
    });
}

function cleanupMessages(userEmail) {
    // Sent messages
    db.collection('messages')
      .where('from', '==', userEmail)
      .orderBy('timestamp', 'asc')
      .get()
      .then(snapshot => {
        const messages = snapshot.docs;
        if (messages.length > 5) {
          const excess = messages.length - 5;
          for (let i=0;i<excess;i++) messages[i].ref.delete();
        }
      });

    
    db.collection('messages')
      .where('to', '==', userEmail)
      .orderBy('timestamp', 'asc')
      .get()
      .then(snapshot => {
        const messages = snapshot.docs;
        if (messages.length > 5) {
          const excess = messages.length - 5;
          for (let i=0;i<excess;i++) messages[i].ref.delete();
        }
      });
}
