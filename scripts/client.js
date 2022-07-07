var peer = null;
var conn = null;
var imageVideo = null;
var call = null;
var stream = null;
var tracker = null;
var trackerTask = null;


var obj = {
  nom: "Montre à Quartz",
  parties: [
    {
      nom: "Bracelet",
      couleur: "yellow",
      active: true
    }
  ]
}

async function initCam(){
 stream = await navigator.mediaDevices.getUserMedia({audio: false, video: true});
 document.getElementById('vidBox').srcObject = stream;
 document.getElementById('vidBox').play()
}
function initTracking(){
  for(let i = 0; i<obj.parties.length; i++){
    if(obj.parties[i].active==true){
      tracker = new tracking.ColorTracker(obj.parties[i].couleur);
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
      trackerTask = tracking.track('#vidBox', tracker);
    }
  }
}

var afficherNom = function(x, y, w, h, nom) {
  var rect = document.createElement('div');
  rect.classList.add('rect');

  rect.innerText = nom;

  rect.style.width = w + 'px';
  rect.style.height = h + 'px';
  rect.style.left = (document.getElementById('vidBox').offsetLeft + x) + 'px';
  rect.style.top = (document.getElementById('vidBox').offsetTop + y) + 'px';
  document.getElementById('contenu').appendChild(rect);
  setTimeout(()=>{
    rect.remove()
  }, 0.5);
};

function initSalle(){
  peer = new Peer("SALLE001");
    peer.on('open', function(id) {
      document.getElementById('attenteCode').innerText = "Le Code de la Salle Virtuelle est: " + id;
    });


  peer.on('connection', function(_conn) {
      console.log("connecté", conn)
      conn = _conn;
      _conn.send('Hello!');
      conn.on('open', function() {
          // Receive messages
          conn.on('data', function(data) {
            console.log('Received', data);
            if(data=="COMMENCER"){
              document.getElementById("attente").setAttribute("class", "invisible");
              document.getElementById("contenu").setAttribute("class", "");
              initCam()//Etape 2
              initTracking()
              call = peer.call(conn.peer, stream);
              call.on('stream', function(_stream) {
                console.log("J'ai recu un stream: ", _stream);
                });
            }
            else if(data.nature=="obj"){
              trackerTask.stop();
              obj = data.data
              //initTracking()
            }
          });
      
          // Send messages
          conn.send('Hello!');
        });
      
  });
}



//Ordre d'execution
initSalle()
// initCam()
// initTracking()