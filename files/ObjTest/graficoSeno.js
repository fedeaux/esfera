
var caixa=document.getElementById("myCanvas");
var desenho=caixa.getContext("2d");
var regua=caixa.getContext("2d");
var marcas=caixa.getContext("2d");
//var trecho = new Image();
var areaW = 600;
var areaH = 600;
var escalaPadrao = 50;
var centroW = areaW/2;
var centroH = areaH/2;
var valorA = document.getElementById("valorA").value;
var valorB = document.getElementById("valorB").value;
var valorC = document.getElementById("valorC").value;
var escala = 50;
var indiceEscala = 1;
var resultado = 1;
var padrao = /[0-9]$/;
var escalaDaVez=1;
var oldBack = new Image(); 


var valorIni1 = "y = x² - 9";
var valorIni2 = "y = x² - 6x + 9";
var valorIni3 = "y = 2x² - 10x + 12";
var valorIni4 = "y = -x² + x + 2";
var valorIni5 = "y = 3x²";
var valorIni6 = "y = x² + 1";
var valorIni7 = "y = x² + x + 1";

var paginaAtual = 1;

for (i=1;i<8;i++){
	this["oldBack"+i] = new Image();
	this["valores"+i] = new Array();
	this["valores"+i][0] = this["valorIni"+i];
	for (j=1;j<19;j++){
		this["valores"+i][j]="";	
	}	
}

document.getElementById("textos").innerHTML = valorIni1;
document.getElementById("letra").innerHTML = document.getElementById("muda"+paginaAtual).value;

function desenha_bt_enter() {
	resultado = 0;
	minhaCor = 1;
	//for (var h=1; h<2; h++) {
		valorA = converteVirgula(document.getElementById("valorA").value);
		valorB = converteVirgula(document.getElementById("valorB").value);
		valorC = converteVirgula(document.getElementById("valorC").value);
		
		var conta = -(valorB * valorB - 4 * valorA * valorC)/(4* valorA);
		var conta2 = valorC;
		//marcadorPonto.x = -b/(2* a);
		//marcadorPonto.y = -valorDelta/(4* a);
		
		if (conta < 0) {
			conta= conta*(-1);
		}
		if (conta2 < 0) {
			conta2= conta2*(-1);
		}
		if (resultado < conta) {
			resultado = conta;
		}
		if (resultado < conta2) {
			resultado = conta2;
		}
	//}
	if (document.getElementById("valorA").value == "-"){
		document.getElementById("valorA").value = "-1";
		valorA = -1;
	}
	if (document.getElementById("valorB").value == "-"){
		document.getElementById("valorB").value = "-1";
		valorB = -1;
	}
	if (document.getElementById("valorC").value == "-"){
		document.getElementById("valorC").value = "-1";
		valorC = -1;
	}
	
	
	if (valorA == "" && valorB == "" && valorC == "") {
		//campo1.caixa_azul.visible = false;
		document.getElementById("textos").innerHTML = "Por favor preencha todos os parâmetros corretamente.";
		document.getElementById("textos").className = "textosErradas";
		limparLinhas();
		document.getElementById("somErro").play();
	} else if (valorA == 0 || valorA == "," || valorA == " ") {
		//campo1.caixa_azul.visible = false;
		document.getElementById("textos").innerHTML = "Atenção: a ≠ 0.";
		document.getElementById("textos").className = "textosErradas";
		limparLinhas();
		document.getElementById("somErro").play();
	} else {
		if (document.getElementById("valorB").value == ""){
			document.getElementById("valorB").value = 0;
		} 
		if (document.getElementById("valorC").value == ""){
			document.getElementById("valorC").value = 0;
		} 
		if(!padrao.test(document.getElementById("valorA").value) || !padrao.test(document.getElementById("valorB").value) || !padrao.test(document.getElementById("valorC").value)){
				
				limparTudo();
				
				if(!padrao.test(document.getElementById("valorC").value)){
					document.getElementById("textos").innerHTML = "O valor do campo 'C' não é número.";
				}
				if(!padrao.test(document.getElementById("valorB").value)){
					document.getElementById("textos").innerHTML = "O valor do campo 'B' não é número.";
				}
				if(!padrao.test(document.getElementById("valorA").value)){
					document.getElementById("textos").innerHTML = "O valor do campo 'A' não é número.";
				}
				
				//input.setCustomValidity("O valor do campo 'A' não é número.");//input.validationMessage;
				
				document.getElementById("somErro").play();
				document.getElementById("textos").className = "textosErradas";
		} else {
			somaA_B();
		}
		
	}
}
function somaA_B() {
	escala = 50
	indiceEscala = 1
	if (resultado > 5) {
		resultado = parseInt(Math.round(resultado));
		for (var j = resultado; j % 5 != 0; j++) {
			resultado++;
		}
		/////////////////////////////////////////////
		indiceEscala =(parseInt(resultado/5));
		escala= 50/(parseInt(resultado/5));
		/////////////////////////////////////////////
	} else {
		escala = 50;
	}
	//indiceEscala = indiceEscala/2
	
	
	escreveFormula();
	draw();
}
function escreveFormula() {// y=a+b.sen(c.x+d)
	//for (var R:Number=1; R<2; R++) {
		//this["campo" + R].caixa_azul.visible = true;
		if (valorA == 1){
			document.getElementById("textos").innerHTML = "y = x²";
		}  else if (valorA == Number(-1)){
			document.getElementById("textos").innerHTML = "y = -x²";
		} else {
			document.getElementById("textos").innerHTML = "y = " + desconverteVirgula(converteVirgula(document.getElementById("valorA").value).toString()) + "x²";
		}
		
		if (document.getElementById("valorB").value == "" ||  converteVirgula(document.getElementById("valorB").value) == 0){
			
		} else if (document.getElementById("valorB").value == "1"){
			document.getElementById("textos").innerHTML += " + x";
		} else if (document.getElementById("valorB").value == "-1"){
			document.getElementById("textos").innerHTML += " - x";
		} else if (converteVirgula(document.getElementById("valorB").value) < 0){
			document.getElementById("textos").innerHTML += " " + desconverteVirgula(converteVirgula(document.getElementById("valorB").value).toString()) + "x";
		} else {
			document.getElementById("textos").innerHTML += " + " + desconverteVirgula(converteVirgula(document.getElementById("valorB").value).toString()) + "x";
		}
		
		if (document.getElementById("valorC").value == "" ||  converteVirgula(document.getElementById("valorC").value) == 0){
			
		} else if (valorC < 0){
			document.getElementById("textos").innerHTML += " " + desconverteVirgula(converteVirgula(document.getElementById("valorC").value).toString());
		} else {
			document.getElementById("textos").innerHTML += " + " + desconverteVirgula(converteVirgula(document.getElementById("valorC").value).toString());
		}
		
		document.getElementById("valorA").value = desconverteVirgula(converteVirgula(document.getElementById("valorA").value).toString())
		document.getElementById("valorB").value = desconverteVirgula(converteVirgula(document.getElementById("valorB").value).toString())
		document.getElementById("valorC").value = desconverteVirgula(converteVirgula(document.getElementById("valorC").value).toString())
	
		document.getElementById("textos").className = "textosCertos";
	//}
}
function draw() {
	document.getElementById("somCerto").play();
	limparLinhas();
	
	//desenho.restore();
	desenho.beginPath();
	desenho.strokeStyle = "#ff0033";
	regua.lineWidth = 2;
	regua.lineJoin = "round";
	
	iniX = -centroW;
	finalX = areaW;
	var valorDelta = valorB * valorB - 4 * valorA * valorC;
	
	desenho.moveTo((iniX*Math.sqrt(escala))+centroW, (((valorA)*(iniX*iniX)+  (valorB*Math.sqrt(escala))* iniX + (valorC*escala)) *(-1))+centroH);
	// marca ponto inicial;
	/////////a * x² + b * x + c
	for (var id=iniX; id<=finalX; id++) {//desenha grafico
		desenho.lineTo((id*Math.sqrt(escala))+centroW, (((valorA)*(id*id)+  (valorB*Math.sqrt(escala))* id + (valorC*escala))  *(-1))+centroH);		
	}
	//desenho.closePath();
	desenho.stroke();
	//desenho.restore();
	
	////// vertice 
		//if((-valorB/(2* valorA))* escala < areaH && (-valorB/(2* valorA))* escala > 0 && (-valorDelta/(4* valorA))* -escala < areaW && (-valorDelta/(4* valorA))* -escala > 0){
			var marcadorPontoX = ((-valorB/(2* valorA))* escala)+centroW;
			var marcadorPontoY = ((-valorDelta/(4* valorA))* -escala)+centroH;
		//}
		marcas.beginPath();
		marcas.strokeStyle = "#0000ff";
		marcas.lineWidth = 2;
		marcas.lineCap = "round";
		marcas.arc(marcadorPontoX, marcadorPontoY, 4, 0, Math.PI * 2, false);
		marcas.stroke();
		
		marcas.beginPath();
		marcas.lineWidth = 1;
		marcas.lineJoin = "round";
		marcas.strokeStyle = "#00cc00";
		marcas.moveTo(marcadorPontoX, centroH);
		marcas.lineTo(marcadorPontoX, marcadorPontoY);
		marcas.lineTo(centroW, marcadorPontoY);
		marcas.stroke();
		
		//}
	////// raizes ou zeros
		//trace(valorDelta);
		if(valorDelta>=0){
			if(((-valorB-Math.sqrt(valorDelta))/(2 * valorA)) * escala < 310 && ((-valorB-Math.sqrt(valorDelta))/(2 * valorA)) * escala > -310){
				
				var r1X = (((-valorB-Math.sqrt(valorDelta))/(2 * valorA)) * escala)+centroW;;
				var r1Y = (0)+centroH;
			}
			if(((-valorB+Math.sqrt(valorDelta))/(2 * valorA)) * escala < 310 && ((-valorB+Math.sqrt(valorDelta))/(2 * valorA)) * escala > -310){
				
				var r2X = (((-valorB+Math.sqrt(valorDelta))/(2 * valorA)) * escala)+centroW;;
				var r2Y = (0)+centroH;
			}
		}
		marcas.beginPath();
		marcas.strokeStyle = "#0000ff";
		marcas.lineWidth = 2;
		marcas.lineCap = "round";
		marcas.arc(r1X, r1Y, 4, 0, Math.PI * 2, false);
		marcas.stroke();
		
		marcas.beginPath();
		marcas.strokeStyle = "#0000ff";
		marcas.lineWidth = 2;
		marcas.lineCap = "round";
		marcas.arc(r2X, r2Y, 4, 0, Math.PI * 2, false);
		marcas.stroke();
		
		////// cruza eixo Y no ponto 0 do eixo X 
		//if(c *(-escala) < (areaH)+centroH && c *(-escala) > (0)+centroH){
			cX = (0)+centroW;
			cY = (valorC *(-escala))+centroH;
		//}
		marcas.beginPath();
		marcas.strokeStyle = "#0000ff";
		marcas.lineWidth = 2;
		marcas.lineCap = "round";
		marcas.arc(cX, cY, 4, 0, Math.PI * 2, false);
		marcas.stroke();
	
	linhas(indiceEscala);
	grava();
}

function zoom_mais() {
	indiceEscala = indiceEscala/2
	escala = escala*2;
	if (valorA == 0 || valorA == "," || valorA == " ") {
		document.getElementById("textos").innerHTML = "Atenção: a ≠ 0.";
		document.getElementById("somErro").play();
		document.getElementById("textos").className = "textosErradas";
	} else {
		draw(); 
		escreveFormula();
	}
}
function zoom_menos() {
	indiceEscala = indiceEscala*2
	escala = escala/2;
	
	if (valorA == 0 || valorA == "," || valorA == " ") {
		document.getElementById("textos").innerHTML = "Atenção: a ≠ 0.";
		document.getElementById("somErro").play();
		document.getElementById("textos").className = "textosErradas";
	} else {
		draw(); 
		escreveFormula();
	}
}
var numZoom = 1;
function maisZ() {
	//document.getElementById("textos").className = "textosErradas";
	numZoom += 0.1;
	document.getElementById("principal").style.zoom = numZoom;
	document.getElementById("principal").style.MozTransform = 'scale('+numZoom+')';
	document.getElementById("principal").style.WebkitTransform = 'scale('+numZoom+')';
}
function menosZ() {
	//document.getElementById("textos").className = "textosErradas";
	numZoom -= 0.1;
	document.getElementById("principal").style.zoom = numZoom;
	document.getElementById("principal").style.MozTransform = 'scale('+numZoom+')';
	document.getElementById("principal").style.WebkitTransform = 'scale('+numZoom+')';
}

function converteVirgula(campo) {//substitui virgula por ponto
	var str = campo.split(",").join(".");
	return Number(str);//devolve transformado em número
}

function desconverteVirgula(valor) {//substitui virgula por ponto
	var str = valor.split(".").join(",");
	return String(str);//devolve transformado em número
}

function linhas(indice) {
	regua.beginPath();
	
	regua.fillStyle = '#000';
	regua.font = 'normal 18px sans-serif';
	
	regua.lineWidth = 1;
	regua.lineJoin = "round";
	regua.strokeStyle = "#777";
	
	for (var id=1; id<=5; id++) {
		regua.moveTo(centroW-3, centroH-escalaPadrao*id);
		regua.lineTo(centroW+3, centroH-escalaPadrao*id);
		regua.stroke();
	
		regua.moveTo(centroW-3, centroH+escalaPadrao*id);
		regua.lineTo(centroW+3, centroH+escalaPadrao*id);
		regua.stroke();
	
		regua.moveTo(centroW-escalaPadrao*id, centroH-3);
		regua.lineTo(centroW-escalaPadrao*id, centroH+3);
		regua.stroke();
	
		regua.moveTo(centroW+escalaPadrao*id, centroH-3);
		regua.lineTo(centroW+escalaPadrao*id, centroH+3);
		regua.stroke();
		
		regua.fillText(desconverteVirgula(String(parseInt( (id-6) * indice*100)/100 )), centroW+10, centroH-escalaPadrao*id +5+300);
		regua.fillText(desconverteVirgula(String(parseInt( (6-id) * indice*100)/100 )), centroW+10, centroH+escalaPadrao*id +5-300);
		regua.fillText(desconverteVirgula(String(parseInt( (6-id) * indice*100)/100 )), centroW-escalaPadrao*id-3+300, centroH+10 +10);
		regua.fillText(desconverteVirgula(String(parseInt( (id-6) * indice*100)/100 )), centroW+escalaPadrao*id-8-300, centroH+10 +10);
	}
	regua.fillText("x", areaW-15, centroH+20);
	regua.fillText("y", centroW+13, 17);
	regua.fillText("0", centroW+6, centroH+21);
	
	regua.moveTo(centroW, 10);
	regua.lineTo(centroW, areaH-10);
	regua.stroke();
	
	regua.moveTo(10, centroH);
	regua.lineTo(areaW-10,centroH);
	regua.stroke();
	
	regua.beginPath();
	regua.fillStyle = '#777';
	regua.moveTo(centroW-5, 15);
	regua.lineTo(centroW,10);
	regua.lineTo(centroW+5,15);
	regua.fill();
	
	regua.moveTo(areaW-15, centroH-5);
	regua.lineTo(areaW-10, centroH);
	regua.lineTo(areaW-15, centroH+5);
	regua.fill();
	
}


function limparLinhas() {
	/*trecho = desenho.getImageData(0, 0, 200, 100);
	desenho.putImageData(trecho, 100, 100);*/
	//desenho.beginPath();
	desenho.fillStyle = "#fff";
    desenho.fillRect(0, 0, areaW, areaH);
	//desenho.closePath();
	linhas(indiceEscala);
	grava();
}
function limparTudo() {
	/*trecho = desenho.getImageData(0, 0, 200, 100);
	desenho.putImageData(trecho, 100, 100);*/
	//desenho.beginPath();
	desenho.fillStyle = "#fff";
    desenho.fillRect(0, 0, areaW, areaH);
	//desenho.closePath();
	linhas(1);
	
	document.getElementById("textos").className = "textosCertos";
	document.getElementById("textos").innerHTML = this["valorIni"+paginaAtual];
	grava();
}

function grava(){
	oldBack = desenho.getImageData(0, 0, areaW, areaH);
	this["oldBack"+paginaAtual]=oldBack;
	this["valores"+paginaAtual][0]=String(document.getElementById("textos").innerHTML);
	
}
function trocaTela(pagina){
	this["valores"+paginaAtual][1]=String(document.getElementById("valorA").value);
	this["valores"+paginaAtual][2]=String(document.getElementById("valorB").value);
	this["valores"+paginaAtual][3]=String(document.getElementById("valorC").value);
	this["valores"+paginaAtual][4]=String(document.getElementById("valorB1").value);
	this["valores"+paginaAtual][5]=String(document.getElementById("valorB2").value);
	this["valores"+paginaAtual][6]=String(document.getElementById("valorB3").value);
	this["valores"+paginaAtual][7]=String(document.getElementById("valorB4").value);
	this["valores"+paginaAtual][8]=String(document.getElementById("valorC1").value);
	this["valores"+paginaAtual][9]=String(document.getElementById("valorC2").value);
	this["valores"+paginaAtual][10]=String(document.getElementById("valorC3").value);
	this["valores"+paginaAtual][11]=String(document.getElementById("valorC4").value);
	this["valores"+paginaAtual][12]=String(document.getElementById("valorC5").value);
	this["valores"+paginaAtual][13]=String(document.getElementById("valorD1").value);
	this["valores"+paginaAtual][14]=String(document.getElementById("valorD2").value);
	this["valores"+paginaAtual][15]=String(document.getElementById("valorD3").value);
	this["valores"+paginaAtual][16]=String(document.getElementById("valorD4").value);
	this["valores"+paginaAtual][17]=String(document.getElementById("valorD5").value);
	this["valores"+paginaAtual][18]=String(document.getElementById("valorD6").value);
	
	paginaAtual = pagina;
	if(String(this["valores"+paginaAtual][0]) == "Atenção: a ≠ 0." || 
		String(this["valores"+paginaAtual][0]) == "Por favor preencha todos os parâmetros corretamente." ||
		String(this["valores"+paginaAtual][0]) == "O valor do campo 'A' não é número." ||
		String(this["valores"+paginaAtual][0]) == "O valor do campo 'B' não é número." ||
		String(this["valores"+paginaAtual][0]) == "O valor do campo 'C' não é número."
		){
		document.getElementById("textos").className = "textosErradas";
		document.getElementById("textos").innerHTML = "Por favor preencha todos os parâmetros corretamente.";
	} else {
		document.getElementById("textos").className = "textosCertos";
		document.getElementById("textos").innerHTML = String(this["valores"+paginaAtual][0]);
	}
	
	desenho.putImageData(this["oldBack"+paginaAtual], 0, 0);
	document.getElementById("valorA").value = this["valores"+paginaAtual][1];
	document.getElementById("valorB").value = this["valores"+paginaAtual][2];
	document.getElementById("valorC").value = this["valores"+paginaAtual][3];
	document.getElementById("valorB1").value = this["valores"+paginaAtual][4];
	document.getElementById("valorB2").value = this["valores"+paginaAtual][5];
	document.getElementById("valorB3").value = this["valores"+paginaAtual][6];
	document.getElementById("valorB4").value = this["valores"+paginaAtual][7];
	calculaDelta();
	document.getElementById("valorC1").value = this["valores"+paginaAtual][8];
	document.getElementById("valorC2").value = this["valores"+paginaAtual][9];
	document.getElementById("valorC3").value = this["valores"+paginaAtual][10];
	document.getElementById("valorC4").value = this["valores"+paginaAtual][11];
	document.getElementById("valorC5").value = this["valores"+paginaAtual][12];
	document.getElementById("valorD1").value = this["valores"+paginaAtual][13];
	document.getElementById("valorD2").value = this["valores"+paginaAtual][14];
	document.getElementById("valorD3").value = this["valores"+paginaAtual][15];
	document.getElementById("valorD4").value = this["valores"+paginaAtual][16];
	document.getElementById("valorD5").value = this["valores"+paginaAtual][17];
	document.getElementById("valorD6").value = this["valores"+paginaAtual][18];
	
	document.getElementById("letra").innerHTML = document.getElementById("muda"+paginaAtual).value;
}

function traca(){
	
	var posicaoX = document.getElementById("sliderH").value * 6;
	var posicaoY = (document.getElementById("sliderV").value * -6)+600;
	
	//document.getElementById("textos").innerHTML = posicaoX;
	
	desenho.putImageData(oldBack, 0, 0);
		//marcas.lineWidth = 1;
		//marcas.lineJoin = "round";
		//marcas.strokeStyle = "#00aa55";
	desenho.beginPath();
	desenho.lineWidth = 1;
	desenho.lineJoin = "round";
	desenho.strokeStyle = "#00aaaa";
	desenho.font = 'normal 12px sans-serif';
	
	desenho.moveTo(posicaoX, 0);
	desenho.lineTo(posicaoX, areaH);
	desenho.stroke();
	
	desenho.moveTo(0, posicaoY);
	desenho.lineTo(areaW, posicaoY);
	desenho.stroke();
	
	
	var psX = 0;
	var psY = 0;
	if(posicaoX >areaW - 90 ){
		psX = posicaoX-90;
	} else {
		psX = posicaoX+10;
	}
	if(posicaoY >areaH - 30 ){
		psY = posicaoY -30;
	} else {
		psY = posicaoY +10;
	}
	
	desenho.fillStyle = "#ddd";
    desenho.fillRect(psX, psY, 73, 20);
	
	desenho.fillStyle = '#000';
	desenho.fillText("("+((posicaoX-centroW)/escala).toFixed(1)+","+((centroH-posicaoY)/escala).toFixed(1)+")", psX+5, psY +14);
}

function calculaDelta(){
	var valorA = document.getElementById("valorB2").value;
	var valorB = document.getElementById("valorB1").value;
	var valorC = document.getElementById("valorB3").value;
	var resposta = (valorB*valorB)-4*valorA*valorC;
	document.getElementById("valorB4").value = desconverteVirgula(String(resposta));;
	if(resposta<0){
		document.getElementById("vazia").style.display = 'block';
		document.getElementById("form3").style.display = 'none';
	} else {
		document.getElementById("vazia").style.display = 'none';
		document.getElementById("form3").style.display = 'block';
	}
}//document.getElementById("textos").className = "textosCertos";

function calculaRaiz(){
	var valorA = document.getElementById("valorC3").value;
	var valorB = document.getElementById("valorC1").value;
	var valorD = document.getElementById("valorC2").value;
	var resposta1 = (-(valorB)+ Math.sqrt(valorD)) / (2*valorA);
	var resposta2 = (-(valorB)- Math.sqrt(valorD)) / (2*valorA);
	document.getElementById("valorC4").value = desconverteVirgula(String(resposta1));
	document.getElementById("valorC5").value = desconverteVirgula(String(resposta2));
}

function calculaVerticeX(){
	var valorA = document.getElementById("valorD2").value;
	var valorB = document.getElementById("valorD1").value;
	var resposta = -(valorB) / (2*valorA);
	document.getElementById("valorD3").value = desconverteVirgula(String(resposta));
}
function calculaVerticeY(){
	var valorA = document.getElementById("valorD5").value;
	var valorD = document.getElementById("valorD4").value;
	var resposta = -(valorD) / (4*valorA);
	document.getElementById("valorD6").value = desconverteVirgula(String(resposta));
}
			
function videoTela(){
	if(document.getElementById("principal").style.display == 'none'){
		document.getElementById("principal").style.display = 'block';
		document.getElementById("video").style.display = 'none';
	} else {
		document.getElementById("principal").style.display = 'none';
		document.getElementById("video").style.display = 'block';
	}
}

linhas(indiceEscala);
grava();

for (ib=1;ib<8;ib++){
	this["oldBack"+ib] = desenho.getImageData(0, 0, areaW, areaH);
}
document.getElementById("video").style.display = 'none';

