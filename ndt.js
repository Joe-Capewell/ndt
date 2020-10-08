var url="http://127.0.0.1:8887/ndt.html";

class NDT{
  
constructor(name){
  if(NDT.currentInstance!==undefined){
    alert("more than one instance of NDT will break things!");
  }else{
  
  alert(this.constructor.name);
  
  this.startTime=new Date();
  
  fetch(url, {
    cache: "no-cache"
  }).then(response=>response.text())
  .then(response=>this.createDT(response));
  
  NDT.currentInstance=name;
  
  document.addEventListener("keydown", function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        window[NDT.currentInstance].showDT();
        e.preventDefault();
    }
  });
  
  this.isShown=false;
  this.isRun=false;
  this.current="console";
  
  window.onerror=function(a, b, c, d, e) {
    var msg = a + " At:" + b + " Line:" + c + " Col:" + d + " Time:" + window[NDT.currentInstance].getTS();
    var errmsg = document.createElement("DIV");
    errmsg.innerHTML = msg;
    var carrier = document.createElement("DIV");
    carrier.style.width = "100%";
    carrier.style.backgroundColor = "red";
    carrier.appendChild(errmsg);
    document.getElementById("Hconsole").appendChild(carrier);
}
  }
}
  
getTS() {
    var endTime = new Date();
    var timeDiff = (endTime - this.startTime) / 1000;
    return timeDiff;
}

showTab(tab) {
    document.querySelector("." + this.current).style.display = "none";
    document.querySelector("." + tab).style.display = "initial";
    this.current = tab;
}

createDT(dt) {
    var br = document.createElement("BR");
    document.body.appendChild(br);
    var ndt = document.createElement("DIV");
    ndt.id = "ndt";
    ndt.innerHTML = dt;
    ndt.style.position = "absolute";
    ndt.style.bottom = "0px";
    ndt.style.left = "0px";
    ndt.style.backgroundColor = "gray";
    ndt.style.width = window.innerWidth;
    ndt.style.height = "50%";
    ndt.style.display = "none";
    document.body.appendChild(ndt);
    i = 0;
    while (i < netReqs.length) {
        document.getElementById("network").appendChild(netReqs[i]);
        i++;
    }
    window.onerror = logE;
}

showDT() {
    if (!this.isShown) {
        if (!this.isRun) {
            this.showTab("network");
            this.showTab("console");
        }
        document.getElementById("ndt").style.display = "initial";
        this.isShown = true;
    } else {
        document.getElementById("ndt").style.display = "none";
        this.isShown = false;
    }
}

execCons() {
    var code = document.createElement("DIV");
    code.innerHTML = document.getElementById("console").value + " Time:" + this.getTS();
    document.getElementById("Hconsole").appendChild(code);
    var str = document.getElementById("console").value;
    if(!str.includes("=")){
        this.evalScript("function ndtAnon(){" + str + "}");
        this.evalScript("window[NDT.currentInstance].responseFunc(ndtAnon())");
    }else{
        this.evalScript(str);
        this.evalScript("window[NDT.currentInstance].responseFunc(undefined)");
    }
}

evalScript(script) {
    var blobText = script;

    var abc = new Blob([blobText],{
        type: "text/plain"
    });
    var def = new FileReader();

    def.addEventListener("loadend", function(e) {

        const script = document.createElement('script');
        script.src = URL.createObjectURL(abc);
        // create blob url and add as script source
        document.body.appendChild(script);
    });

    def.readAsText(abc);
}

responseFunc(data) {
    var code = document.createElement("DIV");
    if (typeof (data) == "object")
        data = JSON.stringify(data);
    code.innerHTML = "Result:" + data;
    document.getElementById("Hconsole").appendChild(code);
}

}

var ndt=new NDT("ndt");
