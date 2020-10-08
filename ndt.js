var url = "https://ezy.warum-llamas.tk/temp/ndt.html";

class NDT {
	constructor(name) {
		if (NDT.currentInstance !== undefined) {
			NDT.badInstance = name;
			setTimeout(function () {
				window[NDT.badInstance] = undefined;
			}, 100);
			throw "NDT: only one instance of NDT allowed";
		} else {
			this.startTime = new Date();

			fetch(url, {
				cache: "no-cache",
			})
				.then((response) => response.text())
				.then((response) => this.createDT(response));

			NDT.currentInstance = name;

			this.netReqs = [];

			document.addEventListener("keydown", function (e) {
				if (e.ctrlKey && e.shiftKey && e.key === "I") {
					window[NDT.currentInstance].showDT();
					e.preventDefault();
				}
			});

			this.isShown = false;
			this.isRun = false;
			this.current = "console";
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
		var i = 0;
		while (i < this.netReqs.length) {
			document.getElementById("network").appendChild(this.netReqs[i]);
			i++;
		}
		window.onerror = NDT.logE;
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
		var str = document.getElementById("console").value;
		console.log(document.getElementById("console").value);
		if (!str.includes("=")) {
			this.evalScript("function ndtAnon(){" + str + "}");
			this.evalScript(
				"window[NDT.currentInstance].responseFunc(ndtAnon())"
			);
		} else {
			this.evalScript(str);
			this.evalScript(
				"window[NDT.currentInstance].responseFunc(undefined)"
			);
		}
	}

	evalScript(script) {
		var blobText = script;

		var abc = new Blob([blobText], {
			type: "text/plain",
		});
		var def = new FileReader();

		def.addEventListener("loadend", function (e) {
			const script = document.createElement("script");
			script.src = URL.createObjectURL(abc);
			// create blob url and add as script source
			document.body.appendChild(script);
		});

		def.readAsText(abc);
	}

	responseFunc(data) {
		var code = document.createElement("DIV");
		if (typeof data == "object") data = JSON.stringify(data);
		code.innerHTML = "Result:" + data;
		document.getElementById("Hconsole").appendChild(code);
	}

	escapeHTML(html_str) {
		"use strict";

		return html_str.replace(/[&<>"]/g, function (tag) {
			var chars_to_replace = {
				"&": "&",
				"<": "<",
				">": ">",
				'"': '"',
			};

			return chars_to_replace[tag] || tag;
		});
	}
}

NDT.logE = function (a, b, c, d, e) {
	var msg =
		a +
		" At:" +
		b +
		" Line:" +
		c +
		" Col:" +
		d +
		" Time:" +
		window[NDT.currentInstance].getTS();
	var errmsg = document.createElement("DIV");
	errmsg.innerHTML = msg;
	var carrier = document.createElement("DIV");
	carrier.style.width = "100%";
	carrier.style.backgroundColor = "red";
	carrier.appendChild(errmsg);
	document.getElementById("Hconsole").appendChild(carrier);
};

var ndt = new NDT("ndt");

NDT.XMLHttpRequest = {};

NDT.XMLHttpRequest.open = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function () {
	this.args = arguments;
	NDT.XMLHttpRequest.open.apply(this, arguments);
};

NDT.XMLHttpRequest.send = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function () {
	if (this.onload !== null) this.ndtOnload = this.onload;
	this.startTS = window[NDT.currentInstance].getTS();
	this.onload = function () {
		var req = document.createElement("DIV");
		req.innerHTML =
			this.args[0] +
			"-" +
			this.args[1] +
			"-" +
			this.startTS +
			"-" +
			window[NDT.currentInstance].getTS() +
			"---" +
			"<a onclick=" +
			"console.log(this.parentElement.getAttribute('data-ndt-netreq'))" +
			">SHOWOPTIONS</a>";
		this.NDTinfo = {};
		this.NDTinfo.responseText = this.responseText;
		req.setAttribute("data-ndt-netreq", JSON.stringify(this.NDTinfo));
		window[NDT.currentInstance].netReqs.push(req);
		if (document.getElementById("network") !== null)
			document.getElementById("network").appendChild(req);
		if (this.ndtOnload !== undefined) this.ndtOnload();
	};
	NDT.XMLHttpRequest.send.apply(this, arguments);
};

var console = {};

console.log = function (txt) {
	var code = document.createElement("DIV");
	code.innerHTML =
		window[NDT.currentInstance].escapeHTML(txt) +
		" Time:" +
		window[NDT.currentInstance].getTS();
	document.getElementById("Hconsole").appendChild(code);
};
