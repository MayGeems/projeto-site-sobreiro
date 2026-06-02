document.addEventListener('DOMContentLoaded', async function () {

    // =====================================================
    // VARIÁVEIS GLOBAIS
    // =====================================================

     let carrinho = JSON.parse(localStorage.getItem('carrinho')) || {};

    let areaProdutos = document.querySelector('.areaProdutos');
    let finalizar = document.querySelector('.finalizar');
    let pesquisarT = document.querySelector('.pesq');
    let btnBuscar = document.querySelector('.fa-magnifying-glass');

    let listaCarrinho = document.getElementById('listaCarrinho');
    let totalItens = document.getElementById('totalItens');
    let valorTotal = document.getElementById('valorTotal');
    let btnFinalizar = document.querySelector('.btn-finalizar');

    let produtosGlobais = [];

    let estaNaTelaProdutos = areaProdutos !== null;
    let estaNaTelaCarrinho = listaCarrinho !== null;
    if (estaNaTelaProdutos) {

        finalizar.style.display = 'none';

        function verificarFinalizar() {

            let itensCarrinho = Object.values(carrinho);

            let possuiBebida = itensCarrinho.some(
                item => item.categoria.toLowerCase() === 'bebida'
            );

            let possuiCesta = itensCarrinho.some(
                item => item.categoria.toLowerCase() === 'cesta'
            );

            finalizar.style.display = (possuiBebida && possuiCesta)
                ? 'block'
                : 'none';
        }

        async function carregarProdutos(categoria) {

            let res = await fetch(
                'http://localhost:3000/produtos/categoria/' + categoria
            );

            produtosGlobais = await res.json();

            renderizar(produtosGlobais);
        }

        function renderizar(lista) {

            areaProdutos.innerHTML = '';

            for (let produto of lista) {

                let quantidade = carrinho[produto.codigo]
                    ? carrinho[produto.codigo].quantidade
                    : 0;

                let card = document.createElement('div');
                card.classList.add('card');

                card.innerHTML = `
                    <div class="card-imagem">
                        <img src="${produto.foto}">
                    </div>

                    <h3>${produto.nome}</h3>

                    <div class="preco">R$ ${produto.preco}</div>

                    <div class="contador">
                        <button class="menos">-</button>
                        <div class="quantidade">${quantidade}</div>
                        <button class="mais">+</button>
                    </div>
                `;

                areaProdutos.appendChild(card);

                let btnMais = card.querySelector('.mais');
                let btnMenos = card.querySelector('.menos');
                let display = card.querySelector('.quantidade');

                btnMais.addEventListener('click', () => {

                    quantidade++;

                    carrinho[produto.codigo] = {
                        id: produto.codigo,
                        categoria: produto.categoria,
                        nome: produto.nome,
                        preco: produto.preco,
                        quantidade: quantidade,
                        comprimento: produto.comprimento, 
                        altura: produto.altura,           
                        largura: produto.largura          
                    };

                    localStorage.setItem('carrinho', JSON.stringify(carrinho));

                    display.textContent = quantidade;
                    verificarFinalizar();
                });

                btnMenos.addEventListener('click', () => {

                    if (quantidade > 0) {

                        quantidade--;

                        if (quantidade === 0) {
                            delete carrinho[produto.codigo];
                        } else {
                            carrinho[produto.codigo].quantidade = quantidade;
                        }

                        localStorage.setItem('carrinho', JSON.stringify(carrinho));

                        display.textContent = quantidade;
                        verificarFinalizar();
                    }
                });
            }
        }

        document.getElementById('btnFinalizar')?.addEventListener('click', function () {

            localStorage.setItem('carrinho', JSON.stringify(carrinho));

            window.location.href = 'pg2.html';
        });

        btnBuscar.addEventListener('click', () => {

            let termo = pesquisarT.value.toLowerCase();

            let filtrados = produtosGlobais.filter(p =>
                p.nome.toLowerCase().includes(termo)
            );

            renderizar(filtrados);
        });

        document.querySelectorAll('.menu button').forEach(botao => {

            botao.addEventListener('click', () => {

                carregarProdutos(botao.dataset.cat.toLowerCase());
            });
        });

        carregarProdutos('bebida');
    }


    if (estaNaTelaCarrinho) {

        let btnFrete = document.getElementById('btnFrete');
        let resultadoFrete = document.getElementById('resultadoFrete');
        
        let valorFreteSalvo = 0; 

        btnFrete?.addEventListener('click', async function () {

            let cep = document.getElementById('cep').value;

            if (cep.length < 8) {
                resultadoFrete.textContent = 'Digite um CEP válido';
                return;
            }

            resultadoFrete.textContent = 'Calculando...';

           
            let pesoTotalKg = 0;
            let maiorComprimento = 0;
            let maiorLargura = 0;
            let alturaAcumulada = 0;

            Object.values(carrinho).forEach(item => {
            
                let pesoDoItem = item.peso || 0.25; 
                pesoTotalKg += pesoDoItem * item.quantidade;

                if (item.comprimento > maiorComprimento) maiorComprimento = Number(item.comprimento);
                if (item.largura > maiorLargura) maiorLargura = Number(item.largura);

                alturaAcumulada += Number(item.altura) * item.quantidade;
            });

            if (pesoTotalKg < 0.3) pesoTotalKg = 0.3;
            if (maiorComprimento < 16) maiorComprimento = 16; 
            if (maiorLargura < 11) maiorLargura = 11;      
            if (alturaAcumulada < 2) alturaAcumulada = 2;     

            try {

                let response = await fetch(
                    'http://localhost:3001/frete',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        
                        body: JSON.stringify({
                            cep: cep,
                            peso: pesoTotalKg,
                            comprimento: maiorComprimento,
                            largura: maiorLargura,
                            altura: alturaAcumulada
                        })
                    }
                );
                let data = await response.json();

                console.log(data);

                resultadoFrete.innerHTML = `
                    PAC: R$ ${data[1].Valor}
                    <br>
                    Prazo: ${data[1].PrazoEntrega} dias

                    <br><br>

                    SEDEX: R$ ${data[0].Valor}
                    <br>
                    Prazo: ${data[0].PrazoEntrega} dias
                `;

                valorFreteSalvo = parseFloat(data[1].Valor.replace(',', '.'));
                renderizarCarrinho();

            } catch (erro) {
                resultadoFrete.textContent = 'Erro ao calcular frete';
            }
        });

        function renderizarCarrinho() {

            listaCarrinho.innerHTML = '';

            let totalProdutos = 0;
            let quantidadeTotal = 0;

            Object.values(carrinho).forEach(item => {

                let subtotal = item.preco * item.quantidade;

                totalProdutos += subtotal;
                quantidadeTotal += item.quantidade;

                let div = document.createElement('div');
                div.classList.add('item');

                div.innerHTML = `
                    <div>
                        <strong>${item.nome}</strong>
                        <p>${item.categoria}</p>
                        <p>Qtd: ${item.quantidade}</p>
                    </div>

                    <div>
                        <strong>R$ ${subtotal.toFixed(2)}</strong>
                    </div>
                `;

                listaCarrinho.appendChild(div);
            });

            let valorTotalComFrete = totalProdutos + valorFreteSalvo;

            totalItens.textContent = `Itens: ${quantidadeTotal}`;
            
            
            if (valorFreteSalvo > 0) {
                valorTotal.innerHTML = `
                    Produtos: R$ ${totalProdutos.toFixed(2)}<br>
                    Frete (PAC): R$ ${valorFreteSalvo.toFixed(2)}<br>
                    <strong>Total: R$ ${valorTotalComFrete.toFixed(2)}</strong>
                `;
            } else {
                valorTotal.textContent = `Total: R$ ${valorTotalComFrete.toFixed(2)}`;
            }
        }

      btnFinalizar?.addEventListener('click', async function () {
            let clienteNome = document.getElementById('clienteNome').value;
            let clienteCpf = document.getElementById('clienteCpf').value;
            let clienteTelefone = document.getElementById('clienteTelefone').value;
            let destinatarioNome = document.getElementById('destinatarioNome').value;
            let destinatarioEndereco = document.getElementById('destinatarioEndereco').value;
            let dataEntrega = document.getElementById('dataEntrega').value;

            if (
                !clienteNome ||
                !clienteCpf ||
                !clienteTelefone ||
                !destinatarioNome ||
                !destinatarioEndereco ||
                !dataEntrega
            ) {
                alert('Preencha todos os campos antes de finalizar');
                return;
            }

            let listaProdutos = Object.values(carrinho)
                .map(item => `${item.nome} (x${item.quantidade})`)
                .join(', ');

            let totalProdutos = Object.values(carrinho).reduce(
                (acc, item) => acc + item.preco * item.quantidade,
                0
            );
            let precoTotalFinal = totalProdutos + valorFreteSalvo;

            
            let pedido = {
                cliente_nome: clienteNome,
                cliente_cpf_cnpj: clienteCpf,
                cliente_telefone: clienteTelefone,
                lista_codigos_produtos: listaProdutos,
                preco_total: precoTotalFinal,
                preco_frete: valorFreteSalvo,
                entrega_destinatario_nome: destinatarioNome,
                entrega_destinatario_endereco: destinatarioEndereco,
                entrega_data_horario: dataEntrega,
                data_criacao: new Date().toISOString().split('T')[0]
            };

            try {
                console.log("Salvando pedido no banco de dados...");
                let responseBanco = await fetch(
                    'http://localhost:3000/pedidos/cadastrar',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(pedido)
                    }
                );

                let dataBanco = await responseBanco.json();
                console.log("Resposta do Banco:", dataBanco);

                if (responseBanco.ok) {
                    
                    console.log("Pedido salvo! Gerando link do Mercado Pago...");
                    let responsePagamento = await fetch(
                        'http://localhost:3001/pedidos/pagar',
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                preco_total: pedido.preco_total,
                                lista_codigos_produtos: pedido.lista_codigos_produtos
                            })
                        }
                    );

                    let dataPagamento = await responsePagamento.json();
                    console.log("Resposta do Mercado Pago:", dataPagamento);

                    if (dataPagamento.init_point) {
                        alert('Pedido gravado e pronto para pagamento! Redirecionando...');
            
                        localStorage.removeItem('carrinho');
                        
                        window.location.href = dataPagamento.init_point;
                    } else {
                        alert('Pedido salvo no banco, mas houve uma falha ao gerar o link de pagamento.');
                    }

                } else {
                    alert('O banco de dados recusou o cadastro do pedido.');
                }

            } catch (erro) {
                console.error(erro);
                alert('Erro na comunicação entre os servidores.');
            }
        });

        renderizarCarrinho();
    }
});
