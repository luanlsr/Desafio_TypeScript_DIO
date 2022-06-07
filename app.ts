// Um desenvolvedor tentou criar um projeto que consome a base de dados de filme do TMDB para criar um organizador de filmes, mas desistiu 
// pois considerou o seu código inviável. Você consegue usar typescript para organizar esse código e a partir daí aprimorar o que foi feito?

// A ideia dessa atividade é criar um aplicativo que: 
//    - Busca filmes
//    - Apresenta uma lista com os resultados pesquisados
//    - Permite a criação de listas de filmes e a posterior adição de filmes nela

// Todas as requisições necessárias para as atividades acima já estão prontas, mas a implementação delas ficou pela metade (não vou dar tudo de graça).
// Atenção para o listener do botão login-button que devolve o sessionID do usuário
// É necessário fazer um cadastro no https://www.themoviedb.org/ e seguir a documentação do site para entender como gera uma API key https://developers.themoviedb.org/3/getting-started/introduction
let loginButton = document.getElementById('login-button') as HTMLButtonElement;
let searchButton = document.getElementById('search-button') as HTMLButtonElement;
let searchContainer = document.getElementById('search-container') as HTMLDivElement;
let searchInput = document.getElementById('search') as HTMLInputElement;
let login = document.getElementById('login') as HTMLInputElement
let senha = document.getElementById('senha') as HTMLInputElement
let apiKeyInput = document.getElementById('api-key') as HTMLInputElement
let loginContainer = document.getElementById('login-container') as HTMLDivElement
let btnBack = document.getElementById('btn-back') as HTMLButtonElement

interface Usuario {
    username: string,
    password: string
}

interface Api {
    apiKey: string,
    listId: string,
    sessionId: unknown,
    requestToken: string
}

let usuario1: Usuario ={
    username: "",
    password: ""
}

let api: Api = {
    apiKey: "",
    listId: "7101979",
    sessionId: "",
    requestToken: ""
}

if(loginButton) {
    loginButton.addEventListener('click', async () => {
      await criarRequestToken();
      await logar();
      await criarSessao();
    })
}

if(searchButton) {
    searchButton.addEventListener('click', async () => {
      let lista = document.getElementById("lista");
      if (lista) {
        lista.outerHTML = "";
      }
      let query = searchInput.value;
      let listaDeFilmes: any = await procurarFilme(query);
      let ul = document.createElement('ul');

      ul.id = "lista"
      
      if(listaDeFilmes) {
          for (const item of listaDeFilmes.results) {
            let li = document.createElement('li');
            let img = document.createElement('img')
            let h3 = document.createElement('h3')
            h3.appendChild(document.createTextNode(item.original_title))
            // li.appendChild(document.createTextNode(item.original_title))
            img.src = `https://image.tmdb.org/t/p/w500${item.backdrop_path}`
            ul.appendChild(li)
            li.appendChild(h3)
            li.appendChild(img)
          }
      }
      console.log(listaDeFilmes);
      if(searchContainer) {
          searchContainer.appendChild(ul);
      }
    })
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
    if(loginButton) {
        if (usuario1.password && usuario1.username && api.apiKey) {
          loginButton.disabled = false;
        } else {
          loginButton.disabled = true;
        }
    }
}

class HttpClient {
  static async get({url, method, body}: {url:string, method: string, body?: any}) {
    return new Promise((resolve, reject) => {
      let request = new XMLHttpRequest();
      request.open(method, url, true);
      request.onload = () => {
        if (request.status >= 200 && request.status < 300) {
          resolve(JSON.parse(request.responseText));
          console.log("OK | 200");
          removeLogin()
        } else {
          reject({
            status: request.status,
            statusText: request.statusText
          })
        }
      }
      request.onerror = () => {
        reject({
          status: request.status,
          statusText: request.statusText
        })
      }

      if (body) {
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        body = JSON.stringify(body);
      }
      request.send(body);
    })
  }
}

async function procurarFilme(query: string) {
  query = encodeURI(query)
  console.log(query)
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/search/movie?api_key=${api.apiKey}&query=${query}`,
    method: "GET"
  })
  return result
}

async function adicionarFilme(filmeId: string) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/movie/${filmeId}?api_key=${api.apiKey}&language=en-US`,
    method: "GET"
  })
  console.log(result);
}

async function criarRequestToken () {
  let result: any = await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/token/new?api_key=${api.apiKey}`,
    method: "GET"
  })
  api.requestToken = result.request_token
}

async function logar() {
  await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/token/validate_with_login?api_key=${api.apiKey}`,
    method: "POST",
    body: {
      username: `${usuario1.username}`,
      password: `${usuario1.password}`,
      request_token: `${api.requestToken}`
    }
  })
}

async function criarSessao() {
  let result: any = await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/session/new?api_key=${api.apiKey}&request_token=${api.requestToken}`,
    method: "GET"
  })
  api.sessionId = result.session_id;
}

async function criarLista(nomeDaLista: string, descricao: string) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list?api_key=${api.apiKey}&session_id=${api.sessionId}`,
    method: "POST",
    body: {
      name: nomeDaLista,
      description: descricao,
      language: "pt-br"
    }
  })
  console.log(result);
}

async function adicionarFilmeNaLista(filmeId: string, listaId: string) {
  let result: any = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list/${listaId}/add_item?api_key=${api.apiKey}&session_id=${api.sessionId}`,
    method: "POST",
    body: {
      media_id: filmeId
    }
  })
  console.log(result);
}

async function pegarLista() {
  let result: any = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list/${api.listId}?api_key=${api.apiKey}`,
    method: "GET"
  })
  console.log(result);
}

btnBack?.addEventListener('click', async () => {
  await addLogin()
  btnBack.style.display = "none"
})

async function removeLogin() {
    loginContainer.style.display = "none"
    searchContainer.style.display = "flex"
    btnBack.style.display = "flex"
}

async function addLogin() {
  loginContainer.style.display = "flex"
  searchContainer.style.display = "none"
}

async function removeSearch() {
  searchContainer.style.display = "none"
}
{/* <div style="display: flex;">
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
</div>*/}
