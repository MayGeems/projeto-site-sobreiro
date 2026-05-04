const express = require('express')
const app = express()
const porta = 3000
const ipDoServidor = '172.26.3.157'
const cors = require('cors');

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static(__dirname));
app.use(express.json());
app.use(cors());

async function cadastrarPedido() {
    const pedido = {
    cliente_nome: document.getElementById('nome').value,
    cliente_cpf_cnpj: document.getElementById('cpf').value,
    cliente_telefone: document.getElementById('telefone').value,
    lista_codigos_produtos: [1, 2, 2, 3],
    preco_total: document.getElementById('preco_total').value,
    entrega_destinatario_nome: document.getElementById('nome').value,
    entrega_destinatario_endereco: document.getElementById('endereco').value,
    entrega_data_horario: document.getElementById('data').value
    };
    try {
        const response = await fetch('http://172.26.3.157:3000/pedidos/cadastrar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(pedido)
    });

    const data = await response.json();
    console.log(data);

  } catch (erro) {
    console.error('Erro ao cadastrar:', erro);
  }
}

app.get('/cestas', async (req, res) => {
    try {
        const response = await fetch('http://172.26.3.157:3000/produtos/categoria/cesta');
        const data = await response.json();

        res.json(data); // repassa o JSON
    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao buscar produtos' });
    }
});

app.get('/itens', async (req, res) => {
    try {
        const response = await fetch('http://172.26.3.157:3000/produtos/categoria/item_comestivel');
        const data = await response.json();

        res.json(data); // repassa o JSON
    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao buscar produtos' });
    }
});

app.get('/bebidas', async (req, res) => {
    try {
        const response = await fetch('http://172.26.3.157:3000/produtos/categoria/bebida');
        const data = await response.json();

        res.json(data); // repassa o JSON
    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao buscar produtos' });
    }
});

app.get('/cartoes', async (req, res) => {
    try {
        const response = await fetch('http://172.26.3.157:3000/produtos/categoria/cartao_de_mensagem');
        const data = await response.json();

        res.json(data); // repassa o JSON
    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao buscar produtos' });
    }
});

app.get('/tematico', async (req, res) => {
    try {
        const response = await fetch('http://172.26.3.157:3000/produtos/categoria/presente_tematico');
        const data = await response.json();

        res.json(data); // repassa o JSON
    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao buscar produtos' });
    }
});

app.get('/decoracao', async (req, res) => {
    try {
        const response = await fetch('http://172.26.3.157:3000/produtos/categoria/decoracao_cesta');
        const data = await response.json();

        res.json(data); // repassa o JSON
    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao buscar produtos' });
    }
});



app.listen(porta, ipDoServidor, function(){
    console.log('\n Aplicacao web executando em http://'+ipDoServidor+':'+porta);
});