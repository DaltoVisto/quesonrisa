// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyC2lhun7fPQmAdsY8FoSegi89D8jy83Oeg",
  authDomain: "quesonrisa-2de8f.firebaseapp.com",
  projectId: "quesonrisa-2de8f",
  storageBucket: "quesonrisa-2de8f.firebasestorage.app",
  messagingSenderId: "944850520581",
  appId: "1:944850520581:web:7b0f8da836f83b8b2bea6c",
  measurementId: "G-CD6VP2L9E8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const messageBox = document.getElementById("messageBox");

const tabs = document.querySelectorAll(".tab");

function showLogin() {
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");

    tabs[0].classList.add("active");
    tabs[1].classList.remove("active");
}

function showRegister() {
    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");

    tabs[1].classList.add("active");
    tabs[0].classList.remove("active");
}

function showMessage(message, type) {
    messageBox.innerHTML = message;
    messageBox.className = type;
}

function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

/* =========================
   REGISTRO
========================= */

registerForm.addEventListener("submit", function(e) {

    e.preventDefault();

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const phone = document.getElementById("registerPhone").value.trim();
    const password = document.getElementById("registerPassword").value.trim();

    let users = getUsers();

    const exists = users.some(user => user.email === email);

    if (exists) {
        showMessage("Este correo ya está registrado.", "error");
        return;
    }

    const newUser = {
        id: Date.now(),
        name,
        email,
        phone,
        password,
        role: "user"
    };

    users.push(newUser);

    saveUsers(users);

    showMessage("Cuenta creada correctamente.", "success");

    registerForm.reset();

    setTimeout(() => {
        showLogin();
    }, 1500);

});

/* =========================
   LOGIN
========================= */

loginForm.addEventListener("submit", function(e) {

    e.preventDefault();

    const type = document.getElementById("loginType").value;
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    const users = getUsers();

    // ADMIN FIJO
    if (
        type === "admin" &&
        email === "admin@consultorio.com" &&
        password === "admin123"
    ) {

        localStorage.setItem("session", JSON.stringify({
            role: "admin",
            email: email
        }));

        showMessage("Ingreso como administrador.", "success");

        setTimeout(() => {
            window.location.href = "index.html";
        }, 1000);

        return;
    }

    // LOGIN USUARIO
    const user = users.find(user =>
        user.email === email &&
        user.password === password
    );

    if (!user) {
        showMessage("Correo o contraseña incorrectos.", "error");
        return;
    }

    localStorage.setItem("session", JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }));

    showMessage("Inicio de sesión exitoso.", "success");

    setTimeout(() => {
        window.location.href = "index.html";
    }, 1000);

});