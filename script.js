// ===============================
// VARIABLES
// ===============================
let carrito = [];
let productoActual = null;

// ===============================
// ABRIR POPUP
// ===============================
function abrirModal(nombre, precio, descripcion, imagen) {
  productoActual = { nombre, precio, descripcion, imagen };

  document.getElementById("modal-img").src = imagen;
  document.getElementById("modal-nombre").innerText = nombre;
  document.getElementById("modal-precio").innerText = "$" + precio;
  document.getElementById("modal-desc").innerText = descripcion;

  document.getElementById("modalProducto").style.display = "flex";
}

// ===============================
// CERRAR POPUP
// ===============================
function cerrarModal() {
  document.getElementById("modalProducto").style.display = "none";
}

// ===============================
// AGREGAR AL CARRITO
// ===============================
function agregarAlCarrito() {
  if (productoActual) {
    carrito.push(productoActual);
    actualizarContador();
    cerrarModal();
    alert("Producto agregado al carrito 🛒");
  }
}

// ===============================
// ACTUALIZAR CONTADOR
// ===============================
function actualizarContador() {
  document.getElementById("contadorCarrito").innerText = carrito.length;
}

// ===============================
// ABRIR CARRITO
// ===============================
function abrirCarrito() {
  const lista = document.getElementById("listaCarrito");
  lista.innerHTML = "";

  if (carrito.length === 0) {
    lista.innerHTML = "<p>Tu carrito está vacío.</p>";
  } else {
    carrito.forEach((item, index) => {
      lista.innerHTML += `
        <div style="margin-bottom:10px;">
          ${item.nombre} - $${item.precio}
        </div>
      `;
    });
  }

  document.getElementById("modalCarrito").style.display = "flex";
}

// ===============================
// CERRAR CARRITO
// ===============================
function cerrarCarrito() {
  document.getElementById("modalCarrito").style.display = "none";
}

// ===============================
// VACIAR CARRITO
// ===============================
function vaciarCarrito() {
  carrito = [];
  actualizarContador();
  abrirCarrito();
}

// ===============================
// ENVIAR POR WHATSAPP
// ===============================
function enviarWhatsApp() {
  if (carrito.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }

  let mensaje = "Hola, quiero hacer el siguiente pedido:%0A";

  carrito.forEach(item => {
    mensaje += `- ${item.nombre} ($${item.precio})%0A`;
  });

  let numero = "5210000000000"; // ← CAMBIA POR TU NÚMERO
  let url = `https://wa.me/${numero}?text=${mensaje}`;

  window.open(url, "_blank");
}
