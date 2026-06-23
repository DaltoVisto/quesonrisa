import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// ==========================================
// 1. CONFIGURACIÓN E INICIALIZACIÓN DE FIREBASE
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyC2lhun7fPQmAdsY8FoSegi89D8jy83Oeg",
  authDomain: "quesonrisa-2de8f.firebaseapp.com",
  projectId: "quesonrisa-2de8f",
  storageBucket: "quesonrisa-2de8f.firebasestorage.app",
  messagingSenderId: "944850520581",
  appId: "1:944850520581:web:7b0f8da836f83b8b2bea6c",
  measurementId: "G-CD6VP2L9E8",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Elementos de la interfaz para mensajes
const messageBox = document.getElementById("messageBox");

function mostrarMensaje(texto, tipo) {
  if (!messageBox) return;
  messageBox.textContent = texto;
  messageBox.className = tipo; // 'success' o 'error'
  messageBox.classList.remove("hidden");
}

// ==========================================
// 2. CONTROL DEL INGRESO (LOGIN)
// ==========================================
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const emailIngresado = document.getElementById("loginEmail").value.trim();
    const passwordIngresado = document.getElementById("loginPassword").value;

    try {
      // Buscamos al usuario en la colección "usuarios" de Firestore por su email
      const q = query(
        collection(db, "users"),
        where("email", "==", emailIngresado),
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docUsuario = querySnapshot.docs[0];
        const usuario = docUsuario.data();

        // Verificamos si la contraseña coincide
        if (usuario.password === passwordIngresado) {
          // Guardamos la sesión local con el rol detectado desde Firebase
          localStorage.setItem(
            "session",
            JSON.stringify({
              id: docUsuario.id,
              name: usuario.nombre,
              email: usuario.email,
              role: usuario.role || "paciente", // Si no tiene rol, por defecto es paciente
            }),
          );

          mostrarMensaje("¡Ingreso exitoso! Redirigiendo...", "success");

          // ¡Tu idea en acción! Redirección inteligente basada en Firebase
          setTimeout(() => {
            if (usuario.role === "admin") {
              window.location.href = "administrador.html"; // Tu página para el administrador
            } else {
              window.location.href = "panel.html"; // Tu página para que el paciente saque turnos
            }
          }, 1500);
        } else {
          mostrarMensaje("Contraseña incorrecta. Intentalo de nuevo.", "error");
        }
      } else {
        mostrarMensaje("El correo electrónico no está registrado.", "error");
      }
    } catch (error) {
      console.error("Error al iniciar sesión: ", error);
      mostrarMensaje("Hubo un problema al conectar con el servidor.", "error");
    }
  });
}


// ==========================================
// 3. CONTROL DEL REGISTRO (PACIENTES)
// ==========================================
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const nombre = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const telefono = document.getElementById("registerPhone").value.trim();
    const password = document.getElementById("registerPassword").value;

    if (password.length < 6) {
      mostrarMensaje(
        "La contraseña debe tener al menos 6 caracteres.",
        "error",
      );
      return;
    }

    try {
      // Verificamos primero si el email ya existe para no duplicarlo
      const q = query(collection(db, "usuarios"), where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        mostrarMensaje("Este correo ya está registrado.", "error");
        return;
      }

      // Creamos el nuevo usuario con el rol base de "paciente"
      const nuevoUsuario = {
        nombre: nombre,
        email: email,
        telefono: telefono,
        password: password, // Almacenamiento básico
        rol: "paciente", // Todos los registrados web arrancan como pacientes
        creadoEl: new Date(),
      };

      await addDoc(collection(db, "usuarios"), nuevoUsuario);
      mostrarMensaje("¡Cuenta creada con éxito! Ya podés ingresar.", "success");

      registerForm.reset();

      // Volvemos visualmente a la pestaña de login después de 2 segundos
      setTimeout(() => {
        if (typeof showTab === "function") {
          showTab("login");
        }
      }, 2000);
    } catch (error) {
      console.error("Error al registrar usuario: ", error);
      mostrarMensaje("No se pudo completar el registro.", "error");
    }
  });
}
// ==========================================
// 4. CONTROL DE PESTAÑAS (LOGIN / REGISTRO)
// ==========================================
function showLogin() {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const tabs = document.querySelectorAll(".tab");

  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");

  tabs[0].classList.add("active");
  tabs[1].classList.remove("active");
}

function showRegister() {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const tabs = document.querySelectorAll(".tab");

  loginForm.classList.add("hidden");
  registerForm.classList.remove("hidden");

  tabs[0].classList.remove("active");
  tabs[1].classList.add("active");
}

// Exponemos las funciones globalmente para que funcionen con onclick
window.showLogin = showLogin;
window.showRegister = showRegister;