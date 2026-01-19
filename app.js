const categories=[
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

let activeCat=categories[0];
let items=JSON.parse(localStorage.items||'[]');
let cart=JSON.parse(localStorage.cart||'[]');
let deleteIndex=null, deleteType=null;

function toggleDrawer(){drawer.classList.toggle('open')}

function renderDrawer(){
  drawer.innerHTML=categories.map(c=>`
    <button class="${c===activeCat?'active':''}"
      onclick="activeCat='${c}';toggleDrawer();render()">${c}</button>
  `).join('');
}

function render(){
  renderDrawer();
  const q=search.value.toLowerCase();
  list.innerHTML=items
    .filter(i=>(!q||i.name.toLowerCase().includes(q)) && i.cat===activeCat)
    .map((i,idx)=>`
      <div class="item">
        <span>${i.name}</span>
        <div>
          <button class="add" onclick="showQtyModal('${i.name}')">+</button>
          <button class="del" onclick="askDeleteItem(${idx})">✕</button>
        </div>
      </div>
    `).join('');
  renderTicket();
  localStorage.items=JSON.stringify(items);
  localStorage.cart=JSON.stringify(cart);
}

function showAddItem(){
  const m=document.createElement('div');
  m.className='modal'; m.style.display='flex';
  m.innerHTML=`<div class="box">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <h3>Nuevo artículo</h3>
      <button id="close" style="border:none;background:none;font-size:20px">✕</button>
    </div>
    <input id="iname" placeholder="Nombre" style="width:100%;padding:8px">
    <select id="icat" style="width:100%;padding:8px;margin-top:8px">
      ${categories.map(c=>`<option>${c}</option>`).join('')}
    </select>
    <div style="display:flex;gap:8px;margin-top:10px">
      <button id="cancel" style="flex:1">Cancelar</button>
      <button id="save" style="flex:1">Guardar</button>
    </div>
  </div>`;
  document.body.appendChild(m);
  m.querySelector('#cancel').onclick=()=>m.remove();
  m.querySelector('#close').onclick=()=>m.remove();
  m.querySelector('#save').onclick=()=>{
    const n=iname.value.trim();
    if(n){
      items.push({name:n,cat:icat.value});
      m.remove(); render();
    }
  };
}

function showQtyModal(name){
  let qty=1, unit='UNIDAD';
  const m=document.createElement('div');
  m.className='modal'; m.style.display='flex';
  m.innerHTML=`<div class="box">
    <h3>${name}</h3>
    <p>Cantidad</p>
    <div class="btns qty">
      ${[1,2,3,4,5,6,7,8,9,10].map(n=>`<button>${n}</button>`).join('')}
    </div>
    <p>Unidad</p>
    <div class="btns unit">
      <button class="active">UNIDAD</button>
      <button>KG</button>
      <button>CAJA</button>
    </div>
   <div style="display:flex;gap:8px;margin-top:10px">
  <button id="add">Añadir</button>
  <button id="cancel">Cancelar</button>
</div>

  </div>`;
  document.body.appendChild(m);

  m.querySelectorAll('.qty button').forEach(b=>b.onclick=()=>{
    m.querySelectorAll('.qty button').forEach(x=>x.classList.remove('active'));
    b.classList.add('active'); qty=Number(b.textContent);
  });
  m.querySelectorAll('.unit button').forEach(b=>b.onclick=()=>{
    m.querySelectorAll('.unit button').forEach(x=>x.classList.remove('active'));
    b.classList.add('active'); unit=b.textContent;
  });

  m.querySelector('#cancel').onclick=()=>m.remove();
  m.querySelector('#add').onclick=()=>{
    const f=cart.find(c=>c.name===name && c.unit===unit);
    if(f)f.qty+=qty; else cart.push({name,qty,unit});
    m.remove(); render();
  };
}

function renderTicket(){
  ticketList.innerHTML=cart.map((c,i)=>`
    <li>${c.name} - ${c.qty} ${c.unit}
      <button class="del" onclick="askDeleteTicket(${i})">✕</button>
    </li>`).join('');
}

function askDeleteItem(i){
  deleteType='item'; deleteIndex=i;
  confirmText.textContent=`¿Eliminar ${items[i].name}?`;
  confirmModal.style.display='flex';
}
function askDeleteTicket(i){
  deleteType='ticket'; deleteIndex=i;
  confirmText.textContent=`¿Eliminar ${cart[i].name} del ticket?`;
  confirmModal.style.display='flex';
}
function confirmDelete(){
  if(deleteType==='item')items.splice(deleteIndex,1);
  if(deleteType==='ticket')cart.splice(deleteIndex,1);
  closeConfirm(); render();
}
function closeConfirm(){confirmModal.style.display='none'}

function resetTicket(){cart=[]; render()}

/* ===== IMPRESIÓN TICKET 80MM ===== */
function printTicket(){
  const cont=document.getElementById("ticket-items");
  cont.innerHTML="";

  cart.forEach(c=>{
    cont.innerHTML+=`
      <div class="ticket-line">
        <span>${c.name}</span>
        <span>${c.qty} ${c.unit}</span>
      </div>
    `;
  });

  document.getElementById("ticket-fecha").textContent=
    new Date().toLocaleString();

  document.getElementById("ticket-total").textContent=cart.length;

  window.print();
}

/* ===== WHATSAPP ===== */
function buildWhatsAppText(){
  let txt="🧾 *PEDIDO*\n\n";
  categories.forEach(cat=>{
    const lines=cart.filter(c=>{
      const it=items.find(i=>i.name===c.name);
      return it && it.cat===cat;
    });
    if(lines.length){
      txt+=cat.toUpperCase()+"\n";
      lines.forEach(l=>{
        txt+=`- ${l.name}: ${l.qty} ${l.unit}\n`;
      });
      txt+="\n";
    }
  });
  return txt.trim();
}

function previewWhatsApp(){
  const text=buildWhatsAppText();
  const m=document.createElement('div');
  m.className='modal'; m.style.display='flex';
  m.innerHTML=`<div class="box">
    <h3>Vista previa WhatsApp</h3>
    <textarea style="width:100%;height:200px">${text}</textarea>
    <div style="display:flex;gap:8px;margin-top:10px">
      <button id="cancel">Cancelar</button>
      <button id="send">Enviar</button>
    </div>
  </div>`;
  document.body.appendChild(m);

  m.querySelector('#cancel').onclick=()=>m.remove();
  m.querySelector('#send').onclick=()=>{
    const t=encodeURIComponent(m.querySelector('textarea').value);
    window.open('https://wa.me/?text='+t);
    m.remove();
  };
}

function sendWhatsApp(){ previewWhatsApp(); }

/* ===== DATOS INICIALES ===== */
if(items.length===0){
  items=[
    {name:'Coca Cola',cat:'Aguas y refrescos'},
    {name:'Manzana',cat:'Frutas y verduras'}
  ];
}

render();
