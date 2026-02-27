// ==========================
// CURSOR PERSONALIZADO
// ==========================
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');

let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top  = mouseY + 'px';
});

(function animateFollower() {
  followerX += (mouseX - followerX) * 0.12;
  followerY += (mouseY - followerY) * 0.12;
  follower.style.left = followerX + 'px';
  follower.style.top  = followerY + 'px';
  requestAnimationFrame(animateFollower);
})();

document.querySelectorAll('a, button, .card, .pasillo-card, .opcion-card, .carrito-icono').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(2.5)';
    cursor.style.background = 'var(--green-300)';
    follower.style.opacity = '0';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    cursor.style.background = 'var(--green-500)';
    follower.style.opacity = '0.6';
  });
});

// ==========================
// NAVBAR SCROLL EFFECT
// ==========================
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

// ==========================
// TOGGLE MENU CONOCENOS
// ==========================
function toggleMenu() {
  const menu = document.getElementById('menu');
  const icon = document.getElementById('toggleIcon');
  const isOpen = menu.style.display === 'flex';
  menu.style.display = isOpen ? 'none' : 'flex';
  icon.classList.toggle('open', !isOpen);
}

// ==========================
// HERO FULLSCREEN
// ==========================
function expandHero() {
  document.getElementById('heroFullscreen').classList.add('active');
}

function closeHero() {
  document.getElementById('heroFullscreen').classList.remove('active');
}

// ==========================
// POPUP MISION / VISION / OBJETIVO
// ==========================
function showPopup(type) {
  const popup = document.getElementById('popup');
  const title = document.getElementById('popup-title');
  const text  = document.getElementById('popup-text');

  const contenido = {
    mision:  { titulo: 'Nuestra Misión',  texto: 'Brindar productos de calidad al mejor precio, acercándonos a nuestra comunidad con honestidad y calidez.' },
    vision:  { titulo: 'Nuestra Visión',  texto: 'Ser la tienda digital líder de nuestra comunidad, innovando con tecnología sin perder el trato humano.' },
    objetivo:{ titulo: 'Nuestro Objetivo', texto: 'Facilitar las compras diarias con rapidez, comodidad y precios justos para cada familia.' }
  };

  title.innerText = contenido[type].titulo;
  text.innerText  = contenido[type].texto;
  popup.classList.add('active');
}

function closePopup() {
  document.getElementById('popup').classList.remove('active');
}

// ==========================
// DATOS DE PASILLOS Y PRODUCTOS
// ==========================
const pasillos = [
  {
    nombre: 'Bebidas',
    imagen: 'https://images.unsplash.com/photo-1586201375761-83865001e31c',
    productos: [
      { nombre: 'Coca-Cola 2L',    precio: 35, desc: 'Refresco clásico 2 litros',    img: 'https://images.unsplash.com/photo-1629203432180-71e7a43a7e2e' },
      { nombre: 'Agua Bonafont',   precio: 18, desc: 'Agua purificada 1L',           img: 'https://images.unsplash.com/photo-1526406915894-7bcd65f60845' },
      { nombre: 'Jugo Del Valle',  precio: 28, desc: 'Jugo natural 1L',              img: 'https://images.unsplash.com/photo-1580910051074-3eb694886505' }
    ]
  },
  {
    nombre: 'Snacks',
    imagen: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc',
    productos: [
      { nombre: 'Sabritas',  precio: 20, desc: 'Papas clásicas',      img: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087' },
      { nombre: 'Doritos',   precio: 22, desc: 'Nachos con queso',    img: 'https://images.unsplash.com/photo-1604908177522-040fb0b1e5f6' },
      { nombre: 'Oreo',      precio: 18, desc: 'Galletas rellenas',   img: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707' }
    ]
  },
  {
    nombre: 'Lácteos',
    imagen: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b',
    productos: [
      { nombre: 'Leche Alpura',   precio: 25, desc: 'Leche entera 1L',     img: 'https://images.unsplash.com/photo-1582719478171-3f68a8e9e197' },
      { nombre: 'Yogurt Danone',  precio: 12, desc: 'Yogurt natural',       img: 'https://images.unsplash.com/photo-1571212515416-fca4b7c8c1a5' },
      { nombre: 'Queso Oaxaca',   precio: 40, desc: 'Queso fresco 500g',    img: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707' }
    ]
  },
  {
    nombre: 'Limpieza',
    imagen: 'https://images.unsplash.com/photo-1581579185169-65b6d5b38d0d',
    productos: [
      { nombre: 'Cloralex',         precio: 30, desc: 'Blanqueador 1L',        img: 'https://images.unsplash.com/photo-1581579185156-0dcb6d59b1b3' },
      { nombre: 'Fabuloso',         precio: 32, desc: 'Limpiador multiusos',   img: 'https://images.unsplash.com/photo-1581579185156-0dcb6d59b1b3' },
      { nombre: 'Detergente Ariel', precio: 45, desc: 'Detergente en polvo',   img: 'https://images.unsplash.com/photo-1581579185156-0dcb6d59b1b3' }
    ]
  },
  {
    nombre: 'Enlatados',
    imagen: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc',
    productos: [
      { nombre: 'Atún Dolores',       precio: 20, desc: 'Atún en agua',         img: 'https://images.unsplash.com/photo-1580910051074-3eb694886505' },
      { nombre: 'Chícharos Herdez',   precio: 15, desc: 'Verduras enlatadas',   img: 'https://images.unsplash.com/photo-1580910051074-3eb694886505' },
      { nombre: 'Frijoles Isadora',   precio: 22, desc: 'Frijoles refritos',    img: 'https://images.unsplash.com/photo-1580910051074-3eb694886505' }
    ]
  }
];

// ==========================
// GENERAR PASILLOS
// ==========================
const contenedor = document.getElementById('contenedorPasillos');

pasillos.forEach(pasillo => {
  const card = document.createElement('div');
  card.className = 'pasillo-card';

  card.innerHTML = `
    <img src="${pasillo.imagen}" alt="${pasillo.nombre}">
    <div class="pasillo-content"><h3>${pasillo.nombre}</h3></div>
    <div class="productos" style="display:none;"></div>
  `;

  card.onclick = function () {
    const productosDiv = card.querySelector('.productos');
    const isOpen = productosDiv.style.display === 'flex';
    productosDiv.style.display = isOpen ? 'none' : 'flex';
    productosDiv.style.flexDirection = 'column';

    if (productosDiv.innerHTML.trim() === '') {
      pasillo.productos.forEach(prod => {
        const p = document.createElement('div');
        p.className = 'producto-card';
        p.innerHTML = `<span>${prod.nombre}</span><span>$${prod.precio}</span>`;
        p.onclick = (e) => {
          e.stopPropagation();
          abrirModal(prod.nombre, prod.precio, prod.desc, prod.img);
        };
        productosDiv.appendChild(p);
      });
    }
  };

  contenedor.appendChild(card);
});

// ==========================
// CARRITO
// ==========================
let carrito = [];
let productoActual = null;

function abrirModal(nombre, precio, descripcion, imagen) {
  productoActual = { nombre, precio, descripcion, imagen };
  document.getElementById('modal-img').src       = imagen;
  document.getElementById('modal-nombre').innerText = nombre;
  document.getElementById('modal-desc').innerText   = descripcion;
  document.getElementById('modal-precio').innerText = '$' + precio;
  document.getElementById('modalProducto').style.display = 'flex';
}

function cerrarModal() {
  document.getElementById('modalProducto').style.display = 'none';
}

function agregarAlCarrito() {
  carrito.push(productoActual);
  document.getElementById('contadorCarrito').innerText = carrito.length;

  // Animación contador
  const counter = document.getElementById('contadorCarrito');
  counter.style.transform = 'scale(1.5)';
  setTimeout(() => counter.style.transform = 'scale(1)', 250);

  cerrarModal();
}

function abrirCarrito() {
  const lista = document.getElementById('listaCarrito');
  lista.innerHTML = '';

  if (carrito.length === 0) {
    lista.innerHTML = '<p style="color:var(--sage); text-align:center; padding: 20px 0; justify-content:center;">Tu carrito está vacío</p>';
  } else {
    carrito.forEach(item => {
      lista.innerHTML += `<p><span>${item.nombre}</span><span>$${item.precio}</span></p>`;
    });
  }

  document.getElementById('modalCarrito').style.display = 'flex';
}

function cerrarCarrito() {
  document.getElementById('modalCarrito').style.display = 'none';
}

function enviarWhatsApp() {
  if (carrito.length === 0) return;
  let mensaje = 'Hola, quiero hacer el siguiente pedido:%0A%0A';
  carrito.forEach(item => {
    mensaje += `• ${item.nombre} — $${item.precio}%0A`;
  });
  const total = carrito.reduce((acc, i) => acc + i.precio, 0);
  mensaje += `%0A*Total estimado: $${total}*`;
  window.open('https://wa.me/?text=' + mensaje, '_blank');
}

// ==========================
// INTERSECTION OBSERVER — REVEAL ON SCROLL
// ==========================
const revealEls = document.querySelectorAll('.card, .pasillo-card, .opcion-card');

const observer = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s cubic-bezier(0.23, 1, 0.32, 1), transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
  observer.observe(el);
});
