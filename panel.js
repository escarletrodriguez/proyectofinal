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


// ==========================================
// HERRAMIENTAS ADMINISTRATIVAS
// ==========================================
function guardarEspecialidadesAdmin() {
    localStorage.setItem("especialidadesMedicas", JSON.stringify(especialidadesMedicas));
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
}
function usuarioMedicoDesdeNombre(nombre) {
    return nombre.replace(/^Dra?\\.\\s*/i, "")
        .normalize("NFD").replace(/[\\u0300-\\u036f]/g, "")
        .toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\\.|\\.$/g, "");
}
function refrescarSelectoresMedicosAdmin() {
    const gestionEspecialidad = document.getElementById("gestionEspecialidad");
    const especialidadDestino = document.getElementById("especialidadDestino");
    const medicoRetirar = document.getElementById("medicoRetirar");
    const disponibilidadMedico = document.getElementById("disponibilidadMedico");
    const llenarEspecialidades = select => {
        if (!select) return;
        const anterior = select.value;
        select.innerHTML = "";
        especialidadesMedicas.forEach(esp => {
            const op = document.createElement("option");
            op.value = esp.nombre; op.textContent = esp.nombre; select.appendChild(op);
        });
        if (especialidadesMedicas.some(esp => esp.nombre === anterior)) select.value = anterior;
    };
    llenarEspecialidades(gestionEspecialidad);
    llenarEspecialidades(especialidadDestino);
    [medicoRetirar, disponibilidadMedico].forEach(select => {
        if (!select) return;
        const anterior = select.value;
        select.innerHTML = "";
        especialidadesMedicas.forEach(esp => esp.medicos.forEach(nombre => {
            const op = document.createElement("option");
            op.value = nombre;
            op.textContent = nombre + " — " + esp.nombre;
            select.appendChild(op);
        }));
        if ([...select.options].some(op => op.value === anterior)) select.value = anterior;
    });
}
const campoNuevaEspecialidad = document.getElementById("nuevaEspecialidad");
const estadoGestionMedicos = document.getElementById("estadoGestionMedicos");
if (campoNuevaEspecialidad && rolActual() === "administrador") {
    const campoNombreMedico = document.getElementById("nombreNuevoMedico");
    const selectEspecialidadGestion = document.getElementById("gestionEspecialidad");
    const selectMedicoRetirar = document.getElementById("medicoRetirar");
    const selectEspecialidadDestino = document.getElementById("especialidadDestino");
    const mostrarEstadoGestion = mensaje => { estadoGestionMedicos.textContent = mensaje; };
    refrescarSelectoresMedicosAdmin();

    document.getElementById("agregarEspecialidad").addEventListener("click", () => {
        const nombre = campoNuevaEspecialidad.value.trim();
        if (!nombre) return alert("Escribe el nombre de la especialidad.");
        if (especialidadesMedicas.some(e => e.nombre.toLocaleLowerCase() === nombre.toLocaleLowerCase())) return alert("Esa especialidad ya existe.");
        especialidadesMedicas.push({nombre, medicos: []});
        guardarEspecialidadesAdmin();
        refrescarSelectoresMedicosAdmin();
        selectEspecialidadGestion.value = nombre;
        campoNuevaEspecialidad.value = "";
        mostrarEstadoGestion("Especialidad agregada correctamente.");
    });

    document.getElementById("agregarMedico").addEventListener("click", () => {
        const especialidad = especialidadesMedicas.find(e => e.nombre === selectEspecialidadGestion.value);
        const nombre = campoNombreMedico.value.trim();
        if (!especialidad) return alert("Primero crea o selecciona una especialidad.");
        if (!nombre || !/^Dra?\\.\\s+.+/i.test(nombre)) return alert("Escribe el nombre con el formato Dr. Nombre o Dra. Nombre.");
        if (especialidadesMedicas.some(e => e.medicos.some(m => m.toLocaleLowerCase() === nombre.toLocaleLowerCase()))) return alert("Ese médico ya está registrado.");
        especialidad.medicos.push(nombre);
        const usuarioMedico = usuarioMedicoDesdeNombre(nombre);
        usuarios[usuarioMedico] = {password:"Medico2026!", rol:"medico", nombre, medico:nombre, especialidad:especialidad.nombre};
        guardarEspecialidadesAdmin();
        refrescarSelectoresMedicosAdmin();
        campoNombreMedico.value = "";
        mostrarEstadoGestion("Médico agregado. Usuario: " + usuarioMedico + " | Contraseña inicial: Medico2026!");
    });

    document.getElementById("moverMedico").addEventListener("click", () => {
        const nombre = selectMedicoRetirar.value;
        const destino = especialidadesMedicas.find(e => e.nombre === selectEspecialidadDestino.value);
        if (!nombre || !destino) return alert("Selecciona el médico y la especialidad de destino.");
        const origen = especialidadesMedicas.find(e => e.medicos.includes(nombre));
        if (!origen) return;
        if (origen === destino) return alert("El médico ya pertenece a esa especialidad.");
        origen.medicos = origen.medicos.filter(m => m !== nombre);
        destino.medicos.push(nombre);
        const cuenta = usuarios[usuarioMedicoDesdeNombre(nombre)];
        if (cuenta) cuenta.especialidad = destino.nombre;
        guardarEspecialidadesAdmin();
        refrescarSelectoresMedicosAdmin();
        mostrarEstadoGestion("Médico movido a " + destino.nombre + ". Las citas anteriores se conservan.");
    });

    document.getElementById("retirarMedico").addEventListener("click", () => {
        const nombre = selectMedicoRetirar.value;
        const origen = especialidadesMedicas.find(e => e.medicos.includes(nombre));
        if (!origen || !nombre) return alert("Selecciona un médico.");
        if (!confirm("¿Retirar a " + nombre + " de la lista de médicos disponibles? Las citas anteriores se conservarán.")) return;
        origen.medicos = origen.medicos.filter(m => m !== nombre);
        delete usuarios[usuarioMedicoDesdeNombre(nombre)];
        guardarEspecialidadesAdmin();
        refrescarSelectoresMedicosAdmin();
        mostrarEstadoGestion("Médico retirado de la lista. Sus citas históricas se conservaron.");
    });
}

// Agenda de horarios ocupados y libres para el médico y la fecha elegidos.
const tablaDisponibilidad = document.getElementById("tablaDisponibilidad");
if (tablaDisponibilidad && rolActual() === "administrador") {
    const selectorDisponibilidad = document.getElementById("disponibilidadMedico");
    const fechaDisponibilidad = document.getElementById("disponibilidadFecha");
    const resumenDisponibilidad = document.getElementById("resumenDisponibilidad");
    const horasAdministrativas = [];
    [[8, 12], [14, 17]].forEach(([inicio, fin]) => {
        for (let minutos = inicio * 60; minutos < fin * 60; minutos += 15) {
            horasAdministrativas.push(String(Math.floor(minutos / 60)).padStart(2, "0") + ":" + String(minutos % 60).padStart(2, "0"));
        }
    });
    function citaActivaEnHorario(medico, fecha, hora, excluirId) {
        return citasSistema.find(c => c.id !== excluirId && c.medico === medico && c.fecha === fecha && c.hora === hora && !["Cancelado", "Cancelada", "Rechazado"].includes(c.estado));
    }
    function fechaLocalAdmin(fecha) {
        return [fecha.getFullYear(), String(fecha.getMonth()+1).padStart(2,"0"), String(fecha.getDate()).padStart(2,"0")].join("-");
    }
    function rangoFechasRegistro() {
        const ahora = new Date();
        const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
        const manana = new Date(hoy); manana.setDate(manana.getDate()+1);
        const soloManana = ahora.getHours() < 8 || ahora.getHours() >= 17;
        return {min: fechaLocalAdmin(soloManana ? manana : hoy), max: fechaLocalAdmin(manana)};
    }
    function cancelarCitaAdmin(cita) {
        const justificacion = prompt("Escribe la justificación para cancelar la ficha " + cita.id + ":");
        if (!justificacion || !justificacion.trim()) return alert("La justificación es obligatoria. No se realizaron cambios.");
        cita.historialAdmin = Array.isArray(cita.historialAdmin) ? cita.historialAdmin : [];
        cita.historialAdmin.push({accion:"Cancelación", fechaAnterior:cita.fecha, horaAnterior:cita.hora, justificacion:justificacion.trim(), administrador:usuarioActual, fechaRegistro:new Date().toISOString()});
        cita.justificacionAdmin = justificacion.trim();
        cita.estado = "Cancelado";
        guardarCitas();
        mostrarDisponibilidadAdmin();
        mostrarPanel();
        alert("Ficha cancelada. El horario anterior volvió a quedar disponible.");
    }
    function reprogramarCitaAdmin(cita) {
        const rango = rangoFechasRegistro();
        const fechaNueva = prompt("Nueva fecha (AAAA-MM-DD). Regla vigente: " + rango.min + " hasta " + rango.max + ".", cita.fecha);
        if (!fechaNueva) return;
        if (fechaNueva < rango.min || fechaNueva > rango.max) return alert("Para mantener la regla de fichas, selecciona una fecha entre " + rango.min + " y " + rango.max + ".");
        const horaNueva = prompt("Nueva hora disponible (formato HH:MM).", cita.hora);
        if (!horaNueva || !horasAdministrativas.includes(horaNueva)) return alert("Selecciona un horario válido de la agenda.");
        if (citaActivaEnHorario(cita.medico, fechaNueva, horaNueva, cita.id)) return alert("Ese horario ya está ocupado por otra ficha.");
        const justificacion = prompt("Escribe la justificación del cambio:");
        if (!justificacion || !justificacion.trim()) return alert("La justificación es obligatoria. No se realizaron cambios.");
        cita.historialAdmin = Array.isArray(cita.historialAdmin) ? cita.historialAdmin : [];
        cita.historialAdmin.push({accion:"Reprogramación", fechaAnterior:cita.fecha, horaAnterior:cita.hora, fechaNueva, horaNueva, justificacion:justificacion.trim(), administrador:usuarioActual, fechaRegistro:new Date().toISOString()});
        cita.fecha = fechaNueva;
        cita.hora = horaNueva;
        cita.justificacionAdmin = justificacion.trim();
        cita.estado = "Pendiente";
        guardarCitas();
        mostrarDisponibilidadAdmin();
        mostrarPanel();
        alert("Cita reprogramada. El horario anterior quedó disponible y la ficha volvió a Pendiente.");
    }
    function mostrarDisponibilidadAdmin() {
        refrescarSelectoresMedicosAdmin();
        const medico = selectorDisponibilidad.value;
        const fecha = fechaDisponibilidad.value;
        tablaDisponibilidad.innerHTML = "";
        if (!medico || !fecha) {
            resumenDisponibilidad.textContent = "Selecciona un médico y una fecha para ver los horarios.";
            return;
        }
        const citasDelDia = citasSistema.filter(c => c.medico === medico && c.fecha === fecha && !["Cancelado", "Cancelada", "Rechazado"].includes(c.estado));
        const disponibles = horasAdministrativas.length - new Set(citasDelDia.map(c => c.hora)).size;
        resumenDisponibilidad.textContent = medico + " — " + fecha + ": " + citasDelDia.length + " reservada(s), " + Math.max(0, disponibles) + " horario(s) libre(s).";
        horasAdministrativas.forEach(hora => {
            const cita = citaActivaEnHorario(medico, fecha, hora);
            const fila = document.createElement("tr");
            const cHora = document.createElement("td"); cHora.textContent = hora; fila.appendChild(cHora);
            const cDisponibilidad = document.createElement("td"); cDisponibilidad.textContent = cita ? "Reservado" : "Disponible"; fila.appendChild(cDisponibilidad);
            const cPaciente = document.createElement("td"); cPaciente.textContent = cita ? nombreCompletoPaciente(cita) + " / " + cita.id : "—"; fila.appendChild(cPaciente);
            const cEstado = document.createElement("td"); cEstado.textContent = cita ? cita.estado : "—"; fila.appendChild(cEstado);
            const cAccion = document.createElement("td");
            if (cita) {
                const btnMover = document.createElement("button"); btnMover.type = "button"; btnMover.className = "boton-accion"; btnMover.textContent = "Reprogramar";
                btnMover.addEventListener("click", () => reprogramarCitaAdmin(cita)); cAccion.appendChild(btnMover);
                const btnCancelar = document.createElement("button"); btnCancelar.type = "button"; btnCancelar.className = "boton-accion"; btnCancelar.textContent = "Cancelar";
                btnCancelar.addEventListener("click", () => cancelarCitaAdmin(cita)); cAccion.appendChild(btnCancelar);
            } else {
                cAccion.textContent = "Sin acciones";
            }
            fila.appendChild(cAccion); tablaDisponibilidad.appendChild(fila);
        });
    }
    document.getElementById("consultarDisponibilidad").addEventListener("click", mostrarDisponibilidadAdmin);
    selectorDisponibilidad.addEventListener("change", mostrarDisponibilidadAdmin);
    fechaDisponibilidad.addEventListener("change", mostrarDisponibilidadAdmin);
    refrescarSelectoresMedicosAdmin();
    mostrarDisponibilidadAdmin();
}
