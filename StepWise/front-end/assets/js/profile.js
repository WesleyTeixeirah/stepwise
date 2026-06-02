const API_URL = "http://localhost:5041";

document.addEventListener("DOMContentLoaded", async function () {
  const token = localStorage.getItem("token");

  // 🔒 Verifica autenticação
  if (!token) {
    alert("Usuário não autenticado.");
    window.location.href = "login.html";
    return;
  }

  // 👤 Exibe os dados do usuário
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (usuario) {
    const nomeElemento = document.querySelector(".profile-header h3");
    const emailElemento = document.querySelector(".role");

    if (nomeElemento) nomeElemento.textContent = usuario.nome;
    if (emailElemento) emailElemento.textContent = usuario.email;
  }

  // 📦 Carrega as tarefas da API
  await carregarTarefas(token);
});

async function carregarTarefas(token) {
  try {
    const response = await fetch(`${API_URL}/api/Task`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    // 🔐 Token inválido ou expirado
    if (response.status === 401) {
      alert("Sessão expirada. Faça login novamente.");
      logout();
      return;
    }

    if (!response.ok) {
      throw new Error("Erro ao buscar tarefas.");
    }

    const tarefas = await response.json();
    renderizarTarefas(tarefas);

  } catch (error) {
    console.error("Erro ao carregar tarefas:", error);
    alert("Não foi possível carregar as tarefas.");
  }
}

function renderizarTarefas(tarefas) {
  const containerTarefas = document.getElementById("container-tarefas");
  const containerHistorico = document.getElementById("container-historico");
  const containerEvolucao = document.querySelector(".skills-list");

  if (!containerTarefas || !containerHistorico || !containerEvolucao) return;

  containerTarefas.innerHTML = "";
  containerHistorico.innerHTML = "";
  containerEvolucao.innerHTML = "";

  let tarefasConcluidas = 0;
  let tarefasPendentes = 0;

  if (!tarefas || tarefas.length === 0) {
    containerTarefas.innerHTML = `<p class="text-center">Nenhuma tarefa encontrada.</p>`;
    atualizarStats(0, 0);
    return;
  }

  tarefas.forEach((tarefa) => {
    const etapas = tarefa.etapas || [];
    const totalEtapas = etapas.length;
    const etapasConcluidas = etapas.filter(e => e.concluida).length;
    const progresso = totalEtapas > 0
      ? Math.round((etapasConcluidas / totalEtapas) * 100)
      : 0;

    if (progresso < 100) {
      tarefasPendentes++;

      containerTarefas.innerHTML += `
        <div class="col-lg-3 col-md-6" data-aos="zoom-in">
          <div class="service-item">
            <div class="icon-wrapper">
              <i class="bi bi-layout-text-window-reverse"></i>
            </div>
            <h4>${tarefa.titulo}</h4>
            <p>${tarefa.descricao || "Sem descrição"}</p>
            <p><strong>Progresso:</strong> ${progresso}%</p>
            <a href="tasks.html?id=${tarefa.id}" class="read-more">
              <span>Visualizar</span>
              <i class="bi bi-arrow-right"></i>
            </a>
          </div>
        </div>`;

      containerEvolucao.innerHTML += `
        <div class="skill-item">
          <div class="skill-info">
            <span class="skill-name">${tarefa.titulo}</span>
            <span class="skill-percent">${progresso}%</span>
          </div>
          <div class="progress">
            <div class="progress-bar" style="width: ${progresso}%"></div>
          </div>
        </div>`;
    } else {
      tarefasConcluidas++;

      containerHistorico.innerHTML += `
        <div class="col-lg-6" data-aos="fade-up">
          <div class="exp-card">
            <div class="card-header">
              <div class="company-logo">
                <i class="bi bi-patch-check-fill" style="color:#20C809;"></i>
              </div>
            </div>
            <div class="card-body">
              <h3>${tarefa.titulo}</h3>
              <p>${tarefa.descricao || "Tarefa concluída com sucesso!"}</p>
              <span class="badge bg-success">Concluída</span>
            </div>
          </div>
        </div>`;
    }
  });

  atualizarStats(tarefasConcluidas, tarefasPendentes);
}

function atualizarStats(concluidas, pendentes) {
  const statItems = document.querySelectorAll(".profile-stats .stat-item h4");
  if (statItems.length >= 3) {
    statItems[0].textContent = concluidas;
    statItems[2].textContent = pendentes;
  }
}

// 🔓 Logout
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  alert("Logout realizado com sucesso!");
  window.location.href = "login.html";
}
