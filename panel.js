// Paneles de administración y personal médico.
const tablaPanel = document.getElementById("tablaPanel");
const buscarCita = document.getElementById("buscarCita");
const filtroEstado = document.getElementById("filtroEstado");
function actualizarEstado(id, estado) {
    const cita = citasSistema.find(c => c.id === id);
    if (!cita) return;
    const rol = rolActual();
    if (rol === "administrador" && estado === "Validada" && cita.estado === "Pendiente") cita.estado = estado;
    else if (rol === "administrador" && estado === "No asistió" && cita.estado === "Pendiente") cita.estado = estado;
    else if (rol === "medico" && ["Atendida", "No asistió"].includes(estado) && cita.estado === "Validada" && cita.medico === usuarios[usuarioActual].medico) cita.estado = estado;
    else return alert("Transición no permitida.");
    guardarCitas();
    mostrarPanel();
}
function confirmarInasistencia(id) {
    if (confirm("¿Confirmar que el paciente no asistió? Esta acción conservará la ficha en el historial.")) {
        actualizarEstado(id, "No asistió");
    }
}
function mostrarPanel() {
    if (!tablaPanel) return;
    const rol = rolActual();
    let citas = citasSistema.filter(c => rol === "administrador" || c.medico === usuarios[usuarioActual].medico);
    const total = citas.length;
    const pendientes = citas.filter(c => c.estado === "Pendiente").length;
    const validadas = citas.filter(c => c.estado === "Validada").length;
    const atendidas = citas.filter(c => c.estado === "Atendida").length;
    const ausentes = citas.filter(c => c.estado === "No asistió").length;
    document.getElementById("resumenPanel").textContent = `Total: ${total} | Pendientes: ${pendientes} | Validadas: ${validadas} | Atendidas: ${atendidas} | No asistió: ${ausentes}`;
    const q = buscarCita.value.toLocaleLowerCase().trim();
    const estado = filtroEstado.value;
    citas = citas.filter(c => (!estado || c.estado === estado) && (!q || [c.id,c.usuario,c.medico,c.especialidad].some(v => String(v || "").toLocaleLowerCase().includes(q))));
    citas.sort((a,b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
    tablaPanel.innerHTML = "";
    if (!citas.length) { tablaPanel.innerHTML = '<tr><td colspan="8">No se encontraron citas.</td></tr>'; return; }
    citas.forEach(c => {
        const fila = document.createElement("tr");
        [c.id,c.usuario,c.fecha,c.hora,c.medico,c.especialidad,c.estado].forEach(valor => { const td = document.createElement("td"); td.textContent = valor || ""; fila.appendChild(td); });
        const acciones = document.createElement("td");
        function boton(texto, accion) { const b = document.createElement("button"); b.type = "button"; b.className = "boton-accion"; b.textContent = texto; b.addEventListener("click", accion); acciones.appendChild(b); }
        boton("Imprimir", () => imprimirFicha(c.id));
        if (rol === "administrador" && c.estado === "Pendiente") {
            boton("Validar llegada", () => actualizarEstado(c.id,"Validada"));
            boton("No asistió", () => confirmarInasistencia(c.id));
        }
        if (rol === "medico" && c.estado === "Validada") {
            boton("Marcar atendida", () => actualizarEstado(c.id,"Atendida"));
            boton("No asistió", () => confirmarInasistencia(c.id));
        }
        fila.appendChild(acciones); tablaPanel.appendChild(fila);
    });
}
if (tablaPanel) { buscarCita.addEventListener("input",mostrarPanel); filtroEstado.addEventListener("change",mostrarPanel); mostrarPanel(); }

// Configuración de cupos exclusiva del panel administrativo.
const selectorCupo = document.getElementById("cupoEspecialidad");
if (selectorCupo && rolActual() === "administrador") {
    const fechaCupo = document.getElementById("cupoFecha");
    const limiteCupo = document.getElementById("cupoLimite");
    const estadoCupo = document.getElementById("estadoCupo");
    especialidadesMedicas.forEach(especialidad => {
        const opcion = document.createElement("option");
        opcion.value = especialidad.nombre;
        opcion.textContent = especialidad.nombre;
        selectorCupo.appendChild(opcion);
    });
    function mostrarCupoActual() {
        if (!fechaCupo.value) {
            estadoCupo.textContent = "Seleccione una fecha para consultar o configurar los cupos.";
            limiteCupo.value = "";
            return;
        }
        const cupo = consultarCupo(selectorCupo.value, fechaCupo.value);
        limiteCupo.value = cupo.limite === null ? "" : String(cupo.limite);
        estadoCupo.textContent = cupo.limite === null
            ? `Sin límite configurado. Fichas asignadas: ${cupo.asignadas}.`
            : `Fichas asignadas: ${cupo.asignadas} de ${cupo.limite}.`;
    }
    selectorCupo.addEventListener("change", mostrarCupoActual);
    fechaCupo.addEventListener("change", mostrarCupoActual);
    document.getElementById("guardarCupo").addEventListener("click", () => {
        if (!fechaCupo.value || limiteCupo.value.trim() === "") {
            alert("Seleccione una fecha e introduzca una cantidad de fichas.");
            return;
        }
        const limite = Number(limiteCupo.value);
        if (!Number.isSafeInteger(limite) || limite < 0) {
            alert("La cantidad debe ser un número entero igual o mayor que cero.");
            return;
        }
        const configuracion = obtenerCupos();
        configuracion[claveCupo(selectorCupo.value, fechaCupo.value)] = limite;
        localStorage.setItem("cuposEspecialidad", JSON.stringify(configuracion));
        mostrarCupoActual();
        estadoCupo.textContent += " Configuración guardada.";
    });
    document.getElementById("quitarCupo").addEventListener("click", () => {
        if (!fechaCupo.value) {
            alert("Seleccione una fecha.");
            return;
        }
        const configuracion = obtenerCupos();
        delete configuracion[claveCupo(selectorCupo.value, fechaCupo.value)];
        localStorage.setItem("cuposEspecialidad", JSON.stringify(configuracion));
        mostrarCupoActual();
    });
    mostrarCupoActual();
}
