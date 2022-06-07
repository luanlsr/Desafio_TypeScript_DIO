"use strict";
// Um desenvolvedor tentou criar um projeto que consome a base de dados de filme do TMDB para criar um organizador de filmes, mas desistiu 
// pois considerou o seu código inviável. Você consegue usar typescript para organizar esse código e a partir daí aprimorar o que foi feito?
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// A ideia dessa atividade é criar um aplicativo que: 
//    - Busca filmes
//    - Apresenta uma lista com os resultados pesquisados
//    - Permite a criação de listas de filmes e a posterior adição de filmes nela
// Todas as requisições necessárias para as atividades acima já estão prontas, mas a implementação delas ficou pela metade (não vou dar tudo de graça).
// Atenção para o listener do botão login-button que devolve o sessionID do usuário
// É necessário fazer um cadastro no https://www.themoviedb.org/ e seguir a documentação do site para entender como gera uma API key https://developers.themoviedb.org/3/getting-started/introduction
let loginButton = document.getElementById('login-button');
let searchButton = document.getElementById('search-button');
let searchContainer = document.getElementById('search-container');
let searchInput = document.getElementById('search');
let login = document.getElementById('login');
let senha = document.getElementById('senha');
let apiKeyInput = document.getElementById('api-key');
let loginContainer = document.getElementById('login-container');
let btnBack = document.getElementById('btn-back');
let usuario1 = {
    username: "",
    password: ""
};
let api = {
    apiKey: "",
    listId: "7101979",
    sessionId: "",
    requestToken: ""
};
if (loginButton) {
    loginButton.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
        yield criarRequestToken();
        yield logar();
        yield criarSessao();
    }));
}
if (searchButton) {
    searchButton.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
        let lista = document.getElementById("lista");
        if (lista) {
            lista.outerHTML = "";
        }
        let query = searchInput.value;
        let listaDeFilmes = yield procurarFilme(query);
        let ul = document.createElement('ul');
        ul.id = "lista";
        if (listaDeFilmes) {
            for (const item of listaDeFilmes.results) {
                let li = document.createElement('li');
                let img = document.createElement('img');
                let h3 = document.createElement('h3');
                h3.appendChild(document.createTextNode(item.original_title));
                // li.appendChild(document.createTextNode(item.original_title))
                img.src = `https://image.tmdb.org/t/p/w500${item.backdrop_path}`;
                ul.appendChild(li);
                li.appendChild(h3);
                li.appendChild(img);
            }
        }
        console.log(listaDeFilmes);
        if (searchContainer) {
            searchContainer.appendChild(ul);
        }
    }));
}
function preencherLogin() {
    usuario1.username = login.value;
    validateLoginButton();
}
function preencherSenha() {
    usuario1.password = senha.value;
    validateLoginButton();
}
function preencherApi() {
    api.apiKey = apiKeyInput.value;
    validateLoginButton();
}
function validateLoginButton() {
    if (loginButton) {
        if (usuario1.password && usuario1.username && api.apiKey) {
            loginButton.disabled = false;
        }
        else {
            loginButton.disabled = true;
        }
    }
}
class HttpClient {
    static get({ url, method, body }) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let request = new XMLHttpRequest();
                request.open(method, url, true);
                request.onload = () => {
                    if (request.status >= 200 && request.status < 300) {
                        resolve(JSON.parse(request.responseText));
                        console.log("OK | 200");
                        removeLogin();
                    }
                    else {
                        reject({
                            status: request.status,
                            statusText: request.statusText
                        });
                    }
                };
                request.onerror = () => {
                    reject({
                        status: request.status,
                        statusText: request.statusText
                    });
                };
                if (body) {
                    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                    body = JSON.stringify(body);
                }
                request.send(body);
            });
        });
    }
}
function procurarFilme(query) {
    return __awaiter(this, void 0, void 0, function* () {
        query = encodeURI(query);
        console.log(query);
        let result = yield HttpClient.get({
            url: `https://api.themoviedb.org/3/search/movie?api_key=${api.apiKey}&query=${query}`,
            method: "GET"
        });
        return result;
    });
}
function adicionarFilme(filmeId) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield HttpClient.get({
            url: `https://api.themoviedb.org/3/movie/${filmeId}?api_key=${api.apiKey}&language=en-US`,
            method: "GET"
        });
        console.log(result);
    });
}
function criarRequestToken() {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield HttpClient.get({
            url: `https://api.themoviedb.org/3/authentication/token/new?api_key=${api.apiKey}`,
            method: "GET"
        });
        api.requestToken = result.request_token;
    });
}
function logar() {
    return __awaiter(this, void 0, void 0, function* () {
        yield HttpClient.get({
            url: `https://api.themoviedb.org/3/authentication/token/validate_with_login?api_key=${api.apiKey}`,
            method: "POST",
            body: {
                username: `${usuario1.username}`,
                password: `${usuario1.password}`,
                request_token: `${api.requestToken}`
            }
        });
    });
}
function criarSessao() {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield HttpClient.get({
            url: `https://api.themoviedb.org/3/authentication/session/new?api_key=${api.apiKey}&request_token=${api.requestToken}`,
            method: "GET"
        });
        api.sessionId = result.session_id;
    });
}
function criarLista(nomeDaLista, descricao) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield HttpClient.get({
            url: `https://api.themoviedb.org/3/list?api_key=${api.apiKey}&session_id=${api.sessionId}`,
            method: "POST",
            body: {
                name: nomeDaLista,
                description: descricao,
                language: "pt-br"
            }
        });
        console.log(result);
    });
}
function adicionarFilmeNaLista(filmeId, listaId) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield HttpClient.get({
            url: `https://api.themoviedb.org/3/list/${listaId}/add_item?api_key=${api.apiKey}&session_id=${api.sessionId}`,
            method: "POST",
            body: {
                media_id: filmeId
            }
        });
        console.log(result);
    });
}
function pegarLista() {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield HttpClient.get({
            url: `https://api.themoviedb.org/3/list/${api.listId}?api_key=${api.apiKey}`,
            method: "GET"
        });
        console.log(result);
    });
}
btnBack === null || btnBack === void 0 ? void 0 : btnBack.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    yield addLogin();
    btnBack.style.display = "none";
}));
function removeLogin() {
    return __awaiter(this, void 0, void 0, function* () {
        loginContainer.style.display = "none";
        searchContainer.style.display = "flex";
        btnBack.style.display = "flex";
    });
}
function addLogin() {
    return __awaiter(this, void 0, void 0, function* () {
        loginContainer.style.display = "flex";
        searchContainer.style.display = "none";
    });
}
function removeSearch() {
    return __awaiter(this, void 0, void 0, function* () {
        searchContainer.style.display = "none";
    });
}
{ /* <div style="display: flex;">
  <div style="display: flex; width: 300px; height: 100px; justify-content: space-between; flex-direction: column;">
      <input id="login" placeholder="Login" onchange="preencherLogin(event)">
      <input id="senha" placeholder="Senha" type="password" onchange="preencherSenha(event)">
      <input id="api-key" placeholder="Api Key" onchange="preencherApi()">
      <button id="login-button" disabled>Login</button>
  </div>
  <div id="search-container" style="margin-left: 20px">
      <input id="search" placeholder="Escreva...">
      <button id="search-button">Pesquisar Filme</button>
  </div>
</div>*/
}
