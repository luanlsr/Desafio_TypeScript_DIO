// O código abaixo tem alguns erros e não funciona como deveria. Você pode identificar quais são e corrigi-los em um arquivo TS?

let botaoAtualizar = document.getElementById('atualizar-saldo');
let botaoLimpar = document.getElementById('limpar-saldo');
let soma = document.getElementById('soma')! as HTMLInputElement;
let campoSaldo = document.getElementById('campo-saldo');
const SALDO_ZERO = 0;

if(campoSaldo) {
    campoSaldo.innerHTML = SALDO_ZERO.toString()
}

function somarAoSaldo(soma: number) {
    if(campoSaldo) {
        campoSaldo.innerHTML = (Number(campoSaldo.innerHTML) + soma).toString();
        limparCampoSoma();
    }
}

function limparSaldo() {
    if(campoSaldo) {
        campoSaldo.innerHTML = SALDO_ZERO.toString();
    }
}
if(botaoAtualizar) {
    botaoAtualizar.addEventListener('click', function () {
        somarAoSaldo(Number(soma.value));
    });
}

if(botaoLimpar) {
    botaoLimpar.addEventListener('click', function () {
        limparSaldo();
    });
}


function limparCampoSoma() {
    soma.value = '';
}
/**
    <h4>Valor a ser adicionado: <input id="soma"> </h4>
    <button id="atualizar-saldo">Atualizar saldo</button>
    <button id="limpar-saldo">Limpar seu saldo</button>
    <h1>"Seu saldo é: " <span id="campo-saldo"></span></h1>
 */
