const express = require('express');
const path = require('path');
const pool = require('./config/database');

const app = express();

app.use(express.json());
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});
app.use(express.static(path.join(__dirname, 'public')));

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

app.get('/pacientes', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM pacientes');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao buscar pacientes');
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


app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
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

