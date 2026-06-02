document.addEventListener("DOMContentLoaded", function () {
  const usuario = localStorage.getItem("usuario");

  
  if (!usuario) {
    alert("Você precisa estar logado para acessar esta página.");
    window.location.href = "login.html";
    return;
  }

  const dadosUsuario = JSON.parse(usuario);

  
  const emailElemento = document.getElementById("usuarioEmail");
  const nomeElemento = document.getElementById("usuarioNome");

  if (emailElemento && dadosUsuario.email) {
    emailElemento.textContent = dadosUsuario.email;
  }

  if (nomeElemento) {
    nomeElemento.textContent = dadosUsuario.nome || "Usuário";
  }
});


function verificarAutenticacao() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  window.location.href = "login.html";
}
