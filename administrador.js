import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const contenedor = document.getElementById("contenedor-turnos");

async function eliminarTurno(turnoId) {
  const confirmar = confirm("¿Estás seguro de que querés eliminar este turno?");
  if (!confirmar) return;

  try {
    const turnoRef = doc(db, "turnos", turnoId);
    await deleteDoc(turnoRef);
    alert("Turno eliminado correctamente.");
  } catch (error) {
    console.error("Error al eliminar el turno: ", error);
    alert("No se pudo eliminar el turno. Intenta nuevamente.");
  }
}

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

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.classList.add("btn-delete");
      deleteButton.textContent = "Eliminar turno";
      deleteButton.addEventListener("click", () => eliminarTurno(docTurno.id));

      card.appendChild(deleteButton);
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