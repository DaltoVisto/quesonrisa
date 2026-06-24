import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where 
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";
// ==========================================
// 1. CONFIGURACIÓN E INICIALIZACIÓN DE FIREBASE
// ==========================================


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const fechaInput = document.getElementById('fecha');
const horaSelect = document.getElementById('hora');

const HORA_INICIO = 9;
const HORA_FIN = 16;
const INTERVALO_MINUTOS = 30; 

// ==========================================
// 2. CONFIGURACIÓN DE LÍMITES (DÍAS GRISADOS)
// ==========================================
if (fechaInput) {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');

    fechaInput.min = `${yyyy}-${mm}-${dd}`; // Bloquea días pasados
    fechaInput.max = `${yyyy}-12-31`;       // Límite fin de año
}

function bloquearHoras() {
    if (horaSelect) {
        horaSelect.innerHTML = '<option value="" disabled selected>Elige un día primero</option>';
        horaSelect.disabled = true;
    }
}

// ==========================================
// 3. GENERACIÓN FILTRANDO TURNOS RESERVADOS
// ==========================================
async function cargarHorariosDisponibles(fechaSeleccionadaTexto) {
    if (!horaSelect) return;
    
    horaSelect.innerHTML = '<option value="" disabled selected>Cargando horarios...</option>';
    horaSelect.disabled = true;

    const turnosOcupados = []; 

    try {
        // Buscamos en Firestore si ya existen turnos agendados para este día específico
        const q = query(
            collection(db, "turnos"),
            where("fecha", "==", fechaSeleccionadaTexto),
            where("estado", "==", "pendiente")
        );
        
        const querySnapshot = await getDocs(q);
        
        // Guardamos las horas que ya están tomadas
        querySnapshot.forEach((doc) => {
            const datosTurno = doc.data();
            if (datosTurno.hora) {
                turnosOcupados.push(datosTurno.hora);
            }
        });
    } catch (error) {
        console.error("Error al consultar turnos ocupados: ", error);
    }

    // Limpiamos y preparamos el selector
    horaSelect.innerHTML = '<option value="" disabled selected>Selecciona un horario</option>';
    horaSelect.disabled = false;

    let horaActual = HORA_INICIO;
    let minutoActual = 0;

    // Generamos los intervalos y saltamos los que estén en el array de ocupados
    while (horaActual < HORA_FIN || (horaActual === HORA_FIN && minutoActual === 0)) {
        const hFormato = String(horaActual).padStart(2, '0');
        const mFormato = String(minutoActual).padStart(2, '0');
        const tiempoTexto = `${hFormato}:${mFormato}`;

        // ¡Acá está el truco! Si la hora está en la lista de ocupados, no se crea la opción
        if (!turnosOcupados.includes(tiempoTexto)) {
            const option = document.createElement('option');
            option.value = tiempoTexto;
            option.textContent = `${tiempoTexto} hs`;
            horaSelect.appendChild(option);
        }

        minutoActual += INTERVALO_MINUTOS;
        if (minutoActual >= 60) {
            minutoActual = 0;
            horaActual++;
        }
    }

    // Si justo se ocuparon todos los horarios de ese día
    if (horaSelect.options.length === 1) {
        horaSelect.innerHTML = '<option value="" disabled selected>No quedan turnos libres este día</option>';
        horaSelect.disabled = true;
    }
}

// ==========================================
// 4. VALIDACIÓN DE DÍAS (MARTES Y JUEVES)
// ==========================================
if (fechaInput) {
    fechaInput.addEventListener('change', function() {
        const valorFecha = this.value;

        if (!valorFecha) {
            bloquearHoras();
            return;
        }

        const partes = valorFecha.split('-');
        const a = parseInt(partes[0], 10);
        const m = parseInt(partes[1], 10) - 1; 
        const d = parseInt(partes[2], 10);

        const fechaSeleccionada = new Date(a, m, d);
        const diaSemana = fechaSeleccionada.getDay(); // 2 = Martes, 4 = Jueves

        if (diaSemana !== 2 && diaSemana !== 4) {
            alert('Atención: El consultorio solo atiende los días Martes y Jueves. Por favor, selecciona otro día.');
            this.value = ''; 
            bloquearHoras();
            return;
        }

        // Le pasamos la fecha elegida a la función para que verifique en Firebase
        cargarHorariosDisponibles(valorFecha);
    });
}

// ==========================================
// 5. ENVÍO DEL FORMULARIO A FIRESTORE
// ==========================================
const formTurno = document.getElementById('form-turno');
if (formTurno) {
    formTurno.addEventListener('submit', async function(e) {
        e.preventDefault(); 

        if (!fechaInput.value || !horaSelect.value) {
            alert("Por favor, selecciona una fecha y un horario válidos.");
            return;
        }

        const datosSesion = localStorage.getItem("session");

        if (!datosSesion) {
            alert("No se detectó ninguna sesión activa. Por favor, vuelve a iniciar sesión.");
            window.location.href = "login.html";
            return;
        }

        const usuarioLogueado = JSON.parse(datosSesion);

        const datosTurno = {
            nombre: usuarioLogueado.name || "Usuario sin nombre", 
            email: usuarioLogueado.email || "sin_correo@correo.com",
            userId: usuarioLogueado.id || "", 
            fecha: fechaInput.value,                                  
            hora: horaSelect.value,                                    
            motivo: document.getElementById('motivo').value.trim(),    
            estado: "pendiente",                                       
            creadoEl: new Date()                                       
        };

        try {
            const docRef = await addDoc(collection(db, "turnos"), datosTurno);
            alert("¡Turno reservado con éxito!");
            formTurno.reset();
            bloquearHoras();
        } catch (error) {
            console.error("Error al guardar en Firestore: ", error);
            alert("Hubo un problema al procesar tu reserva.");
        }
    });
}