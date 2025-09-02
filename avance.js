// URL de tu Apps Script publicado (actualiza si cambia)
const URL_SCRIPT =
  "https://script.google.com/macros/s/AKfycbwOp5c2whQZ16WtpZPjWE9baTG_DtFDvhVnn5WSS5_HYV7Zz_E-Egp0132-4mWGgx4gpA/exec";

let pedidos = {}; // Aquí se guardarán los datos reales desde Google Sheets

// Al cargar la página, obtenemos los datos
window.addEventListener("DOMContentLoaded", () => {
  fetch(URL_SCRIPT)
    .then((res) => res.json())
    .then((data) => {
      data.forEach((row) => {
        if (row["Código"]) {
          pedidos[row["Código"].toUpperCase()] = {
            tienda: row["Tienda"] || "No especificado",
            modelo: row["Modelo"] || "No especificado",
            colores: row["Colores"] || "No especificado",
            tallas: row["Tallas"] || "No especificado",
            estado: row["Estado"] || "🟥 Pedido registrado",
            fecha: row["Fecha"] || "",
            hora: row["Hora"] || "",
          };
        }
      });
    })
    .catch((err) => {
      console.error("Error al cargar pedidos:", err);
    });
});

// Buscar pedido por código
function buscarPedido() {
  const codigo = document
    .getElementById("codigoPedido")
    .value.trim()
    .toUpperCase();
  const resultado = document.getElementById("resultado");
  const mensajeError = document.getElementById("mensajeError");

  resultado.innerHTML = "";
  mensajeError.textContent = "";

  if (pedidos[codigo]) {
    const pedido = pedidos[codigo];
    const estadoVisual = obtenerEstadoVisual(pedido.estado);
    const barraProgreso = generarBarraSeguimiento(pedido.estado);
    const fechaFormateada = formatearFecha(pedido.fecha);
    const horaFormateada = formatearHora(pedido.hora);

    resultado.innerHTML = `
    <div class="result-card">
      <p><strong>🔖 Código:</strong> ${codigo}</p>
      <p><strong>🏬 Tienda:</strong> ${pedido.tienda}</p>
      <p><strong>👕 Modelo:</strong> ${pedido.modelo}</p>
      <p><strong>🎨 Colores:</strong> ${pedido.colores}</p>
      <p><strong>📏 Tallas:</strong> ${pedido.tallas}</p>
      <p><strong>📦 Estado:</strong> ${estadoVisual}</p>
      <p><strong>📅 Última actualización:</strong> ${fechaFormateada} – ${horaFormateada}</p>

      <div class="tracking-bar">
        ${barraProgreso}
      </div>
    </div>
  `;

    document.getElementById("botonReiniciar").style.display = "block";
  } else {
    mensajeError.textContent =
      "❌ No se encontró ningún pedido con ese código.";
  }
}

// Devuelve una insignia visual según el estado actual
function obtenerEstadoVisual(estado) {
  switch (estado.toLowerCase()) {
    case "🟥 pedido registrado":
    case "pedido registrado":
      return '<span class="status red">🟥 Pedido registrado</span>';
    case "🟧 corte":
    case "corte":
      return '<span class="status orange">🟧 En corte</span>';
    case "🟨 confección":
    case "confección":
      return '<span class="status yellow">🟨 En confección</span>';
    case "🟦 acabado":
    case "acabado":
      return '<span class="status blue">🟦 En acabado</span>';
    case "🟪 membretado":
    case "membretado":
      return '<span class="status purple">🟪 En membretado</span>';
    case "🟩 pedido listo":
    case "pedido listo":
    case "entregado":
    case "stock":
      return '<span class="status green">🟩 Pedido listo</span>';
    default:
      return '<span class="status gray">Estado desconocido</span>';
  }
}

// Genera visualmente la barra de seguimiento según el estado actual
function generarBarraSeguimiento(estadoActual) {
  const etapas = [
    "🟥 Pedido registrado",
    "🟧 Corte",
    "🟨 Confección",
    "🟦 Acabado",
    "🟪 Membretado",
    "🟩 Pedido listo",
  ];

  let barra = "";
  let estadoEncontrado = false;

  for (const etapa of etapas) {
    const estadoNombre = etapa.toLowerCase().split(" ").slice(1).join(" ");
    const actual = estadoActual
      .toLowerCase()
      .replace(/[^a-záéíóúñ ]/gi, "")
      .trim();

    if (estadoNombre === actual) {
      barra += `<div class="tracking-step active">${etapa}</div>`;
      estadoEncontrado = true;
    } else if (!estadoEncontrado) {
      barra += `<div class="tracking-step completed">${etapa}</div>`;
    } else {
      barra += `<div class="tracking-step">${etapa}</div>`;
    }
  }

  return barra;
}

// 🔁 Función para reiniciar la búsqueda
function reiniciarFormulario() {
  document.getElementById("codigoPedido").value = "";
  document.getElementById("resultado").innerHTML = "";
  document.getElementById("mensajeError").textContent = "";
  document.getElementById("botonReiniciar").style.display = "none";
  document.getElementById("codigoPedido").focus();
}

// 🔤 Formateo de fecha y hora legible
function formatearFecha(fechaISO) {
  if (!fechaISO) return "";
  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatearHora(fechaISO) {
  if (!fechaISO) return "";
  const fecha = new Date(fechaISO);
  return fecha.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}
