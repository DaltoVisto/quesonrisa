const appointmentForm = document.getElementById('appointmentForm');
const confirmationBox = document.getElementById('confirmation');
const bookedAppointments = document.getElementById('bookedAppointments');
const availableSlotsList = document.getElementById('availableSlotsList');
const dateInput = document.getElementById('date');

const doctors = ['Dr. García', 'Dra. López', 'Dr. Martínez'];
const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
const daysToShow = 5;

function getSavedAppointments() {
    return JSON.parse(localStorage.getItem('appointments')) || [];
}

function saveAppointments(appointments) {
    localStorage.setItem('appointments', JSON.stringify(appointments));
}

function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
}

function generateAvailableSlots() {
    const slots = [];
    const today = new Date();

    for (let i = 0; i < daysToShow; i++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + i);
        const dateValue = currentDate.toISOString().split('T')[0];

        doctors.forEach((doctor) => {
            times.forEach((time) => {
                slots.push({ date: dateValue, time, doctor });
            });
        });
    }

    return slots;
}

function getAvailableSlots(appointments) {
    const reservedKeys = new Set(
        appointments.map((appointment) => `${appointment.date}|${appointment.time}|${appointment.doctor}`)
    );

    return generateAvailableSlots().filter((slot) => {
        const slotKey = `${slot.date}|${slot.time}|${slot.doctor}`;
        return !reservedKeys.has(slotKey);
    });
}

function renderAvailableSlots() {
    const appointments = getSavedAppointments();
    const availableSlots = getAvailableSlots(appointments);

    availableSlotsList.innerHTML = '';

    if (availableSlots.length === 0) {
        availableSlotsList.innerHTML = '<li>No hay turnos disponibles para los próximos días.</li>';
        return;
    }

    availableSlots.forEach((slot) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${slot.date} - ${slot.time} - ${slot.doctor}`;
        availableSlotsList.appendChild(listItem);
    });
}

function renderBookedAppointments() {
    const appointments = getSavedAppointments();

    if (appointments.length === 0) {
        bookedAppointments.innerHTML = '<p>No hay turnos reservados aún.</p>';
        return;
    }

    bookedAppointments.innerHTML = '';

    appointments.forEach((appointment) => {
        const card = document.createElement('div');
        card.className = 'appointment-card';
        card.innerHTML = `
            <strong>${appointment.name}</strong><br>
            ${appointment.date} ${appointment.time} - ${appointment.doctor}<br>
            ${appointment.reason}<br>
            <small>${appointment.email} · ${appointment.phone}</small>
        `;
        bookedAppointments.appendChild(card);
    });
}

function showConfirmation() {
    appointmentForm.style.display = 'none';
    confirmationBox.style.display = 'block';
}

appointmentForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const doctor = document.getElementById('doctor').value;
    const reason = document.getElementById('reason').value.trim();

    if (!name || !email || !phone || !date || !time || !doctor || !reason) {
        alert('Por favor, complete todos los campos.');
        return;
    }

    const appointments = getSavedAppointments();
    const exists = appointments.some(
        (appointment) => appointment.date === date && appointment.time === time && appointment.doctor === doctor
    );

    if (exists) {
        alert('Este turno ya está reservado. Por favor, elija otra fecha, hora o médico.');
        return;
    }

    const appointment = {
        name,
        email,
        phone,
        date,
        time,
        doctor,
        reason,
        timestamp: new Date().toISOString(),
    };

    appointments.push(appointment);
    saveAppointments(appointments);

    renderAvailableSlots();
    renderBookedAppointments();
    showConfirmation();
});

document.addEventListener('DOMContentLoaded', function () {
    setMinDate();
    renderAvailableSlots();
    renderBookedAppointments();
});