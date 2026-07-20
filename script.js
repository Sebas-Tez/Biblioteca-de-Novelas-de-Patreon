/* =====================================================
   EL ESPÍA NARRADOR — script.js
   Toda la lógica del catálogo: carga de datos, búsqueda en
   tiempo real, filtros, orden, tarjetas y modal de detalle.
   No requiere frameworks. Solo hay que editar novelas.json
   para que una novela nueva aparezca en todo el sitio.
   ===================================================== */

(function () {
  "use strict";

  /** Estado global en memoria */
  let novelas = [];
  let filtroActivo = "todos";
  let ordenActivo = "recientes";
  let terminoBusqueda = "";

  /** Referencias al DOM */
  const catalogoEl = document.getElementById("catalogo");
  const emptyEl = document.getElementById("empty");
  const resultadosInfoEl = document.getElementById("resultadosInfo");
  const buscadorEl = document.getElementById("buscador");
  const buscadorClearEl = document.getElementById("buscadorClear");
  const buscadorDropdownEl = document.getElementById("buscadorDropdown");
  const filtrosEl = document.getElementById("filtros");
  const ordenEl = document.getElementById("orden");

  const modalEl = document.getElementById("modal");
  const modalBackdropEl = document.getElementById("modalBackdrop");
  const modalCloseEl = document.getElementById("modalClose");

  /** Verificación de edad para la sección +18 */
  const ageGateEl = document.getElementById("ageGate");
  const ageGateBackdropEl = document.getElementById("ageGateBackdrop");
  const ageGateConfirmarEl = document.getElementById("ageGateConfirmar");
  const ageGateSalirEl = document.getElementById("ageGateSalir");
  const ADULT_CONFIRM_KEY = "espia_18_confirmado";

  /* --------------------------------------------------
     CARGA DE DATOS
     -------------------------------------------------- */
  async function cargarNovelas() {
    try {
      const res = await fetch("novelas.json", { cache: "no-store" });
      if (!res.ok) throw new Error("No se pudo leer novelas.json (" + res.status + ")");
      novelas = await res.json();
      render();
    } catch (err) {
      console.error("Error cargando el catálogo:", err);
      catalogoEl.innerHTML =
        '<p style="color:#b3b3ad;font-family:JetBrains Mono, monospace;grid-column:1/-1;text-align:center;padding:40px 0;">' +
        "No se pudo cargar el catálogo. Verifica que novelas.json exista en la raíz del proyecto." +
        "</p>";
    }
  }

  /* --------------------------------------------------
     UTILIDADES
     -------------------------------------------------- */

  // Quita tildes para que la búsqueda no dependa de acentos exactos
  function normalizar(texto) {
    return (texto || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function escapeHtml(str) {
    return (str || "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]));
  }

  /* --------------------------------------------------
     FILTRO + BÚSQUEDA + ORDEN
     -------------------------------------------------- */
  function obtenerNovelasVisibles() {
    let lista = novelas.slice();

    // Filtro por género o estado, o por la categoría especial +18
    if (filtroActivo === "adulto18") {
      lista = lista.filter((n) => n.adulto === true);
    } else if (filtroActivo !== "todos") {
      lista = lista.filter(
        (n) => n.genero === filtroActivo || n.estado === filtroActivo
      );
    }

    // Búsqueda en tiempo real: título, autor, género, etiquetas
    if (terminoBusqueda.trim() !== "") {
      const q = normalizar(terminoBusqueda);
      lista = lista.filter((n) => {
        const campos = [
          n.titulo,
          n.autor,
          n.genero,
          ...(Array.isArray(n.etiquetas) ? n.etiquetas : []),
        ];
        return campos.some((campo) => normalizar(campo).includes(q));
      });
    }

    // Orden
    switch (ordenActivo) {
      case "az":
        lista.sort((a, b) => a.titulo.localeCompare(b.titulo, "es"));
        break;
      case "capitulos":
        lista.sort((a, b) => (b.capitulos || 0) - (a.capitulos || 0));
        break;
      case "recientes":
      default:
        lista.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        break;
    }

    return lista;
  }

  /* --------------------------------------------------
     RENDER DE TARJETAS
     -------------------------------------------------- */
  function crearTarjeta(novela) {
    const art = document.createElement("article");
    art.className = "card";
    art.dataset.id = novela.id;

    const etiquetasCorta = (novela.etiquetas || []).slice(0, 3);

    art.innerHTML = `
      <div class="card__cover-wrap">
        <img class="card__cover" src="${escapeHtml(novela.cover)}" alt="Portada de ${escapeHtml(novela.titulo)}" loading="lazy">
        <span class="card__tab">${novela.capitulos} caps.</span>
        <span class="card__estado" data-estado="${escapeHtml(novela.estado)}">${escapeHtml(novela.estado)}</span>
        ${novela.adulto ? '<span class="card__nsfw">+18</span>' : ""}

        <div class="card__overlay">
          <p class="card__overlay-sinopsis">${escapeHtml(novela.sinopsis || novela.descripcion || "")}</p>
          <div class="card__overlay-actions">
            <button class="btn btn--gold" data-accion="escuchar" data-url="${escapeHtml(novela.patreon)}" type="button">Escuchar</button>
            <button class="btn btn--ghost" data-accion="info" data-id="${novela.id}" type="button">Más información</button>
          </div>
        </div>
      </div>

      <div class="card__info">
        <p class="card__genero">${escapeHtml(novela.genero)}</p>
        <h3 class="card__titulo">${escapeHtml(novela.titulo)}</h3>
      </div>
    `;

    return art;
  }

  function render() {
    const visibles = obtenerNovelasVisibles();

    catalogoEl.innerHTML = "";

    if (visibles.length === 0) {
      emptyEl.hidden = false;
      resultadosInfoEl.textContent = "";
      return;
    }

    emptyEl.hidden = true;

    const fragment = document.createDocumentFragment();
    visibles.forEach((novela) => fragment.appendChild(crearTarjeta(novela)));
    catalogoEl.appendChild(fragment);

    const plural = visibles.length === 1 ? "novela" : "novelas";
    resultadosInfoEl.textContent = `${visibles.length} ${plural} encontradas`;
  }

  /* --------------------------------------------------
     LISTA DESPLEGABLE DE SUGERENCIAS (bajo el buscador)
     -------------------------------------------------- */
  function coincideBusqueda(novela, qNormalizado) {
    const campos = [
      novela.titulo,
      novela.autor,
      novela.genero,
      ...(Array.isArray(novela.etiquetas) ? novela.etiquetas : []),
    ];
    return campos.some((campo) => normalizar(campo).includes(qNormalizado));
  }

  function renderDropdown() {
    const q = terminoBusqueda.trim();

    if (q === "") {
      buscadorDropdownEl.hidden = true;
      buscadorDropdownEl.innerHTML = "";
      return;
    }

    const qn = normalizar(q);
    const coincidencias = novelas.filter((n) => coincideBusqueda(n, qn)).slice(0, 8);

    if (coincidencias.length === 0) {
      buscadorDropdownEl.innerHTML = '<p class="header__search-empty">Sin resultados para esa búsqueda</p>';
      buscadorDropdownEl.hidden = false;
      return;
    }

    buscadorDropdownEl.innerHTML = coincidencias
      .map(
        (n) => `
        <button class="header__search-item" type="button" data-id="${n.id}">
          <img src="${escapeHtml(n.cover)}" alt="" loading="lazy">
          <span>
            <span class="header__search-item-titulo">${escapeHtml(n.titulo)}</span>
            <span class="header__search-item-genero">${escapeHtml(n.genero)}</span>
          </span>
        </button>
      `
      )
      .join("");

    buscadorDropdownEl.hidden = false;
  }

  /* --------------------------------------------------
     MODAL DE DETALLE
     -------------------------------------------------- */
  function abrirModal(id) {
    const novela = novelas.find((n) => String(n.id) === String(id));
    if (!novela) return;

    document.getElementById("modalBanner").src = novela.banner || novela.cover;
    document.getElementById("modalBanner").alt = `Escena de ${novela.titulo}`;
    document.getElementById("modalCover").src = novela.cover;
    document.getElementById("modalCover").alt = `Portada de ${novela.titulo}`;
    document.getElementById("modalGenero").textContent = novela.genero;
    document.getElementById("modalTitulo").textContent = novela.titulo;
    document.getElementById("modalAutor").textContent = `Por ${novela.autor}`;
    document.getElementById("modalEstado").textContent = novela.estado;
    document.getElementById("modalCapitulos").textContent = `${novela.capitulos} capítulos`;
    document.getElementById("modalSinopsis").textContent = novela.sinopsis || novela.descripcion || "";

    // Insignia +18 dentro del modal (se agrega/quita según corresponda,
    // ya que el modal se reutiliza para todas las novelas).
    const modalTituloEl = document.getElementById("modalTitulo");
    const nsfwExistente = modalTituloEl.querySelector(".modal__nsfw");
    if (nsfwExistente) nsfwExistente.remove();
    if (novela.adulto) {
      const nsfwBadge = document.createElement("span");
      nsfwBadge.className = "modal__nsfw";
      nsfwBadge.textContent = "+18";
      modalTituloEl.appendChild(nsfwBadge);
    }

    const etiquetasEl = document.getElementById("modalEtiquetas");
    etiquetasEl.innerHTML = "";
    (novela.etiquetas || []).forEach((tag) => {
      const span = document.createElement("span");
      span.textContent = tag;
      etiquetasEl.appendChild(span);
    });

    const patreonBtn = document.getElementById("modalPatreon");
    patreonBtn.href = novela.patreon || "#";

    modalEl.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function cerrarModal() {
    modalEl.hidden = true;
    document.body.style.overflow = "";
  }

  /* --------------------------------------------------
     VERIFICACIÓN DE EDAD (sección +18)
     Solo se pide la primera vez que alguien intenta ver el
     filtro +18 en este navegador; queda guardado en localStorage
     para no volver a preguntar en visitas futuras.
     -------------------------------------------------- */
  function tieneConfirmacion18() {
    try {
      return localStorage.getItem(ADULT_CONFIRM_KEY) === "true";
    } catch (e) {
      // Si el navegador bloquea localStorage (modo privado estricto,
      // por ejemplo), se pide confirmación cada vez en vez de fallar.
      return false;
    }
  }

  function guardarConfirmacion18() {
    try {
      localStorage.setItem(ADULT_CONFIRM_KEY, "true");
    } catch (e) {
      /* Si no se puede guardar, no pasa nada grave: solo volverá a
         preguntar la próxima vez. */
    }
  }

  function abrirAgeGate(onConfirmar) {
    ageGateEl.hidden = false;
    document.body.style.overflow = "hidden";

    // Se reasignan los listeners cada vez para no acumular varios
    // "onConfirmar" de intentos anteriores.
    ageGateConfirmarEl.onclick = () => {
      guardarConfirmacion18();
      cerrarAgeGate();
      onConfirmar();
    };
    ageGateSalirEl.onclick = cerrarAgeGate;
    ageGateBackdropEl.onclick = cerrarAgeGate;
  }

  function cerrarAgeGate() {
    ageGateEl.hidden = true;
    document.body.style.overflow = "";
  }

  /* --------------------------------------------------
     EVENTOS
     -------------------------------------------------- */

  // Búsqueda en tiempo real
  buscadorEl.addEventListener("input", (e) => {
    terminoBusqueda = e.target.value;
    buscadorClearEl.hidden = terminoBusqueda.trim() === "";
    render();
    renderDropdown();
  });

  buscadorEl.addEventListener("focus", () => {
    if (terminoBusqueda.trim() !== "") renderDropdown();
  });

  buscadorClearEl.addEventListener("click", () => {
    buscadorEl.value = "";
    terminoBusqueda = "";
    buscadorClearEl.hidden = true;
    buscadorEl.focus();
    render();
    renderDropdown();
  });

  // Clic en una sugerencia de la lista: abre el modal de esa novela
  buscadorDropdownEl.addEventListener("click", (e) => {
    const item = e.target.closest(".header__search-item");
    if (!item) return;
    abrirModal(item.dataset.id);
    buscadorDropdownEl.hidden = true;
  });

  // Cerrar la lista al hacer clic fuera del buscador
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".header__search")) {
      buscadorDropdownEl.hidden = true;
    }
  });

  // Cerrar la lista con Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") buscadorDropdownEl.hidden = true;
  });

  // Filtros (delegación de eventos)
  filtrosEl.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;

    const aplicarEsteFiltro = () => {
      filtrosEl.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      filtroActivo = chip.dataset.filter;
      render();
    };

    // El filtro +18 pide confirmar la edad la primera vez (por
    // navegador); las demás veces entra directo.
    if (chip.dataset.filter === "adulto18" && !tieneConfirmacion18()) {
      abrirAgeGate(aplicarEsteFiltro);
      return;
    }

    aplicarEsteFiltro();
  });

  // Orden
  ordenEl.addEventListener("change", (e) => {
    ordenActivo = e.target.value;
    render();
  });

  // Clics dentro del catálogo: abrir Patreon o abrir modal
  catalogoEl.addEventListener("click", (e) => {
    const btnEscuchar = e.target.closest('[data-accion="escuchar"]');
    if (btnEscuchar) {
      const url = btnEscuchar.dataset.url;
      if (url) window.open(url, "_blank", "noopener");
      return;
    }

    const btnInfo = e.target.closest('[data-accion="info"]');
    if (btnInfo) {
      abrirModal(btnInfo.dataset.id);
    }
  });

  // Cerrar modal
  modalCloseEl.addEventListener("click", cerrarModal);
  modalBackdropEl.addEventListener("click", cerrarModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modalEl.hidden) cerrarModal();
  });

  // Botón de "ver todo" en el estado vacío
  document.getElementById("empty__reset").addEventListener("click", () => {
    buscadorEl.value = "";
    terminoBusqueda = "";
    buscadorClearEl.hidden = true;
    filtroActivo = "todos";
    filtrosEl.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-active"));
    filtrosEl.querySelector('[data-filter="todos"]').classList.add("is-active");
    render();
  });

  /* --------------------------------------------------
     INICIO
     -------------------------------------------------- */
  cargarNovelas();
})();
