(function () {
  "use strict";

  /* ====== CONFIGURACIÓN ====== */
  var PALABRAS = [
    "Cielito", "Amorcita", "Amongucita", "Pastelito", "Shocolate", "Black",
    "Bigotes", "Pelusa", "Mi Ñañe", "Banasplit", "Panquesita", "Corazoncito",
    "Amor", "Muak", "Muakcito", "Mi niña", "Chocorramito"
  ];
  var REPETICIONES_PALABRAS = 2;

  var reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var portada = document.getElementById("portada");
  var sobre = document.getElementById("sobre");
  var btnAbrir = document.getElementById("btn-abrir");
  var carta = document.getElementById("carta");
  var mensaje = document.getElementById("mensaje");
  var btnCerrarCarta = document.getElementById("btn-cerrar-carta");
  var despedida = document.getElementById("despedida");
  var contenedorPalabras = document.getElementById("palabras");
  var btnCorazon = document.getElementById("btn-corazon");
  var sorpresa = document.getElementById("sorpresa");
  var barra = document.getElementById("barra");
  var visor = document.getElementById("visor");
  var visorImg = document.getElementById("visor-img");
  var visorCerrar = document.getElementById("visor-cerrar");

  function aleatorio(min, max) {
    return Math.random() * (max - min) + min;
  }

  function mezclar(array) {
    var resultado = array.slice();
    for (var i = resultado.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temporal = resultado[i];
      resultado[i] = resultado[j];
      resultado[j] = temporal;
    }
    return resultado;
  }

  /* ====== Visor de fotos ====== */
  function abrirVisor(img) {
    visorImg.src = img.currentSrc || img.src;
    visorImg.alt = img.alt;
    if (visor.showModal) { visor.showModal(); } else { visor.setAttribute("open", ""); }
  }
  function cerrarVisor() {
    if (visor.close) { visor.close(); } else { visor.removeAttribute("open"); }
  }
  visorCerrar.addEventListener("click", cerrarVisor);
  visor.addEventListener("click", function (e) {
    if (e.target === visor) cerrarVisor();
  });

  function habilitarZoom(img) {
    var marco = img.closest(".foto-marco");
    marco.setAttribute("role", "button");
    marco.setAttribute("tabindex", "0");
    marco.setAttribute("aria-label", "Ampliar foto: " + img.alt);
    marco.addEventListener("click", function () { abrirVisor(img); });
    marco.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        abrirVisor(img);
      }
    });
  }

  /* ====== Imágenes: si no existen, queda el placeholder ====== */
  document.querySelectorAll(".foto img").forEach(function (img) {
    var ok = function () { img.classList.add("cargada"); habilitarZoom(img); };
    var fallo = function () { img.classList.add("error"); };
    if (img.complete) {
      if (img.naturalWidth > 0) { ok(); } else if (img.currentSrc || img.getAttribute("loading") !== "lazy") { fallo(); }
    }
    img.addEventListener("load", function () { if (!img.classList.contains("cargada")) ok(); });
    img.addEventListener("error", fallo);
  });

  /* ====== Palabras flotantes ====== */
  function crearPalabras() {
    var indice = 0;
    for (var ronda = 0; ronda < REPETICIONES_PALABRAS; ronda++) {
      mezclar(PALABRAS).forEach(function (palabra) {
        var s = document.createElement("span");
        s.className = "palabra";
        s.textContent = palabra;
        s.style.setProperty("--x", aleatorio(2, 78).toFixed(1) + "%");
        s.style.setProperty("--y", aleatorio(5, 92).toFixed(1) + "%");
        s.style.setProperty("--size", aleatorio(1, 1.9).toFixed(2) + "rem");
        s.style.setProperty("--dur", aleatorio(16, 24).toFixed(1) + "s");
        s.style.setProperty("--delay", (indice * 0.35).toFixed(2) + "s");
        s.style.setProperty("--dx", aleatorio(-40, 40).toFixed(0) + "px");
        contenedorPalabras.appendChild(s);
        indice++;
      });
    }
  }

  /* ====== Aparición al desplazarse ====== */
  function activarRevelado() {
    if (reducir || !("IntersectionObserver" in window)) return;
    var items = mensaje.querySelectorAll(
      ":scope > h2, :scope > p, :scope > .foto, :scope > .corazones, " +
      ":scope > blockquote, :scope > .linea-tiempo, :scope > .cierre"
    );
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("vista");
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    items.forEach(function (el) {
      el.classList.add("rev");
      obs.observe(el);
    });
  }

  /* ====== Indicador de avance de lectura ====== */
  var pendiente = false;
  function actualizarProgreso() {
    pendiente = false;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    barra.style.transform = "scaleX(" + p.toFixed(3) + ")";
  }
  window.addEventListener("scroll", function () {
    if (!pendiente) {
      pendiente = true;
      requestAnimationFrame(actualizarProgreso);
    }
  }, { passive: true });

  /* ====== Abrir la carta ====== */
  function mostrarCarta() {
    portada.hidden = true;
    carta.hidden = false;
    document.body.classList.add("abierta");
    window.scrollTo(0, 0);
    crearPalabras();
    activarRevelado();
    actualizarProgreso();
    requestAnimationFrame(function () { carta.classList.add("visible"); });
    mensaje.focus({ preventScroll: true });
  }

  btnAbrir.addEventListener("click", function () {
    btnAbrir.disabled = true;
    sobre.classList.add("abierto");
    if (reducir) { mostrarCarta(); return; }
    setTimeout(function () { portada.classList.add("salida"); }, 1500);
    setTimeout(mostrarCarta, 2100);
  });

  /* ====== Cerrar la carta y volver a la portada ====== */
  function cerrarCarta() {
    if (carta.classList.contains("cerrando")) return;
    despedida.hidden = false;
    carta.classList.add("cerrando");

    window.setTimeout(function () {
      carta.hidden = true;
      carta.classList.remove("visible", "cerrando");
      portada.hidden = false;
      portada.classList.remove("salida");
      sobre.classList.remove("abierto");
      btnAbrir.disabled = false;
      document.body.classList.remove("abierta");
      contenedorPalabras.replaceChildren();
      sorpresa.hidden = true;
      btnCorazon.setAttribute("aria-expanded", "false");
      barra.style.transform = "scaleX(0)";
      window.scrollTo(0, 0);
      despedida.hidden = true;
      btnAbrir.focus({ preventScroll: true });
    }, reducir ? 0 : 1800);
  }

  btnCerrarCarta.addEventListener("click", cerrarCarta);

  /* ====== Corazón final: corazoncitos + sorpresa ====== */
  function lluviaCorazones() {
    var r = btnCorazon.getBoundingClientRect();
    var colores = ["#c2185b", "#e63a5c", "#ff6b8a", "#ff8fa3"];
    for (var i = 0; i < 12; i++) {
      var h = document.createElement("span");
      h.className = "chispa heart";
      h.style.left = (r.left + r.width / 2) + "px";
      h.style.top = (r.top + r.height / 2) + "px";
      h.style.setProperty("--size", aleatorio(0.9, 1.8).toFixed(2) + "rem");
      h.style.setProperty("--c", colores[i % colores.length]);
      h.style.setProperty("--dx", aleatorio(-110, 110).toFixed(0) + "px");
      h.style.setProperty("--dy", (-aleatorio(90, 230)).toFixed(0) + "px");
      document.body.appendChild(h);
      setTimeout(function (el) { el.remove(); }, 1700, h);
    }
  }

  btnCorazon.addEventListener("click", function () {
    if (!reducir) lluviaCorazones();
    if (sorpresa.hidden) {
      sorpresa.hidden = false;
      btnCorazon.setAttribute("aria-expanded", "true");
      setTimeout(function () {
        sorpresa.scrollIntoView({ behavior: reducir ? "auto" : "smooth", block: "center" });
      }, 150);
    }
  });
})();