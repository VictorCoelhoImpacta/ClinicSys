const express = require('express');
const path = require('path');
const pool = require('./config/database');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();

app.use(express.json());
app.use(session({
    secret: 'clinicsys_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false
    }
}));

app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));

function verificarLogin(req, res, next) {

    if (!req.session.usuario) {

        return res.redirect('/');
    }

    next();
}

function verificarPerfil(...perfisPermitidos) {
    return (req, res, next) => {
        if (!req.session.usuario) {
            return res.redirect('/');
        }

        if (!perfisPermitidos.includes(req.session.usuario.perfil)) {
            return res.status(403).send('Acesso negado');
        }

        next();
    };
}

function carregarPagina(nomeArquivo) {

    return (req, res) => {

        res.sendFile(
            path.join(__dirname, 'public', nomeArquivo)
        );
    };
}

app.get('/pacientes', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM pacientes WHERE ativo = true ORDER BY id'
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao buscar pacientes');
    }
});

app.put('/pacientes/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, email, telefone } = req.body;

    try {
        const result = await pool.query(
            'UPDATE pacientes SET nome = $1, email = $2, telefone = $3 WHERE id = $4 RETURNING *',
            [nome, email, telefone, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send('Paciente não encontrado');
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao atualizar paciente');
    }
});

app.delete('/pacientes/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'UPDATE pacientes SET ativo = false WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send('Paciente não encontrado');
        }

        res.json({ message: 'Paciente removido com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao deletar paciente');
    }
});

app.post('/pacientes', async (req, res)=> {
    const { nome, email, telefone } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO pacientes (nome, email, telefone) VALUES ($1, $2 ,$3) RETURNING *',
            [nome, email, telefone]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao cadastrar paciente');
    }
});

app.get('/pacientes/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM pacientes WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send('Paciente não encontrado');
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao buscar paciente');
    }
});

app.post('/medicos', async (req, res) => {
    const { nome, especialidade, crm, telefone } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO medicos (nome, especialidade, crm, telefone) VALUES ($1, $2, $3, $4) RETURNING *',
            [nome, especialidade, crm, telefone]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao cadastrar médico');
    }
});

app.get('/medicos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM medicos WHERE ativo = true');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao buscar médicos');
    }
});

app.put('/medicos/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, especialidade, crm, telefone } = req.body;

    try {
        const result = await pool.query(
            'UPDATE medicos SET nome=$1, especialidade=$2, crm=$3, telefone=$4 WHERE id=$5 RETURNING *',
            [nome, especialidade, crm, telefone, id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao atualizar médico');
    }
});

app.delete('/medicos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query(
            'UPDATE medicos SET ativo = false WHERE id = $1',
            [id]
        );

        res.sendStatus(204);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao desativar médico');
    }
});

app.post('/login', async (req, res) => {

    const { usuario, senha } = req.body;

    try {

        const result = await pool.query(
            'SELECT * FROM usuarios WHERE usuario = $1 AND ativo = true',
            [usuario]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: 'Usuário não encontrado'
            });
        }

        const user = result.rows[0];

        console.log(user);
        console.log(senha);

        if (senha !== user.senha) {
            return res.status(401).json({
                message: 'Senha inválida'
            });
        }

        req.session.usuario = {
            id: user.id,
            nome: user.nome,
            perfil: user.perfil
        };

        res.json({
            message: 'Login realizado com sucesso'
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: 'Erro no login'
        });
    }
});

app.get('/usuarios', async (req, res) => {

    try {

        const result = await pool.query(
            'SELECT id, nome, usuario, perfil FROM usuarios WHERE ativo = true ORDER BY id'
        );

        res.json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).send('Erro ao buscar usuários');
    }
});

app.post('/usuarios', async (req, res) => {

    const { nome, usuario, senha, perfil } = req.body;

    try {

        await pool.query(

            `INSERT INTO usuarios
            (nome, usuario, senha, perfil)
            VALUES ($1, $2, $3, $4)`,

            [nome, usuario, senha, perfil]
        );

        res.status(201).send('Usuário criado');

    } catch (error) {

        console.error(error);

        res.status(500).send('Erro ao criar usuário');
    }
});

app.put('/usuarios/:id', async (req, res) => {

    const { id } = req.params;

    const {
        nome,
        usuario,
        senha,
        perfil
    } = req.body;

    try {

        await pool.query(

            `UPDATE usuarios
            SET nome = $1,
                usuario = $2,
                senha = $3,
                perfil = $4
            WHERE id = $5`,

            [nome, usuario, senha, perfil, id]
        );

        res.send('Usuário atualizado');

    } catch (error) {

        console.error(error);

        res.status(500).send('Erro ao atualizar usuário');
    }
});

app.delete('/usuarios/:id', async (req, res) => {

    const { id } = req.params;

    try {

        await pool.query(

            `UPDATE usuarios
            SET ativo = false
            WHERE id = $1`,

            [id]
        );

        res.send('Usuário desativado');

    } catch (error) {

        console.error(error);

        res.status(500).send('Erro ao desativar usuário');
    }
});

app.get('/consultas', verificarLogin, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                consultas.id,
                consultas.paciente_id,
                pacientes.nome AS paciente_nome,
                consultas.medico_id,
                medicos.nome AS medico_nome,
                consultas.data_consulta,
                consultas.hora_consulta,
                consultas.observacao,
                consultas.status
            FROM consultas
            JOIN pacientes ON consultas.paciente_id = pacientes.id
            JOIN medicos ON consultas.medico_id = medicos.id
            WHERE consultas.ativo = true
            ORDER BY consultas.data_consulta, consultas.hora_consulta
        `);

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao buscar consultas');
    }
});

app.post('/consultas', verificarLogin, async (req, res) => {
    const {
        paciente_id,
        medico_id,
        data_consulta,
        hora_consulta,
        observacao,
        status
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO consultas 
            (paciente_id, medico_id, data_consulta, hora_consulta, observacao, status)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [paciente_id, medico_id, data_consulta, hora_consulta, observacao, status]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao cadastrar consulta');
    }
});

app.put('/consultas/:id', verificarLogin, async (req, res) => {
    const { id } = req.params;

    const {
        paciente_id,
        medico_id,
        data_consulta,
        hora_consulta,
        observacao,
        status
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE consultas
            SET paciente_id = $1,
                medico_id = $2,
                data_consulta = $3,
                hora_consulta = $4,
                observacao = $5,
                status = $6
            WHERE id = $7
            RETURNING *`,
            [paciente_id, medico_id, data_consulta, hora_consulta, observacao, status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send('Consulta não encontrada');
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao atualizar consulta');
    }
});

app.delete('/consultas/:id', verificarLogin, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'UPDATE consultas SET ativo = false WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send('Consulta não encontrada');
        }

        res.json({ message: 'Consulta desativada com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao desativar consulta');
    }
});

app.get('/logout', (req, res) => {

    req.session.destroy(() => {

        res.redirect('/');
    });
});

app.get(
    '/agenda.html',
    verificarLogin,
    carregarPagina('agenda.html')
);

app.get(
    '/home.html',
    verificarLogin,
    carregarPagina('home.html')
);

app.get(
    '/pacientes.html',
    verificarLogin,
    verificarPerfil('admin', 'recepcao'),
    carregarPagina('pacientes.html')
);

app.get(
    '/medicos.html',
    verificarLogin,
    verificarPerfil('admin'),
    carregarPagina('medicos.html')
);

app.get(
    '/user.html',
    verificarLogin,
    verificarPerfil('admin'),
    carregarPagina('user.html')
);

app.get(
    '/cad.html',
    verificarLogin,
    verificarPerfil('admin', 'recepcao'),
    carregarPagina('cad.html')
);

app.get('/', (req, res) => {

    if (req.session.usuario) {

        return res.redirect('/home.html');
    }

    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/logout', (req, res) => {

    req.session.destroy(() => {

        res.redirect('/');
    });
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});