CREATE TABLE pedidos (
  codigo SERIAL PRIMARY KEY,
  cliente_nome VARCHAR(100) NOT NULL,
  cliente_cpf_cnpj VARCHAR(100) NOT NULL,
  cliente_telefone VARCHAR(15) NOT NULL,
  lista_codigos_produtos VARCHAR(100) NOT NULL,
  preco_total NUMERIC(10,2) NOT NULL,
  preco_frete NUMERIC (10,2) NOT NULL,
  entrega_destinatario_nome VARCHAR(100) NOT NULL,
  entrega_destinatario_endereco VARCHAR(200) NOT NULL,
  entrega_data_horario TIMESTAMP NOT NULL,
  data_criacao DATE NOT NULL
);

CREATE TABLE produtos (
  codigo SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT NOT NULL,
  quantidade_estoque INTEGER NOT NULL,
  preco NUMERIC(10,2) NOT NULL,
  categoria VARCHAR(30) NOT NULL,
  foto VARCHAR(255),-- nome do arquivo de imagem ex.: bombom02.png
  comprimento NUMERIC(5,2) NOT NULL, --EM CENTÍMETROS
  altura NUMERIC (5,2) NOT NULL,
  largura NUMERIC (5,2) NOT NULL,
  volume NUMERIC(6,3)
);

CREATE OR REPLACE FUNCTION calcular_volume()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
	NEW.volume :=
	    COALESCE(NEW.altura, 0) *
	    COALESCE(NEW.comprimento, 0) *
	    COALESCE(NEW.largura, 0)
	RETURN NEW;
END;
$$;


CREATE OR REPLACE TRIGGER t_calcular_volume
BEFORE INSERT OR UPDATE ON produtos
FOR EACH ROW EXECUTE PROCEDURE calcular_volume()

