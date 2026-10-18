function HomePage() {
  const especialidades = [
    "Medicina General",
    "Cardiología",
    "Pediatría",
    "Odontología",
    "Dermatología",
    "Oftalmología",
  ];

  const irAEspecialidades = () => {
    document.getElementById("especialidades")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <main className="pagina-inicio">
      <section className="inicio">
        <div className="inicio-contenido">
          <div className="logo-grande" aria-hidden="true">🏥</div>

          <h1>Caja Nacional de Salud</h1>
          <h2>Sistema de Citas Médicas</h2>

          <p>
            Agenda tus citas médicas de forma rápida, consulta nuestras
            especialidades y encuentra la atención que necesitas.
          </p>

          <button className="boton-grande" onClick={irAEspecialidades}>
            🗓️ Ver especialidades
          </button>
        </div>
      </section>

      <section id="especialidades" className="especialidades-seccion">
        <div className="contenedor">
          <div className="titulo-pagina">
            <h2>Especialidades médicas</h2>
            <p>Selecciona la especialidad que necesitas.</p>
          </div>

          <div className="especialidades-grid">
            {especialidades.map((especialidad) => (
              <article className="especialidad-card" key={especialidad}>
                <span className="especialidad-icono">🩺</span>
                <h3>{especialidad}</h3>
                <p>Atención médica disponible.</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
