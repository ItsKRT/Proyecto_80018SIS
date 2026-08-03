/* ============================================================
   ASOCIACIONES.JS — Motor de sugerencias "¿Un antojo más?"
   Abarrotes San Juan

   Qué hace este archivo (todo enganchado, sin editar script.js):
   1. Sugerencias "¿Un antojo más?" en el carrito (igual que antes).
   2. Guarda cada pedido real en Firestore (colección "pedidos"),
      enganchado a tus funciones enviarWhatsApp() y generarPDF().
   3. Guarda/actualiza al cliente en Firestore (colección "usuarios"),
      enganchado a tu función iniciarSesion(), con un contador de
      pedidos por cliente (cliente frecuente).
   4. Calcula las reglas de asociación a partir de los pedidos reales
      guardados. Si todavía hay pocos, rellena lo que falta con
      tickets simulados para que las sugerencias no se vean vacías
      mientras juntas historial.

   ÚNICO PASO MANUAL (si no lo hiciste ya la vez pasada):
   Agrega esta línea en tu index.html, justo después de tu script.js:

       <script src="asociaciones.js"></script>

   Si ya la tenías de antes, solo reemplaza el archivo — es la misma ruta.
   ============================================================ */

(function () {
  const FIRESTORE_SDK = "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
  const UMBRAL_MINIMO_PEDIDOS = 40; // tickets deseados para reglas estables

  let ASOCIACIONES = {};
  let PRODUCTOS_INDEX = {};

  function libFirestore() { return import(FIRESTORE_SDK); }

  // --- Índice de productos reales a partir de tus PASILLOS ---
  function construirIndice() {
    PRODUCTOS_INDEX = {};
    PASILLOS.forEach(pasillo => {
      (pasillo.productos || []).forEach(p => {
        PRODUCTOS_INDEX[p.nombre] = { ...p, categoriaId: pasillo.id };
      });
    });
  }

  // --- Tickets sintéticos (relleno / fallback) ---
  function generarTicketsSinteticos(n, ruido = 0.2) {
    const nombres = Object.keys(PRODUCTOS_INDEX);
    const grupos = [...new Set(Object.values(PRODUCTOS_INDEX).map(p => p.categoriaId))];
    const tickets = [];
    for (let i = 0; i < n; i++) {
      const grupoSemilla = grupos[Math.floor(Math.random() * grupos.length)];
      const cantidad = 2 + Math.floor(Math.random() * 3);
      const set = new Set();
      let intentos = 0;
      while (set.size < cantidad && intentos < 30) {
        intentos++;
        const tomarDelGrupo = Math.random() > ruido;
        const pool = tomarDelGrupo
          ? nombres.filter(nom => PRODUCTOS_INDEX[nom].categoriaId === grupoSemilla)
          : nombres;
        if (pool.length === 0) continue;
        set.add(pool[Math.floor(Math.random() * pool.length)]);
      }
      tickets.push([...set]);
    }
    return tickets;
  }

  // --- Leer pedidos reales guardados en Firestore ---
  async function cargarTicketsReales(limiteDocs = 500) {
    try {
      const { collection, getDocs, query, orderBy, limit } = await libFirestore();
      const db = window._db;
      if (!db) return [];
      const q = query(collection(db, 'pedidos'), orderBy('fecha', 'desc'), limit(limiteDocs));
      const snap = await getDocs(q);
      return snap.docs
        .map(d => (d.data().items || []).map(i => i.nombre).filter(nom => PRODUCTOS_INDEX[nom]))
        .filter(t => t.length >= 2); // un ticket de 1 producto no aporta asociaciones
    } catch (e) {
      console.warn('[asociaciones] No se pudieron leer pedidos reales:', e.message);
      return [];
    }
  }

  // --- Algoritmo de asociación: co-ocurrencia + confianza ---
  function calcularAsociaciones(tickets) {
    const co = {}, frec = {};
    tickets.forEach(t => {
      t.forEach(p => { frec[p] = (frec[p] || 0) + 1; });
      for (let i = 0; i < t.length; i++) {
        for (let j = 0; j < t.length; j++) {
          if (i === j) continue;
          co[t[i]] = co[t[i]] || {};
          co[t[i]][t[j]] = (co[t[i]][t[j]] || 0) + 1;
        }
      }
    });
    const res = {};
    for (const a in co) {
      res[a] = Object.entries(co[a])
        .map(([b, c]) => ({ producto: b, confianza: c / frec[a] }))
        .filter(r => r.confianza > 0.25)
        .sort((x, y) => y.confianza - x.confianza)
        .slice(0, 3);
    }
    return res;
  }

  // --- Arranque: pedidos reales + relleno simulado si hacen falta ---
  async function iniciarMotor() {
    construirIndice();
    const ticketsReales = await cargarTicketsReales();
    let tickets = ticketsReales;
    if (ticketsReales.length < UMBRAL_MINIMO_PEDIDOS) {
      const faltantes = UMBRAL_MINIMO_PEDIDOS - ticketsReales.length;
      tickets = tickets.concat(generarTicketsSinteticos(faltantes));
      console.info(`[asociaciones] ${ticketsReales.length} pedidos reales + ${faltantes} simulados (relleno)`);
    } else {
      console.info(`[asociaciones] Usando ${ticketsReales.length} pedidos reales`);
    }
    ASOCIACIONES = calcularAsociaciones(tickets);
  }

  // ============================================================
  // GUARDAR PEDIDOS EN FIRESTORE
  // ============================================================
  async function guardarPedidoFirestore(canal) {
    if (typeof carrito === 'undefined' || carrito.length === 0) return;
    try {
      const { collection, addDoc, doc, setDoc, increment, serverTimestamp } = await libFirestore();
      const db = window._db;
      if (!db) return;

      const sub   = carrito.reduce((a, i) => a + i.precio * i.qty, 0);
      const envio = sub >= 200 ? 0 : 30;
      const iva   = Math.round(sub * 0.16);

      await addDoc(collection(db, 'pedidos'), {
        items: carrito.map(i => ({ nombre: i.nombre, precio: i.precio, qty: i.qty })),
        subtotal: sub, envio, iva, total: sub + envio + iva,
        cliente: (typeof usuarioActual !== 'undefined' && usuarioActual) ? usuarioActual.nombre : null,
        telefono: (typeof usuarioActual !== 'undefined' && usuarioActual) ? usuarioActual.telefono : null,
        canal, // 'whatsapp' o 'pdf'
        fecha: serverTimestamp()
      });

      // Contador de pedidos por cliente (cliente frecuente)
      if (typeof usuarioActual !== 'undefined' && usuarioActual && usuarioActual.telefono) {
        await setDoc(doc(db, 'usuarios', usuarioActual.telefono), {
          nombre: usuarioActual.nombre,
          telefono: usuarioActual.telefono,
          totalPedidos: increment(1),
          ultimaCompra: serverTimestamp()
        }, { merge: true });
      }
    } catch (e) {
      console.warn('[asociaciones] No se pudo guardar el pedido:', e.message);
    }
  }

  // ============================================================
  // GUARDAR / ACTUALIZAR USUARIOS EN FIRESTORE
  // ============================================================
  async function guardarUsuarioFirestore(usuario) {
    if (!usuario || !usuario.telefono) return;
    try {
      const { doc, getDoc, setDoc, serverTimestamp } = await libFirestore();
      const db = window._db;
      if (!db) return;
      const ref = doc(db, 'usuarios', usuario.telefono);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, {
          nombre: usuario.nombre, telefono: usuario.telefono,
          totalPedidos: 0, fechaRegistro: serverTimestamp()
        });
      } else {
        await setDoc(ref, { nombre: usuario.nombre }, { merge: true });
      }
    } catch (e) {
      console.warn('[asociaciones] No se pudo guardar el usuario:', e.message);
    }
  }

  // ============================================================
  // UI: "¿UN ANTOJO MÁS?" EN EL CARRITO
  // ============================================================
  function crearContenedor() {
    if (document.getElementById('antojoMasWrap')) return;
    const lista = document.getElementById('listaCarrito');
    if (!lista) return;

    const cont = document.createElement('div');
    cont.id = 'antojoMasWrap';
    cont.className = 'antojo-mas-wrap';
    cont.style.display = 'none';
    lista.parentNode.insertBefore(cont, lista.nextSibling);

    const style = document.createElement('style');
    style.textContent = `
      .antojo-mas-wrap{
        margin:0 16px 14px; padding:12px 14px; border-radius:12px;
        border:1.5px dashed #ffd700; background:rgba(255,215,0,.07);
      }
      .antojo-mas-titulo{
        font-family:var(--font-d, inherit); font-weight:700; font-size:.8rem;
        letter-spacing:.03em; color:#b8901a; margin-bottom:10px;
      }
      .antojo-mas-item{
        display:flex; align-items:center; justify-content:space-between;
        background:rgba(0,0,0,.04); border-radius:10px; padding:8px 10px; margin-bottom:8px;
      }
      .antojo-mas-item:last-child{ margin-bottom:0; }
      .antojo-mas-info{ display:flex; align-items:center; gap:9px; }
      .antojo-mas-info img{ width:34px; height:34px; border-radius:8px; object-fit:cover; }
      .antojo-mas-info .nom{ font-size:.78rem; font-weight:600; }
      .antojo-mas-info .pre{ font-size:.72rem; color:#7aab8a; display:block; }
      .antojo-mas-item button{
        background:#39ff14; color:#0d2b1e; border:none; border-radius:20px;
        padding:6px 12px; font-size:.7rem; font-weight:700; cursor:pointer;
      }
      body.dark .antojo-mas-wrap{ background:rgba(255,215,0,.05); border-color:#7a5f10; }
      body.dark .antojo-mas-titulo{ color:#d4a820; }
      body.dark .antojo-mas-item{ background:#1a1400; }
      body.dark .antojo-mas-info .nom{ color:#d4a820; }
    `;
    document.head.appendChild(style);
  }

  function renderAntojoMas() {
    const cont = document.getElementById('antojoMasWrap');
    if (!cont) return;
    if (typeof carrito === 'undefined' || carrito.length === 0) {
      cont.style.display = 'none';
      return;
    }

    const candidatos = {};
    carrito.forEach(item => {
      (ASOCIACIONES[item.nombre] || []).forEach(r => {
        if (carrito.some(c => c.nombre === r.producto)) return;
        if (!candidatos[r.producto] || r.confianza > candidatos[r.producto]) {
          candidatos[r.producto] = r.confianza;
        }
      });
    });

    const top = Object.entries(candidatos).sort((a, b) => b[1] - a[1]).slice(0, 2);

    if (top.length === 0) {
      cont.style.display = 'none';
      return;
    }

    cont.style.display = 'block';
    cont.innerHTML = '<div class="antojo-mas-titulo">¿Un antojo más? 🛍️</div>' +
      top.map(([nombre]) => {
        const p = PRODUCTOS_INDEX[nombre];
        if (!p) return '';
        const nombreEscapado = nombre.replace(/'/g, "\\'");
        return `
          <div class="antojo-mas-item">
            <div class="antojo-mas-info">
              <img src="${p.img || ''}" alt="${nombre}">
              <span><span class="nom">${nombre}</span><span class="pre">$${p.precio}</span></span>
            </div>
            <button onclick="agregarDirecto('${nombreEscapado}', ${p.precio}, '${p.img || ''}')">+ Agregar</button>
          </div>`;
      }).join('');
  }

  // ============================================================
  // ENGANCHES — SIN EDITAR script.js
  // ============================================================
  function envolver(nombreFn, extra) {
    if (typeof window[nombreFn] !== 'function' || window[nombreFn]._envuelta) return false;
    const original = window[nombreFn];
    window[nombreFn] = function (...args) {
      const resultado = original.apply(this, args);
      extra(args, resultado);
      return resultado;
    };
    window[nombreFn]._envuelta = true;
    return true;
  }

  function engancharTodo() {
    let ok = true;
    ok = envolver('renderCarrito', () => renderAntojoMas()) && ok;
    ok = envolver('enviarWhatsApp', () => guardarPedidoFirestore('whatsapp')) && ok;
    ok = envolver('generarPDF', () => guardarPedidoFirestore('pdf')) && ok;
    ok = envolver('iniciarSesion', () => {
      if (typeof usuarioActual !== 'undefined' && usuarioActual) {
        guardarUsuarioFirestore(usuarioActual);
      }
    }) && ok;
    return ok;
  }

  // PASILLOS y las funciones del carrito se cargan async (Firestore),
  // así que esperamos a que todo exista antes de enganchar.
  const esperar = setInterval(() => {
    if (
      typeof PASILLOS !== 'undefined' && PASILLOS.length > 0 &&
      typeof renderCarrito === 'function' &&
      typeof enviarWhatsApp === 'function' &&
      typeof generarPDF === 'function' &&
      typeof iniciarSesion === 'function' &&
      engancharTodo()
    ) {
      clearInterval(esperar);
      crearContenedor();
      iniciarMotor();
    }
  }, 300);
})();
