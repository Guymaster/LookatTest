var peer = null;
var conn = null;
var call = null;
tracking.ColorTracker.registerColor('red', function(r, g, b) {
  if (r>100 && r>g*2 && r>b*2) {
    return true;
  }
  return false;
});
tracking.ColorTracker.registerColor('black', function(r, g, b) {
  let y = 0.2126*r + 0.7152*g + 0.0722*b
  if (y < 200) {
    return true;
  }
  return false;
});
var obj = {
  nom: "Montre à Quartz",
  parties: [
    {
      nom: "Bracelet",
      couleur: "yellow",
      active: true
    },
    {
      nom: "Coque",
      couleur: "red",
      active: true
    },
    {
      nom: "Arriere",
      couleur: "black",
      active: true
    }
  ]
}



function connecter(idClient){
  peer.on('call', function(call) {
    // Answer the call, providing our mediaStream
    console.log("on m'appelle")
    call.answer(new MediaStream());
    console.log("j'ai accepté")

    call.on('stream', function(stream) {
      console.log("J'ai recu un stream: ", stream)
      });
    });
    conn = peer.connect(idClient);
    
}

function initTracking(){
  for(let i = 0; i<obj.parties.length; i++){
    if(obj.parties[i].active==true){
      let tracker = new tracking.ColorTracker(obj.parties[i].couleur);
      tracker.on('track', function(event) {
        if (event.data.length === 0) {
          // No colors were detected in this frame.
        } else {
          event.data.forEach(function(rect) {
            console.log(rect.x, rect.y, rect.height, rect.width, rect.color, obj.parties[i].nom);
            afficherNom(rect.x, rect.y, rect.width, rect.height,  obj.parties[i].nom)
          });
        }
      });
      tracking.track('#vid', tracker);
    }
  }
}


var afficherNom = function(x, y, w, h, nom) {
  var rect = document.createElement('div');
  rect.classList.add('rect');

  rect.innerText = nom;

  rect.style.width = w + 'px';
  rect.style.height = h + 'px';
  rect.style.left = (document.getElementById('vid').offsetLeft + x) + 'px';
  rect.style.top = (document.getElementById('vid').offsetTop + y) + 'px';
  document.getElementById('contenu').appendChild(rect);
  setTimeout(()=>{
    rect.remove()
  }, 0.5);
};

function initMaint(){
  peer = new Peer("MAINTENANCIER001");
  peer.on('call', function(call) {
    
    call.on('stream', function(stream) {
        console.log("Appel Reçu et accepté: ", stream)
        initInterface()
        document.getElementById('connBox').setAttribute('class', 'invisible');
        var video = document.getElementById('vid');
        video.srcObject = stream;
        video.play()
        initTracking()
      });
    call.answer(new MediaStream());
  });

  document.getElementById('btnComm').addEventListener('click', function(){
    connecter(document.getElementById('inputCode').value);
    conn.on('open', function() {
        // Receive messages
        conn.on('data', function(data) {
            if(data.type == "video"){
                data = JSON.parse(data);
            }
          console.log('Received', data);
        });
    
        // Send messages
        conn.send('Hello!');
        conn.send('COMMENCER');
      });
  });
}

function initInterface(){
  document.getElementById("menu").setAttribute("class", "")
  document.getElementById("profilMaint").setAttribute("class", "")
  document.getElementById("annotBtn").addEventListener("click", ()=>{
    let btn = document.getElementById("annotBtn");
    if(btn.getAttribute("class")=="selection"){
      btn.setAttribute("class", "")
      document.getElementById("annotListBox").setAttribute("class", "")
    }
    else{
      btn.setAttribute("class", "selection")
      document.getElementById("annotListBox").setAttribute("class", "invisible")
    }
  });
  for(let i=0; i<obj.parties.length; i++){
    let tyle = document.createElement('div');
    tyle.setAttribute('class', 'annotTyle');
    let inp = document.createElement('input');
    inp.setAttribute('type', 'checkbox');
    inp.setAttribute('name', obj.parties[i].nom);
    inp.setAttribute('id', obj.parties[i].nom);
    inp.setAttribute('checked', obj.parties[i].active);
    let lab = document.createElement('label');
    lab.setAttribute('for', obj.parties[i].nom);
    lab.innerText = obj.parties[i].nom;
    tyle.appendChild(inp);
    tyle.appendChild(lab);
    document.getElementById("annotListBox").appendChild(tyle)
    inp.addEventListener('change', ()=>{
      console.log('le foot i achangé', inp.checked);
      for(let j=0; j<obj.parties.length; j++){
        if(obj.parties[i].nom == inp.getAttribute("name")){
          obj.parties[i].active =  inp.checked;
        }
      }
      sendObj()
    })
  }
}

function sendObj(){
  conn.send({
    nature: "obj",
    data: obj
  })
}

function sendClick(x, y){
  conn.send({
    nature: "click",
    x: x,
    y: y
  })
}

//Ordre d'execution
initMaint()