const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

app.use(cors());
app.use(express.json());

const { MercadoPagoConfig, Preference } = require('mercadopago');

// Inicialização do Mercado Pago com as suas credenciais
const client = new MercadoPagoConfig({ 
    accessToken: process.env.API_KEY
});

// Token de acesso do Melhor Envio
const TOKEN_MELHOR_ENVIO = process.env.TOKEN_MELHOR_ENVIO

// 1. ROTA DE FRETE ()
app.post('/frete', async (req, res) => {
    try {
        const { cep, peso, comprimento, largura, altura } = req.body;

        const response = await fetch("https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${TOKEN_MELHOR_ENVIO}`,
                "User-Agent": "Aplicação de Estudos (pedro14henrick@email.com)"
            },
            body: JSON.stringify({
                "from": { "postal_code": "96470000" }, 
                "to": { "postal_code": cep.replace(/\D/g, '') },
                "products": [
                    {
                        "id": "cesta-variavel",
                        "width": Number(largura),   
                        "height": Number(altura),    
                        "length": Number(comprimento),   
                        "weight": Number(peso),        
                        "insurance_value": 0,
                        "quantity": 1
                    }
                ]
            })
        });

        const resultado = await response.json();

        console.log(resultado);
        if (!Array.isArray(resultado)) {
            return res.status(400).json({
                erro: "Resposta inválida da API",
                detalhes: resultado
            });
        }

        const dadosSedex = resultado.find(t => t.name === 'SEDEX') 
            || { price: "15.00", delivery_time: 3 };

        const dadosPac = resultado.find(t => t.name === 'PAC') 
            || { price: "10.00", delivery_time: 7 };

        const respostaFormatada = [
            { Valor: Number(dadosSedex.price).toFixed(2).replace('.', ','), PrazoEntrega: dadosSedex.delivery_time },
            { Valor: Number(dadosPac.price).toFixed(2).replace('.', ','), PrazoEntrega: dadosPac.delivery_time }
        ];

        res.json(respostaFormatada);

    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao calcular frete' });
    }
});

// 2. ROTA DE PAGAMENTO (MERCADO PAGO)
app.post('/pedidos/pagar', async (req, res) => {
    try {
        // Recebe apenas os dados necessários para a cobrança
        const { preco_total, lista_codigos_produtos } = req.body;

        const preference = new Preference(client);

        const response = await preference.create({
            body: {
                items: [
                    {
                        id: "carrinho-sobreiro",
                        title: "Pedido na Loja Sobreiro",
                        quantity: 1,
                        unit_price: Number(preco_total), // Cobra o valor exato (Produtos + Frete)
                        currency_id: 'BRL'
                    }
                ],
                back_urls: {
                    success: "https://unfeeling-affix-skid.ngrok-free.dev/Telas/pg1.html",
                    failure: "https://unfeeling-affix-skid.ngrok-free.dev/Telas/pg2.html",
                    pending: "https://unfeeling-affix-skid.ngrok-free.dev/Telas/pg1.html"
                },
                auto_return: "approved"
            }
        });

        // Devolve o link de sandbox para o front-end seguir viagem
        res.json({ 
            sucesso: true, 
            init_point: response.sandbox_init_point 
        });

    } catch (erro) {
        console.error("Erro ao gerar link do Mercado Pago:", erro);
        res.status(500).json({ erro: "Erro interno no processamento do Mercado Pago." });
    }
});

app.listen(3001, () => console.log('Servidor de testes (Frete + Mercado Pago) rodando na 3001'));