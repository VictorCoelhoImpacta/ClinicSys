const form = document.getElementById('formPaciente');
const lista = document.getElementById('listaPacientes');
const botao = form.querySelector('button');

let pacienteEditando = null;

async function carregarPacientes() {
    const response = await fetch('/pacientes');
    const pacientes = await response.json();

    lista.innerHTML = '';

    pacientes.forEach(p => {
        const li = document.createElement('li');
	li.id = `paciente-${p.id}`;

        li.innerHTML = `
		<strong>ID:</strong> ${p.id} |
		<strong>Nome:</strong> ${p.nome} |
		<strong>Email:</strong> ${p.email}
		<button onclick="editar(${p.id}, '${p.nome}', '${p.email}', '${p.telefone}')">Editar</button>
		<button onclick="deletar(${p.id})">Excluir</button>
	`;
        lista.appendChild(li);
    });
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const telefone = document.getElementById('telefone').value;

    if (pacienteEditando) {
        // UPDATE
        await fetch(`/pacientes/${pacienteEditando}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, telefone })
        });

        pacienteEditando = null;
    } else {
        // CREATE
        await fetch('/pacientes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, telefone })
        });
    }

    form.reset();
    pacienteEditando = null;
    botao.textContent = 'Cadastrar';
    carregarPacientes();
});

function editar(id, nome, email, telefone) {
	document.getElementById('nome').value = nome;
	document.getElementById('email').value = email;
	document.getElementById('telefone').value = telefone;

	pacienteEditando = id;
	botao.textContent = 'Atualizar';

	document.querySelectorAll('li').forEach(li => {
		li.style.backgroundColor = '';
	});

	const pacienteLi = document.getElementById(`paciente-${id}`);
	if (pacienteLi) {
		pacienteLi.style.backgroundColor = '#d1e7ff';
	}
}

async function deletar(id) {
	await fetch(`/pacientes/${id}`, { method: 'DELETE' });
	carregarPacientes();
}

carregarPacientes();
