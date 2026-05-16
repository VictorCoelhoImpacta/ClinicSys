const form = document.getElementById('formLogin');

form.addEventListener('submit', async (e) => {

    e.preventDefault();

    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;

    const response = await fetch('/login', {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            usuario,
            senha
        })
    });

    const data = await response.json();

    if (response.ok) {

        mostrarMensagem('Login realizado com sucesso');

        setTimeout(() => {
            window.location.href = '/home.html';
        }, 1000);

    } else {

        mostrarMensagem(data.message, 'erro');
    }
});

function mostrarMensagem(texto, tipo = "sucesso") {

    const msg = document.getElementById('mensagem');

    msg.textContent = texto;

    msg.classList.remove('mensagem-sucesso', 'mensagem-erro');

    if (tipo === "erro") {
        msg.classList.add('mensagem-erro');
    } else {
        msg.classList.add('mensagem-sucesso');
    }

    msg.style.display = 'block';

    setTimeout(() => {
        msg.style.display = 'none';
    }, 3000);
}