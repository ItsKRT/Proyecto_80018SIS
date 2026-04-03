/* ============================================
   ABARROTES SAN JUAN — script.js v2
============================================ */

// ─── CONFIG ───────────────────────────────
const WHATSAPP_TIENDA = '5215500000000'; // ← Cambia aquí tu número (sin +, sin espacios)
const NOMBRE_TIENDA   = 'Abarrotes San Juan';

// ─── ESTADO GLOBAL ────────────────────────
let carrito       = [];       // [{...producto, qty}]
let productoActual = null;
let cantidadModal  = 1;
let usuarioActual  = null;    // {nombre, telefono}
let chatbotAbierto = false;

// ─── CARRUSEL DE PASILLOS ─────────────────
const CARRUSEL_COLORES = {
  bebidas:       'cpasillo-bebidas',
  snacks:        'cpasillo-snacks',
  lacteos:       'cpasillo-lacteos',
  limpieza:      'cpasillo-limpieza',
  enlatados:     'cpasillo-enlatados',
  panaderia:     'cpasillo-panaderia',
  'carnesfrías': 'cpasillo-carnes',
  salud:         'cpasillo-salud',
  mascotas:      'cpasillo-mascotas',
  luchaLibre:    'cpasillo-lucha',
  wwe2k26:       'cpasillo-wwe',
  dragonball:    'cpasillo-dragon',
};

function generarCarrusel() {
  const track = document.getElementById('carruselTrack');
  if (!track) return;

  const pasillosValidos = PASILLOS.filter(Boolean);

  track.innerHTML = pasillosValidos.map(p => {
    const colorClass = CARRUSEL_COLORES[p.id] || 'cpasillo-default';
    const ofertasCount = p.productos.filter(pr => pr.oferta).length;
    return `
      <div class="carrusel-item" id="citem-${p.id}" onclick="abrirPasilloView('${p.id}')">
        <div class="carrusel-circle ${colorClass}">
          <span>${p.emoji}</span>
          ${ofertasCount > 0 ? `<span class="carrusel-badge">🔥 ${ofertasCount}</span>` : ''}
        </div>
        <span class="carrusel-label">${p.nombre}</span>
      </div>
    `;
  }).join('');

  initCarruselScroll();
}

function initCarruselScroll() {
  const wrap  = document.getElementById('carruselScrollWrap');
  const thumb = document.getElementById('carruselScrollThumb');
  const track = document.getElementById('carruselScrollTrack');
  if (!wrap || !thumb || !track) return;

  // Sincronizar thumb con scroll del contenedor
  function syncThumb() {
    const scrollRatio = wrap.scrollLeft / (wrap.scrollWidth - wrap.clientWidth);
    const trackW      = track.clientWidth;
    const thumbW      = Math.max(48, trackW * (wrap.clientWidth / wrap.scrollWidth));
    const thumbLeft   = scrollRatio * (trackW - thumbW);
    thumb.style.width = thumbW + 'px';
    thumb.style.left  = thumbLeft + 'px';
  }

  wrap.addEventListener('scroll', syncThumb, { passive: true });
  window.addEventListener('resize', syncThumb);
  setTimeout(syncThumb, 100); // esperar render inicial

  // Clic en el track para saltar
  track.addEventListener('click', e => {
    if (e.target === thumb) return;
    const rect       = track.getBoundingClientRect();
    const clickRatio = (e.clientX - rect.left) / rect.width;
    wrap.scrollLeft  = clickRatio * (wrap.scrollWidth - wrap.clientWidth);
  });

  // Drag del thumb
  let dragStartX = 0, dragStartScroll = 0, isDragging = false;

  thumb.addEventListener('pointerdown', e => {
    isDragging     = true;
    dragStartX     = e.clientX;
    dragStartScroll = wrap.scrollLeft;
    thumb.setPointerCapture(e.pointerId);
    e.stopPropagation();
  });

  thumb.addEventListener('pointermove', e => {
    if (!isDragging) return;
    const trackW    = track.clientWidth;
    const thumbW    = thumb.clientWidth;
    const delta     = e.clientX - dragStartX;
    const scrollMax = wrap.scrollWidth - wrap.clientWidth;
    wrap.scrollLeft = dragStartScroll + (delta / (trackW - thumbW)) * scrollMax;
  });

  thumb.addEventListener('pointerup', () => { isDragging = false; });
  thumb.addEventListener('pointercancel', () => { isDragging = false; });

  // Drag del contenedor (mouse)
  let isMouseDragging = false, startX = 0, startScrollLeft = 0;
  wrap.addEventListener('mousedown', e => {
    isMouseDragging = true;
    startX          = e.pageX - wrap.offsetLeft;
    startScrollLeft = wrap.scrollLeft;
    wrap.style.cursor = 'grabbing';
  });
  wrap.addEventListener('mouseleave', () => { isMouseDragging = false; wrap.style.cursor = 'grab'; });
  wrap.addEventListener('mouseup',    () => { isMouseDragging = false; wrap.style.cursor = 'grab'; });
  wrap.addEventListener('mousemove',  e => {
    if (!isMouseDragging) return;
    e.preventDefault();
    const x = e.pageX - wrap.offsetLeft;
    wrap.scrollLeft = startScrollLeft - (x - startX) * 1.4;
  });
}

// ─── VISTA PASILLO INDIVIDUAL ─────────────
function abrirPasilloView(pasilloId) {
  const pasillo = PASILLOS.find(p => p && p.id === pasilloId);
  if (!pasillo) return;

  const view  = document.getElementById('pasilloView');
  const grid  = document.getElementById('pasilloViewGrid');
  const title = document.getElementById('pasilloViewTitle');
  const count = document.getElementById('pasilloViewCount');

  title.textContent = `${pasillo.emoji} ${pasillo.nombre}`;
  count.textContent = `${pasillo.productos.length} productos`;

  grid.innerHTML = '';
  pasillo.productos.forEach((prod, i) => {
    const card = document.createElement('div');
    card.className = 'pv-product-card';
    card.style.animationDelay = `${i * 0.06}s`;
    card.innerHTML = `
      ${prod.oferta ? '<span class="pv-oferta-badge">🔥 Oferta</span>' : ''}
      <img src="${prod.img}" alt="${prod.nombre}" loading="lazy">
      <div class="pv-product-info">
        <div class="pv-product-name">${prod.nombre}</div>
        <div class="pv-product-desc">${prod.desc}</div>
        <div class="pv-product-prices">
          ${prod.precioOld ? `<span class="pv-price-old">$${prod.precioOld}</span>` : ''}
          <span class="pv-price-new">$${prod.precio}</span>
        </div>
      </div>
      <button class="pv-add-btn" onclick="event.stopPropagation();abrirModal('${prod.nombre.replace(/'/g,"\\'")}',${prod.precio},${prod.precioOld||'null'},'${prod.desc.replace(/'/g,"\\'")}','${prod.img}','${pasillo.nombre}')">Ver detalle ✦</button>
    `;
    grid.appendChild(card);
  });

  // Marcar activo en carrusel
  document.querySelectorAll('.carrusel-item').forEach(el => el.classList.remove('active'));
  const activeItem = document.getElementById(`citem-${pasilloId}`);
  if (activeItem) activeItem.classList.add('active');

  view.scrollTop = 0;
  view.classList.add('open');
  document.body.style.overflow = 'hidden';
  // Mostrar FAB con pequeño delay para que entre con la animación del pasillo
  setTimeout(() => { const fab = document.getElementById('pvFabBack'); if (fab) fab.classList.add('visible'); }, 300);
}

function cerrarPasilloView() {
  const view = document.getElementById('pasilloView');
  const fab  = document.getElementById('pvFabBack');
  if (fab) fab.classList.remove('visible');
  view.classList.remove('open');
  document.body.style.overflow = '';
  document.querySelectorAll('.carrusel-item').forEach(el => el.classList.remove('active'));
}

// ─── NMHP: Scroll a pasillos y abrir directamente ─
function scrollToAndOpen(pasilloId) {
  const sec = document.getElementById('pasillos');
  if (sec) sec.scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => {
    aplicarFiltro(pasilloId, document.querySelector(`[onclick*="${pasilloId}"]`) || document.createElement('button'));
    setTimeout(() => abrirPasilloView(pasilloId), 300);
  }, 600);
}

// Cerrar con tecla Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const view = document.getElementById('pasilloView');
    if (view && view.classList.contains('open')) { cerrarPasilloView(); return; }
    const drawer = document.getElementById('cartDrawer');
    if (drawer && drawer.classList.contains('open')) { cerrarCarrito(); return; }
  }
});

const cursor   = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');
let mouseX = 0, mouseY = 0, fX = 0, fY = 0;

let rafPending = false;
document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  cursor.style.transform = `translate(${mouseX}px,${mouseY}px) translate(-50%,-50%)`;
  if (!rafPending) { rafPending = true; requestAnimationFrame(animF); }
});
function animF() {
  rafPending = false;
  const dx = mouseX - fX, dy = mouseY - fY;
  if (Math.abs(dx) > 0.3 || Math.abs(dy) > 0.3) {
    fX += dx * 0.12; fY += dy * 0.12;
    follower.style.transform = `translate(${fX}px,${fY}px) translate(-50%,-50%)`;
    rafPending = true;
    requestAnimationFrame(animF);
  }
}

document.querySelectorAll('a,button,.card,.pasillo-card,.opcion-card,.carrito-icono,.oferta-card').forEach(el => {
  el.addEventListener('mouseenter', () => { cursor.style.transform='translate(-50%,-50%) scale(2.5)'; cursor.style.background='var(--g300)'; follower.style.opacity='0'; });
  el.addEventListener('mouseleave', () => { cursor.style.transform=`translate(${mouseX}px,${mouseY}px) translate(-50%,-50%)`; cursor.style.background='var(--g500)'; follower.style.opacity='.6'; });
});

// Pausar animaciones del hero cuando no está en pantalla
const heroEl = document.querySelector('.hero');
if (heroEl) {
  const heroObs = new IntersectionObserver(entries => {
    entries[0].target.classList.toggle('in-viewport', entries[0].isIntersecting);
  }, { threshold: 0 });
  heroObs.observe(heroEl);
}

// ─── NAVBAR SCROLL + BACK-TO-TOP (throttled) ──
let scrollTicking = false;
function onScroll() {
  if (!scrollTicking) {
    requestAnimationFrame(() => {
      const sy = window.scrollY;
      document.getElementById('navbar').classList.toggle('scrolled', sy > 60);
      const btn = document.getElementById('backToTop');
      if (btn) btn.classList.toggle('visible', sy > 500);
      scrollTicking = false;
    });
    scrollTicking = true;
  }
}
window.addEventListener('scroll', onScroll, { passive: true });

// ─── SPLASH ───────────────────────────────
function cerrarSplash() {
  const s = document.getElementById('splash');
  s.classList.add('hidden');
  setTimeout(() => s.remove(), 700);
}

// ─── HERO ─────────────────────────────────
function expandHero() { document.getElementById('heroFullscreen').classList.add('active'); }
function closeHero()  { document.getElementById('heroFullscreen').classList.remove('active'); }

// ─── TOGGLE CONOCENOS ─────────────────────
function toggleMenu() {
  const menu = document.getElementById('menu');
  const icon = document.getElementById('toggleIcon');
  const open = menu.style.display === 'flex';
  menu.style.display = open ? 'none' : 'flex';
  icon.classList.toggle('open', !open);
}

// ─── POPUP ────────────────────────────────
function showPopup(type) {
  const info = {
    mision:  ['Nuestra Misión',   'Brindar productos de calidad al mejor precio, acercándonos a nuestra comunidad con honestidad y calidez en cada venta.'],
    vision:  ['Nuestra Visión',   'Ser la tienda digital líder de nuestra comunidad, innovando con tecnología sin perder el trato humano y cercano.'],
    objetivo:['Nuestro Objetivo', 'Facilitar las compras diarias con rapidez, comodidad y precios justos para cada familia de nuestra colonia.']
  };
  document.getElementById('popup-title').innerText = info[type][0];
  document.getElementById('popup-text').innerText  = info[type][1];
  document.getElementById('popup').classList.add('active');
}
function closePopup() { document.getElementById('popup').classList.remove('active'); }

// ─── TOAST ────────────────────────────────
function mostrarToast(msg, dur = 2500) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), dur);
}

// ─── MENÚ FLOTANTE USUARIO ───────────────
function toggleUserMenu() {
  const menu = document.getElementById('userMenu');
  const isOpen = menu.classList.contains('open');
  if (isOpen) cerrarUserMenu();
  else abrirUserMenu();
}

function abrirUserMenu() {
  actualizarUserMenu();
  document.getElementById('userMenu').classList.add('open');
  setTimeout(() => document.addEventListener('click', clickFueraUserMenu), 10);
}

function cerrarUserMenu() {
  document.getElementById('userMenu').classList.remove('open');
  document.removeEventListener('click', clickFueraUserMenu);
}

function clickFueraUserMenu(e) {
  if (!e.target.closest('.user-btn-wrap')) cerrarUserMenu();
}

function actualizarUserMenu() {
  const guest  = document.getElementById('userMenuGuest');
  const logged = document.getElementById('userMenuLogged');
  if (usuarioActual) {
    guest.style.display  = 'none';
    logged.style.display = 'block';
    // Avatar en menú — foto o inicial
    const avatarEl = document.getElementById('userAvatar');
    if (usuarioActual.foto) {
      avatarEl.innerHTML = `<img src="${usuarioActual.foto}" alt="Foto de perfil">`;
    } else {
      avatarEl.textContent = usuarioActual.nombre.charAt(0).toUpperCase();
    }
    // Avatar en NAVBAR — foto o inicial
    actualizarNavAvatar();
    document.getElementById('userMenuNombre').textContent = usuarioActual.nombre;
    document.getElementById('userMenuTel').textContent   = '+52 ' + usuarioActual.telefono;
    // Stats carrito
    const items = carrito.reduce((a, i) => a + i.qty, 0);
    const total = carrito.reduce((a, i) => a + i.precio * i.qty, 0);
    document.getElementById('userMenuItems').textContent = items + (items === 1 ? ' producto' : ' productos');
    document.getElementById('userMenuTotal').textContent = '$' + total;
  } else {
    guest.style.display  = 'block';
    logged.style.display = 'none';
  }
}

function actualizarNavAvatar() {
  const navCircle = document.getElementById('navAvatarCircle');
  if (!navCircle) return;
  if (usuarioActual.foto) {
    navCircle.innerHTML = `<img src="${usuarioActual.foto}" alt="Perfil">`;
  } else {
    navCircle.textContent = usuarioActual.nombre.charAt(0).toUpperCase();
  }
}

function cambiarFotoPerfil(input) {
  if (!input.files || !input.files[0]) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    if (usuarioActual) {
      usuarioActual.foto = e.target.result;
      actualizarUserMenu();
      mostrarToast('✦ Foto de perfil actualizada');
    }
  };
  reader.readAsDataURL(input.files[0]);
}

function cerrarSesion() {
  usuarioActual = null;
  document.getElementById('loginBtn').style.display    = 'flex';
  document.getElementById('navAvatarBtn').style.display = 'none';
  cerrarUserMenu();
  mostrarToast('Sesión cerrada ✓');
}

function cerrarLogin() { document.getElementById('modalLogin').style.display = 'none'; }

function iniciarSesion() {
  // Detectar cuál campo tiene valor — navbar o modal
  const nombreNav   = document.getElementById('loginNombre');
  const telNav      = document.getElementById('loginTelefono');
  const nombreModal = document.getElementById('loginNombreModal');
  const telModal    = document.getElementById('loginTelefonoModal');

  // Usar el par que tenga datos, priorizando el modal si está visible
  let nombre = '', telRaw = '';
  const modalVisible = document.getElementById('modalLogin') &&
                       document.getElementById('modalLogin').style.display === 'flex';

  if (modalVisible) {
    nombre = nombreModal ? nombreModal.value.trim() : '';
    telRaw = telModal    ? telModal.value.trim()    : '';
  }
  // Si el modal no está visible o no tiene datos, usar el navbar
  if (!nombre) {
    nombre = nombreNav ? nombreNav.value.trim() : '';
    telRaw = telNav    ? telNav.value.trim()    : '';
  }

  const tel = telRaw.replace(/\D/g,'');
  if (!nombre) { mostrarToast('⚠ Ingresa tu nombre'); return; }
  if (tel.length < 10) { mostrarToast('⚠ Número inválido (10 dígitos)'); return; }

  usuarioActual = { nombre, telefono: tel };

  // Limpiar campos
  if (nombreNav)   nombreNav.value   = '';
  if (telNav)      telNav.value      = '';
  if (nombreModal) nombreModal.value = '';
  if (telModal)    telModal.value    = '';

  // Mostrar avatar en navbar
  document.getElementById('loginBtn').style.display = 'none';
  const navBtn = document.getElementById('navAvatarBtn');
  navBtn.style.display = 'flex';
  navBtn.classList.remove('pop');
  setTimeout(() => navBtn.classList.add('pop'), 10);

  actualizarUserMenu();
  cerrarUserMenu();

  if (modalVisible) {
    document.getElementById('modalLogin').style.display = 'none';
  }
  mostrarToast(`¡Hola, ${nombre.split(' ')[0]}! 👋`);
  lanzarConfetti();
}

// ─── DATOS ────────────────────────────────
const PASILLOS = [
  {
    id:'bebidas', nombre:'Bebidas', emoji:'🥤',
    imagen:'./img/bebidas.png',
    productos:
   [
  { nombre:'Coca-Cola 2L',              precio:35, precioOld:null, desc:'Refresco de cola icónico, botella 2 litros.',                  img:'https://m.media-amazon.com/images/I/71wWKpuFjdL._AC_UF894,1000_QL80_.jpg', oferta:false },
  { nombre:'Coca-Cola Zero 600ml',      precio:20, precioOld:null, desc:'Refresco de cola sin azúcar lata 355ml.',                      img:'https://resources.coca-colaentuhogar.com/media/catalog/product/c/o/coccolsinazu-sinazuc-nor-pet-600ml-4pz_4.png?quality=100&fit=bounds&height=550&width=550&format=webp', oferta:false },
  { nombre:'Agua Bonafont 1.5L',        precio:18, precioOld:null, desc:'Agua purificada en botella de 1.5 litros.',                    img:'https://lagranbodega.vteximg.com.br/arquivos/ids/281012-1000-1000/758104000159.jpg?v=637438353438500000', oferta:false },
  { nombre:'Agua Ciel 500ml x6',        precio:55, precioOld:65,   desc:'Pack de 6 botellas de agua purificada 500ml.',                 img:'https://i5.walmartimages.com.mx/mg/gm/3pp/asr/dc881d8c-1280-4c82-b490-eea5e1a72da2.01b8a9de0902063a2421a46f99c584e7.jpeg?odnHeight=2000&odnWidth=2000&odnBg=ffffff', oferta:true  },
  { nombre:'Jugo Del Valle 1L',         precio:28, precioOld:35,   desc:'Jugo de naranja natural, 1 litro.',                            img:'https://anyhow.mx/wp-content/uploads/2021/07/Jugo-del-Valle-sabor-Manzana-Clarificada-1Lt.webp', oferta:true  },
  { nombre:'Jugo Jumex Mango 1L',       precio:26, precioOld:null, desc:'Jugo de mango natural sin conservadores 1 litro.',             img:'https://i5.walmartimages.com.mx/gr/images/product-images/img_large/00750101310279L.jpg?odnHeight=612&odnWidth=612&odnBg=FFFFFF&format=avif', oferta:false },
  { nombre:'Gatorade Moras Freeze',     precio:22, precioOld:null, desc:'Bebida isotónica sabor limón 600ml.',                          img:'https://i5.walmartimages.com.mx/mg/gm/3pp/asr/75e3bede-0fe5-4791-8ec6-96600a07d96e.c94082c4e5c97fdcb63f8c7a19d6f42d.jpeg?odnHeight=612&odnWidth=612&odnBg=FFFFFF', oferta:false },
  { nombre:'Gatorade Tropical',         precio:22, precioOld:null, desc:'Bebida isotónica sabor tropical 600ml.',                       img:'https://www.crackerjack.co.nz/content/products/gatorade-tropical-fruit-500ml-FD0182-13258.jpg', oferta:false },
  { nombre:'Red Bull 250ml',            precio:38, precioOld:null, desc:'Bebida energizante lata 250ml.',                               img:'https://i5.walmartimages.com.mx/mg/gm/3pp/asr/a29a56da-a432-4737-9216-d017981a4c9e.ab4ce6a74cb0f2077ada87ee1a78e81a.jpeg?odnHeight=612&odnWidth=612&odnBg=FFFFFF', oferta:false },
  { nombre:'Monster Energy Verde',      precio:42, precioOld:null, desc:'Bebida energizante Monster Original lata 473ml.',              img:'https://i5.walmartimages.com.mx/mg/gm/3pp/asr/c0076ab0-e12e-47d3-9653-ad31f8f6b6cd.d8f00da1bf20f9eaf5ee1d0e39322270.jpeg?odnHeight=612&odnWidth=612&odnBg=FFFFFF', oferta:false },
  { nombre:'Café Nescafé Clásico',      precio:55, precioOld:65,   desc:'Café soluble instantáneo frasco 100g.',                        img:'https://www.costco.com.mx/medias/sys_master/products/h3e/h39/326968845926430.jpg', oferta:true  },
  { nombre:'Café Dolca 200g',           precio:75, precioOld:null, desc:'Café molido tostado mediano bolsa 200g.',                      img:'https://res.cloudinary.com/riqra/image/upload/w_656,h_656,c_limit,q_auto,f_auto/v1764950307/merco-monterrey/products/e44f9af368a233b0.png', oferta:false },
  { nombre:'Pepsi 2L',                  precio:33, precioOld:null, desc:'Refresco de cola Pepsi botella 2 litros.',                     img:'https://i5.walmartimages.com/asr/5994ff97-c874-4063-a2da-e5a9d8af5de2.6dfb91f11200970234fae20a09eaf328.jpeg?odnHeight=612&odnWidth=612&odnBg=FFFFFF', oferta:false },
  { nombre:'Sprite 1.5L',               precio:30, precioOld:null, desc:'Refresco de limón sin cafeína botella 1.5L.',                  img:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxWdjvj2YIXOGWiFdZDGFdu0MSrTxYkmsONQ&s', oferta:false },
  { nombre:'Leche con Chocolate Nesquik',precio:22, precioOld:null, desc:'Bebida de leche con chocolate Nesquik 1 litro.',              img:'https://i5.walmartimages.com.mx/gr/images/product-images/img_large/00750105861185L.jpg?odnHeight=612&odnWidth=612&odnBg=FFFFFF', oferta:false },
  { nombre:'Té Lipton Durazno 500ml',   precio:18, precioOld:22,   desc:'Bebida de té helado sabor durazno botella 500ml.',             img:'https://inversionesloan.com/cdn/shop/files/TE010.jpg?v=1741889824&width=1080', oferta:true  },
  { nombre:'Agua de Horchata 1L',        precio:25, precioOld:null, desc:'Agua fresca de jamaica lista para servir 1 litro.',           img:'https://chedrauimx.vteximg.com.br/arquivos/ids/65439611/7503045646002_01.jpg?v=639093937561800000', oferta:false },
  { nombre:'Sangría Señorial 330ml',    precio:15, precioOld:null, desc:'Refresco sabor sangría lata 355ml. Clásico mexicano.',         img:'https://mexicomagico.de/cdn/shop/files/s897309111128769345_p117_i1_w2000.jpg?v=1731755516&width=1946', oferta:false },
]

  },
  {
    id:'snacks', nombre:'Snacks', emoji:'🍿',
    imagen:'./img/snacks.png',
    productos:
[
  { nombre:'Sabritas Clásicas',         precio:20, precioOld:null, desc:'Papas fritas originales bolsa 45g.',                          img:'https://chedrauimx.vtexassets.com/arquivos/ids/65853660-800-auto?v=639099109020930000&width=800&height=auto&aspect=true', oferta:false },
  { nombre:'Sabritas Adobadas',         precio:20, precioOld:null, desc:'Papas fritas con adobo bolsa 45g. Sabor inigualable.',         img:'https://i5.walmartimages.com.mx/mg/gm/3pp/asr/ef959bc1-91e9-4d7e-a2ac-4f83c0d66962.223459e9592f733119e5660661289d99.jpeg?odnHeight=2000&odnWidth=2000&odnBg=ffffff', oferta:false },
  { nombre:'Doritos Nacho',             precio:22, precioOld:null, desc:'Totopos con queso bolsa 65g.',                                img:'https://chedrauimx.vtexassets.com/arquivos/ids/65734806-800-auto?v=639097356595000000&width=800&height=auto&aspect=true   ', oferta:false },
  { nombre:'Doritos Flamin Hot',        precio:22, precioOld:null, desc:'Totopos sabor picante extremo bolsa 65g.',                    img:'https://hebmx.vtexassets.com/arquivos/ids/886252-800-800?v=638616554404800000&width=800&height=800&aspect=true', oferta:false },
  { nombre:'Oreo Original',             precio:18, precioOld:22,   desc:'Galletas de chocolate con relleno 117g.',                    img:'https://hebmx.vtexassets.com/arquivos/ids/651170-800-800?v=638829470112070000&width=800&height=800&aspect=true', oferta:true  },
  { nombre:'Oreo White Fudge',          precio:22, precioOld:null, desc:'Galletas Oreo con cubierta de chocolate blanco 124g.',       img:'https://chedrauimx.vtexassets.com/arquivos/ids/58027531/7622201412081_00.jpg?v=638980657814470000', oferta:false },
  { nombre:'Ruffles Queso',             precio:24, precioOld:null, desc:'Papas acanaladas sabor queso bolsa 45g.',                    img:'https://www.costco.com.mx/medias/sys_master/products/h39/hf2/188081078501406.jpg', oferta:false },
  { nombre:'Palomitas Act ll',          precio:15, precioOld:null, desc:'Palomitas de maíz con mantequilla 50g.',                     img:'https://hebmx.vtexassets.com/arquivos/ids/647332/654080_986674128.jpg?v=638521665335430000', oferta:false },
  { nombre:'Palomitas ACT ll Caramelo', precio:16, precioOld:20,   desc:'Palomitas dulces con caramelo bolsa 80g.',                   img:'https://i5.walmartimages.com.mx/mg/gm/3pp/asr/f2dc802b-f8bf-4729-b6df-407f766f17a7.26a63919c73ecce1674f4badabe21002.jpeg?odnHeight=2000&odnWidth=2000&odnBg=ffffff', oferta:true  },
  { nombre:'Cacahuates Japoneses',      precio:16, precioOld:null, desc:'Cacahuates cubiertos de harina 100g.',                       img:'https://hscomercial.mx/wp-content/uploads/2021/06/Sabritas-cacahuate-Japones-Karate-50g-con-50-piezas-dulces-botanas-dulceria-mayoreo.jpg', oferta:false },
  { nombre:'Cacahuates Enchilados',     precio:15, precioOld:null, desc:'Cacahuates con chile y limón bolsa 100g.',                   img:'https://i5.walmartimages.com.mx/gr/images/product-images/img_large/00750047801423L.jpg', oferta:false },
  { nombre:'Takis Fuego',               precio:24, precioOld:null, desc:'Totopos enrollados sabor fuego y limón bolsa 65g.',          img:'https://lagranbodega.vteximg.com.br/arquivos/ids/304464-1000-1000/757528026042.jpg?v=638900129641970000', oferta:false },
  { nombre:'Cheetos Flamin Hot',        precio:20, precioOld:null, desc:'Botanitas de maíz sabor picante 55g.',                       img:'https://hebmx.vtexassets.com/arquivos/ids/789090-800-800?v=638498157340730000&width=800&height=800&aspect=true', oferta:false },
  { nombre:'Cashita´s Nuez Mixta 150g', precio:38, precioOld:45,   desc:'Mix de nueces tostadas y saladas bolsa 150g.',               img:'https://lacolonia.vtexassets.com/arquivos/ids/190591-800-800?v=637124490432200000&width=800&height=800&aspect=true', oferta:true  },
  { nombre:'Barcel Chips Habanero',     precio:22, precioOld:null, desc:'Papas estilo chips con habanero picante bolsa 45g.',         img:'https://chedrauimx.vtexassets.com/arquivos/ids/65852511-800-auto?v=639099105916500000&width=800&height=auto&aspect=true   ', oferta:false },
  { nombre:'Galletas Marías Gamesa',    precio:18, precioOld:null, desc:'Galletas tradicionales paquete 230g. Perfectas con café.',   img:'https://serviciosapp.casaley.com.mx/rails//Images/07501000658923/07501000658923.2.jpg', oferta:false },   
  { nombre:'Galletas Surtidas Gamesa',  precio:22, precioOld:null, desc:'Surtido de galletas variadas paquete 270g.',                 img:'https://tb-static.uber.com/prod/image-proc/processed_images/2953dc81011de757a2b5a9532bc9eb90/0e5313be7a8831b8ed60f8dab3c2df10.jpeg', oferta:false },                                                                                                                                                                                                                                                                                          
  { nombre:'Gomitas Ricolino x200g',    precio:28, precioOld:null, desc:'Gomitas de sabores surtidos bolsa 200g.',                   img:'https://k-botanas.com/cdn/shop/files/RicolinoGomitaGusanoBICOLOR.webp?v=1697052842', oferta:false },
]
  },
  {
    id:'lacteos', nombre:'Lácteos', emoji:'🥛',
    imagen:'./img/lacteos.png',
    productos:
[
  { nombre:'Leche Alpura Entera 1L',    precio:25, precioOld:null, desc:'Leche entera pasteurizada 1 litro.',                          img:'https://chedrauimx.vtexassets.com/arquivos/ids/66104024/7501055900039_00.jpg?v=639102534999370000', oferta:false },
  { nombre:'Leche Lala Semidescremada', precio:24, precioOld:null, desc:'Leche semidescremada pasteurizada 1 litro.',                  img:'https://chedrauimx.vtexassets.com/arquivos/ids/66104017-800-auto?v=639102534984630000&width=800&height=auto&aspect=true', oferta:false },
  { nombre:'Leche Sin Lactosa Lala 1L', precio:30, precioOld:null, desc:'Leche deslactosada para intolerantes 1 litro.',               img:'https://i5.walmartimages.com/asr/fbf9c002-b010-4247-88d5-d811dc9a87f3.8786211d903377ed73dc1d15aa6c4900.jpeg', oferta:false },
  { nombre:'Yogurt Danone Natural',     precio:12, precioOld:null, desc:'Yogurt natural sin azúcar 125g.',                            img:'https://i5-mx.walmartimages.com/gr/images/product-images/img_large/00750103233210L.jpg', oferta:false },
  { nombre:'Yogurt Griego Fage 170g',   precio:28, precioOld:34,   desc:'Yogurt griego natural 0% grasa frasco 170g.',                img:'https://chedrauimx.vteximg.com.br/arquivos/ids/65849854-400-400/689544086505_00.jpg?v=639099099567200000', oferta:true  },
  { nombre:'Yoplait Fresa 125g',        precio:14, precioOld:null, desc:'Yogurt sabor fresa con frutas reales 125g.',                  img:'https://chedrauimx.vtexassets.com/arquivos/ids/66112871/7501040090745_00.jpg?v=639102556742500000', oferta:false },
  { nombre:'Queso Oaxaca 400g',         precio:48, precioOld:55,   desc:'Queso de hebra artesanal 400g.',                             img:'https://hebmx.vtexassets.com/arquivos/ids/577391-800-800?v=638497697389130000&width=800&height=800&aspect=true', oferta:true  },
  { nombre:'Queso Manchego Lala 200g',  precio:38, precioOld:null, desc:'Queso manchego rebanado listo para servir 200g.',             img:'https://hebmx.vtexassets.com/arquivos/ids/577029-800-800?v=638497696404600000&width=800&height=800&aspect=true', oferta:false },
  { nombre:'Queso Panela Junco 400g',   precio:42, precioOld:null, desc:'Queso panela fresco bajo en grasa 400g.',                    img:'https://hebmx.vtexassets.com/arquivos/ids/736796/841968_image-1724907601.jpg?v=638605321539300000', oferta:false },
  { nombre:'Queso Crema Philadelphia',  precio:55, precioOld:null, desc:'Queso crema para untar frasco 190g.',                        img:'https://www.grillhouse.mx/cdn/shop/products/00762221056155L.jpg?v=1753148218', oferta:false },
  { nombre:'Mantequilla Lala 200g',     precio:32, precioOld:null, desc:'Mantequilla sin sal barra 200g.',                            img:'https://chedrauimx.vtexassets.com/arquivos/ids/66114322/7501020564808_00.jpg?v=639102560223800000', oferta:false },
  { nombre:'Margarina Primavera 90g',   precio:18, precioOld:null, desc:'Margarina vegetal para cocinar y untar 90g.',                 img:'https://chedrauimx.vtexassets.com/arquivos/ids/65175779-800-auto?v=639090508313670000&width=800&height=auto&aspect=true', oferta:false },
  { nombre:'Crema Lala 200ml',          precio:18, precioOld:null, desc:'Crema ácida lista para servir 200ml.',                       img:'https://i5.walmartimages.com.mx/mg/gm/3pp/asr/f2ecdb08-90bd-4b8f-b5aa-309bb3a04dfa.4320a93bc4e12082625c293e0e029eaf.jpeg?odnHeight=2000&odnWidth=2000&odnBg=ffffff', oferta:false },
  { nombre:'Crema Ácida Nestlé 200ml',  precio:20, precioOld:24,   desc:'Crema ácida espesa Nestlé ideal para tacos y sopas 200ml.',   img:'https://http2.mlstatic.com/D_Q_NP_2X_855246-MLA99885716621_112025-P.webp', oferta:true  },
  { nombre:'Jocoque Lala 225g',         precio:22, precioOld:null, desc:'Jocoque seco listo para servir frasco 225g.',                 img:'https://serviciosapp.casaley.com.mx/rails//Images/07501020513295/07501020513295.2.jpg', oferta:false },
]
  },
  {
    id:'limpieza', nombre:'Limpieza', emoji:'🧹',
    imagen:'./img/limpieza.png',
    productos:
[
  { nombre:'Cloralex 950ml',              precio:30, precioOld:null, desc:'Blanqueador con aroma 950ml. Desinfecta y elimina gérmenes.',   img:'https://i5.walmartimages.com.mx/mg/gm/3pp/asr/a4a015cb-82d1-4b28-9f68-0d8612c0490c.9999806b5842838b03e231f203c1beff.jpeg?odnHeight=612&odnWidth=612&odnBg=FFFFFF', oferta:false },
  { nombre:'Cloralex Multiusos Spray',    precio:28, precioOld:null, desc:'Blanqueador en spray listo para usar 500ml. Sin fregar.',       img:'https://arteli.vtexassets.com/arquivos/ids/260236/7501025405830_00.jpg?v=638635817103130000', oferta:false },
  { nombre:'Jabon Liquido Blumen',        precio:32, precioOld:38,   desc:'Jabon para manos liquido con aroma a cereza',                  img:'https://siltecsa.mx/cdn/shop/products/776bf5b55f7be9365cd0d3852342d152_945x.jpg?v=1617285134', oferta:true  },
  { nombre:'Fabuloso Frescura Activa 1L', precio:34, precioOld:null, desc:'Limpiador con tecnología de frescura activa 1 litro.',         img:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThu5ih9gr3AUJJG7dKsvzuT_-Xbmw1Y7rnig&s', oferta:false },
  { nombre:'Ariel Polvo 1kg',             precio:55, precioOld:null, desc:'Detergente en polvo con suavizante 1kg.',                      img:'https://www.movil.farmaciasguadalajara.com/wcsstore/FGCAS/wcs/products/1396692_S_1280_F.jpg', oferta:false },
  { nombre:'Ariel Líquido 1L',            precio:68, precioOld:80,   desc:'Detergente líquido concentrado 1 litro para ropa delicada.',   img:'https://m.media-amazon.com/images/I/61EV2o+eA9L.jpg', oferta:true  },
  { nombre:'Downy Suavizante 1.4L',       precio:72, precioOld:null, desc:'Suavizante de telas con aroma floral 1.4 litros.',             img:'https://i5.walmartimages.com.mx/mg/gm/3pp/asr/8effb927-7791-4621-9fa6-26c17692e5c2.8bd9a528e4eab0d66c61b0128883c03d.jpeg?odnHeight=612&odnWidth=612&odnBg=FFFFFF', oferta:false },
  { nombre:'Axion Lava Trastes',          precio:22, precioOld:null, desc:'Lavatrastes en pasta limón 500g.',                             img:'https://lagranbodega.vteximg.com.br/arquivos/ids/304677-1000-1000/75045838.jpg?v=638920833020530000', oferta:false },
  { nombre:'Salvo Lavatrastes Líquido',   precio:28, precioOld:null, desc:'Lavatrastes líquido limón 750ml. Corta grasa al instante.',    img:'https://masbodegaonline.com.mx/media/catalog/product/i/m/image_19602_5662.jpeg?optimize=low&bg-color=255,255,255&fit=bounds&height=700&width=700&canvas=700:700', oferta:false },
  { nombre:'Papel Higiénico Regio x4',    precio:45, precioOld:52,   desc:'Papel higiénico doble hoja paquete 4 rollos.',                 img:'https://surtace.mayoreoenlinea.mx/cdn/shop/files/7501036625852_1_00e53e10-ad00-43f5-be8a-9222e378d1e5.jpg?v=1731596061', oferta:true  },
  { nombre:'Jabon de Tocador Rosa Venus', precio:95, precioOld:null, desc:'Jabon de barra extra suave y delicado para la piel hecho con ingredientes  naturales.',   img:'https://res.cloudinary.com/riqra/image/upload/w_656,h_656,c_limit,q_auto,f_auto/v1698260221/sellers/0/yg8ispgeocetj90yk5tz.jpg', oferta:false },
  { nombre:'Toallas de Cocina Kirkland',  precio:55, precioOld:null, desc:'Toallas absorbentes para cocina rollo doble hoja.',            img:'https://www.costco.com.mx/medias/sys_master/products/ha3/h3f/83423759728670.jpg', oferta:false },
  { nombre:'Escoba Plástica',             precio:48, precioOld:null, desc:'Escoba de plástico con mango largo resistente.',              img:'https://www.hypercleansa.com/cdn/shop/products/ESCOBAPLASTICACLASICASTANDARDAZUL.jpg?v=1677625818', oferta:false },
  { nombre:'Trapero Microfibra',          precio:65, precioOld:80,   desc:'Trapero de microfibra con mango telescópico 120cm.',          img:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0JpFybB99jxXAWBvdIGneK2ET1XFtlwQEkQ&s', oferta:true  },
  { nombre:'Bolsas de Basura x10',        precio:25, precioOld:null, desc:'Bolsas de basura negras resistentes 60L paquete 10 piezas.',  img:'https://http2.mlstatic.com/D_NQ_NP_796833-MLA79562884230_102024-O.webp', oferta:false },
  { nombre:'Desinfectante Pinol 1L',      precio:30, precioOld:null, desc:'Desinfectante de pisos pino 1 litro. Mata el 99.9% gérmenes.',img:'https://i5.walmartimages.com.mx/mg/gm/3pp/asr/807f847d-24b9-4496-a1e9-aeaa68c62be2.9fdaa06f02f490202aa2997fb55ed415.jpeg?odnHeight=612&odnWidth=612&odnBg=FFFFFF', oferta:false },
  { nombre:'Limpiador WC Harpic 500ml',   precio:38, precioOld:45,   desc:'Limpiador de baño WC con ácido activo 500ml.',                img:'https://m.media-amazon.com/images/I/61KMQWeBKNL.jpg', oferta:true  },
  { nombre:'Esponja Scotch-Brite x3',     precio:28, precioOld:null, desc:'Esponjas duales para trastes paquete 3 piezas.',              img:'https://www.surtilag.com/cdn/shop/products/FIBRA_ESPONJA_SCOTCH_BRITE_ca3e5184-89e7-4074-a18e-1f7f888324f3_600x.jpg?v=1585764193', oferta:false },
]
  },
  {
    id:'enlatados', nombre:'Enlatados', emoji:'🥫',
    imagen:'./img/enlatados.png',
    productos:
[
  { nombre:'Atún Dolores Agua',           precio:20, precioOld:null, desc:'Atún en agua lata 140g. Rico en proteína.',                   img:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfuC3VAr6CHV8NtM7LDF1Gpl1GmB5YQgdRVQ&s', oferta:false },
  { nombre:'Atún Dolores Aceite',         precio:22, precioOld:null, desc:'Atún en aceite de girasol lata 140g.',                        img:'https://i5.walmartimages.com.mx/mg/gm/3pp/asr/eedf5a9c-d36f-41c6-a3a9-4b81c97dacaa.a83e41b20b69d6af292c428f923df6f9.jpeg?odnHeight=612&odnWidth=612&odnBg=FFFFFF', oferta:false },
  { nombre:'Atún Herdez 3 pack',          precio:55, precioOld:65,   desc:'Pack de 3 latas de atún en agua 140g cada una.',              img:'https://http2.mlstatic.com/D_Q_NP_2X_888375-MLM90235950434_082025-P.webp', oferta:true  },
  { nombre:'Chícharos Herdez 400g',       precio:15, precioOld:null, desc:'Chícharos en lata listos para servir 400g.',                  img:'https://lagranbodega.vteximg.com.br/arquivos/ids/299708-1000-1000/7501003124142.jpg?v=638489675494600000', oferta:false },
  { nombre:'Elote Entero Del Fuerte 400g',precio:18, precioOld:null, desc:'Elote entero en almíbar lata 400g.',                          img:'https://tb-static.uber.com/prod/image-proc/processed_images/9bc7adb15ee5800e728d3c2cad7593c7/0e5313be7a8831b8ed60f8dab3c2df10.jpeg', oferta:false },
  { nombre:'Champiñones Herdez 280g',     precio:22, precioOld:null, desc:'Champiñones en agua en lata listos para cocinar 280g.',       img:'https://tubodeguita.com.mx/wp-content/uploads/2021/09/Herdez-champin%CC%83ones-186.png', oferta:false },
  { nombre:'Frijoles Isadora 440g',       precio:22, precioOld:28,   desc:'Frijoles refritos con manteca lata 440g.',                    img:'https://d1zc67o3u1epb0.cloudfront.net/media/catalog/product/2/2/2251_1.jpg?width=265&height=390&store=tienda&image-type=image', oferta:true  },
  { nombre:'Frijoles Bayos Herdez 400g',  precio:18, precioOld:null, desc:'Frijoles bayos enteros en caldo lata 400g.',                  img:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCLe1qrp-R7Lk4_3bUBSpMB-LZXiNgixh5lQ&s', oferta:false },
  { nombre:'Salsa Tomate Herdez 210g',    precio:14, precioOld:null, desc:'Salsa de tomate para guisar lata 210g. Base ideal para salsas.',img:'https://www.pidefacilraul.com/cms/wp-content/uploads/2019/11/46-019-Salsa-Casera-210_alta.png', oferta:false },
  { nombre:'Chiles Chipotle La Costeña',  precio:16, precioOld:null, desc:'Chiles chipotles en adobo lata 199g. Sabor ahumado intenso.', img:'https://comercialzazueta.com/cdn/shop/products/Chipotles-Adobados-220g.png?v=1595620585', oferta:false },
  { nombre:'Sardinas Calmex',             precio:18, precioOld:null, desc:'Sardinas en tomate lata 215g.',                               img:'https://lagranbodega.vteximg.com.br/arquivos/ids/303504-1000-1000/7501007829500.jpg?v=638851678967630000', oferta:false },
  { nombre:'Caldo de Pollo Knorr 230g',   precio:28, precioOld:34,   desc:'Caldo concentrado de pollo en lata 230g para sopas.',        img:'https://i5.walmartimages.com.mx/mg/gm/3pp/asr/deeb50c6-886f-4dad-b4aa-9620a2cd638b.5dd5e7f64dfd1dbbee4205d17c043eac.jpeg?odnHeight=612&odnWidth=612&odnBg=FFFFFF', oferta:true  },
  { nombre:'Durazno en Almíbar 820g',     precio:24, precioOld:null, desc:'Duraznos en almíbar lata 820g.',                             img:'https://www.smartnfinal.com.mx/wp-content/uploads/2023/10/17267-DURAZNO-EN-MITADES-EN-ALMIBAR-LA-COSTENA-820.0-GRS.jpg', oferta:false },
  { nombre:'Piña en Rodajas Del Monte',   precio:26, precioOld:null, desc:'Piña en rodajas en almíbar lata 565g.',                      img:'https://m.media-amazon.com/images/I/81lSC-sG1PL.jpg', oferta:false },
  { nombre:'Sopa Campbells Pollo',      precio:22, precioOld:null, desc:'Crema de pollo lista para servir lata 305g. Solo calienta.',   img:'https://www.smartnfinal.com.mx/wp-content/uploads/2023/10/7625-SOPA-POLLO-C_TALLARINES-CAMPBELLS-305.0-GR.jpg', oferta:false },
  { nombre:'Maíz Pozolero Maseca 800g',   precio:30, precioOld:36,   desc:'Maíz cacahuazintle precocido para pozole lata 800g.',        img:'https://i5.walmartimages.com/asr/01a6d3eb-b309-4790-8667-7103fb3108ba.8133b8e5b863f519b1dbf3ef09ad5d40.jpeg', oferta:true  },
]
  },
  {
    id:'panaderia', nombre:'Panadería', emoji:'🍞',
    imagen:'./img/panaderia.png',
    productos:
[
  { nombre:'Pan de Caja Bimbo Blanco',    precio:38, precioOld:null, desc:'Pan de caja blanco grande 680g. Suave y esponjoso.',           img:'https://i5.walmartimages.com.mx/mg/gm/3pp/asr/99be9647-b7b6-49b0-8d43-161d4f19ad31.d0e0d739d1616e1ee524513eb3e9205b.jpeg?odnHeight=612&odnWidth=612&odnBg=FFFFFF', oferta:false },
  { nombre:'Pan de Caja Bimbo Integral',  precio:40, precioOld:null, desc:'Pan integral con granos enteros 680g. Alto en fibra.',         img:'https://i5.walmartimages.com.mx/samsmx/images/product-images/img_large/981013168l.jpg?odnHeight=612&odnWidth=612&odnBg=FFFFFF', oferta:false },
  { nombre:'Pan Tostado Bimbo x8',        precio:28, precioOld:34,   desc:'Rebanadas de pan tostado crujiente paquete 8 piezas.',        img:'https://i0.wp.com/superfenix.mx/wp-content/uploads/2022/06/7501000111800.jpg?resize=320%2C320&ssl=1', oferta:true  },
  { nombre:'Tortillas Maíz x30',          precio:22, precioOld:null, desc:'Tortillas de maíz empaque 30 piezas.',                        img:'https://chedrauimx.vteximg.com.br/arquivos/ids/65653871-400-400/7501054950479_00.jpg?v=639096503570530000', oferta:false },
  { nombre:'Tortillas de Harina x10',     precio:28, precioOld:null, desc:'Tortillas de harina grandes paquete 10 piezas para burritos.',img:'https://productoschata.com/wp-content/uploads/2025/10/torillas-de-harina.jpg', oferta:false },
  { nombre:'Conchas Marinela x6',         precio:32, precioOld:38,   desc:'Pan dulce tradicional paquete 6 piezas.',                    img:'https://calimaxmx.vtexassets.com/arquivos/ids/204808/7501000142453.1.jpg?v=638152047891630000', oferta:true  },
  { nombre:'Doraditas Tia Rosa',          precio:20, precioOld:null, desc:'Tiras de hojaldre con azucar de 2 piezas.',                  img:'https://lagranbodega.vteximg.com.br/arquivos/ids/304219-1000-1000/7501000142804.jpg?v=638882035665270000', oferta:false },
  { nombre:'Gansitos Marinela x3',        precio:18, precioOld:null, desc:'Pastelito de chocolate con fresa 3 piezas.',                 img:'https://i5.walmartimages.com/asr/e9609ef0-362c-44bd-9f7a-4fdf0316ff45.d0a68e568d7f4fc292a6a419bcd1ed39.jpeg?odnHeight=612&odnWidth=612&odnBg=FFFFFF', oferta:false },
  { nombre:'Submarinos Marinela x6',      precio:32, precioOld:null, desc:'Bizcochitos de nata rellenos de crema 6 piezas.',            img:'https://olimpica.vtexassets.com/arquivos/ids/2358684/Submarinos%20Marinela%20Surtidos%206p%20204g%207705326081223.jpg?v=639081550167270000', oferta:false },
  { nombre:'Obleas Nestle x8',            precio:14, precioOld:null, desc:'Obleas con cajeta paquete 8 piezas.',                        img:'https://i5.walmartimages.com.mx/mg/gm/3pp/asr/54ffe2ab-2ab7-41bb-8fe0-d3549272110d.9b2782495039bd3aac13de628cfa6af6.jpeg?odnHeight=2000&odnWidth=2000&odnBg=ffffff', oferta:false },
  { nombre:'Donas Bimbo Glaseadas x6',    precio:42, precioOld:50,   desc:'Donas suaves con glaseado de azúcar paquete 6 piezas.',     img:'https://i5.walmartimages.com.mx/gr/images/product-images/img_large/00750100011242L.jpg', oferta:true  },
  { nombre:'Cuernos Hojaldre Bimbo x4',   precio:35, precioOld:null, desc:'Cuernos de hojaldre mantequilla paquete 4 piezas.',          img:'https://img06.weeecdn.com/description/image/786/071/4197D260E6A01272.png', oferta:false },
  { nombre:'Tostadas Charras x40',        precio:28, precioOld:null, desc:'Tostadas de maíz crujientes paquete 40 piezas.',             img:'https://hiperabasto.mx/cdn/shop/files/tostadas_charras_55fda2c7-6203-473c-961f-bfaa14a7a08c.webp?v=1728344862&width=1214', oferta:false },
  { nombre:'Pan Árabe Pita x6',           precio:30, precioOld:null, desc:'Pan pita árabe suave listo para rellenar paquete 6 piezas.', img:'https://i5-mx.walmartimages.com/gr/images/product-images/img_large/00750220911522L4.jpg?odnHeight=612&odnWidth=612&odnBg=FFFFFF', oferta:false },
  { nombre:'Bolillos Frescos x6',         precio:20, precioOld:null, desc:'Bolillos artesanales recién horneados paquete 6 piezas.',    img:'https://http2.mlstatic.com/D_NQ_NP_605692-MLU48859648661_012022-O.webp', oferta:false },
]
  },
  {
    id:'carnesfrías', nombre:'Carnes Frías', emoji:'🥩',
    imagen:'./img/carnes.png',
    productos:
[
  { nombre:'Jamón Virginia FUD 200g',       precio:42, precioOld:null, desc:'Jamón de pierna rebanado 200g.',                             img:'https://i5.walmartimages.com.mx/mg/gm/3pp/asr/0e75644b-ad19-4bc9-ae53-b113e8d092e5.9f9d4a72eea44ec1346ae33f0a3cc6e1.jpeg?odnHeight=264&odnWidth=264&odnBg=FFFFFF', oferta:false },
  { nombre:'Jamón de Pavo Zwan 200g',       precio:38, precioOld:45,   desc:'Jamón de pavo bajo en grasa rebanado 200g.',                 img:'https://chedrauimx.vtexassets.com/arquivos/ids/65089772/7501057711275_00.jpg?v=639089681280970000', oferta:true  },
  { nombre:'Jamón Serrano Cien Montaditos', precio:85, precioOld:null, desc:'Jamón serrano importado rebanado fino 100g.',               img:'https://lapastora.mx/wp-content/uploads/2025/11/9134.jpg', oferta:false },
  { nombre:'Salchicha FUD x8',              precio:36, precioOld:42,   desc:'Salchicha de pavo empaque 8 piezas.',                       img:'https://i0.wp.com/superfenix.mx/wp-content/uploads/2022/06/7501040008900.jpg?fit=800%2C800&ssl=1', oferta:true  },
  { nombre:'Salchicha Jumbo FUD x6',        precio:40, precioOld:null, desc:'Salchicha jumbo de cerdo empaque 6 piezas.',                 img:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZcLBU1B3VaYIZpWyQMLCJtdYjqleAH5CYmA&s', oferta:false },
  { nombre:'Salchicha Hot Dog x10',         precio:32, precioOld:null, desc:'Salchichas estilo hot dog paquete 10 piezas.',               img:'https://i5.walmartimages.com.mx/mg/gm/3pp/asr/f4b06b36-134e-438b-b9f6-c99306f54c54.84c20dbbf03ddff8187073b6010e9f9b.jpeg?odnHeight=612&odnWidth=612&odnBg=FFFFFF', oferta:false },
  { nombre:'Chorizo San Manuel 500g',       precio:55, precioOld:null, desc:'Chorizo rojo español artesanal 500g.',                      img:'https://www.chorizodesanmanuel.com/wp-content/smush-webp/2018/12/Cilantro-300x300.png.webp', oferta:false },
  { nombre:'Chorizo Verde Oaxaqueño',       precio:60, precioOld:72,   desc:'Chorizo verde artesanal oaxaqueño con hierbas frescas 400g.',img:'https://www.teke.mx/wp-content/uploads/2025/04/chorizo-verde.jpg', oferta:true  },
  { nombre:'Mortadela Zwan 200g',           precio:30, precioOld:null, desc:'Mortadela rebanada fina 200g.',                             img:'https://situcka.com/wp-content/uploads/2020/07/MHS-Mortadela-Zwan-Pollo-200Gr-..jpg', oferta:false },
  { nombre:'Pepperoni San Rafael 100g',     precio:35, precioOld:null, desc:'Pepperoni rebanado para pizza 100g. Sabor americano.',       img:'https://hebmx.vtexassets.com/arquivos/ids/1014047/1082856_image-1774047604.jpg?v=639097794908600000', oferta:false },
  { nombre:'Tocino Bud 200g',               precio:55, precioOld:null, desc:'Tocino de cerdo ahumado rebanado 200g. Perfectas tiras.',    img:'https://calimaxmx.vtexassets.com/arquivos/ids/211777/7501518466355.1.jpg?v=638527018516370000', oferta:false },
  { nombre:'Pastrami Res Zwan 100g',        precio:48, precioOld:58,   desc:'Pastrami de res rebanado con especias 100g.',               img:'https://i5-mx.walmartimages.com/gr/images/product-images/img_large/00750179166750L.jpg?odnHeight=612&odnWidth=612&odnBg=FFFFFF', oferta:true  },
  { nombre:'Queso de Puerco Peñaranda 150g', precio:32, precioOld:null, desc:'Queso de puerco ahumado rebanado 200g.',                    img:'https://chedrauimx.vtexassets.com/arquivos/ids/65156822-800-auto?v=639090459519600000&width=800&height=auto&aspect=true', oferta:false },
  { nombre:'Milanesa de Pollo x4',          precio:65, precioOld:null, desc:'Milanesas de pollo empanizadas listas para freír x4 pzas.', img:'https://frideli.co/wp-content/uploads/2025/04/fotos-pagina-3-1.jpg', oferta:false },
]
  },
  {
    id:'salud', nombre:'Salud Natural', emoji:'🌿',
    imagen:'./img/salud.png',
    productos:
[
  { nombre:'Avena Quaker 1kg',             precio:45, precioOld:null, desc:'Avena en hojuelas integral 1kg. Desayuno nutritivo.',         img:'https://i5.walmartimages.com.mx/samsmx/images/product-images/img_large/000017618l.jpg', oferta:false },
  { nombre:'Avena Quaker Instantánea x8',  precio:38, precioOld:null, desc:'Sobres individuales de avena instantánea sabores surtidos.',  img:'https://dulcealcance.com/cdn/shop/files/quakerlower.jpg?v=1687463579', oferta:false },
  { nombre:'Granola Natural 500g',         precio:52, precioOld:null, desc:'Granola con frutos secos y miel 500g.',                       img:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStaaIiC6i3njZPJEZK-wjtE2MZNGy66pTl1A&s', oferta:false },
  { nombre:'Granola con Chocolate 400g',   precio:55, precioOld:65,   desc:'Granola con chips de chocolate oscuro y arándanos 400g.',    img:'https://lacolonia.vtexassets.com/arquivos/ids/244886-800-800?v=638312745015800000&width=800&height=800&aspect=true', oferta:true  },
  { nombre:'Miel Carlota 500g',            precio:62, precioOld:75,   desc:'Miel de abeja pura de campo 500g.',                          img:'https://i5.walmartimages.com/asr/73f5e228-3f9d-46fd-8d7e-e5ca5c3bd163.d96aefcd1bdef9e7e62860e44dab781d.jpeg', oferta:true  },
  { nombre:'Mermelada Smuckers Fresa',   precio:38, precioOld:null, desc:'Mermelada de fresa premium frasco 340g. Sin conservadores.',  img:'https://chedrauimx.vteximg.com.br/arquivos/ids/65661833-400-400/51500782484_00.jpg?v=639096522952500000', oferta:false },
  { nombre:'Chía Orgánica 250g',           precio:38, precioOld:null, desc:'Semillas de chía orgánica 250g.',                            img:'https://i5.walmartimages.com.mx/mg/gm/3pp/asr/a50d7817-197d-4b96-bee9-f3c32565cc67.00361f02042d022f9bfdc790a2e97c37.jpeg?odnHeight=612&odnWidth=612&odnBg=FFFFFF', oferta:false },
  { nombre:'Linaza Molida 300g',           precio:30, precioOld:null, desc:'Linaza molida lista para mezclar con jugos o yogurt 300g.',  img:'https://i5.walmartimages.com/asr/2e9d283d-cb3d-4f5e-833a-546d62eee2d8.9cbe866ad92fc33db4bb55b826b3f609.jpeg?odnHeight=612&odnWidth=612&odnBg=FFFFFF', oferta:false },
  { nombre:'Proteína Whey Chocolate',      precio:280,precioOld:320,  desc:'Proteína de suero de leche sabor chocolate 1kg.',            img:'https://gnc.com.mx/media/catalog/product/1/0/107206001_01_01.jpg', oferta:true  },
  { nombre:'Vitamina C 500mg x30',         precio:55, precioOld:null, desc:'Suplemento vitamina C tabletas frasco 30 piezas.',           img:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRb8gHV1TWD5aPeyW05-_G9bSKkxjCNcwE9VA&s', oferta:false },
  { nombre:'Multivitamínico Centrum x30',  precio:120,precioOld:140,  desc:'Multivitamínico completo adultos frasco 30 tabletas.',       img:'https://static.beautytocare.com/cdn-cgi/image/width=1600,height=1600,f=auto/media/catalog/product//c/e/centrum-multivitamin-and-multimineral-complex-30-tablets.jpg', oferta:true  },
  { nombre:'Omega 3 x60 cápsulas',         precio:145,precioOld:null, desc:'Omega 3 aceite de pescado 1000mg cápsulas frasco 60 piezas.',img:'https://marynaturals.com/cdn/shop/files/Diseno_sin_titulo_4.png?v=1763342990&width=1920', oferta:false },
  { nombre:'Té Verde Lipton x20 sobres',   precio:38, precioOld:null, desc:'Té verde natural con antioxidantes caja 20 sobres.',         img:'https://ventasinstitucionales.com/wp-content/uploads/2025/07/te-verde-lipton-classic-green-te-40g-x20-und-lipton-3645-33ab.jpg', oferta:false },
  { nombre:'Té Manzanilla Grisi x25',      precio:30, precioOld:null, desc:'Manzanilla para relajar e infusionar caja 25 sobres.',       img:'https://www.laranitadelapaz.com.mx/images/thumbs/0008238_te-manzanilla-mccormick-con-25-sobres_625.jpeg', oferta:false },
  { nombre:'Almendras Naturales 200g',     precio:75, precioOld:90,   desc:'Almendras crudas sin sal bolsa 200g. Alto en vitamina E.',   img:'https://i5.walmartimages.com.mx/mg/gm/3pp/asr/6f3bcd20-c6b3-4f2f-869f-254e155a40c5.990613fde3bf51f891de5d2a752c43df.jpeg?odnHeight=612&odnWidth=612&odnBg=FFFFFF', oferta:true  },
  { nombre:'Nuez de Castilla 150g',        precio:65, precioOld:null, desc:'Nuez de castilla sin cáscara bolsa 150g. Omega 3 natural.',  img:'https://i5-mx.walmartimages.com/gr/images/product-images/img_large/00750302065735L.jpg?odnHeight=612&odnWidth=612&odnBg=FFFFFF&format=avif', oferta:false },
]
  },
  {
    id:'mascotas', nombre:'Mascotas', emoji:'🐾',
    imagen:'./img/mascotas.png',
    productos:
[
  { nombre:'Croquetas Pedigree 1kg',      precio:95,  precioOld:110,  desc:'Alimento seco para perro adulto 1kg.',                    img:'https://i5.walmartimages.com.mx/mg/gm/3pp/asr/a297a9c3-bf9d-4c91-8502-6d08a9701b44.81320aa435251f043011a5c7c330d2e4.jpeg?odnHeight=2000&odnWidth=2000&odnBg=ffffff', oferta:true  },
  { nombre:'Croquetas Pedigree 3kg',      precio:245, precioOld:280,  desc:'Alimento seco para perro adulto bolsa 3kg. Ahorra más.',  img:'https://catycanar.vtexassets.com/arquivos/ids/167314/13488.jpg?v=638071568517300000', oferta:true  },
  { nombre:'Croquetas Purina Dog Chow',   precio:110, precioOld:null, desc:'Alimento completo para perro adulto 1kg. Nutrición total.',img:'https://m.media-amazon.com/images/I/81mcS8BwXaL.jpg', oferta:false },
  { nombre:'Alimento Húmedo Pedigree',    precio:18,  precioOld:null, desc:'Alimento húmedo pollo y res para perro lata 100g.',       img:'https://lagranbodega.vteximg.com.br/arquivos/ids/295968-1000-1000/706460249279.jpg?v=638362647931100000', oferta:false },
  { nombre:'Croquetas Whiskas 500g',      precio:55,  precioOld:null, desc:'Alimento seco para gato adulto 500g.',                    img:'img/croquetas.jpg', oferta:false },
  { nombre:'Croquetas Pro Plan Gato 1kg', precio:145, precioOld:160,  desc:'Alimento premium para gato adulto interior 1kg.',         img:'img/proplan.jpg', oferta:true  },
  { nombre:'Alimento Húmedo Whiskas',     precio:16,  precioOld:null, desc:'Alimento húmedo de pollo para gato sobre 85g.',           img:'img/alimentohumedo.jpg', oferta:false },
  { nombre:'Arena para Gato 5kg',         precio:75,  precioOld:null, desc:'Arena absorbente con control de olor 5kg.',               img:'https://i5.walmartimages.com.mx/gr/images/product-images/img_large/00750046492651L1.jpg?odnHeight=612&odnWidth=612&odnBg=FFFFFF', oferta:false },
  { nombre:'Arena Aglomerante 4kg',       precio:85,  precioOld:100,  desc:'Arena aglomerante sin polvo control de olor 4kg.',        img:'https://http2.mlstatic.com/D_Q_NP_950660-MLA99970937797_112025-O.webp', oferta:true  },
  { nombre:'Premio Snacks Perro 100g',    precio:35,  precioOld:null, desc:'Snacks masticables para perro bolsa 100g.',               img:'https://http2.mlstatic.com/D_Q_NP_742062-MLM89524302754_082025-O.webp', oferta:false },
  { nombre:'Premio Dental Perro Pedigree',precio:45,  precioOld:null, desc:'Galletas dentales para higiene bucal canina 100g.',       img:'https://i5.walmartimages.com.mx/mg/gm/3pp/asr/d205e8b9-2fa2-4813-ab57-a9e9e69747d9.367fe9417253800c483f457a706ca7d6.jpeg?odnHeight=612&odnWidth=612&odnBg=FFFFFF', oferta:false },
  { nombre:'Juguete Cuerda Perro',        precio:65,  precioOld:80,   desc:'Juguete de cuerda colorido para perro mediano.',          img:'https://m.media-amazon.com/images/I/71w7R97E+0S.jpg', oferta:true  },
  { nombre:'Plato Acero Perro/Gato',      precio:45,  precioOld:null, desc:'Plato de acero inoxidable antideslizante 500ml.',         img:'https://m.media-amazon.com/images/I/61FiQNoAgVL.jpg', oferta:false },
  { nombre:'Shampoo Perro Suave 250ml',   precio:55,  precioOld:null, desc:'Shampoo suavizante con avena para perros 250ml.',         img:'https://petpaw.mx/cdn/shop/files/ScreenShot2024-01-10at10.40.35.png?v=1754073103', oferta:false },
]
  },
  {
    id:'luchaLibre', nombre:'Lucha Libre 2026', emoji:'🎭',
    imagen:'./img/mascaras.png',
    productos:[
      // ── HIJO DEL VIKINGO (figura AAA / estilo aéreo extremo)
      { nombre:'Máscara Hijo del Vikingo',      precio:220, precioOld:270, desc:'Réplica oficial máscara negra y dorada del rey del aire de AAA. Talla adulto.',           img:'https://i.ebayimg.com/images/g/HYYAAeSwP4hoVhXH/s-l400.jpg', oferta:true  },
      { nombre:'Camisa Vikingo "Rey del Aire"', precio:290, precioOld:null, desc:'Camiseta oficial Hijo del Vikingo edición 2026. 100% algodón tallas S-XL.',             img:'https://http2.mlstatic.com/D_NQ_NP_740751-MLM86004445809_062025-O-playera-el-hijo-del-vikingo-wwe-100-algodon-premium-hombre.webp', oferta:false },
      // ── MÍSTICO (CMLL, Top 10 PWI 500)
      { nombre:'Máscara Místico Plata y Oro',   precio:210, precioOld:null, desc:'Réplica máscara Místico plateada y dorada. Campeón Grand Prix 2025. Talla adulto.',      img:'https://http2.mlstatic.com/D_NQ_NP_969050-MLM74463673081_022024-O.webp', oferta:false },
      { nombre:'Camisa Místico CMLL 2026',      precio:280, precioOld:320,  desc:'Camiseta oficial Místico con estampado Grand Prix. Edición limitada.',                  img:'https://http2.mlstatic.com/D_875950-MLM84415667518_052025-O.jpg', oferta:true  },
      // ── PENTA ZERO MIEDO (WWE 2026)
      { nombre:'Máscara Penta Zero Miedo',      precio:240, precioOld:null, desc:'Réplica máscara negra Penta Zero Miedo. Ahora en WWE. ¡Zero Miedo! Talla adulto.',       img:'https://images.footballfanatics.com/penta/penta-luchador-replica-mask_ss5_p-202742463+u-j7nho3hpiqqelfopyd56+v-3lbwwr7dfziomxabmo0e.jpg?_hv=2', oferta:false },
      { nombre:'Camisa Penta "Cero Miedo" M',   precio:310, precioOld:360,  desc:'Camiseta oficial Penta Zero Miedo WWE 2026 edición especial. Talla M.',                 img:'https://http2.mlstatic.com/D_NQ_NP_2X_615808-MLM86099066090_062025-T.webp', oferta:true  },
      // ── BANDIDO (ROH World Champion)
      { nombre:'Máscara Bandido ROH Champ',     precio:200, precioOld:null, desc:'Réplica máscara Bandido, Campeón Mundial de ROH. Talla única adulto.',                   img:'https://i.ebayimg.com/images/g/KUMAAOSwNftmbELT/s-l400.jpg', oferta:false },
      { nombre:'Camisa Bandido "Torreón"',      precio:270, precioOld:null, desc:'Camiseta oficial Bandido edición Torreón, Coahuila. 100% algodón.',                      img:'https://i.ebayimg.com/images/g/v50AAOSw~Ixl3g0z/s-l1200.png', oferta:false },
      // ── DOMINIK MYSTERIO (WWE IC Champ + MegaCampeón AAA)
      { nombre:'Camisa Dominik "Dirty Dom"',    precio:320, precioOld:380,  desc:'Camiseta oficial Dominik Mysterio WWE 2026, Campeón Intercontinental. Talla L.',         img:'https://rubbert.mx/cdn/shop/files/dominik_front.png?v=1749678227&width=1946', oferta:true  },
      // ── COLECCIONABLES
      { nombre:'Penta WWE Debut - Defining Moments Ed. 2026.',          precio:520, precioOld:650,  desc:'La era de Penta ha llegado a San Juan! Figura articulada del luchador con Zero Miedo!.',        img:'https://http2.mlstatic.com/D_NQ_NP_678314-MLA106199695695_012026-O.webp', oferta:true  },
      { nombre:'Póster "WWE AAA WORLDS COLLIDE" 2025',precio:95,  precioOld:null, desc:'Hagamos historia juntos! Póster oficial del evento historico entre AAA y WWE. 50x70cm.',   img:'https://superluchas.com/cl_resize/YoOKNy0xW0500tGnuvaXJouzD5YqElOC-931J7-9XdQ/rs:fill:500:0/g:ce/q:70/aHR0cHM6Ly9zMy5zdXBlcmx1Y2hhcy5jb20vMjAyNS8wNS9DYXJ0ZWwtV29ybGRzLUNvbGxpZGUtNDgweDYwMC5qcGc', oferta:false },
      { nombre:'Taza Lucha Libre Eras 350ml',    precio:120, precioOld:null, desc:'Taza cerámica con diseño de los grandes de la lucha libre mexicana.',             img:'https://i.etsystatic.com/14168735/r/il/7e759a/5536480663/il_570xN.5536480663_ecm4.jpg', oferta:false },
      { nombre:'Llavero Penta "Cero Miedo"',    precio:55,  precioOld:null, desc:'Llavero metálico figura Penta Zero Miedo con detalle de calavera.',                      img:'https://makerworld.bblmw.com/makerworld/model/USd264cc5f657cc1/design/2025-04-27_ae414d862abee.jpg?x-oss-process=image%2Fresize%2Cw_400%2Fformat%2Cwebp', oferta:false },
      { nombre:'¡NUEVA! Máscara Rey Fenix Talla S',  precio:110, precioOld:140,  desc:'Máscara de Rey Fenix para niño talla 4-10 años. AN1MO!.',         img:'https://m.media-amazon.com/images/I/91kLJRYi2nL._AC_UF350,350_QL80_.jpg', oferta:true  },
    ]
  },
  // ════════════════════════════════════════════
  // WWE 2K26 VIDEOJUEGO
  // ════════════════════════════════════════════
  {
    id:'wwe2k26', nombre:'WWE 2K26', emoji:'🎮',
    imagen:'./img/juego.png',
    productos:[
      { nombre:'WWE 2K26 Standard – PS5',         precio:1399, precioOld:null, desc:'WWE 2K26 Edición Estándar PS5. Portada: CM Punk. +400 luchadores. Lanzamiento 13 marzo 2026.',   img:'https://juegosdigitalesmexico.mx/files/images/productos/1771026010-wwe-2k26-standard-edition-ps5-0.webp?w=300', oferta:false },
      { nombre:'WWE 2K26 Standard – Xbox S/X',    precio:1399, precioOld:null, desc:'WWE 2K26 Edición Estándar Xbox Series X|S. Incluye Showcase CM Punk + nuevos modos.',           img:'https://www.rarewaves.com/cdn/shop/files/orig_14721704_27268111_20260207074410_514x700.jpg?w=300', oferta:false },
      { nombre:'WWE 2K26 King of Kings – PS5',    precio:1999, precioOld:2299, desc:'Ed. King of Kings PS5. Triple H 98 + Stephanie McMahon, Acceso Anticipado 6 marzo + Season 1.',  img:'https://images.ctfassets.net/wn7ipiv9ue5v/69GFcZk9Llcq9QX8cCIpAS/45b8162441ae1a05b6d8c785678fec34/W26-DLX-ANNOUNCE-RETAIL_DIGITAL_BANNERS-D2C_V1-STATIC-ENUS-NO_RATING-AGN-600x850-R2.jpg?w=300', oferta:true  },
      { nombre:'WWE 2K26 Attitude Era – PS5',     precio:2599, precioOld:2999, desc:'Ed. Attitude Era PS5. Stone Cold, The Rock, Undertaker eras clásicas + todo el contenido extra.', img:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYUYc6u4TnAMv7jpYU3YQJL2VUV6Z5c8gI0A&s?w=300', oferta:true  },
      { nombre:'WWE 2K26 Monday Night War',       precio:2999, precioOld:null, desc:'Edición Máxima: WWE vs WCW. Todo incluido: Season Pass, WrestleMania 42 Pack + Acceso Anticipado.',img:'https://www.theaureview.com/wp-content/uploads/2026/01/IMG_0227-640x800.jpeg?w=300', oferta:false },
      { nombre:'WWE 2K26 Nintendo Switch 2',      precio:1399, precioOld:null, desc:'¡Primera WWE 2K en Switch 2! Edición Estándar portátil. CM Punk cover. Lanzamiento 13/03/2026.',  img:'https://target.scene7.com/is/image/Target/GUEST_8a8f8b44-199c-4039-9afb-653d2515e2b4?w=300', oferta:false },
      { nombre:'Ringside Pass Premium Season 1',  precio:199,  precioOld:null, desc:'Pase de temporada WWE 2K26 Season 1. Nuevos luchadores, contenido exclusivo y más. Digital.',    img:'https://insider-gaming.com/wp-content/uploads/2026/02/WWE-2K26-Ringside-Pass.jpg?w=300', oferta:false },
      { nombre:'Poster WWE 2K26 CM Punk 50x70',   precio:95,   precioOld:120,  desc:'Póster oficial WWE 2K26 portada CM Punk "Best in the World". Impresión premium 50x70cm.',       img:'https://shopmerchgame.com/wp-content/uploads/2026/01/WWE-2K26-CM-Punk-Standard-Edition-March-2026-Release-Red-Geometric-Shield-Design-Monochrome-Portrait-Wall-Art-Decor-Poster-Canvas.jpg?w=300', oferta:true  },
    ]
  },
  // ════════════════════════════════════════════
  // S.H. FIGUARTS DRAGON BALL
  // ════════════════════════════════════════════
  {
    id:'dragonball', nombre:'S.H. Figuarts Dragon Ball', emoji:'🐉',
    imagen:'./img/figuras.png',
    productos:[
  // ── LANZAMIENTOS 2026
  { nombre:'SHF Goku Black Rose "Zero Humans"',                precio:950,  precioOld:null, desc:'Goku Black en forma Super Saiyan Rosé. Cabello rosa oscuro, aura divina. Incluye efectos de ki y manos intercambiables. Ed. Tamashii Web.',          img:'https://tooys.mx/media/catalog/product/cache/74c1057f7991b4edb2bc7bdaa94de933/g/o/goku-black_dragon-ball-super_shfiguarts_0.jpg', oferta:false },
  { nombre:'SHF Broly SSJ Full Power "Warrior of Rage"',       precio:1150, precioOld:1350, desc:'Broly en Super Saiyan Full Power, musculatura extrema y aura verde. Cuerpo 4.0. Incluye cabellera SSJ, efectos de energía y rostros de furia. Ed. Tamashii Web.',    img:'https://http2.mlstatic.com/D_NQ_NP_715928-MLA107722048265_022026-O.webp', oferta:true  },
  { nombre:'SHF Son Gohan Beast "Wide Open" SDCC Exc.',        precio:980,  precioOld:null, desc:'Gohan en forma Beast exclusivo SDCC. Cabello blanco con mechón rojo, aura violeta intensa. Incluye efectos de Camehameha Beast y rostros intercambiables. Edición limitada.',  img:'https://tooys.mx/media/catalog/product/cache/0daeb07bb1d294c1f281fab47369d56a/g/o/gohan-_beast_-exclusive_0.png', oferta:false },
  { nombre:'SHF Son Goku Ultra Instinct Toyotaro Ver.',         precio:1100, precioOld:1299, desc:'Goku Ultra Instinto Perfeccionado ilustrado por Toyotaro. Cabello plateado, aura plateada-azul. Pose exclusiva del mangaka. Incluye efectos de ki y manos extra.',          img:'https://media.falabella.com/falabellaPE/132168377_01/w=1500,h=1500,fit=cover', oferta:true  },
  { nombre:'SHF SSJ God Goku "Ki Divino"',                     precio:1250, precioOld:null, desc:'Goku Super Saiyan Dios con aura roja divina llameante. Cabello rojo, expresión serena. Tamashii Nations 2025. Incluye efectos de llamas divinas. Edición exclusiva.',       img:'https://www.listacompletade.com/export/sites/listas-completas/.galleries/Dragon-Ball/SH-Figuarts/figuras/218-DB-Super-Super-Saiyan-God-Son-Goku-God-Aura-2026.jpg_622590185.jpg', oferta:false },
  { nombre:'SHF SSGSS Goku "Poder Azur"',                      precio:1250, precioOld:1450, desc:'Goku Super Saiyan Blue Rompelímites con aura azul eléctrica. Incluye efecto de Kamehameha Blue y manos intercambiables. Ed. exclusiva evento Tamashii 2025.',              img:'https://www.listacompletade.com/export/sites/listas-completas/.galleries/Dragon-Ball/SH-Figuarts/figuras/220-DB-Super-Super-Saiyan-God-Super-Saiyan-Son-Goku-Blue-power-Transcending-Limits-2026.jpg_1216690859.jpg', oferta:true  },
  { nombre:'SHF Vegeta "Great Ape" SDCC Exc.',                 precio:1800, precioOld:2100, desc:'Vegeta forma Gran Mono con cola y armadura Saiyan, exclusivo SDCC. Figura extra grande con detalle de pelaje y ojos rojos. La más imponente de la línea DBZ. Ed. limitada.', img:'https://tamashiiweb.com/images/item/item_0000013194_mwCKd6mb_01.jpg', oferta:true  },
  { nombre:'SHF Son Goku Mini SSJ4 "Fire Soul"',               precio:1350, precioOld:null, desc:'Goku Super Saiyan 4 en escala mini con pelaje rojo y cabello negro. Aura dorada-roja. Tamashii Web Exclusive. Incluye efectos de Dragon Fist y base temática GT.',         img:'https://isekollect.com.mx/cdn/shop/files/Snapinsta.app_481994728_17986431464794485_3906112305132027133_n_1080.jpg?v=1743396092&width=1445', oferta:false },
  // ── EFECTOS TAMASHII
  { nombre:'Tamashii Effect DBZ Efectos de Carga',             precio:890,  precioOld:null, desc:'Set de efectos de energía estilo Dragon Ball Z: auras amarillas y destellos de ki. Compatible con todas las figuras S.H.Figuarts. Incluye 8 piezas intercambiables.',      img:'https://m.media-amazon.com/images/I/51tw6cYadWL._AC_UF894,1000_QL80_.jpg', oferta:false },
  { nombre:'Tamashii Effect Efectos de Energía (Rose)',         precio:920,  precioOld:1050, desc:'Set de efectos de ki color rosa oscuro estilo Goku Black y Rosé. Auras, destellos y ondas de energía divina. 6 piezas compatibles con figuras SHF. Ed. limitada.',        img:'https://animejapangeek.com/wp-content/uploads/2022/02/shopping.webp', oferta:true  },
  { nombre:'Tamashii Effect Efectos de Explosión',             precio:1600, precioOld:null, desc:'Set premium de efectos de explosión y impacto para dioramas. Humo, escombros y ondas de choque en resina translúcida. 10 piezas. El set más completo de la línea.',         img:'https://www.funkyshop.fr/62707-large_default/shfiguarts-super-saiyan-trunks-the-boy-from-the-future-dragon-ball-z.jpg', oferta:false },
  { nombre:'Tamashii Effect Set de Efectos Son Goku',          precio:450,  precioOld:null, desc:'Set exclusivo de efectos diseñados para Son Goku: Kamehameha azul, aura dorada SSJ y destellos de Ultra Instinto plateado. 5 piezas en resina translúcida de alta calidad.', img:'https://images-eu.ssl-images-amazon.com/images/I/617Y4hckCbL._AC_UL210_SR210,210_.jpg', oferta:false },
]
  }
];

// Índice plano de todos los productos
const TODOS_PRODUCTOS = PASILLOS.filter(Boolean).flatMap(p => p.productos.map(pr => ({ ...pr, categoria: p.nombre, categoriaId: p.id })));

// ─── GENERAR OFERTAS ──────────────────────
function generarOfertas() {
  const ofertasProd = TODOS_PRODUCTOS.filter(p => p.oferta).slice(0, 8);
  const grid = document.getElementById('ofertasGrid');
  grid.innerHTML = ofertasProd.map(p => `
    <div class="oferta-card" onclick="abrirModal_directo('${p.nombre}',${p.precio},${p.precioOld||'null'},'${p.desc}','${p.img}','${p.categoria}')">
      <div class="oferta-badge">🔥 Oferta</div>
      <img src="${p.img}" alt="${p.nombre}" loading="lazy">
      <div class="oferta-info">
        <h4>${p.nombre}</h4>
        <p>${p.categoria}</p>
        <div class="oferta-precios">
          ${p.precioOld ? `<span class="precio-old">$${p.precioOld}</span>` : ''}
          <span class="precio-new">$${p.precio}</span>
        </div>
        <button class="oferta-add" onclick="event.stopPropagation();agregarDirecto('${p.nombre}',${p.precio},'${p.img}')">+ Agregar</button>
      </div>
    </div>
  `).join('');
}

// ─── GENERAR PASILLOS ─────────────────────
function generarPasillos(filtro = 'todos') {
  const contenedor = document.getElementById('contenedorPasillos');
  contenedor.innerHTML = '';
  const pasillosFiltrados = filtro === 'todos' ? PASILLOS : PASILLOS.filter(p => p.id === filtro);

  pasillosFiltrados.forEach(pasillo => {
    const card = document.createElement('div');
    card.className = 'pasillo-card';
    card.innerHTML = `
      <div class="pasillo-card-img">
        <img src="${pasillo.imagen}" alt="${pasillo.nombre}" loading="lazy">
      </div>
      <div class="pasillo-content">
        <h3>${pasillo.emoji} ${pasillo.nombre}</h3>
        <div class="pasillo-toggle-icon">+</div>
      </div>
      <div class="productos"></div>
    `;

    card.onclick = function (e) {
      if (e.target.closest('.producto-card')) return;
      const prodDiv = card.querySelector('.productos');
      const isOpen  = card.classList.contains('open');

      // Cerrar todos los demás pasillos (acordeón)
      document.querySelectorAll('.pasillo-card.open').forEach(other => {
        if (other !== card) {
          other.classList.remove('open');
          other.querySelector('.productos').style.display = 'none';
        }
      });

      card.classList.toggle('open', !isOpen);
      prodDiv.style.display = isOpen ? 'none' : 'flex';

      if (!isOpen && prodDiv.childElementCount === 0) {
        pasillo.productos.forEach(prod => {
          const p = document.createElement('div');
          p.className = 'producto-card';
          p.innerHTML = `
            <img src="${prod.img}" alt="${prod.nombre}" loading="lazy">
            <div class="producto-card-info">
              <strong>${prod.nombre}</strong>
              <span>${prod.desc.substring(0, 40)}…</span>
            </div>
            ${prod.precioOld ? `<span class="precio-old" style="font-size:.75rem;text-decoration:line-through;color:var(--sage);">$${prod.precioOld}</span>` : ''}
            <span class="producto-card-price">$${prod.precio}</span>
          `;
          p.onclick = ev => { ev.stopPropagation(); abrirModal(prod.nombre, prod.precio, prod.precioOld, prod.desc, prod.img, pasillo.nombre); };
          prodDiv.appendChild(p);
        });
      }
    };

    contenedor.appendChild(card);
  });
}

// ─── FILTROS CATEGORÍAS ───────────────────
function generarFiltros() {
  const cont = document.getElementById('filtrosCategorias');
  cont.innerHTML = `<button class="filtro-btn active" onclick="aplicarFiltro('todos',this)">Todos</button>` +
    PASILLOS.map(p => `<button class="filtro-btn" onclick="aplicarFiltro('${p.id}',this)">${p.emoji} ${p.nombre}</button>`).join('');
}
function aplicarFiltro(id, btn) {
  document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  generarPasillos(id);
}

// ─── MODAL PRODUCTO ───────────────────────
function abrirModal(nombre, precio, precioOld, desc, img, categoria) {
  cantidadModal = 1;
  productoActual = { nombre, precio, precioOld, desc, img, categoria };
  document.getElementById('modal-img').src          = img;
  document.getElementById('modal-nombre').innerText  = nombre;
  document.getElementById('modal-desc').innerText    = desc;
  document.getElementById('modal-precio').innerText  = '$' + precio;
  document.getElementById('modal-tag').innerText     = categoria || '';
  document.getElementById('modal-qty-val').innerText = 1;
  const oldEl = document.getElementById('modal-precio-old');
  oldEl.innerText = precioOld ? `$${precioOld}` : '';
  document.getElementById('modalProducto').style.display = 'flex';
}
function abrirModal_directo(nombre, precio, precioOld, desc, img, categoria) {
  abrirModal(nombre, precio, precioOld, desc, img, categoria);
}
function cerrarModal() { document.getElementById('modalProducto').style.display = 'none'; cantidadModal = 1; }
function cambiarCantidadModal(d) {
  cantidadModal = Math.max(1, cantidadModal + d);
  document.getElementById('modal-qty-val').innerText = cantidadModal;
}

// ─── CARRITO ──────────────────────────────
function agregarAlCarrito() {
  if (!productoActual) return;
  const existe = carrito.find(i => i.nombre === productoActual.nombre);
  if (existe) existe.qty += cantidadModal;
  else carrito.push({ ...productoActual, qty: cantidadModal });
  actualizarContador();
  cerrarModal();
  mostrarToast(`✦ ${productoActual.nombre} agregado`);
  animarContador();
}
function agregarDirecto(nombre, precio, img) {
  const existe = carrito.find(i => i.nombre === nombre);
  if (existe) existe.qty += 1;
  else carrito.push({ nombre, precio, img, qty: 1 });
  actualizarContador();
  mostrarToast(`✦ ${nombre} agregado`);
  animarContador();
}
function animarContador() {
  const c = document.getElementById('contadorCarrito');
  c.style.transform = 'scale(1.7)';
  setTimeout(() => c.style.transform = 'scale(1)', 300);
  // Neon green glow on cart icon
  const cartBtn = document.querySelector('.cart-btn');
  if (cartBtn) {
    cartBtn.classList.add('cart-neon');
    setTimeout(() => cartBtn.classList.remove('cart-neon'), 1400);
  }
}
function actualizarContador() {
  const total = carrito.reduce((a, i) => a + i.qty, 0);
  document.getElementById('contadorCarrito').innerText = total;
  // Sincronizar badge del drawer
  const dc = document.getElementById('cartDrawerCount');
  if (dc) dc.textContent = total;
  // Re-renderizar barra de envío si el drawer está abierto
  if (document.getElementById('cartDrawer').classList.contains('open')) {
    renderCarrito();
  }
}
function vaciarCarrito() {
  carrito = [];
  actualizarContador();
  renderCarrito();
  mostrarToast('🗑 Carrito vaciado');
}
function eliminarItemCarrito(nombre) {
  carrito = carrito.filter(i => i.nombre !== nombre);
  actualizarContador();
  renderCarrito();
}
function cambiarQtyCarrito(nombre, d) {
  const item = carrito.find(i => i.nombre === nombre);
  if (!item) return;
  item.qty = Math.max(0, item.qty + d);
  if (item.qty === 0) carrito = carrito.filter(i => i.nombre !== nombre);
  actualizarContador();
  renderCarrito();
}

function renderCarrito() {
  const lista = document.getElementById('listaCarrito');
  const META_ENVIO = 200;

  if (carrito.length === 0) {
    lista.innerHTML = `
      <div class="cart-empty">
        <span class="cart-empty-icon">🛒</span>
        <p>Tu carrito está vacío</p>
        <button class="cart-empty-cta" onclick="cerrarCarrito();document.getElementById('carruselPasillos').scrollIntoView({behavior:'smooth'})">
          Explorar pasillos →
        </button>
      </div>`;
  } else {
    lista.innerHTML = carrito.map((item, idx) => `
      <div class="cart-item" style="animation-delay:${idx * 0.05}s">
        <img class="cart-item-img" src="${item.img || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=80'}" alt="${item.nombre}">
        <div class="cart-item-info">
          <strong>${item.nombre}</strong>
          <span>$${item.precio} c/u</span>
        </div>
        <div class="cart-item-qty">
          <button onclick="cambiarQtyCarrito('${item.nombre.replace(/'/g,"\\'")}', -1)">−</button>
          <span>${item.qty}</span>
          <button onclick="cambiarQtyCarrito('${item.nombre.replace(/'/g,"\\'")}', 1)">+</button>
        </div>
        <span class="cart-item-price">$${item.precio * item.qty}</span>
        <button class="cart-item-del" onclick="eliminarItemCarrito('${item.nombre.replace(/'/g,"\\'")}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
        </button>
      </div>
    `).join('');
  }

  const sub = carrito.reduce((a, i) => a + i.precio * i.qty, 0);
  document.getElementById('cartSubtotal').innerText = '$' + sub;
  document.getElementById('cartTotal').innerText    = '$' + sub;

  // Actualizar contador del drawer
  const totalItems = carrito.reduce((a, i) => a + i.qty, 0);
  const countEl = document.getElementById('cartDrawerCount');
  if (countEl) {
    countEl.textContent = totalItems;
    countEl.classList.remove('bounce');
    setTimeout(() => countEl.classList.add('bounce'), 10);
  }

  // ── BARRA DE ENVÍO GRATIS ──
  const barEl    = document.getElementById('cartShippingBar');
  const fillEl   = document.getElementById('shippingBarFill');
  const textEl   = document.getElementById('shippingBarText');
  if (barEl && fillEl && textEl) {
    const pct = Math.min(100, (sub / META_ENVIO) * 100);
    fillEl.style.width = pct + '%';
    if (sub >= META_ENVIO) {
      barEl.classList.add('free');
      textEl.innerHTML = '<span class="shipping-free-msg">🎉 ¡Envío gratis desbloqueado!</span>';
    } else {
      barEl.classList.remove('free');
      const falta = META_ENVIO - sub;
      textEl.innerHTML = `<span>🚚 Te faltan <strong id="shippingFaltante">$${falta}</strong> para envío gratis</span>`;
    }
  }
}

function abrirCarrito() {
  renderCarrito();
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function cerrarCarrito() {
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ─── WHATSAPP ────────────────────────────
function enviarWhatsApp() {
  if (carrito.length === 0) { mostrarToast('⚠ El carrito está vacío'); return; }
  const cliente = usuarioActual ? `Cliente: *${usuarioActual.nombre}*\n` : '';
  let msg = `🛒 *Pedido ${NOMBRE_TIENDA}*\n${cliente}\n`;
  carrito.forEach(i => msg += `• ${i.nombre} × ${i.qty} = $${i.precio * i.qty}\n`);
  const total = carrito.reduce((a, i) => a + i.precio * i.qty, 0);
  msg += `\n*Total: $${total}*\n📍 Por favor confirme disponibilidad y envío.`;
  const num = usuarioActual ? '52' + usuarioActual.telefono : WHATSAPP_TIENDA;
  window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank');
}

// ─── PDF TICKET ──────────────────────────
function generarPDF() {
  if (carrito.length === 0) { mostrarToast('⚠ El carrito está vacío'); return; }
  if (typeof window.jspdf === 'undefined') { mostrarToast('⚠ Librería PDF no disponible'); return; }

  const { jsPDF } = window.jspdf;
  const doc  = new jsPDF({ unit: 'mm', format: [80, 200] });
  const ancho = 80;
  let y = 10;

  // Header
  doc.setFillColor(30, 84, 55);
  doc.rect(0, 0, ancho, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(NOMBRE_TIENDA, ancho / 2, 12, { align: 'center' });
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Calidad y confianza en cada producto', ancho / 2, 18, { align: 'center' });
  doc.text(`Fecha: ${new Date().toLocaleString('es-MX')}`, ancho / 2, 24, { align: 'center' });
  if (usuarioActual) doc.text(`Cliente: ${usuarioActual.nombre}`, ancho / 2, 29, { align: 'center' });
  y = 36;

  // Línea
  doc.setDrawColor(200, 200, 200);
  doc.line(5, y, ancho - 5, y); y += 5;

  // Productos
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Producto', 6, y); doc.text('Cant', 46, y); doc.text('Precio', 58, y); doc.text('Total', 68, y);
  y += 4; doc.line(5, y, ancho - 5, y); y += 4;

  doc.setFont('helvetica', 'normal');
  carrito.forEach(item => {
    const lines = doc.splitTextToSize(item.nombre, 38);
    lines.forEach((line, i) => doc.text(line, 6, y + i * 4));
    doc.text(`${item.qty}`, 46, y);
    doc.text(`$${item.precio}`, 56, y);
    doc.text(`$${item.precio * item.qty}`, 66, y);
    y += (lines.length * 4) + 2;
  });

  // Total
  y += 2; doc.line(5, y, ancho - 5, y); y += 5;
  const total = carrito.reduce((a, i) => a + i.precio * i.qty, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TOTAL:', 6, y);
  doc.setTextColor(30, 84, 55);
  doc.text(`$${total}`, 60, y);
  y += 8;

  // Footer
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Gracias por tu compra ✦', ancho / 2, y, { align: 'center' });
  y += 5;
  doc.text(`WhatsApp: +${WHATSAPP_TIENDA}`, ancho / 2, y, { align: 'center' });

  doc.save(`ticket_sanjuan_${Date.now()}.pdf`);
  mostrarToast('✦ Ticket descargado');
}

// ─── BUSCADOR ────────────────────────────
function buscarProductos(q) {
  const res   = document.getElementById('searchResults');
  const clear = document.getElementById('searchClear');
  clear.style.display = q ? 'block' : 'none';

  if (!q.trim()) { res.style.display = 'none'; return; }

  const qLow = q.toLowerCase().trim();

  // Resultados exactos/directos: nombre, descripción o categoría contiene la query
  const exactos = TODOS_PRODUCTOS.filter(p =>
    p.nombre.toLowerCase().includes(qLow) ||
    p.desc.toLowerCase().includes(qLow) ||
    p.categoria.toLowerCase().includes(qLow)
  ).slice(0, 8);

  // Algoritmo de Similares: busca por palabras clave individuales y por categoría de los exactos
  const categoriasEncontradas = [...new Set(exactos.map(p => p.categoriaId))];
  const palabras = qLow.split(/\s+/).filter(w => w.length > 2);

  const similares = TODOS_PRODUCTOS.filter(p => {
    // No mostrar si ya está en exactos
    if (exactos.some(e => e.nombre === p.nombre)) return false;
    const textoP = (p.nombre + ' ' + p.desc + ' ' + p.categoria).toLowerCase();
    // Mismo pasillo que algún resultado exacto
    if (categoriasEncontradas.includes(p.categoriaId)) return true;
    // Comparte alguna palabra clave de peso
    return palabras.some(w => textoP.includes(w));
  }).slice(0, 5);

  if (!exactos.length && !similares.length) {
    res.style.display = 'block';
    res.innerHTML = `<div class="search-no-results">Sin resultados para "<strong>${q}</strong>"</div>`;
    return;
  }

  const renderItem = p => `
    <div class="search-result-item" onclick="abrirModal('${p.nombre.replace(/'/g,"\\'")}',${p.precio},${p.precioOld||'null'},'${p.desc.replace(/'/g,"\\'")}','${p.img}','${p.categoria}'); cerrarBusqueda();">
      <img src="${p.img}" alt="${p.nombre}" loading="lazy">
      <div class="search-result-info">
        <strong>${p.nombre}</strong>
        <small>${p.categoria}</small>
        <span>$${p.precio}</span>
      </div>
    </div>
  `;

  res.style.display = 'block';
  let html = '';

  if (exactos.length) {
    html += `<div class="search-section-label">Resultados para "${q}"</div>`;
    html += exactos.map(renderItem).join('');
  } else {
    html += `<div class="search-no-results">Sin resultados exactos para "<strong>${q}</strong>"</div>`;
  }

  if (similares.length) {
    html += `<div class="search-section-label search-section-similares">✦ Similares</div>`;
    html += similares.map(renderItem).join('');
  }

  res.innerHTML = html;
}
function limpiarBusqueda() {
  document.getElementById('searchInput').value = '';
  buscarProductos('');
}
function abrirBuscador() {
  const wrap = document.getElementById('navSearchWrap');
  wrap.classList.add('search-open');
  setTimeout(() => {
    const inp = document.getElementById('searchInput');
    if (inp) inp.focus();
  }, 350);
}

function cerrarBusqueda() {
  const res   = document.getElementById('searchResults');
  const inp   = document.getElementById('searchInput');
  const clear = document.getElementById('searchClear');
  const wrap  = document.getElementById('navSearchWrap');
  if (res)   res.style.display = 'none';
  if (inp)   inp.value = '';
  if (clear) clear.style.display = 'none';
  if (wrap)  wrap.classList.remove('search-open');
}

// Cerrar buscador al hacer click fuera — con mousedown para no bloquear clicks en resultados
document.addEventListener('mousedown', e => {
  if (!e.target.closest('.nav-search-wrap') && !e.target.closest('.search-results')) {
    cerrarBusqueda();
  }
});

// ─── CHATBOT ─────────────────────────────
// ═══════════════════════════════════════════════════════
//  CHATBOT CON GROQ IA — Abarrotes San Juan
// ═══════════════════════════════════════════════════════

const GROQ_MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `Eres el asistente virtual de Abarrotes San Juan, una tienda de abarrotes en México. Tu nombre es Juanito.

Tienes un trato amable, cercano y de confianza — como el dependiente chido de la tienda de la esquina que siempre te atiende bien. Hablas en español mexicano natural y relajado, sin groserías ni exageraciones. Usas algún emoji ocasional para que no se sienta tan seco, pero sin spamearlos. Eres directo y no echas rollo de más — la gente quiere su respuesta rápido.

Tu ÚNICA función es ayudar con todo lo relacionado a Abarrotes San Juan: productos, precios, ofertas, categorías, horarios, entregas, formas de pago y cómo usar la tienda en línea.

━━━ CATÁLOGO CON PRECIOS (🔥 = oferta activa) ━━━
🥤 Bebidas: Agua Bonafont 1.5L $14 | Agua Ciel 500ml x6 $35 | Coca-Cola 2L $32 🔥(antes $38) | Coca-Cola Zero 600ml $18 | Gatorade 600ml $22 🔥(antes $28) | Jugo Del Valle 1L $25 | Jugo Jumex Mango 1L $20 🔥(antes $25) | Pepsi 2L $30 | Red Bull 250ml $42 | Sangría Señorial 600ml $16 | Sprite 1.5L $28 | Té Lipton Durazno 500ml $16
🍿 Snacks: Barcel Chips Habanero 65g $18 🔥(antes $22) | Cacahuates Enchilados 200g $22 | Cacahuates Japoneses 200g $20 | Cheetos Flamin Hot 60g $16 | Doritos Flamin Hot 65g $16 | Doritos Nacho 65g $15 | Gomitas Ricolino 200g $14 | Palomitas Boing Caramelo $12 | Ruffles Queso 65g $16 | Sabritas Adobadas 45g $14 | Sabritas Clásicas 45g $14 | Takis Fuego 100g $22
🧀 Lácteos: Crema Lala 200ml $18 | Crema Ácida Nestlé 200g $20 | Jocoque Lala 900g $35 🔥(antes $42) | Queso Crema Philadelphia 190g $48 | Queso Manchego Lala 400g $65 🔥(antes $75) | Queso Oaxaca 400g $55 | Queso Panela 400g $45 | Yogurt Danone 1kg $48 🔥(antes $55) | Yogurt Griego Fage 200g $38 | Yoplait Fresa 220g $20
🧹 Limpieza: Ariel Líquido 1.8L $89 🔥(antes $105) | Ariel Polvo 1kg $65 | Axion Pasta 500g $28 | Cloralex 950ml $22 | Fabuloso 1L $28 | Pinol 1L $30 🔥(antes $36) | Downy 1.8L $95 🔥(antes $110) | Escoba $45 | Esponja Scotch-Brite x2 $22 | Papel Elite x12 $75 🔥(antes $88) | Papel Regio x4 $28 | Toallas Kirkland x160 $120 | Trapero $55
🥫 Enlatados: Atún Herdez 3-pack $55 🔥(antes $65) | Chícharos Herdez 400g $15 | Elote Del Fuerte 400g $18 | Champiñones Herdez 280g $22 | Frijoles Isadora 440g $22 🔥(antes $28) | Frijoles Bayos Herdez 400g $18 | Salsa Tomate Herdez 210g $14 | Chiles Chipotle La Costeña $16 | Sardinas Calmex $18 | Caldo Knorr 230g $28 🔥(antes $34) | Durazno Almíbar 820g $24 | Piña Del Monte 565g $26 | Sopa Campbells Pollo $22 | Maíz Pozolero Maseca 800g $30 🔥(antes $36)
🍞 Panadería: Pan Bimbo Blanco 680g $38 | Pan Bimbo Integral 680g $40 | Pan Tostado x8 $28 🔥(antes $34) | Tortillas Maíz x30 $22 | Tortillas Harina x10 $28 | Conchas Marinela x6 $32 🔥(antes $38) | Doraditas Tia Rosa x2 $20 | Gansitos x3 $18 | Submarinos x6 $32 | Obleas Nestle x8 $14 | Donas Bimbo x6 $42 🔥(antes $50) | Cuernos Hojaldre x4 $35 | Tostadas Charras x40 $28 | Pan Árabe Pita x6 $30 | Bolillos x6 $20
🥩 Carnes Frías: Jamón Virginia FUD 200g $42 | Jamón Pavo Zwan 200g $38 🔥(antes $45) | Jamón Serrano 100g $85 | Salchicha FUD x8 $36 🔥(antes $42) | Salchicha Jumbo x6 $40 | Salchicha Hot Dog x10 $32 | Chorizo San Manuel 500g $55 | Chorizo Verde Oaxaqueño 400g $60 🔥(antes $72) | Mortadela Zwan 200g $30 | Pepperoni San Rafael 100g $35 | Tocino Bud 200g $55 | Pastrami Res Zwan 100g $48 🔥(antes $58) | Queso de Puerco 150g $32 | Milanesa Pollo x4 $65
🌿 Salud Natural: Avena Quaker 1kg $45 | Avena Instantánea x8 $38 | Granola Natural 500g $52 | Granola Chocolate 400g $55 🔥(antes $65) | Chía Orgánica 250g $48 | Proteína Whey 1kg $320 🔥(antes $380) | Vitamina C 500mg x30 $65 | Té Manzanilla x25 $22 | Té Verde x20 $28 | Café Nescafé 200g $75 | Almendras 200g $65 🔥(antes $78)
🐾 Mascotas: Croquetas Pedigree Adulto 1kg $85 🔥(antes $100) | Croquetas Whiskas 500g $65 | Croquetas Pro Plan Cachorro 1.5kg $220 🔥(antes $260) | Croquetas Purina 1kg $75 | Arena Sanitaria 4kg $55 🔥(antes $65) | Alimento Húmedo Whiskas x12 $95 | Premios Pedigree 200g $45 | Shampoo Perro 250ml $65
🤼 Lucha Libre: Máscara Rey Fénix $180 | Máscara Místico $160 | Playera Vikingo $220 | Playera Penta $220 | Playera Bandido $200 | Playera Dominik $210 | Poster Lucha $85 | Taza Luchador $95
🎮 WWE 2K26: Edición Estándar $999 | Edición Deluxe $1,299 🔥(antes $1,499) | Edición Campeón $1,599 | Figura WWE $350 | Taza WWE $95
🐉 Dragon Ball S.H.Figuarts: Goku Base $650 | Vegeta SSJ $680 | Gohan Beast $720 🔥(antes $850) | Broly $750 | Goku Black $700 | Tamashii Effect Aura $280

━━━ INFORMACIÓN DE LA TIENDA ━━━
- Horario: Lunes a Sábado 8:00am – 9:00pm (domingos cerrado)
- Entregas a domicilio dentro de la colonia: mínimo $150, costo de envío $30 (gratis en compras de $200 o más)
- Formas de pago: efectivo, transferencia bancaria, WhatsApp Pay (no se aceptan tarjetas por el momento)
- Pedidos por WhatsApp: +52 55 0000 0000
- Entrega el mismo día si el pedido entra antes de las 7:00pm

━━━ FUNCIONES DE LA PÁGINA ━━━
- Carrito lateral: se abre desde el ícono arriba, muestra productos y total en tiempo real
- Barra de envío gratis: se va llenando conforme agregas productos, se activa al llegar a $200
- Buscador: en la barra de navegación, busca cualquier producto por nombre
- Pasillos por categoría: toca los círculos del carrusel para explorar cada sección
- Modo oscuro: botón en la navbar para cambiar el tema visual
- Ticket PDF: se descarga desde el carrito al finalizar la compra
- Login por WhatsApp: el cliente ingresa su nombre y número para identificarse

━━━ PREGUNTAS FRECUENTES ━━━
- ¿Hacen envíos? Sí, dentro de la colonia. Mínimo $150, envío $30 (gratis si llegas a $200).
- ¿Aceptan tarjeta? No por el momento, manejamos efectivo, transferencia y WhatsApp Pay.
- ¿A qué hora abren? Lunes a sábado de 8am a 9pm. Domingos no abrimos.
- ¿Cómo hago un pedido? Agrega al carrito y descarga tu ticket, o escríbenos por WhatsApp.
- ¿A qué hora llega mi pedido? El mismo día si pides antes de las 7pm.

━━━ REGLAS ━━━
1. Solo responde temas relacionados con Abarrotes San Juan. Si preguntan otra cosa, di amablemente: "Eso ya se me va de las manos 😄 — ¿te puedo ayudar con algo de la tienda?"
2. Si un producto no está en el catálogo, dilo claro y sugiere una alternativa similar si existe.
3. Cuando alguien muestre interés en un producto, anímalo a agregarlo al carrito o a escribir por WhatsApp sin ser insistente.
4. Menciona siempre las ofertas 🔥 cuando sean relevantes para lo que preguntan.
5. Respuestas cortas y claras — no te extiendas de más.
6. Responde SIEMPRE en español.`;

const SUGERENCIAS = [
  '¿Tienen entrega a domicilio?',
  '¿Qué bebidas tienen?',
  '¿Cuáles son sus horarios?',
  '¿Cómo hago mi pedido?'
];

let groqApiKey = '';
let chatHistorial = [];
let enviandoMensaje = false;

// ── INIT ──────────────────────────────────────────────
(function initChatbot() {
  const savedKey = localStorage.getItem('sj_groq_key');
  if (savedKey) groqApiKey = savedKey;
})();

// ── TOGGLE ────────────────────────────────────────────
function toggleChatbot() {
  chatbotAbierto = !chatbotAbierto;
  const win = document.getElementById('chatbotWindow');
  win.classList.toggle('open', chatbotAbierto);
  document.getElementById('chatbotBadge').style.display = chatbotAbierto ? 'none' : 'flex';
  if (chatbotAbierto) {
    if (groqApiKey) {
      mostrarPantallaChat();
      if (document.getElementById('chatbotMessages').childElementCount === 0) {
        setTimeout(() => {
          agregarMensajeBot('¡Hola! 👋 Soy el asistente de **Abarrotes San Juan** con IA. Puedo ayudarte con productos, precios, horarios y más. ¿En qué te ayudo?');
          renderSugerencias();
        }, 300);
      }
    } else {
      mostrarPantallaKey();
    }
  }
}

// ── PANTALLAS ─────────────────────────────────────────
function mostrarPantallaKey() {
  document.getElementById('chatScreenKey').style.display = 'flex';
  document.getElementById('chatScreenChat').style.display = 'none';
  setTimeout(() => document.getElementById('groqApiKeyInput')?.focus(), 200);
}

function mostrarPantallaChat() {
  document.getElementById('chatScreenKey').style.display = 'none';
  document.getElementById('chatScreenChat').style.display = 'flex';
  setTimeout(() => document.getElementById('chatbotInput')?.focus(), 200);
}

function cambiarApiKey() {
  groqApiKey = '';
  localStorage.removeItem('sj_groq_key');
  mostrarPantallaKey();
  document.getElementById('groqApiKeyInput').value = '';
}

// ── ACTIVAR GROQ ──────────────────────────────────────
async function activarGroq() {
  const input = document.getElementById('groqApiKeyInput');
  const key = input.value.trim();
  if (!key || !key.startsWith('gsk_')) {
    input.classList.add('chat-key-input--error');
    input.placeholder = 'Debe empezar con gsk_...';
    setTimeout(() => {
      input.classList.remove('chat-key-input--error');
      input.placeholder = 'gsk_xxxxxxxxxxxxxxxxxxxx';
    }, 2500);
    return;
  }
  groqApiKey = key;
  localStorage.setItem('sj_groq_key', key);
  chatHistorial = [];
  mostrarPantallaChat();
  setTimeout(() => {
    agregarMensajeBot('¡Hola! 👋 Soy el asistente de **Abarrotes San Juan** con IA. Puedo ayudarte con productos, precios, horarios y más. ¿En qué te ayudo?');
    renderSugerencias();
  }, 300);
}

function toggleVerApiKey() {
  const input = document.getElementById('groqApiKeyInput');
  const icon = document.getElementById('eyeIcon');
  if (input.type === 'password') {
    input.type = 'text';
    icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>';
  } else {
    input.type = 'password';
    icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
  }
}

// ── MENSAJES ──────────────────────────────────────────
function agregarMensajeBot(texto, esError = false) {
  const msgs = document.getElementById('chatbotMessages');
  const typing = document.createElement('div');
  typing.className = 'chat-msg bot';
  typing.innerHTML = `<div class="chat-typing"><span></span><span></span><span></span></div>`;
  msgs.appendChild(typing);
  msgs.scrollTop = msgs.scrollHeight;
  setTimeout(() => {
    typing.className = 'chat-msg bot' + (esError ? ' chat-msg--error' : '');
    typing.innerHTML = texto.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    msgs.scrollTop = msgs.scrollHeight;
  }, 600);
}

function agregarMensajeUser(texto) {
  const msgs = document.getElementById('chatbotMessages');
  const div = document.createElement('div');
  div.className = 'chat-msg user';
  div.textContent = texto;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function mostrarTypingIndicator() {
  const msgs = document.getElementById('chatbotMessages');
  const div = document.createElement('div');
  div.className = 'chat-msg bot';
  div.id = 'typingIndicator';
  div.innerHTML = `<div class="chat-typing"><span></span><span></span><span></span></div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function quitarTypingIndicator() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

function renderSugerencias() {
  const cont = document.getElementById('chatbotSuggestions');
  cont.innerHTML = SUGERENCIAS.map(s =>
    `<button class="sugg-btn" onclick="usarSugerencia('${s}')">${s}</button>`
  ).join('');
}

function usarSugerencia(txt) {
  document.getElementById('chatbotInput').value = txt;
  enviarMensaje();
}

// ── ENVIAR MENSAJE ────────────────────────────────────
async function enviarMensaje() {
  if (enviandoMensaje) return;
  const input = document.getElementById('chatbotInput');
  const txt = input.value.trim();
  if (!txt) return;

  agregarMensajeUser(txt);
  input.value = '';
  document.getElementById('chatbotSuggestions').innerHTML = '';
  enviandoMensaje = true;
  const sendBtn = document.getElementById('chatSendBtn');
  if (sendBtn) sendBtn.disabled = true;

  chatHistorial.push({ role: 'user', content: txt });
  if (chatHistorial.length > 10) chatHistorial = chatHistorial.slice(-10);

  mostrarTypingIndicator();

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${groqApiKey}` },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: 300,
        temperature: 0.4,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...chatHistorial]
      })
    });

    quitarTypingIndicator();

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      console.error('Groq error:', res.status, errBody);
      if (res.status === 401) {
        groqApiKey = '';
        localStorage.removeItem('sj_groq_key');
        agregarMensajeBot('⚠️ Tu API Key ya no es válida. Por favor ingresa una nueva.', true);
        setTimeout(() => mostrarPantallaKey(), 2000);
      } else {
        agregarMensajeBot(`⚠️ Error ${res.status}: ${errBody?.error?.message || 'Intenta de nuevo en un momento.'}`, true);
      }
    } else {
      const data = await res.json();
      const respuesta = data.choices?.[0]?.message?.content || 'No pude generar una respuesta, intenta de nuevo.';
      chatHistorial.push({ role: 'assistant', content: respuesta });
      const msgs = document.getElementById('chatbotMessages');
      const div = document.createElement('div');
      div.className = 'chat-msg bot';
      div.innerHTML = respuesta.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      msgs.appendChild(div);
      msgs.scrollTop = msgs.scrollHeight;
    }
  } catch {
    quitarTypingIndicator();
    agregarMensajeBot('⚠️ Sin conexión. Revisa tu internet e intenta de nuevo.', true);
  }

  enviandoMensaje = false;
  if (sendBtn) sendBtn.disabled = false;
  input.focus();
}


// ─── INTERSECTION OBSERVER (optimizado) ──
const revealEls = document.querySelectorAll('.card,.pasillo-card,.opcion-card,.oferta-card');
revealEls.forEach(el => { el.classList.add('reveal-hidden'); });
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.remove('reveal-hidden');
      e.target.classList.add('reveal-done');
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
revealEls.forEach(el => obs.observe(el));

// ─── MODO OSCURO ─────────────────────────
function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem('darkMode', isDark);
  const btn = document.getElementById('darkModeBtn');
  if (btn) btn.innerHTML = isDark ? '☀️' : '🌙';
  mostrarToast(isDark ? '🌙 Modo oscuro activado' : '☀️ Modo claro activado');
}

// Aplicar modo oscuro guardado
(function initDarkMode() {
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark');
    const btn = document.getElementById('darkModeBtn');
    if (btn) btn.innerHTML = '☀️';
  }
})();

function irArriba() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── CONFETTI ────────────────────────────
function lanzarConfetti() {
  const colores = ['#3a9e6a','#5dbf89','#8dd9ae','#b8eece','#f8f4eb','#ffd700','#ff6b6b'];
  const frag = document.createDocumentFragment();
  for (let i = 0; i < 40; i++) {
    const conf = document.createElement('div');
    conf.className = 'confetti-piece';
    conf.style.cssText = `left:${Math.random()*100}vw;background:${colores[i%colores.length]};width:${6+Math.random()*8}px;height:${6+Math.random()*8}px;animation-duration:${1+Math.random()*1.5}s;animation-delay:${Math.random()*0.4}s;border-radius:${Math.random()>.5?'50%':'2px'};`;
    conf.addEventListener('animationend', () => conf.remove(), { once: true });
    frag.appendChild(conf);
  }
  document.body.appendChild(frag);
}

// Llamar confetti al agregar al carrito (parchear función)
const _agregarAlCarritoOriginal = agregarAlCarrito;
// Ya está integrado abajo — reemplazamos agregarAlCarrito
function agregarAlCarrito() {
  if (!productoActual) return;
  const existe = carrito.find(i => i.nombre === productoActual.nombre);
  if (existe) existe.qty += cantidadModal;
  else carrito.push({ ...productoActual, qty: cantidadModal });
  actualizarContador();
  cerrarModal();
  mostrarToast(`✦ ${productoActual.nombre} agregado`);
  animarContador();
  lanzarConfetti();
}

// ─── INIT ────────────────────────────────
generarOfertas();
generarFiltros();
generarPasillos();
generarCarrusel();
