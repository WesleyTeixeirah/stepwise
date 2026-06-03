const API_URL = "https://stepwise-api-production.up.railway.app";

document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  const btnCriarTarefa = document.querySelector(".btn-success");
  const btnAdicionarEtapa = document.getElementById("btnAdicionarEtapa");
  const modalElemento = document.getElementById("modalNovaEtapa");
  const instanciaModal = new bootstrap.Modal(modalElemento);
  const timeline = document.querySelector(".timeline");

  // Tags
  document.querySelectorAll(".selectable-tag").forEach(tag => {
    tag.addEventListener("click", function () {
      this.classList.toggle("active");
    });
  });

  // Prioridade
  document.querySelectorAll(".priority-tag").forEach(tag => {
    tag.addEventListener("click", function () {
      document.querySelectorAll(".priority-tag").forEach(t => t.classList.remove("active"));
      this.classList.add("active");
    });
  });

  // Abrir modal de etapa
  btnAdicionarEtapa.addEventListener("click", () => instanciaModal.show());

  // Reordenar etapas
  function reordenarEtapas() {
    const itens = timeline.querySelectorAll(".timeline-item");
    itens.forEach((item, index) => {
      const marcador = item.querySelector(".timeline-marker");
      if (marcador) marcador.textContent = index + 1;
    });
  }

  // Salvar etapa no modal
  document.getElementById("salvarNovaEtapa").addEventListener("click", function () {
    const inputTitulo = document.getElementById("modalTituloEtapa");
    const inputDesc = document.getElementById("modalDescricaoEtapa");
    if (!inputTitulo.value.trim() || !inputDesc.value.trim()) {
      return alert("Preencha título e descrição!");
    }

    const novoItem = document.createElement("div");
    novoItem.className = "timeline-item";
    novoItem.innerHTML = `
      <div class="timeline-marker">0</div>
      <div class="timeline-content">
        <div class="d-flex justify-content-between align-items-start">
          <h4>${inputTitulo.value}</h4>
          <button type="button" class="btn btn-sm btn-outline-danger border-0 btn-remover">
            <i class="bi bi-trash"></i>
          </button>
        </div>
        <p>${inputDesc.value}</p>
      </div>`;
    timeline.appendChild(novoItem);
    reordenarEtapas();
    inputTitulo.value = "";
    inputDesc.value = "";
    instanciaModal.hide();
  });

  // Remover etapa
  timeline.addEventListener("click", (e) => {
    if (e.target.closest(".btn-remover")) {
      e.target.closest(".timeline-item").remove();
      reordenarEtapas();
    }
  });

  // Criar tarefa na API
  btnCriarTarefa.addEventListener("click", async function (e) {
    e.preventDefault();

    const titulo = document.getElementById("taskTitle").value.trim();
    const descricao = document.getElementById("taskDescription").value.trim();
    const prazo = document.getElementById("taskDeadline").value.trim();

    if (!titulo || !descricao || !prazo) {
      return alert("Preencha todos os campos básicos.");
    }

    const etapas = [];
    document.querySelectorAll(".timeline-item").forEach(item => {
      const h4 = item.querySelector("h4");
      const p = item.querySelector("p");
      if (h4) {
        etapas.push({
          titulo: h4.innerText,
          descricao: p ? p.innerText : ""
        });
      }
    });

    if (etapas.length === 0) {
      return alert("Adicione pelo menos uma etapa!");
    }

    const tags = Array.from(document.querySelectorAll(".selectable-tag.active")).map(t => t.innerText);
    const prioridade = document.querySelector(".priority-tag.active")?.dataset.priority || "Média";

    const novaTarefa = { titulo, descricao, prazo, prioridade, tags, etapas };

    try {
      const response = await fetch(`${API_URL}/api/Task`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(novaTarefa)
      });

      if (response.status === 401) {
        alert("Sessão expirada. Faça login novamente.");
        window.location.href = "login.html";
        return;
      }

      if (!response.ok) throw new Error("Erro ao criar tarefa.");

      alert("Tarefa criada com sucesso!");
      window.location.href = "profile.html";

    } catch (error) {
      alert(error.message);
    }
  });
});
