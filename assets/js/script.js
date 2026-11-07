(function () {
  "use strict";

  var PALABRAS = [
    "Cielito", "Amorcita", "Amongucita", "Pastelito", "Shocolate", "Black",
    "Bigotes", "Pelusa", "Mi Ñañe", "Banasplit", "Panquesita", "Corazoncito",
    "Amor", "Muak", "Muakcito", "Mi niña", "Chocorramito"
  ];
  var REPETICIONES_PALABRAS = 2;
  var FECHA_INICIO = "07/09/2026";
  var reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var acceso = document.getElementById("acceso");
  var formAcceso = document.getElementById("form-acceso");
  var fechaAcceso = document.getElementById("fecha-acceso");
  var errorAcceso = document.getElementById("error-acceso");
  var cargaExperiencia = document.getElementById("carga-experiencia");
  var hub = document.getElementById("hub");
  var botonVanesa = document.getElementById("abrir-vanesa");
  var botonDosMeses = document.getElementById("abrir-dos-meses");
  var experiencia;
  var detalleCargando = false;
  var salidaRamoEnCurso = false;
  var temporizadoresDetalle = [];
  var limpiarReaccionRamo;
  var limpiarInteraccionRamo;
  var marcoReaccionRamo = 0;
  var temporizadorPulsoRamo;
  var temporizadorParticulas;

  var portada;
  var sobre;
  var btnAbrir;
  var carta;
  var mensaje;
  var btnCerrarCarta;
  var despedida;
  var contenedorPalabras;
  var btnCorazon;
  var sorpresa;
  var barra;
  var visor;
  var visorImg;
  var visorCerrar;

  fechaAcceso.addEventListener("input", function () {
    var posicion = fechaAcceso.selectionStart;
    var digitosAntes = fechaAcceso.value.slice(0, posicion).replace(/\D/g, "").length;
    var digitos = fechaAcceso.value.replace(/\D/g, "").slice(0, 8);
    var valor = digitos;

    if (digitos.length > 2) {
      valor = digitos.slice(0, 2) + "/" + digitos.slice(2);
    }
    if (digitos.length > 4) {
      valor = digitos.slice(0, 2) + "/" + digitos.slice(2, 4) + "/" + digitos.slice(4);
    }

    fechaAcceso.value = valor;
    if (posicion !== null) {
      var nuevaPosicion = 0;
      var digitosContados = 0;
      while (nuevaPosicion < valor.length && digitosContados < digitosAntes) {
        if (/\d/.test(valor.charAt(nuevaPosicion))) digitosContados++;
        nuevaPosicion++;
      }
      if (digitosAntes >= 2 && valor.charAt(nuevaPosicion) === "/") nuevaPosicion++;
      if (digitosAntes >= 4 && valor.charAt(nuevaPosicion) === "/") nuevaPosicion++;
      fechaAcceso.setSelectionRange(nuevaPosicion, nuevaPosicion);
    }

    if (fechaAcceso.hasAttribute("aria-invalid")) {
      fechaAcceso.removeAttribute("aria-invalid");
      errorAcceso.textContent = "";
    }
  });

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

  formAcceso.addEventListener("submit", function (evento) {
    evento.preventDefault();
    if (fechaAcceso.value.trim() !== FECHA_INICIO) {
      errorAcceso.textContent = "Esa fecha no coincide, mi amor. Inténtalo otra vez :3";
      fechaAcceso.setAttribute("aria-invalid", "true");
      fechaAcceso.focus();
      return;
    }

    fechaAcceso.removeAttribute("aria-invalid");
    formAcceso.querySelector("button[type='submit']").disabled = true;
    acceso.remove();
    hub.hidden = false;
    botonVanesa.focus();
  });

  botonVanesa.addEventListener("click", cargarDetalleVanesa);
  botonDosMeses.addEventListener("click", cargarDetalleDosMeses);
  activarInteraccionTarjetaHub(botonVanesa);
  activarInteraccionTarjetaHub(botonDosMeses);

  function activarInteraccionTarjetaHub(tarjeta) {
    tarjeta.addEventListener("pointermove", function (evento) {
      if (reducir || evento.pointerType === "touch") return;
      var limites = tarjeta.getBoundingClientRect();
      var x = (evento.clientX - limites.left) / limites.width;
      var y = (evento.clientY - limites.top) / limites.height;
      tarjeta.style.setProperty("--luz-x", (x * 100).toFixed(1) + "%");
      tarjeta.style.setProperty("--luz-y", (y * 100).toFixed(1) + "%");
      tarjeta.style.setProperty("--tarjeta-inclinacion-x", ((x - 0.5) * 5).toFixed(2) + "deg");
      tarjeta.style.setProperty("--tarjeta-inclinacion-y", ((0.5 - y) * 5).toFixed(2) + "deg");
    });

    tarjeta.addEventListener("pointerleave", function () {
      tarjeta.style.removeProperty("--tarjeta-inclinacion-x");
      tarjeta.style.removeProperty("--tarjeta-inclinacion-y");
      tarjeta.style.removeProperty("--luz-x");
      tarjeta.style.removeProperty("--luz-y");
    });
  }

  async function cargarDetalleVanesa() {
    if (detalleCargando) return;
    detalleCargando = true;
    botonVanesa.disabled = true;
    document.getElementById("error-hub").textContent = "Preparando tu cartita...";
    try {
      var respuesta = await fetch("./detalles/vanesa/experiencia.html");
      if (!respuesta.ok) {
        throw new Error("No se pudo cargar la cartita (HTTP " + respuesta.status + ").");
      }

      cargaExperiencia.innerHTML = await respuesta.text();
      experiencia = cargaExperiencia.querySelector("#experiencia");
      if (!experiencia) {
        throw new Error("El archivo de la cartita no contiene el contenido esperado.");
      }

      cargaExperiencia.hidden = false;
      experiencia.hidden = false;
      document.querySelectorAll(".foto img[data-src]").forEach(function (img) {
        img.src = img.dataset.src;
        img.removeAttribute("data-src");
      });

      inicializarExperiencia();
      document.getElementById("error-hub").textContent = "";
      hub.hidden = true;
      portada.hidden = false;
      btnAbrir.focus();
    } catch (error) {
      console.error(error);
      if (error instanceof Error && error.message.indexOf("HTTP 404") !== -1) {
        document.getElementById("error-hub").textContent =
          "No se encontró la cartita. Comprueba que detalles/vanesa/experiencia.html esté en el proyecto.";
      } else {
        document.getElementById("error-hub").textContent =
          "No se pudo cargar la cartita. Comprueba tu conexión e inténtalo de nuevo.";
      }
      botonVanesa.disabled = false;
    } finally {
      detalleCargando = false;
    }
  }

  async function cargarDetalleDosMeses() {
    if (detalleCargando) return;
    detalleCargando = true;
    botonDosMeses.disabled = true;
    document.getElementById("error-hub").textContent = "Preparando tu sorpresa...";

    try {
      var respuesta = await fetch("./detalles/dos-meses/experiencia.html");
      if (!respuesta.ok) {
        throw new Error("No se pudo cargar el detalle de los dos meses (HTTP " + respuesta.status + ").");
      }

      cargaExperiencia.innerHTML = await respuesta.text();
      var detalle = cargaExperiencia.querySelector("#detalle-dos-meses");
      if (!detalle) {
        throw new Error("El archivo no contiene el detalle de los dos meses esperado.");
      }

      cargaExperiencia.hidden = false;
      hub.hidden = true;
      document.getElementById("error-hub").textContent = "";
      detalle.querySelector("#volver-hub-loto").addEventListener("click", function () {
        iniciarSalidaRamoAlAgua(detalle);
      });
      iniciarSecuenciaLoto(detalle);
    } catch (error) {
      console.error(error);
      document.getElementById("error-hub").textContent =
        "No se pudo cargar la sorpresa. Comprueba tu conexión e inténtalo de nuevo.";
      botonDosMeses.disabled = false;
    } finally {
      detalleCargando = false;
    }
  }

  function iniciarSecuenciaLoto(detalle) {
    var titulo = detalle.querySelector("#titulo-dos-meses");
    var mensaje = detalle.querySelector("#mensaje-dos-meses");
    var fraseFlor = detalle.querySelector("#frase-flor-favorita");
    var ornamento = detalle.querySelector(".ornamento-mensaje");
    var ramo = detalle.querySelector(".ramo-loto");
    var botonVolver = detalle.querySelector("#volver-hub-loto");
    activarInteraccionRamo(detalle, ramo);

    if (reducir) {
      detalle.classList.add("movimiento-reducido");
      fraseFlor.hidden = false;
      fraseFlor.classList.add("visible");
      ramo.removeAttribute("aria-hidden");
      ramo.querySelector(".ilustracion-ramo").setAttribute("tabindex", "0");
      ramo.classList.add("visible");
      botonVolver.disabled = false;
      botonVolver.focus({ preventScroll: true });
      return;
    }

    activarReaccionRamo(ramo);

    var textoTitulo = titulo.textContent.trim();
    var indiceLetra = 0;
    titulo.textContent = "";
    titulo.setAttribute("aria-label", textoTitulo);
    titulo.classList.add("escribiendo");
    detalle.classList.add("secuencia-activa", "titulo-visible");

    var escritura = window.setInterval(function () {
      indiceLetra++;
      titulo.textContent = textoTitulo.slice(0, indiceLetra);
      if (indiceLetra >= textoTitulo.length) {
        window.clearInterval(escritura);
        temporizadoresDetalle.push(window.setTimeout(function () {
          titulo.classList.remove("escribiendo");
          detalle.classList.remove("titulo-visible");
          titulo.classList.add("saliendo");
          temporizadoresDetalle.push(window.setTimeout(function () {
            titulo.hidden = true;
            mensaje.classList.add("visible");
            ornamento.classList.add("visible");
            temporizadoresDetalle.push(window.setTimeout(function () {
              mensaje.classList.add("saliendo");
              ornamento.classList.remove("visible");
              temporizadoresDetalle.push(window.setTimeout(function () {
                mensaje.hidden = true;
                ornamento.hidden = true;
                temporizadoresDetalle.push(window.setTimeout(function () {
                  fraseFlor.classList.add("saliendo");
                  temporizadoresDetalle.push(window.setTimeout(function () {
                    fraseFlor.hidden = true;
                    ramo.removeAttribute("aria-hidden");
                    ramo.querySelector(".ilustracion-ramo").setAttribute("tabindex", "0");
                    ramo.classList.add("visible");
                    temporizadoresDetalle.push(window.setTimeout(function () {
                      botonVolver.classList.add("visible");
                      botonVolver.disabled = false;
                      botonVolver.focus({ preventScroll: true });
                    }, 2600));
                  }, 650));
                }, 1900));
                fraseFlor.hidden = false;
                fraseFlor.classList.add("visible");
              }, 820));
            }, 4800));
          }, 820));
        }, 780));
      }
    }, 42);
    temporizadoresDetalle.push(escritura);
  }

  function volverAlHub() {
    temporizadoresDetalle.forEach(function (temporizador) {
      window.clearTimeout(temporizador);
      window.clearInterval(temporizador);
    });
    temporizadoresDetalle = [];
    salidaRamoEnCurso = false;
    if (limpiarReaccionRamo) {
      limpiarReaccionRamo();
      limpiarReaccionRamo = null;
    }
    if (limpiarInteraccionRamo) {
      limpiarInteraccionRamo();
      limpiarInteraccionRamo = null;
    }
    window.clearTimeout(temporizadorPulsoRamo);
    window.clearTimeout(temporizadorParticulas);
    cargaExperiencia.hidden = true;
    cargaExperiencia.replaceChildren();
    hub.hidden = false;
    botonVanesa.disabled = false;
    botonDosMeses.disabled = false;
    window.scrollTo(0, 0);
    botonDosMeses.focus({ preventScroll: true });
  }

  function iniciarSalidaRamoAlAgua(detalle) {
    if (salidaRamoEnCurso) return;
    if (reducir) {
      volverAlHub();
      return;
    }

    salidaRamoEnCurso = true;
    detalle.classList.add("salida-agua");
    var botonVolver = detalle.querySelector("#volver-hub-loto");
    botonVolver.disabled = true;
    temporizadoresDetalle.push(window.setTimeout(volverAlHub, 1600));
  }

  function activarInteraccionRamo(detalle, ramo) {
    var ilustracion = ramo.querySelector(".ilustracion-ramo");
    var escena = detalle.querySelector(".celebracion-loto");
    var particulas = detalle.querySelector(".particulas-interaccion");
    var corazones = detalle.querySelector(".corazones-interaccion");

    function crearParticula(simbolo, x, y, desplazamientoX, desplazamientoY, giro, tamano) {
      var particula = document.createElement("span");
      particula.className = "particula-interaccion";
      particula.textContent = simbolo;
      particula.style.setProperty("--particula-x", x + "px");
      particula.style.setProperty("--particula-y", y + "px");
      particula.style.setProperty("--particula-dx", desplazamientoX + "px");
      particula.style.setProperty("--particula-dy", desplazamientoY + "px");
      particula.style.setProperty("--particula-giro", giro + "deg");
      particula.style.setProperty("--particula-tamano", tamano + "rem");
      particula.style.setProperty("--particula-color", Math.random() > 0.5 ? "#fff8cc" : "#fff3f8");
      particulas.appendChild(particula);
      if (!reducir) {
        particula.addEventListener("animationend", function () {
          particula.remove();
        }, { once: true });
      }
    }

    function crearCorazonesFondo() {
      var cantidad = reducir ? 6 : 9;
      var simbolos = ["♡", "♥", "♡"];

      for (var i = 0; i < cantidad; i++) {
        var corazon = document.createElement("span");
        corazon.className = "corazon-interaccion";
        corazon.textContent = simbolos[i % simbolos.length];
        corazon.style.setProperty("--corazon-x", (8 + Math.random() * 84) + "%");
        corazon.style.setProperty("--corazon-y", (24 + Math.random() * 72) + "%");
        corazon.style.setProperty("--corazon-tamano", (0.85 + Math.random() * 1.15) + "rem");
        corazon.style.setProperty("--corazon-deriva", (Math.random() * 56 - 28) + "px");
        corazon.style.setProperty("--corazon-demora", (Math.random() * 0.45) + "s");
        corazon.style.setProperty("--corazon-color", Math.random() > 0.5 ? "rgba(224, 82, 133, 0.46)" : "rgba(255, 250, 252, 0.72)");
        corazones.appendChild(corazon);

        if (!reducir) {
          corazon.addEventListener("animationend", function (evento) {
            evento.currentTarget.remove();
          }, { once: true });
          window.setTimeout(function () {
            corazon.remove();
          }, 3200);
        }
      }

      while (corazones.childElementCount > 36) {
        corazones.firstElementChild.remove();
      }
    }

    function reaccionar(evento) {
      var escenaRect = escena.getBoundingClientRect();
      var ramoRect = ilustracion.getBoundingClientRect();
      var tienePosicion = evento && evento.detail !== 0 && Number.isFinite(evento.clientX) && Number.isFinite(evento.clientY);
      var x = tienePosicion ? evento.clientX - escenaRect.left : ramoRect.left + ramoRect.width / 2 - escenaRect.left;
      var y = tienePosicion ? evento.clientY - escenaRect.top : ramoRect.top + ramoRect.height * 0.42 - escenaRect.top;
      var cantidad = reducir ? 7 : 12;

      if (reducir) particulas.replaceChildren();
      crearCorazonesFondo();
      ramo.classList.add("reaccionando");
      window.clearTimeout(temporizadorPulsoRamo);
      temporizadorPulsoRamo = window.setTimeout(function () {
        ramo.classList.remove("reaccionando");
      }, 720);

      crearParticula("", x, y, 0, 0, 0, 2);
      particulas.lastElementChild.classList.add("onda-interaccion");
      for (var i = 0; i < cantidad; i++) {
        var angulo = (i / cantidad) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
        var distancia = 42 + Math.random() * 76;
        var simbolos = ["✦", "♡", "✿"];
        crearParticula(
          simbolos[i % simbolos.length],
          x,
          y,
          Math.cos(angulo) * distancia,
          Math.sin(angulo) * distancia - 14,
          Math.round(Math.random() * 70 - 35),
          0.72 + Math.random() * 0.72
        );
      }

      while (particulas.childElementCount > 40) {
        particulas.firstElementChild.remove();
      }

      if (reducir) {
        window.clearTimeout(temporizadorParticulas);
        temporizadorParticulas = window.setTimeout(function () {
          particulas.replaceChildren();
          corazones.replaceChildren();
        }, 900);
      }
    }

    function alPresionarTecla(evento) {
      if (evento.key !== "Enter" && evento.key !== " ") return;
      evento.preventDefault();
      reaccionar();
    }

    function alHacerClick(evento) {
      reaccionar(evento);
      if (evento.detail > 0) ilustracion.blur();
    }

    ilustracion.addEventListener("click", alHacerClick);
    ilustracion.addEventListener("keydown", alPresionarTecla);
    limpiarInteraccionRamo = function () {
      ilustracion.removeEventListener("click", alHacerClick);
      ilustracion.removeEventListener("keydown", alPresionarTecla);
      corazones.replaceChildren();
    };
  }

  function activarReaccionRamo(ramo) {
    var ilustracion = ramo.querySelector(".ilustracion-ramo");
    var flores = Array.from(ilustracion.querySelectorAll(".flor-respuesta"));
    var x = 0;
    var y = 0;
    var punteroActivo = false;

    function actualizarInclinacion() {
      marcoReaccionRamo = 0;
      ilustracion.style.setProperty("--ramo-inclinacion-x", (-y * 5).toFixed(2) + "deg");
      ilustracion.style.setProperty("--ramo-inclinacion-y", (x * 7).toFixed(2) + "deg");
      ilustracion.style.setProperty("--ramo-desplazamiento-x", (x * 8).toFixed(2) + "px");
      ilustracion.style.setProperty("--ramo-desplazamiento-y", (y * 5).toFixed(2) + "px");
      var limites = ilustracion.getBoundingClientRect();
      flores.forEach(function (flor) {
        if (!punteroActivo) {
          flor.style.setProperty("--flor-x", "0px");
          flor.style.setProperty("--flor-y", "0px");
          flor.style.setProperty("--flor-giro", "0deg");
          return;
        }
        var centro = flor.getBoundingClientRect();
        var florX = Math.max(-1, Math.min(1, (eventoX - (centro.left + centro.width / 2)) / (limites.width / 2)));
        var florY = Math.max(-1, Math.min(1, (eventoY - (centro.top + centro.height / 2)) / (limites.height / 2)));
        flor.style.setProperty("--flor-x", (florX * 7).toFixed(2) + "px");
        flor.style.setProperty("--flor-y", (florY * 4).toFixed(2) + "px");
        flor.style.setProperty("--flor-giro", (florX * 3.5 - florY * 1.5).toFixed(2) + "deg");
      });
    }

    var eventoX = 0;
    var eventoY = 0;

    function alMoverPuntero(evento) {
      if (evento.pointerType === "touch") return;
      var limites = ilustracion.getBoundingClientRect();
      x = Math.max(-1, Math.min(1, ((evento.clientX - limites.left) / limites.width - 0.5) * 2));
      y = Math.max(-1, Math.min(1, ((evento.clientY - limites.top) / limites.height - 0.5) * 2));
      eventoX = evento.clientX;
      eventoY = evento.clientY;
      punteroActivo = true;
      if (!marcoReaccionRamo) {
        marcoReaccionRamo = window.requestAnimationFrame(actualizarInclinacion);
      }
    }

    function alSalir() {
      x = 0;
      y = 0;
      punteroActivo = false;
      if (!marcoReaccionRamo) {
        marcoReaccionRamo = window.requestAnimationFrame(actualizarInclinacion);
      }
    }

    ilustracion.addEventListener("pointermove", alMoverPuntero);
    ilustracion.addEventListener("pointerleave", alSalir);
    ilustracion.addEventListener("pointercancel", alSalir);
    limpiarReaccionRamo = function () {
      ilustracion.removeEventListener("pointermove", alMoverPuntero);
      ilustracion.removeEventListener("pointerleave", alSalir);
      ilustracion.removeEventListener("pointercancel", alSalir);
      if (marcoReaccionRamo) {
        window.cancelAnimationFrame(marcoReaccionRamo);
        marcoReaccionRamo = 0;
      }
    };
  }

  function inicializarExperiencia() {
    portada = document.getElementById("portada");
    sobre = document.getElementById("sobre");
    btnAbrir = document.getElementById("btn-abrir");
    carta = document.getElementById("carta");
    mensaje = document.getElementById("mensaje");
    btnCerrarCarta = document.getElementById("btn-cerrar-carta");
    despedida = document.getElementById("despedida");
    contenedorPalabras = document.getElementById("palabras");
    btnCorazon = document.getElementById("btn-corazon");
    sorpresa = document.getElementById("sorpresa");
    barra = document.getElementById("barra");
    visor = document.getElementById("visor");
    visorImg = document.getElementById("visor-img");
    visorCerrar = document.getElementById("visor-cerrar");

    visorCerrar.addEventListener("click", cerrarVisor);
    visor.addEventListener("click", function (evento) {
      if (evento.target === visor) cerrarVisor();
    });

    document.querySelectorAll(".foto img").forEach(function (img) {
      var ok = function () {
        img.classList.add("cargada");
        habilitarZoom(img);
      };
      var fallo = function () { img.classList.add("error"); };
      if (img.complete) {
        if (img.naturalWidth > 0) {
          ok();
        } else if (img.currentSrc || img.getAttribute("loading") !== "lazy") {
          fallo();
        }
      }
      img.addEventListener("load", function () {
        if (!img.classList.contains("cargada")) ok();
      });
      img.addEventListener("error", fallo);
    });

    window.addEventListener("scroll", function () {
      if (!pendiente) {
        pendiente = true;
        requestAnimationFrame(actualizarProgreso);
      }
    }, { passive: true });

    btnAbrir.addEventListener("click", function () {
      btnAbrir.disabled = true;
      sobre.classList.add("abierto");
      if (reducir) {
        mostrarCarta();
        return;
      }
      setTimeout(function () { portada.classList.add("salida"); }, 1500);
      setTimeout(mostrarCarta, 2100);
    });

    btnCerrarCarta.addEventListener("click", cerrarCarta);
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
  }

  function abrirVisor(img) {
    visorImg.src = img.currentSrc || img.src;
    visorImg.alt = img.alt;
    if (visor.showModal) {
      visor.showModal();
    } else {
      visor.setAttribute("open", "");
    }
  }

  function cerrarVisor() {
    if (visor.close) {
      visor.close();
    } else {
      visor.removeAttribute("open");
    }
  }

  function habilitarZoom(img) {
    var marco = img.closest(".foto-marco");
    marco.setAttribute("role", "button");
    marco.setAttribute("tabindex", "0");
    marco.setAttribute("aria-label", "Ampliar foto: " + img.alt);
    marco.addEventListener("click", function () { abrirVisor(img); });
    marco.addEventListener("keydown", function (evento) {
      if (evento.key === "Enter" || evento.key === " ") {
        evento.preventDefault();
        abrirVisor(img);
      }
    });
  }

  function crearPalabras() {
    var indice = 0;
    for (var ronda = 0; ronda < REPETICIONES_PALABRAS; ronda++) {
      mezclar(PALABRAS).forEach(function (palabra) {
        var elemento = document.createElement("span");
        elemento.className = "palabra";
        elemento.textContent = palabra;
        elemento.style.setProperty("--x", aleatorio(2, 78).toFixed(1) + "%");
        elemento.style.setProperty("--y", aleatorio(5, 92).toFixed(1) + "%");
        elemento.style.setProperty("--size", aleatorio(1, 1.9).toFixed(2) + "rem");
        elemento.style.setProperty("--dur", aleatorio(16, 24).toFixed(1) + "s");
        elemento.style.setProperty("--delay", (indice * 0.35).toFixed(2) + "s");
        elemento.style.setProperty("--dx", aleatorio(-40, 40).toFixed(0) + "px");
        contenedorPalabras.appendChild(elemento);
        indice++;
      });
    }
  }

  function activarRevelado() {
    if (reducir || !("IntersectionObserver" in window)) return;
    var items = mensaje.querySelectorAll(
      ":scope > h2, :scope > p, :scope > .foto, :scope > .corazones, " +
      ":scope > blockquote, :scope > .linea-tiempo, :scope > .cierre"
    );
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("vista");
          observador.unobserve(entrada.target);
        }
      });
    }, { threshold: 0.15 });
    items.forEach(function (elemento) {
      elemento.classList.add("rev");
      observador.observe(elemento);
    });
  }

  var pendiente = false;
  function actualizarProgreso() {
    pendiente = false;
    var maximo = document.documentElement.scrollHeight - window.innerHeight;
    var progreso = maximo > 0 ? Math.min(1, window.scrollY / maximo) : 0;
    barra.style.transform = "scaleX(" + progreso.toFixed(3) + ")";
  }

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

  function cerrarCarta() {
    if (carta.classList.contains("cerrando")) return;
    despedida.hidden = false;
    carta.classList.add("cerrando");

    window.setTimeout(function () {
      cargaExperiencia.hidden = true;
      cargaExperiencia.replaceChildren();
      hub.hidden = false;
      botonVanesa.disabled = false;
      botonDosMeses.disabled = false;
      document.body.classList.remove("abierta");
      window.scrollTo(0, 0);
      botonVanesa.focus({ preventScroll: true });
    }, reducir ? 0 : 1800);
  }

  function lluviaCorazones() {
    var rect = btnCorazon.getBoundingClientRect();
    var colores = ["#c2185b", "#e63a5c", "#ff6b8a", "#ff8fa3"];
    for (var i = 0; i < 12; i++) {
      var corazon = document.createElement("span");
      corazon.className = "chispa heart";
      corazon.style.left = (rect.left + rect.width / 2) + "px";
      corazon.style.top = (rect.top + rect.height / 2) + "px";
      corazon.style.setProperty("--size", aleatorio(0.9, 1.8).toFixed(2) + "rem");
      corazon.style.setProperty("--c", colores[i % colores.length]);
      corazon.style.setProperty("--dx", aleatorio(-110, 110).toFixed(0) + "px");
      corazon.style.setProperty("--dy", (-aleatorio(90, 230)).toFixed(0) + "px");
      document.body.appendChild(corazon);
      setTimeout(function (elemento) { elemento.remove(); }, 1700, corazon);
    }
  }
})();
