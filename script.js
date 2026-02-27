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
    imagen:'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500',
    productos:[
      { nombre:'Coca-Cola 2L',          precio:35, precioOld:null, desc:'Refresco de cola icónico, botella 2 litros.',       img:'https://images.unsplash.com/photo-1629203432180-71e7a43a7e2e?w=300', oferta:false },
      { nombre:'Agua Bonafont 1.5L',    precio:18, precioOld:null, desc:'Agua purificada en botella de 1.5 litros.',        img:'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=300', oferta:false },
      { nombre:'Jugo Del Valle 1L',     precio:28, precioOld:35,   desc:'Jugo de naranja natural, 1 litro.',                img:'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300', oferta:true  },
      { nombre:'Gatorade Limón',        precio:22, precioOld:null, desc:'Bebida isotónica sabor limón 600ml.',              img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300', oferta:false },
      { nombre:'Red Bull 250ml',        precio:38, precioOld:null, desc:'Bebida energizante lata 250ml.',                  img:'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300', oferta:false },
      { nombre:'Café Nescafé Clásico',  precio:55, precioOld:65,   desc:'Café soluble instantáneo frasco 100g.',           img:'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300', oferta:true  },
    ]
  },
  {
    id:'snacks', nombre:'Snacks', emoji:'🍿',
    imagen:'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=500',
    productos:[
      { nombre:'Sabritas Clásicas',     precio:20, precioOld:null, desc:'Papas fritas originales bolsa 45g.',              img:'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=300', oferta:false },
      { nombre:'Doritos Nacho',         precio:22, precioOld:null, desc:'Totopos con queso bolsa 65g.',                    img:'https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=300', oferta:false },
      { nombre:'Oreo Original',         precio:18, precioOld:22,   desc:'Galletas de chocolate con relleno 117g.',         img:'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300', oferta:true  },
      { nombre:'Ruffles Queso',         precio:24, precioOld:null, desc:'Papas acanaladas sabor queso bolsa 45g.',         img:'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300', oferta:false },
      { nombre:'Palomitas Crunch',      precio:15, precioOld:null, desc:'Palomitas de maíz con mantequilla 50g.',          img:'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=300', oferta:false },
      { nombre:'Cacahuates Japoneses',  precio:16, precioOld:null, desc:'Cacahuates cubiertos de harina 100g.',            img:'https://images.unsplash.com/photo-1571218281820-4e886f6c1c15?w=300', oferta:false },
    ]
  },
  {
    id:'lacteos', nombre:'Lácteos', emoji:'🥛',
    imagen:'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=500',
    productos:[
      { nombre:'Leche Alpura Entera 1L',precio:25, precioOld:null, desc:'Leche entera pasteurizada 1 litro.',              img:'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300', oferta:false },
      { nombre:'Yogurt Danone Natural', precio:12, precioOld:null, desc:'Yogurt natural sin azúcar 125g.',                 img:'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300', oferta:false },
      { nombre:'Queso Oaxaca 400g',     precio:48, precioOld:55,   desc:'Queso de hebra artesanal 400g.',                  img:'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=300', oferta:true  },
      { nombre:'Mantequilla Lala 200g', precio:32, precioOld:null, desc:'Mantequilla sin sal barra 200g.',                 img:'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300', oferta:false },
      { nombre:'Crema Lala 200ml',      precio:18, precioOld:null, desc:'Crema ácida lista para servir 200ml.',            img:'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=300', oferta:false },
    ]
  },
  {
    id:'limpieza', nombre:'Limpieza', emoji:'🧹',
    imagen:'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500',
    productos:[
      { nombre:'Cloralex 950ml',        precio:30, precioOld:null, desc:'Blanqueador con aroma 950ml.',                    img:'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=300', oferta:false },
      { nombre:'Fabuloso Multiusos 1L', precio:32, precioOld:38,   desc:'Limpiador líquido lavanda 1 litro.',              img:'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=300', oferta:true  },
      { nombre:'Ariel Polvo 1kg',       precio:55, precioOld:null, desc:'Detergente en polvo con suavizante 1kg.',         img:'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=300', oferta:false },
      { nombre:'Axion Lava Trastes',    precio:22, precioOld:null, desc:'Lavatrastes en pasta limón 500g.',                img:'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=300', oferta:false },
      { nombre:'Papel Higiénico x4',   precio:45, precioOld:52,   desc:'Papel higiénico doble hoja paquete 4 rollos.',    img:'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300', oferta:true  },
    ]
  },
  {
    id:'enlatados', nombre:'Enlatados', emoji:'🥫',
    imagen:'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=500',
    productos:[
      { nombre:'Atún Dolores Agua',     precio:20, precioOld:null, desc:'Atún en agua lata 140g.',                         img:'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300', oferta:false },
      { nombre:'Chícharos Herdez 400g', precio:15, precioOld:null, desc:'Chícharos en lata listos para servir 400g.',      img:'https://images.unsplash.com/photo-1617952236317-0bd127407984?w=300', oferta:false },
      { nombre:'Frijoles Isadora 440g', precio:22, precioOld:28,   desc:'Frijoles refritos con manteca lata 440g.',        img:'https://images.unsplash.com/photo-1555244162-803834f70033?w=300', oferta:true  },
      { nombre:'Sardinas Calmex',       precio:18, precioOld:null, desc:'Sardinas en tomate lata 215g.',                   img:'https://images.unsplash.com/photo-1600188769099-d25b4ec79659?w=300', oferta:false },
      { nombre:'Durazno en Almíbar',    precio:24, precioOld:null, desc:'Duraznos en almíbar lata 820g.',                  img:'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300', oferta:false },
    ]
  },
  {
    id:'panaderia', nombre:'Panadería', emoji:'🍞',
    imagen:'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500',
    productos:[
      { nombre:'Pan de Caja Bimbo',     precio:38, precioOld:null, desc:'Pan de caja blanco grande 680g.',                 img:'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=300', oferta:false },
      { nombre:'Tortillas Maíz x30',    precio:22, precioOld:null, desc:'Tortillas de maíz empaque 30 piezas.',            img:'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=300', oferta:false },
      { nombre:'Conchas Marinela x6',   precio:32, precioOld:38,   desc:'Pan dulce tradicional paquete 6 piezas.',         img:'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=300', oferta:true  },
      { nombre:'Gansitos Marinela',     precio:18, precioOld:null, desc:'Pastelito de chocolate con fresa 3 piezas.',      img:'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300', oferta:false },
      { nombre:'Obleas Nestle x8',      precio:14, precioOld:null, desc:'Obleas con cajeta paquete 8 piezas.',             img:'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=300', oferta:false },
    ]
  },
  {
    id:'carnesfrías', nombre:'Carnes Frías', emoji:'🥩',
    imagen:'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=500',
    productos:[
      { nombre:'Jamón Virginia FUD 200g',precio:42, precioOld:null, desc:'Jamón de pierna rebanado 200g.',                img:'https://images.unsplash.com/photo-1612103198005-b238a0fa5d45?w=300', oferta:false },
      { nombre:'Salchicha FUD x8',      precio:36, precioOld:42,   desc:'Salchicha de pavo empaque 8 piezas.',            img:'https://images.unsplash.com/photo-1597733336794-12d05021d510?w=300', oferta:true  },
      { nombre:'Chorizo San Manuel',    precio:55, precioOld:null, desc:'Chorizo rojo español artesanal 500g.',           img:'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300', oferta:false },
      { nombre:'Mortadela Zwan 200g',   precio:30, precioOld:null, desc:'Mortadela rebanada fina 200g.',                  img:'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=300', oferta:false },
    ]
  },
  {
    id:'salud', nombre:'Salud Natural', emoji:'🌿',
    imagen:'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500',
    productos:[
      { nombre:'Avena Quaker 1kg',      precio:45, precioOld:null, desc:'Avena en hojuelas integral 1kg.',                img:'https://images.unsplash.com/photo-1614961233913-a5113a4a34ed?w=300', oferta:false },
      { nombre:'Miel Carlota 500g',     precio:62, precioOld:75,   desc:'Miel de abeja pura de campo 500g.',              img:'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300', oferta:true  },
      { nombre:'Chía Orgánica 250g',    precio:38, precioOld:null, desc:'Semillas de chía orgánica 250g.',                img:'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=300', oferta:false },
      { nombre:'Granola Natural 500g',  precio:52, precioOld:null, desc:'Granola con frutos secos y miel 500g.',          img:'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=300', oferta:false },
      { nombre:'Vitamina C 500mg x30',  precio:55, precioOld:null, desc:'Suplemento vitamina C tabletas frasco 30 pzs.',  img:'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300', oferta:false },
    ]
  },
  {
    id:'mascotas', nombre:'Mascotas', emoji:'🐾',
    imagen:'https://images.unsplash.com/photo-1601758174114-e711c0cbaa69?w=500',
    productos:[
      { nombre:'Croquetas Pedigree 1kg',precio:95, precioOld:110,  desc:'Alimento seco para perro adulto 1kg.',           img:'https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?w=300', oferta:true  },
      { nombre:'Croquetas Whiskas 500g',precio:55, precioOld:null, desc:'Alimento seco para gato adulto 500g.',           img:'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=300', oferta:false },
      { nombre:'Arena para Gato 5kg',  precio:75, precioOld:null, desc:'Arena absorbente con control de olor 5kg.',       img:'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=300', oferta:false },
      { nombre:'Premio Snacks Perro',   precio:35, premioOld:null, desc:'Snacks masticables para perro bolsa 100g.',       img:'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300', oferta:false },
    ]
  }
  ,{
    id:'luchaLibre', nombre:'Lucha Libre 2026', emoji:'🎭',
    imagen:'https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?w=500',
    productos:[
      // ── HIJO DEL VIKINGO (figura AAA / estilo aéreo extremo)
      { nombre:'Máscara Hijo del Vikingo',      precio:220, precioOld:270, desc:'Réplica oficial máscara negra y dorada del rey del aire de AAA. Talla adulto.',           img:'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=300', oferta:true  },
      { nombre:'Camisa Vikingo "Rey del Aire"', precio:290, precioOld:null, desc:'Camiseta oficial Hijo del Vikingo edición 2026. 100% algodón tallas S-XL.',             img:'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300', oferta:false },
      // ── MÍSTICO (CMLL, Top 10 PWI 500)
      { nombre:'Máscara Místico Plata y Oro',   precio:210, precioOld:null, desc:'Réplica máscara Místico plateada y dorada. Campeón Grand Prix 2025. Talla adulto.',      img:'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=300', oferta:false },
      { nombre:'Camisa Místico CMLL 2026',      precio:280, precioOld:320,  desc:'Camiseta oficial Místico con estampado Grand Prix. Edición limitada.',                  img:'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=300', oferta:true  },
      // ── PENTA ZERO MIEDO (WWE 2026)
      { nombre:'Máscara Penta Zero Miedo',      precio:240, precioOld:null, desc:'Réplica máscara negra Penta Zero Miedo. Ahora en WWE. ¡Cero Miedo! Talla adulto.',       img:'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300', oferta:false },
      { nombre:'Camisa Penta "Cero Miedo" M',   precio:310, precioOld:360,  desc:'Camiseta oficial Penta Zero Miedo WWE 2026 edición especial. Talla M.',                 img:'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=300', oferta:true  },
      // ── BANDIDO (ROH World Champion)
      { nombre:'Máscara Bandido ROH Champ',     precio:200, precioOld:null, desc:'Réplica máscara Bandido, Campeón Mundial de ROH. Talla única adulto.',                   img:'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=300', oferta:false },
      { nombre:'Camisa Bandido "Torreón"',      precio:270, precioOld:null, desc:'Camiseta oficial Bandido edición Torreón, Coahuila. 100% algodón.',                      img:'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300', oferta:false },
      // ── DOMINIK MYSTERIO (WWE IC Champ + MegaCampeón AAA)
      { nombre:'Camisa Dominik "Dirty Dom"',    precio:320, precioOld:380,  desc:'Camiseta oficial Dominik Mysterio WWE 2026, Campeón Intercontinental. Talla L.',         img:'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=300', oferta:true  },
      // ── COLECCIONABLES
      { nombre:'Set Figuras Big 4 x4',          precio:520, precioOld:650,  desc:'Set 4 mini figuras coleccionables: Vikingo, Místico, Penta y Bandido. Ed. 2026.',        img:'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=300', oferta:true  },
      { nombre:'Póster "Nueva Generación" 2026',precio:95,  precioOld:null, desc:'Póster oficial luchadores mexicanos 2026: Vikingo, Místico, Penta, Bandido. 50x70cm.',   img:'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300', oferta:false },
      { nombre:'Taza Lucha Nueva Era 350ml',    precio:120, precioOld:null, desc:'Taza cerámica con diseño de los 4 grandes de la lucha libre mexicana 2026.',             img:'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=300', oferta:false },
      { nombre:'Llavero Penta "Cero Miedo"',    precio:55,  precioOld:null, desc:'Llavero metálico figura Penta Zero Miedo con detalle de calavera.',                      img:'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=300', oferta:false },
      { nombre:'Máscara Niño Vikingo Talla S',  precio:110, precioOld:140,  desc:'Máscara Hijo del Vikingo para niño talla 4-10 años. La más pedida del momento.',         img:'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=300', oferta:true  },
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

// ─── INIT ────────────────────────────────
generarOfertas();
generarFiltros();
generarPasillos();
