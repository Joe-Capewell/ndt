var url = "https://ezy.warum-llamas.tk/temp/ndt.html";

var oldlog = console.log;

var console = {};

console.log = function (txt) {
	var code = document.createElement("DIV");
	code.innerHTML =
		window[NDT.currentInstance].escapeHTML(txt) +
		" Time:" +
		window[NDT.currentInstance].getTS();
	document.getElementById("Hconsole").appendChild(code);
};

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
			this.select = true;
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
		ndt.style.zIndex = 9999;
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
				this.showTab("dom");
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
			this.evalScript(
				"function ndtAnon(){" +
					str +
					"}" +
					"\n" +
					"window[NDT.currentInstance].responseFunc(ndtAnon());"
			);
		} else {
			this.evalScript(
				str +
					"\n" +
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
		if (typeof data == "object") data = JSON.stringify(data);
		var text = "Result:" + data;
		console.log(text);
	}

	escapeHTML(txt) {
		var count =
			(txt.match(/</g) || []).length +
			(txt.match(/>/g) || []).length +
			(txt.match(/\n/g) || []).length;
		var i = 0;
		while (i < count) {
			txt = txt.replace("<", "&lt;");
			txt = txt.replace(">", "&gt;");
			i++;
		}
		var t = 0;
		while (t < count) {
			txt = txt.replace("\n", "<br data-ndt-nl>");
			t++;
		}
		return txt;
	}

	unescapeHTML(txt) {
		var count =
			(txt.match(/&lt;/g) || []).length +
			(txt.match(/&gt;/g) || []).length +
			(txt.match(/<br data-ndt-nl>/g) || []).length;
		var i = 0;
		while (i < count) {
			txt = txt.replace("&lt;", "<");
			txt = txt.replace("&gt;", ">");
			i++;
		}
		var t = 0;
		while (t < count) {
			txt = txt.replace("<br data-ndt-nl>", "\n");
			t++;
		}
		return txt;
	}

	updateDom() {
		var elems = document.querySelectorAll(
			"*:not(html):not(body):not(head)"
		);
		var i = 0;
		while (i < elems.length) {
			elems[i].setAttribute("data-ndt-id", i);
			i++;
		}
		var htmlDoc = new DocumentFragment();
		var html = document.createElement("HTML");
		html.id = "ndtDoc";
		html.innerHTML = document.documentElement.innerHTML;
		htmlDoc.appendChild(html);
		var ndtElem = htmlDoc.getElementById("ndt");
		ndtElem.parentNode.removeChild(ndtElem);
		document.getElementById("dom").innerHTML = this.escapeHTML(
			htmlDoc.getElementById("ndtDoc").innerHTML
		);
	}

	saveDom() {
		var oldDomDoc = new DocumentFragment();
		var oldDom = document.createElement("HTML");
		oldDom.innerHTML = document.documentElement.innerHTML;
		oldDomDoc.appendChild(oldDom);
		var ndtElem = oldDomDoc.getElementById("ndt");
		ndtElem.parentNode.removeChild(ndtElem);
		var oldElems = oldDomDoc.querySelectorAll("[data-ndt-id]");

		var newDom = document.createElement("HTML");
		var userHTML = document.getElementById("dom").innerHTML;
		newDom.innerHTML = this.unescapeHTML(userHTML);
		var newElems = newDom.querySelectorAll(
			"*:not(html):not(body):not(head):not([data-ndt-nl])"
		);

		var i = 0;
		var diffs = [];

		while (i < oldElems.length) {
			if (newElems[i].innerHTML !== oldElems[i].innerHTML) {
				diffs.push(newElems[i]);
			}
			i++;
		}

		var t = 0;
		while (t < diffs.length) {
			var currentElem = document.querySelectorAll(
				'[data-ndt-id="' + diffs[t].getAttribute("data-ndt-id") + '"]'
			)[0];
			currentElem.innerHTML = diffs[t].innerHTML;
			t++;
		}
	}

	toggleSelect() {
		alert(this.select);
		if (this.select) {
			document.addEventListener("click", (e) => {
				alert(
					document.elementFromPoint(e.clientX, e.clientY).outerHTML
				);
				e.preventDefault();
				this.select = false;
			});
		} else {
			this.select = true;
		}
	}
}

NDT.logE = function (a, b, c, d, e) {
	var msg = e.stack;
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
			"console.log(this.parentElement.getAttribute('data-ndt-netreq'));window[NDT.currentInstance].showTab('console')" +
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
