const form = document.getElementById('formPaciente');
const lista = document.getElementById('listaPacientes');
const botao = form.querySelector('button');
const telefoneInput = document.getElementById('telefone');
let pacientesCache = [];

telefoneInput.addEventListener('input', function () {

    let valor = this.value.replace(/\D/g, ''); // remove tudo que não for número

    if (valor.length > 11) {
        valor = valor.slice(0, 11);
    }

    this.value = valor;
});

let pacienteEditando = null;

async function carregarPacientes() {

	const response = await fetch('/pacientes');
	const pacientes = await response.json();
    pacientesCache = pacientes;

	lista.innerHTML = '';

	pacientes.forEach(p => {

		const linha = document.createElement('tr');
		linha.id = `paciente-${p.id}`;

		linha.innerHTML = `
			<td>${p.id}</td>
			<td>${p.nome}</td>
			<td>${p.email}</td>
			<td>${formatarTelefone(p.telefone)}</td>
			<td>
				<button onclick="editar(${p.id})">Editar</button>
				<button class="btn-excluir" onclick="deletar(${p.id})">Excluir</button>
			</td>
		`;

		lista.appendChild(linha);
	});
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const telefone = document.getElementById('telefone').value;

    if (pacienteEditando) {

    await fetch(`/pacientes/${pacienteEditando}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, telefone })
    });

    mostrarMensagem("Paciente atualizado com sucesso");

    pacienteEditando = null;

    } else {

    await fetch('/pacientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, telefone })
    });

    mostrarMensagem("Paciente cadastrado com sucesso");
}

    form.reset();
    pacienteEditando = null;
    botao.textContent = 'Cadastrar';
    carregarPacientes();
});

function editar(id) {

    const paciente = pacientesCache.find(p => p.id === id);

    if (!paciente) return;

    document.getElementById('nome').value = paciente.nome;
    document.getElementById('email').value = paciente.email;
    document.getElementById('telefone').value = paciente.telefone;

    pacienteEditando = id;
    botao.textContent = 'Atualizar';

    document.querySelectorAll('tr').forEach(tr => {
        tr.style.backgroundColor = '';
    });

    const pacienteLinha = document.getElementById(`paciente-${id}`);
    if (pacienteLinha) {
        pacienteLinha.style.backgroundColor = '#d1e7ff';
    }
}

async function deletar(id) {

    const confirmar = confirm("Tem certeza que deseja excluir este paciente?");

    if (!confirmar) return;

    await fetch(`/pacientes/${id}`, { method: 'DELETE' });

    mostrarMensagem("Paciente excluído com sucesso", "erro");

    carregarPacientes();
}

carregarPacientes();

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
