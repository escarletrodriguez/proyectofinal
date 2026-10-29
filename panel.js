// Paneles separados para administración y personal médico.
const tablaPanel = document.getElementById("tablaPanel");
const buscarCita = document.getElementById("buscarCita");
const filtroEstado = document.getElementById("filtroEstado");
const ESTADOS_FICHA = ["Pendiente", "Aceptado", "Rechazado", "Realizado (Atendido)", "Cancelado", "Sin asistencia"];

function actualizarEstado(id, estado) {
    const cita = citasSistema.find(c => c.id === id);
    if (!cita || !ESTADOS_FICHA.includes(estado)) return;
    const rol = rolActual();
    const usuario = usuarios[usuarioActual] || {};
    if (rol === "administrador") {
        cita.estado = estado;
    } else if (rol === "medico" && cita.medico === usuario.medico) {
        cita.estado = estado;
    } else {
        alert("No tienes permiso para cambiar el estado de esta ficha.");
        return;
    }
    guardarCitas();
    mostrarPanel();
}

function nombreCompletoPaciente(cita) {
    const p = cita.paciente || {};
    return [p.nombre, p.apellidoPaterno, p.apellidoMaterno].filter(Boolean).join(" ") || cita.usuario || "Paciente";
}

function mostrarPanel() {
    if (!tablaPanel) return;
    const rol = rolActual();
    const usuario = usuarios[usuarioActual] || {};
    if (rol === "medico") {
        const titulo = document.getElementById("tituloAgendaMedica");
        if (titulo) titulo.textContent = "Agenda de " + (usuario.medico || usuario.nombre || "médico");
    }
    let citas = citasSistema.filter(c => rol === "administrador" || (rol === "medico" && c.medico === usuario.medico));
    const total = citas.length;
    const pendientes = citas.filter(c => c.estado === "Pendiente").length;
    const aceptadas = citas.filter(c => c.estado === "Aceptado").length;
    const rechazadas = citas.filter(c => c.estado === "Rechazado").length;
    const realizadas = citas.filter(c => c.estado === "Realizado (Atendido)").length;
    const canceladas = citas.filter(c => c.estado === "Cancelado").length;
    const ausentes = citas.filter(c => c.estado === "Sin asistencia").length;
    const resumen = document.getElementById("resumenPanel");
    if (resumen) resumen.textContent = `Total: ${total} | Pendientes: ${pendientes} | Aceptadas: ${aceptadas} | Rechazadas: ${rechazadas} | Realizadas: ${realizadas} | Canceladas: ${canceladas} | Sin asistencia: ${ausentes}`;

    const q = (buscarCita?.value || "").toLocaleLowerCase().trim();
    const estado = filtroEstado?.value || "";
    citas = citas.filter(c => {
        const paciente = nombreCompletoPaciente(c);
        const ci = (c.paciente || {}).carnet || "";
        return (!estado || c.estado === estado) &&
            (!q || [c.id, paciente, ci, c.medico, c.especialidad].some(v => String(v || "").toLocaleLowerCase().includes(q)));
    });
    citas.sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
    tablaPanel.innerHTML = "";
    if (!citas.length) {
        tablaPanel.innerHTML = '<tr><td colspan="' + (rol === "administrador" ? "9" : "8") + '">No se encontraron citas.</td></tr>';
        return;
    }

    citas.forEach(c => {
        const fila = document.createElement("tr");
        const paciente = c.paciente || {};
        const nombre = nombreCompletoPaciente(c);
        const valores = rol === "administrador"
            ? [c.id, nombre, paciente.carnet || "", c.fecha, c.hora, c.medico, c.especialidad]
            : [c.id, nombre, paciente.carnet || "", c.fecha, c.hora, c.especialidad];
        valores.forEach(valor => {
            const td = document.createElement("td");
            td.textContent = valor || "";
            fila.appendChild(td);
        });
        const celdaEstado = document.createElement("td");
        const selector = document.createElement("select");
        selector.className = "selector-estado-ficha";
        selector.setAttribute("aria-label", "Estado de ficha " + c.id);
        ESTADOS_FICHA.forEach(estadoDisponible => {
            const opcion = document.createElement("option");
            opcion.value = estadoDisponible;
            opcion.textContent = estadoDisponible;
            selector.appendChild(opcion);
        });
        selector.value = ESTADOS_FICHA.includes(c.estado) ? c.estado : "Pendiente";
        selector.addEventListener("change", () => actualizarEstado(c.id, selector.value));
        celdaEstado.appendChild(selector);
        fila.appendChild(celdaEstado);

        const acciones = document.createElement("td");
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "boton-accion";
        boton.textContent = "Imprimir";
        boton.addEventListener("click", () => imprimirFicha(c.id));
        acciones.appendChild(boton);
        fila.appendChild(acciones);
        tablaPanel.appendChild(fila);
    });
}
if (tablaPanel) {
    buscarCita?.addEventListener("input", mostrarPanel);
    filtroEstado?.addEventListener("change", mostrarPanel);
    mostrarPanel();
}

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
