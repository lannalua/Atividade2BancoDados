const express = require("express")
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');

const swaggerDocument = YAML.load('./openapi.yaml');

const app = express()
app.use(bodyParser.json());
const port = 3000

//cria o schema do usuário
const usuarioSchema = new mongoose.Schema({
    cpf: { type: String, required: true, unique: true },
    nome: { type: String, required: true },
    data_nascimento: { type: Date, required: true }
});

//cria o modelo do Usuário
const Usuario = mongoose.model('Usuario', usuarioSchema);

// get pelo cpf
//url: http://localhost:3000/consultarusuarios/:cpf
app.get('/consultarusuario/:cpf', async (req, res) => {
    try {
        const { cpf } = req.params;
        
        const usuario = await Usuario.findOne({ cpf });
       
        if (usuario == null) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.json(usuario);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
})

// url:http://localhost:3000/listarusuarios
app.get('/listarusuarios', async (req, res) => {
    try {
        const users = await Usuario.find()

        res.send(users);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao listar usuários' })
    }
});


//url: http://localhost:3000/deleteusuario/:cpf
app.delete('/deleteusuario/:cpf', async (req, res) => {
    try {
        const { cpf } = req.params
        
        const usuario = await Usuario.findOneAndDelete({ cpf })

        if (usuario == null) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.send('Deletado com sucesso')
    }
    catch (err) {
        res.status(500).json({ error: 'Erro ao deletar usuário' })
    }
});

//url: http://localhost:3000/usuario
app.post('/usuario', async (req, res) => {
    try {
        const { cpf, nome, data_nascimento } = req.body;

        if (!cpf || !nome || !data_nascimento) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }

        const novoUsuario = new Usuario({ cpf, nome, data_nascimento });
        await novoUsuario.save();

        res.status(201).json({ message: 'Usuário criado com sucesso' });
    } catch (err) {
        if (err.code === 11000) {
            //11000 duplicidade no MongoDB
            res.status(400).json({ error: 'Usuário com este CPF já cadastrado' });
        } else {
            res.status(500).json({ error: 'Erro ao criar usuário' });
        }
    }
});

//url: http://localhost:3000/api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(port, () => {
    mongoose.connect('mongodb+srv://lannanovaes010:RnWwbEPaKIizWytx@atv2database.d5fzs.mongodb.net/?retryWrites=true&w=majority&appName=Atv2Database');
    console.log(`Example app listening on port ${port}`)
})
