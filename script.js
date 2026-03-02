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

// ─── CURSOR ───────────────────────────────
const cursor   = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');
let mouseX = 0, mouseY = 0, fX = 0, fY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top  = mouseY + 'px';
});
(function animF() {
  fX += (mouseX - fX) * 0.12;
  fY += (mouseY - fY) * 0.12;
  follower.style.left = fX + 'px';
  follower.style.top  = fY + 'px';
  requestAnimationFrame(animF);
})();

document.querySelectorAll('a,button,.card,.pasillo-card,.opcion-card,.carrito-icono,.oferta-card').forEach(el => {
  el.addEventListener('mouseenter', () => { cursor.style.transform='translate(-50%,-50%) scale(2.5)'; cursor.style.background='var(--g300)'; follower.style.opacity='0'; });
  el.addEventListener('mouseleave', () => { cursor.style.transform='translate(-50%,-50%) scale(1)'; cursor.style.background='var(--g500)'; follower.style.opacity='.6'; });
});

// ─── NAVBAR SCROLL ────────────────────────
window.addEventListener('scroll', () => document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 60));

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

// ─── LOGIN ────────────────────────────────
function abrirLogin() {
  if (usuarioActual) {
    usuarioActual = null;
    document.getElementById('loginLabel').textContent = 'Entrar';
    document.getElementById('loginBtn').classList.remove('logged');
    mostrarToast('Sesión cerrada ✓');
    return;
  }
  document.getElementById('modalLogin').style.display = 'flex';
}
function cerrarLogin() { document.getElementById('modalLogin').style.display = 'none'; }
function iniciarSesion() {
  const nombre = document.getElementById('loginNombre').value.trim();
  const tel    = document.getElementById('loginTelefono').value.trim().replace(/\D/g,'');
  if (!nombre) { mostrarToast('⚠ Ingresa tu nombre'); return; }
  if (tel.length < 10) { mostrarToast('⚠ Número inválido (10 dígitos)'); return; }
  usuarioActual = { nombre, telefono: tel };
  document.getElementById('loginLabel').textContent = nombre.split(' ')[0];
  document.getElementById('loginBtn').classList.add('logged');
  cerrarLogin();
  mostrarToast(`¡Hola, ${nombre.split(' ')[0]}! 👋`);
}

// ─── DATOS ────────────────────────────────
const PASILLOS = [
  {
    id:'bebidas', nombre:'Bebidas', emoji:'🥤',
    imagen:'./img/bebidas.png',
    productos:[
      { nombre:'Coca-Cola 2L',          precio:35, precioOld:null, desc:'Refresco de cola icónico, botella 2 litros.',       img:'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=300', oferta:false },
      { nombre:'Agua Bonafont 1.5L',    precio:18, precioOld:null, desc:'Agua purificada en botella de 1.5 litros.',        img:'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=300', oferta:false },
      { nombre:'Jugo Del Valle 1L',     precio:28, precioOld:35,   desc:'Jugo de naranja natural, 1 litro.',                img:'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300', oferta:true  },
      { nombre:'Gatorade Limón',        precio:22, precioOld:null, desc:'Bebida isotónica sabor limón 600ml.',              img:'https://images.unsplash.com/photo-1571748982800-fa51082c2224?w=300', oferta:false },
      { nombre:'Red Bull 250ml',        precio:38, precioOld:null, desc:'Bebida energizante lata 250ml.',                  img:'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=300', oferta:false },
      { nombre:'Café Nescafé Clásico',  precio:55, precioOld:65,   desc:'Café soluble instantáneo frasco 100g.',           img:'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300', oferta:true  },
    ]
  },
  {
    id:'snacks', nombre:'Snacks', emoji:'🍿',
    imagen:'./img/snacks.png',
    productos:[
      { nombre:'Sabritas Clásicas',     precio:20, precioOld:null, desc:'Papas fritas originales bolsa 45g.',              img:'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300', oferta:false },
      { nombre:'Doritos Nacho',         precio:22, precioOld:null, desc:'Totopos con queso bolsa 65g.',                    img:'https://images.unsplash.com/photo-1601700109060-8f5e2e3c4b0a?w=300', oferta:false },
      { nombre:'Oreo Original',         precio:18, precioOld:22,   desc:'Galletas de chocolate con relleno 117g.',         img:'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300', oferta:true  },
      { nombre:'Ruffles Queso',         precio:24, precioOld:null, desc:'Papas acanaladas sabor queso bolsa 45g.',         img:'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=300', oferta:false },
      { nombre:'Palomitas Crunch',      precio:15, precioOld:null, desc:'Palomitas de maíz con mantequilla 50g.',          img:'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=300', oferta:false },
      { nombre:'Cacahuates Japoneses',  precio:16, precioOld:null, desc:'Cacahuates cubiertos de harina 100g.',            img:'https://images.unsplash.com/photo-1567892737950-30c4db39a5d4?w=300', oferta:false },
    ]
  },
  {
    id:'lacteos', nombre:'Lácteos', emoji:'🥛',
    imagen:'./img/lacteos.png',
    productos:[
      { nombre:'Leche Alpura Entera 1L',precio:25, precioOld:null, desc:'Leche entera pasteurizada 1 litro.',              img:'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300', oferta:false },
      { nombre:'Yogurt Danone Natural', precio:12, precioOld:null, desc:'Yogurt natural sin azúcar 125g.',                 img:'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300', oferta:false },
      { nombre:'Queso Oaxaca 400g',     precio:48, precioOld:55,   desc:'Queso de hebra artesanal 400g.',                  img:'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=300', oferta:true  },
      { nombre:'Mantequilla Lala 200g', precio:32, precioOld:null, desc:'Mantequilla sin sal barra 200g.',                 img:'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300', oferta:false },
      { nombre:'Crema Lala 200ml',      precio:18, precioOld:null, desc:'Crema ácida lista para servir 200ml.',            img:'https://images.unsplash.com/photo-1578020190125-f4f7c18bc9cb?w=300', oferta:false },
    ]
  },
  {
    id:'limpieza', nombre:'Limpieza', emoji:'🧹',
    imagen:'./img/limpieza.png',
    productos:[
      { nombre:'Cloralex 950ml',        precio:30, precioOld:null, desc:'Blanqueador con aroma 950ml.',                    img:'https://images.unsplash.com/photo-1609204782896-81c4a4e5b61f?w=300', oferta:false },
      { nombre:'Fabuloso Multiusos 1L', precio:32, precioOld:38,   desc:'Limpiador líquido lavanda 1 litro.',              img:'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=300', oferta:true  },
      { nombre:'Ariel Polvo 1kg',       precio:55, precioOld:null, desc:'Detergente en polvo con suavizante 1kg.',         img:'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=300', oferta:false },
      { nombre:'Axion Lava Trastes',    precio:22, precioOld:null, desc:'Lavatrastes en pasta limón 500g.',                img:'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=300', oferta:false },
      { nombre:'Papel Higiénico x4',   precio:45, precioOld:52,   desc:'Papel higiénico doble hoja paquete 4 rollos.',    img:'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300', oferta:true  },
    ]
  },
  {
    id:'enlatados', nombre:'Enlatados', emoji:'🥫',
    imagen:'./img/enlatados.png',
    productos:[
      { nombre:'Atún Dolores Agua',     precio:20, precioOld:null, desc:'Atún en agua lata 140g.',                         img:'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=300', oferta:false },
      { nombre:'Chícharos Herdez 400g', precio:15, precioOld:null, desc:'Chícharos en lata listos para servir 400g.',      img:'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=300', oferta:false },
      { nombre:'Frijoles Isadora 440g', precio:22, precioOld:28,   desc:'Frijoles refritos con manteca lata 440g.',        img:'https://images.unsplash.com/photo-1555244162-803834f70033?w=300', oferta:true  },
      { nombre:'Sardinas Calmex',       precio:18, precioOld:null, desc:'Sardinas en tomate lata 215g.',                   img:'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300', oferta:false },
      { nombre:'Durazno en Almíbar',    precio:24, precioOld:null, desc:'Duraznos en almíbar lata 820g.',                  img:'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300', oferta:false },
    ]
  },
  {
    id:'panaderia', nombre:'Panadería', emoji:'🍞',
    imagen:'./img/panaderia.png',
    productos:[
      { nombre:'Pan de Caja Bimbo',     precio:38, precioOld:null, desc:'Pan de caja blanco grande 680g.',                 img:'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=300', oferta:false },
      { nombre:'Tortillas Maíz x30',    precio:22, precioOld:null, desc:'Tortillas de maíz empaque 30 piezas.',            img:'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=300', oferta:false },
      { nombre:'Conchas Marinela x6',   precio:32, precioOld:38,   desc:'Pan dulce tradicional paquete 6 piezas.',         img:'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300', oferta:true  },
      { nombre:'Gansitos Marinela',     precio:18, precioOld:null, desc:'Pastelito de chocolate con fresa 3 piezas.',      img:'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300', oferta:false },
      { nombre:'Obleas Nestle x8',      precio:14, precioOld:null, desc:'Obleas con cajeta paquete 8 piezas.',             img:'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=300', oferta:false },
    ]
  },
  {
    id:'carnesfrías', nombre:'Carnes Frías', emoji:'🥩',
    imagen:'./img/carnes.png',
    productos:[
      { nombre:'Jamón Virginia FUD 200g',precio:42, precioOld:null, desc:'Jamón de pierna rebanado 200g.',                img:'https://images.unsplash.com/photo-1612103198005-b238a0fa5d45?w=300', oferta:false },
      { nombre:'Salchicha FUD x8',      precio:36, precioOld:42,   desc:'Salchicha de pavo empaque 8 piezas.',            img:'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300', oferta:true  },
      { nombre:'Chorizo San Manuel',    precio:55, precioOld:null, desc:'Chorizo rojo español artesanal 500g.',           img:'https://images.unsplash.com/photo-1624623278313-a930126a11c3?w=300', oferta:false },
      { nombre:'Mortadela Zwan 200g',   precio:30, precioOld:null, desc:'Mortadela rebanada fina 200g.',                  img:'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=300', oferta:false },
    ]
  },
  {
    id:'salud', nombre:'Salud Natural', emoji:'🌿',
    imagen:'./img/salud.png',
    productos:[
      { nombre:'Avena Quaker 1kg',      precio:45, precioOld:null, desc:'Avena en hojuelas integral 1kg.',                img:'https://images.unsplash.com/photo-1614961233913-a5113a4a34ed?w=300', oferta:false },
      { nombre:'Miel Carlota 500g',     precio:62, precioOld:75,   desc:'Miel de abeja pura de campo 500g.',              img:'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300', oferta:true  },
      { nombre:'Chía Orgánica 250g',    precio:38, precioOld:null, desc:'Semillas de chía orgánica 250g.',                img:'https://images.unsplash.com/photo-1571051740689-2b90a25661e2?w=300', oferta:false },
      { nombre:'Granola Natural 500g',  precio:52, precioOld:null, desc:'Granola con frutos secos y miel 500g.',          img:'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=300', oferta:false },
      { nombre:'Vitamina C 500mg x30',  precio:55, precioOld:null, desc:'Suplemento vitamina C tabletas frasco 30 pzs.',  img:'https://images.unsplash.com/photo-1616671276441-2f2c277b8bf6?w=300', oferta:false },
    ]
  },
  {
    id:'mascotas', nombre:'Mascotas', emoji:'🐾',
    imagen:'./img/mascotas.png',
    productos:[
      { nombre:'Croquetas Pedigree 1kg',precio:95, precioOld:110,  desc:'Alimento seco para perro adulto 1kg.',           img:'https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?w=300', oferta:true  },
      { nombre:'Croquetas Whiskas 500g',precio:55, precioOld:null, desc:'Alimento seco para gato adulto 500g.',           img:'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=300', oferta:false },
      { nombre:'Arena para Gato 5kg',  precio:75, precioOld:null, desc:'Arena absorbente con control de olor 5kg.',       img:'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=300', oferta:false },
      { nombre:'Premio Snacks Perro',  precio:35, precioOld:null,  desc:'Snacks masticables para perro bolsa 100g.',      img:'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300', oferta:false },
    ]
  },
  ,{
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
const TODOS_PRODUCTOS = PASILLOS.flatMap(p => p.productos.map(pr => ({ ...pr, categoria: p.nombre, categoriaId: p.id })));

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
}
function actualizarContador() {
  document.getElementById('contadorCarrito').innerText = carrito.reduce((a, i) => a + i.qty, 0);
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
  if (carrito.length === 0) {
    lista.innerHTML = `<div class="cart-empty"><span class="cart-empty-icon">🛒</span><p>Tu carrito está vacío</p></div>`;
  } else {
    lista.innerHTML = carrito.map(item => `
      <div class="cart-item">
        <img class="cart-item-img" src="${item.img || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=80'}" alt="${item.nombre}">
        <div class="cart-item-info">
          <strong>${item.nombre}</strong>
          <span>$${item.precio} c/u</span>
        </div>
        <div class="cart-item-qty">
          <button onclick="cambiarQtyCarrito('${item.nombre}',-1)">−</button>
          <span>${item.qty}</span>
          <button onclick="cambiarQtyCarrito('${item.nombre}',1)">+</button>
        </div>
        <span class="cart-item-price">$${item.precio * item.qty}</span>
        <button class="cart-item-del" onclick="eliminarItemCarrito('${item.nombre}')" title="Eliminar">🗑</button>
      </div>
    `).join('');
  }
  const sub = carrito.reduce((a, i) => a + i.precio * i.qty, 0);
  document.getElementById('cartSubtotal').innerText = '$' + sub;
  document.getElementById('cartTotal').innerText    = '$' + sub;
}

function abrirCarrito() {
  renderCarrito();
  document.getElementById('modalCarrito').style.display = 'flex';
}
function cerrarCarrito() { document.getElementById('modalCarrito').style.display = 'none'; }

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
  const found = TODOS_PRODUCTOS.filter(p =>
    p.nombre.toLowerCase().includes(q.toLowerCase()) ||
    p.desc.toLowerCase().includes(q.toLowerCase()) ||
    p.categoria.toLowerCase().includes(q.toLowerCase())
  ).slice(0, 8);

  if (!found.length) {
    res.style.display = 'block';
    res.innerHTML = `<div class="search-no-results">Sin resultados para "<strong>${q}</strong>"</div>`;
    return;
  }
  res.style.display = 'block';
  res.innerHTML = found.map(p => `
    <div class="search-result-item" onclick="abrirModal('${p.nombre}',${p.precio},${p.precioOld||'null'},'${p.desc}','${p.img}','${p.categoria}'); cerrarBusqueda();">
      <img src="${p.img}" alt="${p.nombre}" loading="lazy">
      <div class="search-result-info">
        <strong>${p.nombre}</strong>
        <small>${p.categoria}</small>
        <span>$${p.precio}</span>
      </div>
    </div>
  `).join('');
}
function limpiarBusqueda() {
  document.getElementById('searchInput').value = '';
  buscarProductos('');
}
function cerrarBusqueda() {
  document.getElementById('searchResults').style.display = 'none';
  document.getElementById('searchInput').value = '';
  document.getElementById('searchClear').style.display = 'none';
}
document.addEventListener('click', e => {
  if (!e.target.closest('.nav-search-wrap')) cerrarBusqueda();
});

// ─── CHATBOT ─────────────────────────────
const CHATBOT_RESPUESTAS = [
  { palabras:['hola','buenas','hey','saludos'],           resp:'¡Hola! 👋 Bienvenido a Abarrotes San Juan. ¿En qué puedo ayudarte?' },
  { palabras:['horario','hora','abren','cierran','abierto'], resp:'🕐 Abrimos de lunes a sábado de 8:00am a 9:00pm. ¡Te esperamos!' },
  { palabras:['envío','entrega','domicilio','llevan'],     resp:'🚴 Sí, hacemos entregas a domicilio en la colonia. Pedido mínimo $150, costo de envío $30. ¡Gratis en compras +$200!' },
  { palabras:['precio','costo','cuánto','barato'],        resp:'💰 Tenemos los mejores precios del vecindario. Explora nuestros pasillos o usa el buscador para ver precios exactos.' },
  { palabras:['oferta','descuento','promoción','sale'],   resp:'🔥 ¡Tenemos ofertas increíbles! Consulta la sección "Ofertas de la Semana" justo abajo del hero.' },
  { palabras:['whatsapp','pedir','pedido','orden'],       resp:'📱 Puedes hacer tu pedido directamente desde el carrito con el botón de WhatsApp, o escríbenos al +52 55 0000 0000.' },
  { palabras:['pago','efectivo','tarjeta','transferencia'],resp:'💳 Aceptamos efectivo, transferencia y pago por WhatsApp Pay. ¡Próximamente tarjeta en línea!' },
  { palabras:['bebida','refresco','agua','jugo'],         resp:'🥤 Tenemos todo en bebidas: refrescos, agua, jugos, energizantes y café. Revisa el pasillo de Bebidas.' },
  { palabras:['snack','botana','papas','galleta'],        resp:'🍿 Gran variedad de botanas: Sabritas, Doritos, Oreo, Ruffles y más. ¡Revisa el pasillo de Snacks!' },
  { palabras:['leche','yogurt','queso','lácteo'],         resp:'🥛 Contamos con leche, yogurt, queso, mantequilla y crema de las mejores marcas.' },
  { palabras:['mascota','perro','gato','alimento animal'],resp:'🐾 Tenemos croquetas, arena para gatos y snacks para mascotas. Revisa el pasillo de Mascotas.' },
  { palabras:['lucha','máscara','mascara','vikingo','penta','mistico','místico','bandido','dominik','luchador','camisa','ring','aaa','cmll','wwe'], resp:'🎭 ¡Fuego puro! Tenemos la sección **Lucha Libre 2026** con la sangre nueva que está rompiendo el ring: Hijo del Vikingo (AAA), Penta Zero Miedo (WWE), Místico (CMLL Top 10), Bandido (Campeón ROH) y Dominik Mysterio. Máscaras, camisas y coleccionables edición 2026. ¡Busca el pasillo de Lucha Libre!' },
  { palabras:['gracias','thank','ok','perfecto'],         resp:'¡Con gusto! ¿Necesitas algo más? 😊' },
  { palabras:['pdf','ticket','recibo','comprobante'],     resp:'📄 Sí, puedes generar tu ticket en PDF desde el carrito. Solo haz clic en "Ticket PDF" al momento de revisar tu pedido.' },
  { palabras:['login','sesion','cuenta','registrar'],     resp:'👤 Puedes iniciar sesión con tu nombre y número de WhatsApp. Haz clic en "Entrar" en la parte superior derecha.' },
];
const SUGERENCIAS = ['¿Tienen entrega a domicilio?', 'Ver ofertas', '¿Cuáles son sus horarios?', '¿Cómo pago mi pedido?'];

function toggleChatbot() {
  chatbotAbierto = !chatbotAbierto;
  const win = document.getElementById('chatbotWindow');
  win.classList.toggle('open', chatbotAbierto);
  document.getElementById('chatbotBadge').style.display = chatbotAbierto ? 'none' : 'flex';
  if (chatbotAbierto && document.getElementById('chatbotMessages').childElementCount === 0) {
    setTimeout(() => {
      agregarMensajeBot('¡Hola! 👋 Soy el asistente de **Abarrotes San Juan**. ¿En qué puedo ayudarte hoy?');
      renderSugerencias();
    }, 300);
  }
}

function agregarMensajeBot(texto) {
  const msgs = document.getElementById('chatbotMessages');
  const typing = document.createElement('div');
  typing.className = 'chat-msg bot';
  typing.innerHTML = `<div class="chat-typing"><span></span><span></span><span></span></div>`;
  msgs.appendChild(typing);
  msgs.scrollTop = msgs.scrollHeight;
  setTimeout(() => {
    typing.className = 'chat-msg bot';
    typing.innerHTML = texto.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    msgs.scrollTop = msgs.scrollHeight;
  }, 700);
}

function agregarMensajeUser(texto) {
  const msgs = document.getElementById('chatbotMessages');
  const div = document.createElement('div');
  div.className = 'chat-msg user';
  div.textContent = texto;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
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

function enviarMensaje() {
  const input = document.getElementById('chatbotInput');
  const txt = input.value.trim();
  if (!txt) return;
  agregarMensajeUser(txt);
  input.value = '';
  document.getElementById('chatbotSuggestions').innerHTML = '';

  const lower = txt.toLowerCase();
  const match = CHATBOT_RESPUESTAS.find(r => r.palabras.some(p => lower.includes(p)));
  const resp = match
    ? match.resp
    : '🤔 No estoy seguro de eso. Puedes contactarnos directamente por WhatsApp al **+52 55 0000 0000** o explorar nuestros pasillos.';

  setTimeout(() => agregarMensajeBot(resp), 400);
}

// ─── INTERSECTION OBSERVER ───────────────
const revealEls = document.querySelectorAll('.card,.pasillo-card,.opcion-card,.oferta-card');
const obs = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => { e.target.style.opacity='1'; e.target.style.transform='translateY(0)'; }, i * 70);
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => {
  el.style.opacity='0';
  el.style.transform='translateY(28px)';
  el.style.transition='opacity .55s cubic-bezier(.23,1,.32,1), transform .55s cubic-bezier(.23,1,.32,1)';
  obs.observe(el);
});

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

// ─── VOLVER ARRIBA ────────────────────────
window.addEventListener('scroll', () => {
  const btn = document.getElementById('backToTop');
  if (btn) btn.classList.toggle('visible', window.scrollY > 500);
});

function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── CONFETTI ────────────────────────────
function lanzarConfetti() {
  const colores = ['#3a9e6a','#5dbf89','#8dd9ae','#b8eece','#f8f4eb','#ffd700','#ff6b6b'];
  for (let i = 0; i < 80; i++) {
    const conf = document.createElement('div');
    conf.className = 'confetti-piece';
    conf.style.cssText = `
      left:${Math.random() * 100}vw;
      background:${colores[Math.floor(Math.random() * colores.length)]};
      width:${6 + Math.random() * 8}px;
      height:${6 + Math.random() * 8}px;
      animation-duration:${1 + Math.random() * 1.5}s;
      animation-delay:${Math.random() * 0.4}s;
      border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
      transform:rotate(${Math.random() * 360}deg);
    `;
    document.body.appendChild(conf);
    conf.addEventListener('animationend', () => conf.remove());
  }
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

// ─── CHATBOT RESPUESTAS EXTRA ─────────────
// (ya inicializado arriba, solo añadimos al array en runtime)
CHATBOT_RESPUESTAS.push(
  { palabras:['wwe 2k26','2k26','videojuego','juego','cm punk','ps5','xbox','switch'], resp:'🎮 ¡Sí tenemos WWE 2K26! Salió el 13 de marzo 2026 con CM Punk de portada y +400 luchadores. Disponible en PS5, Xbox Series X|S y Nintendo Switch 2. ¡Busca el pasillo de WWE 2K26!' },
  { palabras:['dragon ball','goku','vegeta','figuarts','figura','sh figuarts','coleccionable','bandai'], resp:'🐉 ¡Kamehameha! Tenemos S.H. Figuarts Dragon Ball: Goku "Kind-hearted Saiyan" 2026 con cuerpo 4.0, SSJ Goku "Warrior of Rage", Vegeta DAIMA, Bardock y más. ¡Pura colección de primera!' },
  { palabras:['modo oscuro','oscuro','dark','claro','tema'], resp:'🌙 Puedes cambiar entre modo oscuro y claro con el botón de luna 🌙 en la esquina superior derecha del menú.' }
);

// ─── INIT ────────────────────────────────
generarOfertas();
generarFiltros();
generarPasillos();
