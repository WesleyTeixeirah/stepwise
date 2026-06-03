document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const email = document.getElementById("emailLogin").value;
      const senha = document.getElementById("senhaLogin").value;

      try {
        const response = await fetch("https://stepwise-api-production.up.railway.app", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: senha,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Erro ao realizar login.");
        }

        // Salva os dados do usuário e o token
        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", JSON.stringify({
          nome: data.nome,
          email: data.email
        }));

        alert("Login realizado com sucesso!");
        window.location.href = "profile.html";

      } catch (error) {
        alert("Erro ao realizar login: " + error.message);
      }
    });
  }
});
