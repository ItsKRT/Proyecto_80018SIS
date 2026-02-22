// ==========================
// FUNCIONES ORIGINALES (NO SE TOCAN)
// ==========================

function toggleMenu(){
const menu=document.getElementById("menu");
menu.style.display=menu.style.display==="block"?"none":"block";
}

function expandHero(){
document.getElementById("heroFullscreen").classList.add("active");
}

function closeHero(){
document.getElementById("heroFullscreen").classList.remove("active");
}

function showPopup(type){
const popup=document.getElementById("popup");
const title=document.getElementById("popup-title");
const text=document.getElementById("popup-text");

if(type==="mision"){
title.innerText="Nuestra Misión";
text.innerText="Brindar productos de calidad al mejor precio.";
}
if(type==="vision"){
title.innerText="Nuestra Visión";
text.innerText="Ser la tienda digital líder de nuestra comunidad.";
}
if(type==="objetivo"){
title.innerText="Nuestro Objetivo";
text.innerText="Facilitar las compras diarias con rapidez.";
}

popup.classList.add("active");
}

function closePopup(){
document.getElementById("popup").classList.remove("active");
}

// ==========================
// DATOS DE PASILLOS Y PRODUCTOS
// ==========================

const pasillos = [
{
nombre:"Bebidas",
imagen:"https://images.unsplash.com/photo-1586201375761-83865001e31c",
productos:[
{nombre:"Coca-Cola 2L",precio:35,desc:"Refresco clásico 2 litros",img:"https://images.unsplash.com/photo-1629203432180-71e7a43a7e2e"},
{nombre:"Agua Bonafont",precio:18,desc:"Agua purificada 1L",img:"https://images.unsplash.com/photo-1526406915894-7bcd65f60845"},
{nombre:"Jugo Del Valle",precio:28,desc:"Jugo natural 1L",img:"https://images.unsplash.com/photo-1580910051074-3eb694886505"}
]
},
{
nombre:"Snacks",
imagen:"https://images.unsplash.com/photo-1606787366850-de6330128bfc",
productos:[
{nombre:"Sabritas",precio:20,desc:"Papas clásicas",img:"https://images.unsplash.com/photo-1599490659213-e2b9527bd087"},
{nombre:"Doritos",precio:22,desc:"Nachos con queso",img:"https://images.unsplash.com/photo-1604908177522-040fb0b1e5f6"},
{nombre:"Oreo",precio:18,desc:"Galletas rellenas",img:"https://images.unsplash.com/photo-1585238342024-78d387f4a707"}
]
},
{
nombre:"Lácteos",
imagen:"https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",
productos:[
{nombre:"Leche Alpura",precio:25,desc:"Leche entera 1L",img:"https://images.unsplash.com/photo-1582719478171-3f68a8e9e197"},
{nombre:"Yogurt Danone",precio:12,desc:"Yogurt natural",img:"https://images.unsplash.com/photo-1571212515416-fca4b7c8c1a5"},
{nombre:"Queso Oaxaca",precio:40,desc:"Queso fresco 500g",img:"https://images.unsplash.com/photo-1585238342024-78d387f4a707"}
]
},
{
nombre:"Limpieza",
imagen:"https://images.unsplash.com/photo-1581579185169-65b6d5b38d0d",
productos:[
{nombre:"Cloralex",precio:30,desc:"Blanqueador 1L",img:"https://images.unsplash.com/photo-1581579185156-0dcb6d59b1b3"},
{nombre:"Fabuloso",precio:32,desc:"Limpiador multiusos",img:"https://images.unsplash.com/photo-1581579185156-0dcb6d59b1b3"},
{nombre:"Detergente Ariel",precio:45,desc:"Detergente en polvo",img:"https://images.unsplash.com/photo-1581579185156-0dcb6d59b1b3"}
]
},
{
nombre:"Enlatados",
imagen:"https://images.unsplash.com/photo-1606787366850-de6330128bfc",
productos:[
{nombre:"Atún Dolores",precio:20,desc:"Atún en agua",img:"https://images.unsplash.com/photo-1580910051074-3eb694886505"},
{nombre:"Chícharos Herdez",precio:15,desc:"Verduras enlatadas",img:"https://images.unsplash.com/photo-1580910051074-3eb694886505"},
{nombre:"Frijoles Isadora",precio:22,desc:"Frijoles refritos",img:"https://images.unsplash.com/photo-1580910051074-3eb694886505"}
]
}
];

// ==========================
// GENERAR PASILLOS
// ==========================

const contenedor=document.getElementById("contenedorPasillos");

pasillos.forEach(pasillo=>{
const card=document.createElement("div");
card.className="pasillo-card";

card.innerHTML=`
<img src="${pasillo.imagen}">
<div class="pasillo-content"><h3>${pasillo.nombre}</h3></div>
<div class="productos" style="display:none;"></div>
`;

card.onclick=function(){
const productosDiv=card.querySelector(".productos");
productosDiv.style.display=productosDiv.style.display==="block"?"none":"block";

if(productosDiv.innerHTML===""){
pasillo.productos.forEach(prod=>{
productosDiv.innerHTML+=`
<div class="producto-card" onclick="abrirModal('${prod.nombre}',${prod.precio},'${prod.desc}','${prod.img}')">
${prod.nombre} - $${prod.precio}
</div>
`;
});
}
};

contenedor.appendChild(card);
});

// ==========================
// CARRITO
// ==========================

let carrito=[];
let productoActual=null;

function abrirModal(nombre,precio,descripcion,imagen){
productoActual={nombre,precio,descripcion,imagen};
document.getElementById("modal-img").src=imagen;
document.getElementById("modal-nombre").innerText=nombre;
document.getElementById("modal-desc").innerText=descripcion;
document.getElementById("modal-precio").innerText="$"+precio;
document.getElementById("modalProducto").style.display="flex";
}

function cerrarModal(){
document.getElementById("modalProducto").style.display="none";
}

function agregarAlCarrito(){
carrito.push(productoActual);
document.getElementById("contadorCarrito").innerText=carrito.length;
cerrarModal();
}

function abrirCarrito(){
const lista=document.getElementById("listaCarrito");
lista.innerHTML="";
carrito.forEach(item=>{
lista.innerHTML+=`<p>${item.nombre} - $${item.precio}</p>`;
});
document.getElementById("modalCarrito").style.display="flex";
}

function cerrarCarrito(){
document.getElementById("modalCarrito").style.display="none";
}

function enviarWhatsApp(){
let mensaje="Hola quiero pedir:%0A";
carrito.forEach(item=>{
mensaje+=`- ${item.nombre} $${item.precio}%0A`;
});
window.open("https://wa.me/?text="+mensaje,"_blank");
}
