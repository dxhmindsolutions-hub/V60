/* ===== ELEMENTOS DOM ===== */
const drawer       = document.getElementById("drawer");
const search       = document.getElementById("search");
const list         = document.getElementById("list");
const ticketList   = document.getElementById("ticketList");
const confirmModal = document.getElementById("confirmModal");
const confirmText  = document.getElementById("confirmText");

/* ===== MODO EDICIÓN ===== */
let editMode = false;

function toggleEditMode(){
  editMode = !editMode;

  const btn = document.getElementById("editBtn");
  const addBtn = document.getElementById("addItemBtn");

  if(editMode){
    btn.textContent = "↩️ Volver";
    addBtn.style.display = "block";
  }else{
    btn.textContent = "✏️ Editar";
    addBtn.style.display = "none";
  }

  render();
}

/* ===== CATEGORÍAS ===== */
const categories = [
  "Aguas y refrescos",
  "Cerveza, vinos y licores",
  "Café y té",
  "Frutas y verduras",
  "Lácteos y huevos",
  "Carne",
  "Pescado",
  "Limpieza",
  "Congelados",
  "Asiático",
  "Otros"
];

let activeCat = categories[0];
let items = JSON.parse(localStorage.items || "[]");
let cart  = JSON.parse(localStorage.cart  || "[]");
let deleteIndex = null;
let deleteType  = null;

/* ===== DRAWER ===== */
function toggleDrawer(){
  drawer.classList.toggle("open");
}

function renderDrawer(){
  drawer.innerHTML = categories.map(c => `
    <button class="${c === activeCat ? "active" : ""}"
      onclick="activeCat='${c}';toggleDrawer();render()">
      ${c}
    </button>
  `).join("");
}

/* ===== RENDER ===== */
function render(){
  renderDrawer();
  const q = search.value.toLowerCase();

  list.innerHTML = items
    .filter(i => (!q || i.name.toLowerCase().includes(q)) && i.cat === activeCat)
    .map((i, idx) => `
      <div class="item">
        <span>${i.name}</span>
        <div>
          ${
            editMode
              ? `<button class="del" onclick="askDeleteItem(${idx})">✕</button>`
              : `<button class="add" onclick="showQtyModal('${i.name}')">+</button>`
          }
        </div>
      </div>
    `).join("");

  renderTicket();
  localStorage.items = JSON.stringify(items);
  localStorage.cart  = JSON.stringify(cart);
}

/* ===== AÑADIR ARTÍCULO ===== */
function showAddItem(){
  const m = document.createElement("div");
  m.className = "modal";
  m.style.display = "flex";
  m.innerHTML = `
    <div class="box">
      <h3>Nuevo artículo</h3>
      <input id="iname" placeholder="Nombre">
      <select id="icat">
        ${categories.map(c => `<option>${c}</option>`).join("")}
      </select>
      <div>
        <button id="save">Guardar</button>
        <button id="cancel">Cancelar</button>
      </div>
    </div>
  `;
  document.body.appendChild(m);

  m.querySelector("#cancel").onclick = () => m.remove();
  m.querySelector("#save").onclick = () => {
    const n = m.querySelector("#iname").value.trim();
    const c = m.querySelector("#icat").value;
    if(n){
      items.push({ name: n, cat: c });
      m.remove();
      render();
    }
  };
}

/* ===== MODAL CANTIDAD ===== */
function showQtyModal(name){
  let qty = 1;
  let unit = "UNIDAD";

  const m = document.createElement("div");
  m.className = "modal";
  m.style.display = "flex";
  m.innerHTML = `
    <div class="box">
      <h3>${name}</h3>
      <div>
        <button id="add">Añadir</button>
        <button id="cancel">Cancelar</button>
      </div>
    </div>
  `;
  document.body.appendChild(m);

  m.querySelector("#cancel").onclick = () => m.remove();
  m.querySelector("#add").onclick = () => {
    cart.push({ name, qty, unit });
    m.remove();
    render();
  };
}

/* ===== TICKET ===== */
function renderTicket(){
  ticketList.innerHTML = cart.map((c, i) => `
    <li>
      ${c.name}
      <button class="del" onclick="askDeleteTicket(${i})">✕</button>
    </li>
  `).join("");
}

/* ===== ELIMINAR ===== */
function askDeleteItem(i){
  deleteType = "item";
  deleteIndex = i;
  confirmText.textContent = `¿Eliminar ${items[i].name}?`;
  confirmModal.style.display = "flex";
}

function askDeleteTicket(i){
  deleteType = "ticket";
  deleteIndex = i;
  confirmText.textContent = `¿Eliminar ${cart[i].name}?`;
  confirmModal.style.display = "flex";
}

function confirmDelete(){
  if(deleteType === "item") items.splice(deleteIndex, 1);
  if(deleteType === "ticket") cart.splice(deleteIndex, 1);
  closeConfirm();
  render();
}

function closeConfirm(){
  confirmModal.style.display = "none";
}

function resetTicket(){
  cart = [];
  render();
}

/* ===== IMPRESIÓN ===== */
function printTicket(){
  window.print();
}

/* ===== WHATSAPP ===== */
function sendWhatsApp(){
  window.open("https://wa.me/?text=Pedido");
}

/* ===== DATOS INICIALES ===== */
if(items.length === 0){
  items = [
    { name: "Coca Cola", cat: "Aguas y refrescos" },
    { name: "Manzana", cat: "Frutas y verduras" }
  ];
}

render();
