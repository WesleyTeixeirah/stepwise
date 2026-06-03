document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("registerForm");

  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senhaCadastro").value;
    const confirmar = document.getElementById("confirmarSenha").value;

    if (senha !== confirmar) {
      alert("As senhas não coincidem");
      return;
    }

    try {
      const response = await fetch(
        "https://stepwise-api-production.up.railway.app/api/Auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            nome: nome,
            email: email,
            password: senha
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao cadastrar");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify({
        nome: data.nome,
        email: data.email
      }));

      alert("Conta criada com sucesso!");
      window.location.href = "profile.html";

    } catch (err) {
      alert("Erro ao cadastrar: " + err.message);
    }
  });
});
