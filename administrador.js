import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC2lhun7fPQmAdsY8FoSegi89D8jy83Oeg",
  authDomain: "quesonrisa-2de8f.firebaseapp.com",
  projectId: "quesonrisa-2de8f",
  storageBucket: "quesonrisa-2de8f.firebasestorage.app",
  messagingSenderId: "944850520581",
  appId: "1:944850520581:web:7b0f8da836f83b8b2bea6c",
  measurementId: "G-CD6VP2L9E8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const contenedor = document.getElementById("contenedor-turnos");

function mostrarTurnos() {
  const q = query(collection(db, "turnos"), orderBy("fecha", "asc"));

  onSnapshot(q, (snapshot) => {
    contenedor.innerHTML = "";

    if (snapshot.empty) {
      contenedor.innerHTML = "<p>No hay turnos agendados por el momento.</p>";
      return;
    }

    snapshot.forEach((docTurno) => {
      const turno = docTurno.data();
      const fechaTexto = turno.fecha?.toDate
        ? turno.fecha.toDate().toLocaleDateString("es-AR")
        : turno.fecha || "Sin fecha";

      const card = document.createElement("div");
      card.classList.add("card-turno");
      card.innerHTML = `
        <h3>${turno.paciente || turno.nombre || "Paciente"}</h3>
        <p><strong>Email:</strong> ${turno.email || "No indicado"}</p>
        <p><strong>Razón:</strong> ${turno.motivo || turno.servicio || "Consulta"}</p>
        <p class="fecha-turno">📅 ${fechaTexto} - ⏰ ${turno.hora || "Sin hora"} hs</p>
      `;

      contenedor.appendChild(card);
    });
  });
}

// Verificar con localStorage en lugar de Firebase Auth
const session = JSON.parse(localStorage.getItem("session"));

if (!session || session.role !== "admin") {
  window.location.href = "index.html";
} else {
  mostrarTurnos();
}