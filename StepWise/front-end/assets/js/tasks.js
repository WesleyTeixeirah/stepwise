const API_URL = "http://localhost:5041";

document.addEventListener("DOMContentLoaded", async function () {
  const token = localStorage.getItem("token");
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  if (!id) {
    alert("Tarefa não encontrada.");
    window.location.href = "profile.html";
    return;
  }

  let tarefa = null;

  // Carregar tarefa da API
  async function carregarTarefa() {
    try {
      const response = await fetch(`${API_URL}/api/Task/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.status === 401) {
        window.location.href = "login.html";
        return;
      }

      if (!response.ok) throw new Error("Tarefa não encontrada.");

      tarefa = await response.json();
      renderizarTela();

    } catch (error) {
      alert(error.message);
      window.location.href = "profile.html";
    }
  }

  function renderizarTela() {
    document.querySelector(".overview-header h2").innerText = tarefa.titulo;
    document.querySelector(".lead-text").innerText = tarefa.descricao || "";
    const prazoSpan = document.querySelector(".quick-info span");
    if (prazoSpan) prazoSpan.innerText = tarefa.prazo;

    // Prioridade
    document.querySelectorAll(".priority-tag").forEach(s => {
      s.classList.remove("active");
      if (s.getAttribute("data-priority") === tarefa.prioridade) s.classList.add("active");
    });

    // Tags
    document.querySelectorAll(".selectable-tag").forEach(span => {
      span.classList.remove("active");
      if (tarefa.tags && tarefa.tags.includes(span.innerText)) span.classList.add("active");
    });

    // Etapas
    const timeline = document.querySelector(".timeline");
    timeline.innerHTML = "";
    tarefa.etapas.forEach((etapa, index) => {
      const isConcluida = etapa.concluida === true;
      timeline.insertAdjacentHTML("beforeend", `
        <div class="timeline-item ${isConcluida ? 'etapa-concluida' : ''}" data-index="${index}" style="${isConcluida ? 'opacity:0.6;' : ''}">
          <div class="timeline-marker">${index + 1}</div>
          <div class="timeline-content">
            <div class="d-flex justify-content-between align-items-start">
              <h4 style="${isConcluida ? 'text-decoration:line-through;' : ''}">${etapa.titulo}</h4>
              <button class="btn btn-sm text-danger btn-excluir-etapa"><i class="bi bi-x-circle"></i></button>
            </div>
            <p>${etapa.descricao || ""}</p>
            <div class="row gy-2 mt-2">
              <div class="col-12">
                <span class="bi bi-pencil-square btn-editar" style="color:#1D9AE2;cursor:pointer;"> Editar</span>
              </div>
              <div class="col-12">
                <span class="bi bi-check2-square btn-concluir" style="color:#20C809;cursor:pointer;display:${isConcluida ? 'none' : 'inline'}"> Concluir</span>
                ${isConcluida ? '<span class="text-success fw-bold"><i class="bi bi-check-all"></i> Concluída</span>' : ''}
              </div>
            </div>
          </div>
        </div>`);
    });
  }

  // Ações nas etapas
  document.querySelector(".timeline").addEventListener("click", async function (e) {
    const item = e.target.closest(".timeline-item");
    if (!item) return;
    const index = parseInt(item.dataset.index);

    if (e.target.classList.contains("btn-concluir") || e.target.closest(".btn-concluir")) {
      await fetch(`${API_URL}/api/Task/${id}/steps/${index}/complete`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
      });
      await carregarTarefa();
    }

    if (e.target.classList.contains("btn-editar") || e.target.closest(".btn-editar")) {
      indexSendoEditado = index;
      document.getElementById("editTitulo").value = tarefa.etapas[index].titulo;
      document.getElementById("editDescricao").value = tarefa.etapas[index].descricao;
      new bootstrap.Modal(document.getElementById("modalEditarEtapa")).show();
    }

    if (e.target.closest(".btn-excluir-etapa")) {
      if (confirm("Deseja remover esta etapa?")) {
        await fetch(`${API_URL}/api/Task/${id}/steps/${index}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        await carregarTarefa();
      }
    }
  });

  // Adicionar etapa
  document.getElementById("salvarNovaEtapa").addEventListener("click", async function () {
    const titulo = document.getElementById("modalTituloEtapa").value;
    const descricao = document.getElementById("modalDescricaoEtapa").value;
    if (!titulo.trim()) return alert("Título obrigatório!");

    await fetch(`${API_URL}/api/Task/${id}/steps`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ titulo, descricao })
    });

    document.getElementById("modalTituloEtapa").value = "";
    document.getElementById("modalDescricaoEtapa").value = "";
    bootstrap.Modal.getInstance(document.getElementById("modalNovaEtapa")).hide();
    await carregarTarefa();
  });

  // Editar etapa
  let indexSendoEditado = null;
  document.getElementById("salvarEdicao").addEventListener("click", async function () {
    if (indexSendoEditado === null) return;
    const titulo = document.getElementById("editTitulo").value;
    const descricao = document.getElementById("editDescricao").value;

    await fetch(`${API_URL}/api/Task/${id}/steps/${indexSendoEditado}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ titulo, descricao })
    });

    bootstrap.Modal.getInstance(document.getElementById("modalEditarEtapa")).hide();
    await carregarTarefa();
  });

  // Editar tarefa principal
  document.getElementById("modalEditarTarefaPrincipal").addEventListener("show.bs.modal", function () {
    document.getElementById("editTarefaTitulo").value = tarefa.titulo;
    document.getElementById("editTarefaDescricao").value = tarefa.descricao || "";
    document.getElementById("editTarefaPrazo").value = tarefa.prazo || "";
  });

  document.getElementById("btnSalvarTarefaPrincipal").addEventListener("click", async function () {
    const titulo = document.getElementById("editTarefaTitulo").value;
    if (!titulo.trim()) return alert("Título obrigatório!");

    const prioridade = document.querySelector('input[name="priority"]:checked')?.value || tarefa.prioridade;

    await fetch(`${API_URL}/api/Task/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        titulo,
        descricao: document.getElementById("editTarefaDescricao").value,
        prazo: document.getElementById("editTarefaPrazo").value,
        prioridade,
        tags: tarefa.tags
      })
    });

    bootstrap.Modal.getInstance(document.getElementById("modalEditarTarefaPrincipal")).hide();
    await carregarTarefa();
  });

  // Excluir tarefa
  document.getElementById("btnAbrirModalExcluir").addEventListener("click", function (e) {
    e.preventDefault();
    new bootstrap.Modal(document.getElementById("modalExcluirTarefa")).show();
  });

  document.getElementById("confirmarExclusao").addEventListener("click", async function () {
    await fetch(`${API_URL}/api/Task/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    window.location.href = "profile.html#task";
  });

  await carregarTarefa();
});