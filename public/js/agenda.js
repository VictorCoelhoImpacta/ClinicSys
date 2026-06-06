const selectPaciente = document.getElementById('paciente_id');
const selectMedico = document.getElementById('medico_id');
const form = document.getElementById('formConsulta');
const lista = document.getElementById('listaConsultas');
const botao = form.querySelector('button');

let consultasCache = [];
let consultaEditando = null;

async function carregarPacientesSelect() {
    const response = await fetch('/pacientes');
    const pacientes = await response.json();

    selectPaciente.innerHTML = '<option value="">Selecione o paciente</option>';

    pacientes.forEach(p => {
        const option = document.createElement('option');
        option.value = p.id;
        option.textContent = `${p.id} - ${p.nome}`;
        selectPaciente.appendChild(option);
    });
}

async function carregarMedicosSelect() {
    const response = await fetch('/medicos');
    const medicos = await response.json();

    selectMedico.innerHTML = '<option value="">Selecione o médico</option>';

    medicos.forEach(m => {
        const option = document.createElement('option');
        option.value = m.id;
        option.textContent = `${m.id} - ${m.nome} (${m.especialidade || 'Sem especialidade'})`;
        selectMedico.appendChild(option);
    });
}

async function carregarConsultas() {
    const response = await fetch('/consultas');
    const consultas = await response.json();

    consultasCache = consultas;
    lista.innerHTML = '';

    consultas.forEach(c => {
        const linha = document.createElement('tr');
        linha.id = `consulta-${c.id}`;

        linha.innerHTML = `
            <td>${c.id}</td>
            <td>${c.paciente_nome}</td>
            <td>${c.medico_nome}</td>
            <td>${formatarData(c.data_consulta)}</td>
            <td>${formatarHora(c.hora_consulta)}</td>
            <td>${c.status}</td>
            <td>
                <button onclick="editar(${c.id})">Editar</button>
                <button class="btn-excluir" onclick="deletar(${c.id})">Excluir</button>
            </td>
        `;

        lista.appendChild(linha);
    });
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const paciente_id = document.getElementById('paciente_id').value;
    const medico_id = document.getElementById('medico_id').value;
    const data_consulta = document.getElementById('data_consulta').value;
    const hora_consulta = document.getElementById('hora_consulta').value;
    const observacao = document.getElementById('observacao').value;
    const status = document.getElementById('status').value;

    const dados = {
        paciente_id,
        medico_id,
        data_consulta,
        hora_consulta,
        observacao,
        status
    };

    let response;

    if (consultaEditando) {
        response = await fetch(`/consultas/${consultaEditando}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        if (response.ok) {
            mostrarMensagem('Consulta atualizada com sucesso');
        }

        consultaEditando = null;
        botao.textContent = 'Cadastrar';

    } else {
        response = await fetch('/consultas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        if (response.ok) {
            mostrarMensagem('Consulta agendada com sucesso');
        }
    }

    if (response.ok) {
        form.reset();
        carregarConsultas();
    } else {
        mostrarMensagem('Erro ao salvar consulta', 'erro');
    }
});

function editar(id) {
    const consulta = consultasCache.find(c => c.id === id);

    if (!consulta) return;

    document.getElementById('paciente_id').value = consulta.paciente_id;
    document.getElementById('medico_id').value = consulta.medico_id;
    document.getElementById('data_consulta').value = formatarDataInput(consulta.data_consulta);
    document.getElementById('hora_consulta').value = formatarHoraInput(consulta.hora_consulta);
    document.getElementById('observacao').value = consulta.observacao || '';
    document.getElementById('status').value = consulta.status;

    consultaEditando = id;
    botao.textContent = 'Atualizar';

    document.querySelectorAll('tr').forEach(tr => {
        tr.style.backgroundColor = '';
    });

    const linha = document.getElementById(`consulta-${id}`);

    if (linha) {
        linha.style.backgroundColor = '#d1e7ff';
    }
}

async function deletar(id) {
    const confirmar = confirm('Tem certeza que deseja excluir esta consulta?');

    if (!confirmar) return;

    const response = await fetch(`/consultas/${id}`, {
        method: 'DELETE'
    });

    if (response.ok) {
        mostrarMensagem('Consulta excluída com sucesso', 'erro');
        carregarConsultas();
    } else {
        mostrarMensagem('Erro ao excluir consulta', 'erro');
    }
}

function formatarData(data) {
    if (!data) return '';

    const d = new Date(data);

    return d.toLocaleDateString('pt-BR');
}

function formatarDataInput(data) {
    if (!data) return '';

    return data.split('T')[0];
}

function formatarHora(hora) {
    if (!hora) return '';

    return hora.substring(0, 5);
}

function formatarHoraInput(hora) {
    if (!hora) return '';

    return hora.substring(0, 5);
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

carregarPacientesSelect();
carregarMedicosSelect();
carregarConsultas();