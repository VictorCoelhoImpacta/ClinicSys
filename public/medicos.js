const form = document.getElementById('formMedico');
const lista = document.getElementById('listaMedicos');
const botao = form.querySelector('button');

let medicosCache = [];
let medicoEditando = null;

async function carregarMedicos() {
    const response = await fetch('/medicos');
    const medicos = await response.json();

    medicosCache = medicos;

    lista.innerHTML = '';

    medicos.forEach(m => {
        const linha = document.createElement('tr');
        linha.id = `medico-${m.id}`;

        linha.innerHTML = `
            <td>${m.id}</td>
            <td>${m.nome}</td>
            <td>${m.especialidade}</td>
            <td>${m.crm}</td>
            <td>${formatarTelefone(m.telefone)}</td>
            <td>
                <button onclick="editar(${m.id})">Editar</button>
                <button class="btn-excluir" onclick="deletar(${m.id})">Excluir</button>
            </td>
        `;

        lista.appendChild(linha);
    });
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const especialidade = document.getElementById('especialidade').value;
    const tipoRegistro = document.getElementById('tipoRegistro').value;
    const registro = document.getElementById('registro').value;
    const crm = `${tipoRegistro} ${registro}`;
    const telefone = document.getElementById('telefone').value;

    if (medicoEditando) {
        await fetch(`/medicos/${medicoEditando}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, especialidade, crm, telefone })
        });

        mostrarMensagem("Médico atualizado com sucesso");
        medicoEditando = null;

    } else {
        await fetch('/medicos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, especialidade, crm, telefone })
        });

        mostrarMensagem("Médico cadastrado com sucesso");
    }

    form.reset();
    botao.textContent = 'Cadastrar';
    carregarMedicos();
});

function editar(id) {
    const medico = medicosCache.find(m => m.id === id);
    if (!medico) return;

    document.getElementById('nome').value = medico.nome;
    document.getElementById('especialidade').value = medico.especialidade;
    const partes = medico.crm.split(' ');
    document.getElementById('tipoRegistro').value = partes[0] || '';
    document.getElementById('registro').value = partes[1] || '';
    document.getElementById('telefone').value = medico.telefone;

    medicoEditando = id;
    botao.textContent = 'Atualizar';

    document.querySelectorAll('tr').forEach(tr => {
        tr.style.backgroundColor = '';
    });

    const linha = document.getElementById(`medico-${id}`);
    if (linha) {
        linha.style.backgroundColor = '#d1e7ff';
    }
}

async function deletar(id) {
    const confirmar = confirm("Tem certeza que deseja excluir este médico?");
    if (!confirmar) return;

    await fetch(`/medicos/${id}`, { method: 'DELETE' });

    mostrarMensagem("Médico excluído com sucesso", "erro");
    carregarMedicos();
}

function formatarTelefone(telefone) {
    if (!telefone) return '';

    telefone = telefone.replace(/\D/g, '');

    if (telefone.length === 11) {
        return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }

    if (telefone.length === 10) {
        return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }

    return telefone;
}

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

carregarMedicos();