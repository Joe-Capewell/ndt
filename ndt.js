document.addEventListener("keydown", function(e){
  if(e.ctrlKey && e.shiftKey && e.key==='I'){
    showDT();
    e.preventDefault();
  }
});

var isShown=false;
var isRun=false;

var current="network";

startTime = new Date();

fetch('https://ezy.warum-llamas.tk/temp/ndt.html',{cache:"no-cache"})
  .then(response => response.text())
  .then(response => createDT(response)
);

function getTS() {
  endTime = new Date();
  var timeDiff = (endTime - startTime)/1000; //in s
  return timeDiff;
}

function logE(a,b,c,d,e){
  var msg=a+" at:"+b+" Line:"+c+" Col:"+d+" Time:"+getTS();
  var errmsg=document.createElement("DIV");
  errmsg.innerHTML=msg;
  var carrier=document.createElement("DIV");
  carrier.style.width="100%";
  carrier.style.backgroundColor="red";
  carrier.appendChild(errmsg);
  document.getElementById("Hconsole").appendChild(carrier);
}

function showTab(tab){
  document.querySelector("."+current).style.display="none";
  document.querySelector("."+tab).style.display="initial";
  current=tab;
}
  
function createDT(dt){
  var br=document.createElement("BR");
  document.body.appendChild(br);
  var ndt=document.createElement("DIV");
  ndt.id="ndt";
  ndt.innerHTML=dt;
  ndt.style.position="absolute";
  ndt.style.bottom="0px";
  ndt.style.left="0px";
  ndt.style.backgroundColor="gray";
  ndt.style.width=window.innerWidth;
  ndt.style.height="50%";
  ndt.style.display="none";
  document.body.appendChild(ndt);
  window.onerror = logE;
}

function showDT(){
  if(!isShown){
    if(!isRun){
      showTab("console");
    }
    document.getElementById("ndt").style.display="initial";
    isShown=true;
  }else{
    document.getElementById("ndt").style.display="none";
    isShown=false;
  }
}

var xhrProxy0=XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open=function(){
  xhrProxy0.apply(this,arguments);
  this.args=arguments;
};

var xhrProxy1=XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send=function(){
  this.ndtOnload=this.onload;
  this.startTS=getTS();
  this.onload=function(){
    var req=document.createElement("DIV");
    req.innerHTML=this.args[0]+"-"+this.args[1]+"-"+this.startTS+"-"+getTS();
    document.getElementById("network").appendChild(req);
    this.ndtOnload();
  };
  xhrProxy1.apply(this,arguments);
};

function execCons(){
  var code=document.createElement("DIV");
  code.innerHTML=document.getElementById("console").value+" Time:"+getTS();
  document.getElementById("Hconsole").appendChild(code);
  evalScript(document.getElementById("console").value);
}

function evalScript(script){ //alternative to eval because of xss guards
    var blobText=script;
    
    var abc = new Blob([blobText],{type : "text/plain"});
    var def = new FileReader();

    def.addEventListener("loadend", function(e) {
        
        const script = document.createElement('script');
        script.src = URL.createObjectURL(abc); // create blob url and add as script source
        document.body.appendChild(script);
    });
    
    def.readAsText(abc);
}
