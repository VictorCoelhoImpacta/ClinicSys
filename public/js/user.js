const form = document.getElementById('formUsuario');
const lista = document.getElementById('listaUsuarios');
const botao = form.querySelector('button');

let usuariosCache = [];
let usuarioEditando = null;

async function carregarUsuarios() {

    const response = await fetch('/usuarios');
    const usuarios = await response.json();

    usuariosCache = usuarios;

    lista.innerHTML = '';

    usuarios.forEach(u => {

        const linha = document.createElement('tr');

        linha.id = `usuario-${u.id}`;

        linha.innerHTML = `
            <td>${u.id}</td>
            <td>${u.nome}</td>
            <td>${u.usuario}</td>
            <td>${u.perfil}</td>
            <td>
                <button onclick="editar(${u.id})">Editar</button>

                <button class="btn-excluir"
                    onclick="deletar(${u.id})">
                    Desativar
                </button>
            </td>
        `;

        lista.appendChild(linha);
    });
}

form.addEventListener('submit', async (e) => {

    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;
    const perfil = document.getElementById('perfil').value;

    if (usuarioEditando) {

        await fetch(`/usuarios/${usuarioEditando}`, {

            method: 'PUT',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                nome,
                usuario,
                senha,
                perfil
            })
        });

        mostrarMensagem('Usuário atualizado com sucesso');

    } else {

        await fetch('/usuarios', {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                nome,
                usuario,
                senha,
                perfil
            })
        });

        mostrarMensagem('Usuário cadastrado com sucesso');
    }

    form.reset();

    usuarioEditando = null;

    botao.textContent = 'Cadastrar';

    carregarUsuarios();
});

function editar(id) {

    const usuario = usuariosCache.find(u => u.id === id);

    if (!usuario) return;

    document.getElementById('nome').value = usuario.nome;
    document.getElementById('usuario').value = usuario.usuario;
    document.getElementById('perfil').value = usuario.perfil;

    usuarioEditando = id;

    botao.textContent = 'Atualizar';
}

async function deletar(id) {

    const confirmar = confirm(
        'Deseja desativar este usuário?'
    );

    if (!confirmar) return;

    await fetch(`/usuarios/${id}`, {
        method: 'DELETE'
    });

    mostrarMensagem('Usuário desativado', 'erro');

    carregarUsuarios();
}

function mostrarMensagem(texto, tipo = "sucesso") {

    const msg = document.getElementById('mensagem');

    msg.textContent = texto;

    msg.classList.remove(
        'mensagem-sucesso',
        'mensagem-erro'
    );

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

carregarUsuarios();