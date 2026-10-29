// ==========================================
// CAJA NACIONAL DE SALUD
// SISTEMA DE CITAS MÉDICAS
// ==========================================


// ==========================================
// ESPECIALIDADES Y MÉDICOS
// ==========================================

const especialidadesMedicas = [

    {
        nombre: "Medicina General",

        medicos: [
            "Dra. María Fernández",
            "Dr. José Ramírez",
            "Dra. Carolina Flores"
        ]
    },

    {
        nombre: "Cardiología",

        medicos: [
            "Dr. Carlos Mendoza",
            "Dra. Patricia Vargas"
        ]
    },

    {
        nombre: "Pediatría",

        medicos: [
            "Dra. Ana Rodríguez",
            "Dr. Miguel Torres",
            "Dra. Gabriela Pérez"
        ]
    },

    {
        nombre: "Odontología",

        medicos: [
            "Dr. Luis Herrera",
            "Dra. Gabriela Castro",
            "Dr. Roberto Suárez"
        ]
    },

    {
        nombre: "Dermatología",

        medicos: [
            "Dra. Sofía Morales",
            "Dr. Eduardo Flores"
        ]
    },

    {
        nombre: "Oftalmología",

        medicos: [
            "Dr. Ricardo Gómez",
            "Dra. Elena Pérez"
        ]
    },

    {
        nombre: "Ginecología",

        medicos: [
            "Dra. Laura Méndez",
            "Dra. Valeria Suárez"
        ]
    },

    {
        nombre: "Traumatología",

        medicos: [
            "Dr. Fernando Rojas",
            "Dr. Marco Salinas"
        ]
    },

    {
        nombre: "Neurología",

        medicos: [
            "Dr. Andrés Molina",
            "Dra. Silvia Torres"
        ]
    },

    {
        nombre: "Urología",

        medicos: [
            "Dr. Daniel Cruz"
        ]
    },

    {
        nombre: "Medicina Interna",

        medicos: [
            "Dra. Rosa Jiménez",
            "Dr. Pablo Flores"
        ]
    },

    {
        nombre: "Otorrinolaringología",

        medicos: [
            "Dr. Sergio López",
            "Dra. Verónica Ruiz"
        ]
    },

    {
        nombre: "Psiquiatría",

        medicos: [
            "Dr. Alejandro Vargas",
            "Dra. Natalia Romero"
        ]
    },

    {
        nombre: "Nutrición",

        medicos: [
            "Dra. Daniela Torres",
            "Dr. Miguel Fernández"
        ]
    },

    {
        nombre: "Endocrinología",

        medicos: [
            "Dra. Claudia Rojas"
        ]
    },

    {
        nombre: "Neumología",

        medicos: [
            "Dr. Martín López",
            "Dra. Paola Mendoza"
        ]
    },

    {
        nombre: "Gastroenterología",

        medicos: [
            "Dr. Javier Herrera",
            "Dra. Sonia Morales"
        ]
    },

    {
        nombre: "Nefrología",

        medicos: [
            "Dr. Ricardo Salazar"
        ]
    }

];


// ==========================================
// VARIABLES
// ==========================================

let medicoSeleccionado = null;

let especialidadSeleccionada = null;

let horaSeleccionada = null;

let fechaSeleccionada = null;


// ==========================================
// SISTEMA DE USUARIOS
// ==========================================

const usuarios = JSON.parse(localStorage.getItem("usuarios") || "{}");
const cuentasDemo = {
    admin_demo: {password: "Admin2026!", rol: "administrador", nombre: "Administración CNS"},
    medico_demo: {password: "Medico2026!", rol: "medico", nombre: "Dra. María Fernández", medico: "Dra. María Fernández", especialidad: "Medicina General"}
};
Object.entries(cuentasDemo).forEach(([clave, datos]) => {
    if (!usuarios[clave]) usuarios[clave] = datos;
});
function crearUsuarioMedico(nombreMedico) {
    return nombreMedico
        .replace(/^Dra?\.\s*/i, "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ".")
        .replace(/^\.|\.$/g, "");
}
especialidadesMedicas.forEach(especialidad => {
    especialidad.medicos.forEach(nombreMedico => {
        const usuarioMedico = crearUsuarioMedico(nombreMedico);
        if (!usuarios[usuarioMedico]) {
            usuarios[usuarioMedico] = {
                password: "Medico2026!",
                rol: "medico",
                nombre: nombreMedico,
                medico: nombreMedico,
                especialidad: especialidad.nombre
            };
        } else if (usuarios[usuarioMedico].rol === "medico") {
            usuarios[usuarioMedico].medico = nombreMedico;
            usuarios[usuarioMedico].especialidad = especialidad.nombre;
        }
    });
});
localStorage.setItem("usuarios", JSON.stringify(usuarios));

function rolActual() {
    const nombre = localStorage.getItem("nombreUsuario");
    return nombre && usuarios[nombre] ? (usuarios[nombre].rol || "paciente") : null;
}
function destinoRol(rol) {
    return rol === "administrador" ? "admin.html" : rol === "medico" ? "medico.html" : "sistema.html";
}
function iniciarSesion(nombre) {
    localStorage.setItem("sesionActiva", "true");
    localStorage.setItem("nombreUsuario", nombre);
    window.location.href = destinoRol(rolActual());
}
const formularioLogin = document.getElementById("formularioLogin");
if (formularioLogin) {
    formularioLogin.addEventListener("submit", function(evento) {
        evento.preventDefault();
        const nombre = document.getElementById("usuario").value.trim();
        const clave = document.getElementById("password").value;
        if (!usuarios[nombre] || usuarios[nombre].password !== clave) {
            alert("Usuario o contraseña incorrectos. Para crear una cuenta, utilice Registrarse.");
            return;
        }
        iniciarSesion(nombre);
    });
}
const formularioRegistro = document.getElementById("formularioRegistro");
if (formularioRegistro) {
    const fechaNacimientoInput = document.getElementById("fechaNacimiento");
    if (fechaNacimientoInput) {
        const hoy = new Date();
        fechaNacimientoInput.max = [hoy.getFullYear(), String(hoy.getMonth() + 1).padStart(2, "0"), String(hoy.getDate()).padStart(2, "0")].join("-");
    }
    formularioRegistro.addEventListener("submit", function(evento) {
        evento.preventDefault();
        const nombreUsuario = document.getElementById("usuario").value.trim();
        const clave = document.getElementById("password").value;
        const confirmar = document.getElementById("confirmarPassword").value;
        const datosPaciente = {
            nombre: document.getElementById("nombre").value.trim(),
            apellidoPaterno: document.getElementById("apellidoPaterno").value.trim(),
            apellidoMaterno: document.getElementById("apellidoMaterno").value.trim(),
            carnet: document.getElementById("carnet").value.trim(),
            fechaNacimiento: document.getElementById("fechaNacimiento").value
        };
        if (nombreUsuario.length < 3 || clave.length < 6) return alert("El usuario debe tener al menos 3 caracteres y la contraseña 6.");
        if (Object.values(datosPaciente).some(valor => !valor)) return alert("Complete todos los datos obligatorios del paciente.");
        if (clave !== confirmar) return alert("Las contraseñas no coinciden.");
        if (usuarios[nombreUsuario]) return alert("El usuario ya existe.");
        if (Object.values(usuarios).some(usuario => usuario.carnet && usuario.carnet === datosPaciente.carnet)) return alert("Ya existe una cuenta registrada con ese carnet de identidad.");
        if (datosPaciente.fechaNacimiento > new Date().toISOString().slice(0, 10)) return alert("La fecha de nacimiento no puede ser futura.");
        usuarios[nombreUsuario] = {
            ...datosPaciente,
            password: clave,
            rol: "paciente",
            fechaRegistro: new Date().toLocaleDateString()
        };
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
        iniciarSesion(nombreUsuario);
    });
}
function cerrarSesion() {
    localStorage.removeItem("sesionActiva");
    localStorage.removeItem("nombreUsuario");
}
function verificarSesion() {
    const pagina = window.location.pathname.split("/").pop();
    const privadas = ["sistema.html", "horarios.html", "historial.html", "admin.html", "medico.html"];
    if (!privadas.includes(pagina)) return;
    if (localStorage.getItem("sesionActiva") !== "true" || !rolActual()) {
        window.location.replace("login.html");
        return;
    }
    const rol = rolActual();
    if (["sistema.html", "horarios.html", "historial.html"].includes(pagina) && rol !== "paciente") {
        window.location.replace(destinoRol(rol));
    }
    if (pagina === "admin.html" && rol !== "administrador") window.location.replace(destinoRol(rol));
    if (pagina === "medico.html" && rol !== "medico") window.location.replace(destinoRol(rol));
}
verificarSesion();

// ==========================================
// USUARIO ACTUAL
// ==========================================

const usuarioActual =

localStorage.getItem(
    "nombreUsuario"
);


// ==========================================
// CITAS DEL USUARIO ACTUAL
// ==========================================

const claveCitasUsuario =

"misCitas_" +

usuarioActual;


let citasUsuario =

JSON.parse(

    localStorage.getItem(
        claveCitasUsuario
    )

)

|| [];


// ==========================================
// CITAS GENERALES DEL SISTEMA
// ==========================================

// Estas citas son utilizadas para saber
// qué horarios están ocupados para TODOS
// los usuarios.

let citasSistema =

JSON.parse(

    localStorage.getItem(
        "citasSistema"
    )

)

|| [];


// Migración de citas antiguas al registro general y normalización de estados.
let huboMigracion = false;
citasSistema = citasSistema.map((cita, indice) => {
    if (!cita.id) {
        cita.id = "ANT-" + String(indice + 1).padStart(5, "0");
        huboMigracion = true;
    }
    const estadosAntiguos = {
        "Validada": "Pendiente",
        "Atendida": "Realizado (Atendido)",
        "Realizada": "Realizado (Atendido)",
        "Cancelada": "Cancelado",
        "No asistió": "Sin asistencia",
        "Sin asistencia": "Sin asistencia"
    };
    if (estadosAntiguos[cita.estado]) {
        cita.estado = estadosAntiguos[cita.estado];
        huboMigracion = true;
    }
    if (!cita.paciente && cita.usuario && usuarios[cita.usuario]) {
        const u = usuarios[cita.usuario];
        cita.paciente = {
            nombre: u.nombre || "",
            apellidoPaterno: u.apellidoPaterno || "",
            apellidoMaterno: u.apellidoMaterno || "",
            carnet: u.carnet || "",
            fechaNacimiento: u.fechaNacimiento || ""
        };
        huboMigracion = true;
    }
    return cita;
});
if (huboMigracion) localStorage.setItem("citasSistema", JSON.stringify(citasSistema));

// ==========================================
// MOSTRAR ESPECIALIDADES
// ==========================================

const contenedorEspecialidades =

document.getElementById(
    "especialidades"
);


if (contenedorEspecialidades) {


    especialidadesMedicas.forEach(

        function(especialidad) {


            const tarjeta =

            document.createElement(
                "div"
            );


            tarjeta.className =
            "especialidad-card";


            tarjeta.innerHTML = `

                <h3>
                    🏥 ${especialidad.nombre}
                </h3>

                <p>
                    ${especialidad.medicos.length}
                    médico(s) disponible(s)
                </p>

                <div class="lista-medicos">

                    ${

                        especialidad.medicos
                        .map(

                            medico => `

                                <div
                                    class="medico"
                                    onclick="
                                        seleccionarMedico(
                                            '${medico}',
                                            '${especialidad.nombre}'
                                        )
                                    "
                                >

                                    <span>
                                        👨‍⚕️
                                    </span>

                                    <div>

                                        <strong>
                                            ${medico}
                                        </strong>

                                        <small>
                                            Ver disponibilidad
                                        </small>

                                    </div>

                                </div>

                            `

                        )

                        .join("")

                    }

                </div>

            `;


            contenedorEspecialidades.appendChild(
                tarjeta
            );

        }

    );

}


// ==========================================
// SELECCIONAR MÉDICO
// ==========================================

function seleccionarMedico(
    medico,
    especialidad
) {


    localStorage.setItem(

        "medicoSeleccionado",

        medico

    );


    localStorage.setItem(

        "especialidadSeleccionada",

        especialidad

    );


    window.location.href =
    "horarios.html";

}


// ==========================================
// CARGAR MÉDICO EN HORARIOS
// ==========================================

const nombreMedico =

document.getElementById(
    "nombreMedico"
);


if (nombreMedico) {


    medicoSeleccionado =

    localStorage.getItem(
        "medicoSeleccionado"
    );


    especialidadSeleccionada =

    localStorage.getItem(
        "especialidadSeleccionada"
    );


    nombreMedico.textContent =
    medicoSeleccionado;


    document
    .getElementById(
        "especialidadMedico"
    )
    .textContent =

    "Especialidad: " +
    especialidadSeleccionada;


    const fechaInput =

    document.getElementById(
        "fechaCita"
    );


    // ==============================
    // FECHA MÍNIMA
    // ==============================

    const hoy =
    new Date();


    const fechaMinima =

    hoy.getFullYear() +

    "-" +

    String(
        hoy.getMonth() + 1
    ).padStart(2, "0")

    +

    "-" +

    String(
        hoy.getDate()
    ).padStart(2, "0");


    fechaInput.min =
    fechaMinima;


    // ==============================
    // CUANDO CAMBIA LA FECHA
    // ==============================

    fechaInput.addEventListener(

        "change",

        function() {


            fechaSeleccionada =
            fechaInput.value;


            horaSeleccionada =
            null;


            document
            .getElementById(
                "confirmacion"
            )
            .style.display =
            "none";


            mostrarHorarios();

        }

    );


    // No mostramos horarios hasta
    // que el usuario seleccione fecha.

}


// ==========================================
// VERIFICAR SI UNA HORA ESTÁ OCUPADA
// ==========================================

// Cupos configurados por especialidad y fecha para este prototipo local.
function obtenerCupos() {
    try {
        const datos = JSON.parse(localStorage.getItem("cuposEspecialidad") || "{}");
        return datos && typeof datos === "object" && !Array.isArray(datos) ? datos : {};
    } catch (error) {
        return {};
    }
}

function claveCupo(especialidad, fecha) {
    return JSON.stringify([especialidad, fecha]);
}

function consultarCupo(especialidad, fecha) {
    const configuracion = obtenerCupos();
    const limite = configuracion[claveCupo(especialidad, fecha)];
    const asignadas = citasSistema.filter(cita =>
        cita.especialidad === especialidad && cita.fecha === fecha &&
        cita.estado !== "Cancelado" && cita.estado !== "Cancelada"
    ).length;
    return { limite: Number.isInteger(limite) && limite >= 0 ? limite : null, asignadas };
}

function cupoAgotado(especialidad, fecha) {
    const cupo = consultarCupo(especialidad, fecha);
    return cupo.limite !== null && cupo.asignadas >= cupo.limite;
}

function horaOcupada(
    medico,
    fecha,
    hora
) {


    return citasSistema.some(

        cita =>

        cita.medico === medico &&

        cita.fecha === fecha &&

        cita.hora === hora &&

        !["Cancelado", "Cancelada", "Rechazado"].includes(cita.estado)

    );

}


// ==========================================
// MOSTRAR HORARIOS
// ==========================================

function mostrarHorarios() {


    const contenedor =

    document.getElementById(
        "horarios"
    );


    if (!contenedor) {


        return;

    }


    // Si todavía no eligió fecha

    if (!fechaSeleccionada) {


        contenedor.innerHTML = `

            <p class="mensaje-fecha">

                📅 Primero selecciona
                el día de tu cita.

            </p>

        `;


        return;

    }


    // Generar turnos cada 15 minutos: mañana y tarde.
    const horas = [];
    [[8, 12], [14, 17]].forEach(([inicio, fin]) => {
        for (let minutos = inicio * 60; minutos < fin * 60; minutos += 15) {
            const hh = String(Math.floor(minutos / 60)).padStart(2, "0");
            const mm = String(minutos % 60).padStart(2, "0");
            horas.push(`${hh}:${mm}`);
        }
    });


    contenedor.innerHTML =
    "";


    if (cupoAgotado(especialidadSeleccionada, fechaSeleccionada)) {
        const cupo = consultarCupo(especialidadSeleccionada, fechaSeleccionada);
        contenedor.textContent = `Cupos agotados para esta especialidad y fecha (${cupo.asignadas} de ${cupo.limite}). Seleccione otra fecha.`;
        return;
    }

    horas.forEach(

        function(hora) {


            const elemento =

            document.createElement(
                "div"
            );


            elemento.className = "hora";
            if (hora === horaSeleccionada) elemento.classList.add("seleccionada");


            // ==============================
            // VERIFICAR DISPONIBILIDAD REAL
            // ==============================

            const ocupado =

            horaOcupada(

                medicoSeleccionado,

                fechaSeleccionada,

                hora

            );


            // ==============================
            // HORA OCUPADA
            // ==============================

            if (ocupado) {


                elemento.classList.add(
                    "ocupado"
                );


                elemento.innerHTML = `

                    <strong>
                        ${hora}
                    </strong>

                    <span>
                        ❌ No disponible
                    </span>

                `;

            }


            // ==============================
            // HORA DISPONIBLE
            // ==============================

            else {


                elemento.classList.add(
                    "disponible"
                );


                elemento.innerHTML = `

                    <strong>
                        ${hora}
                    </strong>

                    <span>
                        ✓ Disponible
                    </span>

                `;


                elemento.addEventListener(

                    "click",

                    function() {


                        seleccionarHora(
                            hora
                        );

                    }

                );

            }


            contenedor.appendChild(
                elemento
            );

        }

    );

}


// ==========================================
// SELECCIONAR HORA
// ==========================================

function seleccionarHora(
    hora
) {


    const fecha =

    document
    .getElementById(
        "fechaCita"
    )
    .value;


    if (!fecha) {


        alert(
            "Primero selecciona una fecha."
        );


        return;

    }


    if (cupoAgotado(especialidadSeleccionada, fecha)) {
        alert("No quedan fichas disponibles para esta especialidad y fecha.");
        mostrarHorarios();
        return;
    }

    // Volver a verificar antes de seleccionar

    const ocupado =

    horaOcupada(

        medicoSeleccionado,

        fecha,

        hora

    );


    if (ocupado) {


        alert(
            "Este horario ya no está disponible."
        );


        mostrarHorarios();


        return;

    }


    horaSeleccionada =
    hora;


    const confirmacion =

    document.getElementById(
        "confirmacion"
    );


    confirmacion.style.display =
    "block";


    document
    .getElementById(
        "informacionCita"
    )
    .textContent =

    "Médico: " +
    medicoSeleccionado +

    " | Especialidad: " +
    especialidadSeleccionada +

    " | Fecha: " +
    fecha +

    " | Hora: " +
    horaSeleccionada;

    mostrarHorarios();
}


// ==========================================
// CONFIRMAR CITA
// ==========================================

function confirmarCita() {


    const motivo =

    document
    .getElementById(
        "motivo"
    )
    .value
    .trim();


    const fecha =

    document
    .getElementById(
        "fechaCita"
    )
    .value;


    // ==============================
    // VALIDACIONES
    // ==============================

    if (!fecha) {


        alert(
            "Seleccione una fecha."
        );


        return;

    }


    if (!horaSeleccionada) {


        alert(
            "Seleccione una hora."
        );


        return;

    }


    if (!motivo) {


        alert(
            "Ingrese el motivo de consulta."
        );


        return;

    }


    // ==============================
    // VERIFICACIÓN FINAL
    // ==============================

    const ocupado =

    horaOcupada(

        medicoSeleccionado,

        fecha,

        horaSeleccionada

    );


    if (ocupado) {


        alert(
            "Otra persona acaba de reservar este horario."
        );


        horaSeleccionada =
        null;


        mostrarHorarios();


        return;

    }


    if (cupoAgotado(especialidadSeleccionada, fecha)) {
        alert("Se alcanzó el límite de fichas para esta especialidad y fecha.");
        horaSeleccionada = null;
        mostrarHorarios();
        return;
    }

    // ==============================
    // CREAR NUEVA CITA
    // ==============================

    const datosCuentaPaciente = usuarios[usuarioActual] || {};
    const nuevaCita = {

        id: "F-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase(),

        usuario: usuarioActual,

        paciente: {
            nombre: datosCuentaPaciente.nombre || "",
            apellidoPaterno: datosCuentaPaciente.apellidoPaterno || "",
            apellidoMaterno: datosCuentaPaciente.apellidoMaterno || "",
            carnet: datosCuentaPaciente.carnet || "",
            fechaNacimiento: datosCuentaPaciente.fechaNacimiento || ""
        },

        fecha:
        fecha,

        hora:
        horaSeleccionada,

        medico:
        medicoSeleccionado,

        especialidad:
        especialidadSeleccionada,

        motivo:
        motivo,

        estado:
        "Pendiente"

    };


    // ==============================
    // GUARDAR PARA EL USUARIO
    // ==============================

    citasUsuario.push(
        nuevaCita
    );


    localStorage.setItem(

        claveCitasUsuario,

        JSON.stringify(
            citasUsuario
        )

    );


    // ==============================
    // GUARDAR EN EL SISTEMA GENERAL
    // ==============================

    citasSistema.push(
        nuevaCita
    );


    localStorage.setItem(

        "citasSistema",

        JSON.stringify(
            citasSistema
        )

    );


    alert(
        "Su solicitud de cita fue enviada y está pendiente de revisión por el médico."
    );


    window.location.href =
    "historial.html";

}


// ==========================================
// MOSTRAR HISTORIAL
// ==========================================

const tablaCitas =

document.getElementById(
    "tablaCitas"
);


if (tablaCitas) {


    tablaCitas.innerHTML =
    "";


    // ==============================
    // SI NO HAY CITAS
    // ==============================

    if (citasSistema.filter(c => c.usuario === usuarioActual).length === 0) {


        tablaCitas.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    style="text-align:center"
                >

                    No tienes citas registradas.

                </td>

            </tr>

        `;

    }


    // ==============================
    // MOSTRAR CITAS
    // ==============================

    citasSistema.filter(c => c.usuario === usuarioActual).forEach(

        function(cita) {


            let claseEstado =
            "";


            if (

                cita.estado ===
                "Pendiente"

            ) {


                claseEstado =
                "estado-pendiente";

            }


            else if (

                cita.estado ===
                "Realizado (Atendido)"

            ) {


                claseEstado =
                "estado-atendida";

            } else if (cita.estado === "Cancelado") {
                claseEstado = "estado-cancelado";
            } else if (cita.estado === "Sin asistencia") {
                claseEstado = "estado-ausente";
            }


            const fila =

            document.createElement(
                "tr"
            );


            fila.innerHTML = `

                <td>${escapar(cita.id || "Sin número")}</td>
                <td>
                    ${escapar(cita.fecha)}
                </td>

                <td>
                    ${escapar(cita.hora)}
                </td>

                <td>
                    ${escapar(cita.medico)}
                </td>

                <td>
                    ${escapar(cita.especialidad)}
                </td>

                <td>
                    ${escapar(cita.motivo)}
                </td>

                <td
                    class="${claseEstado}"
                >

                    ${escapar(cita.estado)}

                </td>
                <td><button type="button" class="boton-accion" onclick="imprimirFicha('${cita.id}')">Imprimir</button>${cita.estado === "Pendiente" ? ` <button type="button" class="boton-accion" onclick="cancelarMiCita('${cita.id}')">Cancelar</button>` : ""}</td>

            `;


            tablaCitas.appendChild(
                fila
            );

        }

    );

}
// Funciones compartidas por el historial, administración y agenda médica.
function escapar(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caracter => ({"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"})[caracter]);
}
function guardarCitas() {
    localStorage.setItem("citasSistema", JSON.stringify(citasSistema));
}
function cancelarMiCita(id) {
    const cita = citasSistema.find(c => c.id === id && c.usuario === usuarioActual);
    if (!cita || cita.estado !== "Pendiente") return alert("La cita no puede cancelarse.");
    if (!confirm("¿Cancelar esta cita?")) return;
    cita.estado = "Cancelado";
    guardarCitas();
    window.location.reload();
}
function imprimirFicha(id) {
    const cita = citasSistema.find(c => c.id === id);
    if (!cita) return alert("Ficha no encontrada.");
    if (rolActual() === "paciente" && cita.usuario !== usuarioActual) return;
    const ventana = window.open("", "_blank", "width=760,height=850");
    if (!ventana) return alert("Se debe permitir la ventana emergente para imprimir.");
    const paciente = cita.paciente || {};
    const nombreCompleto = [paciente.nombre, paciente.apellidoPaterno, paciente.apellidoMaterno].filter(Boolean).join(" ") || cita.usuario || "Paciente";
    const carnet = paciente.carnet || "No registrado";
    const nacimiento = paciente.fechaNacimiento || "No registrado";
    const estado = cita.estado || "Pendiente";
    ventana.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ficha ${escapar(cita.id)}</title><style>
        *{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#23352a;margin:0;padding:32px;background:#fff;line-height:1.5}
        .ficha{max-width:720px;margin:auto;border:2px solid #167447;border-radius:12px;padding:28px}
        header{display:flex;align-items:center;gap:16px;border-bottom:2px solid #167447;padding-bottom:16px;margin-bottom:20px}
        header img{width:72px;height:72px;object-fit:contain}h1{font-size:22px;margin:0;color:#11663d}h2{font-size:19px;margin:8px 0 0}
        .aviso{background:#edf7f0;padding:10px;border-radius:6px;font-size:13px}
        .datos{display:grid;grid-template-columns:1fr 1fr;gap:12px}.dato{border:1px solid #d8e5dc;border-radius:6px;padding:10px;overflow-wrap:anywhere}
        .etiqueta{display:block;font-size:11px;text-transform:uppercase;color:#52705d;font-weight:bold;margin-bottom:4px}
        .valor{font-weight:600}.estado{display:inline-block;padding:5px 10px;border-radius:18px;background:#e5f3e9}
        .acciones{margin-top:24px;text-align:center}button{background:#167447;color:white;border:0;border-radius:6px;padding:11px 18px;font-size:14px;cursor:pointer}
        @media print{body{padding:0}.ficha{border:1px solid #167447;border-radius:0}.acciones{display:none}}
        @media(max-width:520px){body{padding:10px}.ficha{padding:14px}.datos{grid-template-columns:1fr}}
    </style></head><body><article class="ficha">
        <header><img src="logo.png" alt="Logo CNS"><div><h1>Caja Nacional de Salud</h1><h2>Comprobante de cita médica</h2><p>Ficha N.º ${escapar(cita.id)}</p></div></header>
        <h3>Datos del paciente</h3><section class="datos">
            <div class="dato"><span class="etiqueta">Nombre</span><span class="valor">${escapar(paciente.nombre || nombreCompleto)}</span></div>
            <div class="dato"><span class="etiqueta">Apellido paterno</span><span class="valor">${escapar(paciente.apellidoPaterno || "No registrado")}</span></div>
            <div class="dato"><span class="etiqueta">Apellido materno</span><span class="valor">${escapar(paciente.apellidoMaterno || "No registrado")}</span></div>
            <div class="dato"><span class="etiqueta">Carnet de identidad</span><span class="valor">${escapar(carnet)}</span></div>
            <div class="dato"><span class="etiqueta">Fecha de nacimiento</span><span class="valor">${escapar(nacimiento)}</span></div>
            <div class="dato"><span class="etiqueta">Usuario de registro</span><span class="valor">${escapar(cita.usuario)}</span></div>
        </section>
        <h3>Datos de la cita</h3><section class="datos">
            <div class="dato"><span class="etiqueta">Médico</span><span class="valor">${escapar(cita.medico)}</span></div>
            <div class="dato"><span class="etiqueta">Especialidad</span><span class="valor">${escapar(cita.especialidad)}</span></div>
            <div class="dato"><span class="etiqueta">Fecha de atención</span><span class="valor">${escapar(cita.fecha)}</span></div>
            <div class="dato"><span class="etiqueta">Hora</span><span class="valor">${escapar(cita.hora)}</span></div>
            <div class="dato"><span class="etiqueta">Motivo de consulta</span><span class="valor">${escapar(cita.motivo || "No especificado")}</span></div>
            <div class="dato"><span class="etiqueta">Estado de la ficha</span><span class="estado">${escapar(estado)}</span></div>
        </section>
        <p class="aviso">Comprobante de uso académico. No válido para atención médica real.</p>
        <div class="acciones"><button onclick="window.print()">Imprimir ficha</button></div>
    </article></body></html>`);
    ventana.document.close();
}

