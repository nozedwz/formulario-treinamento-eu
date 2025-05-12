-- Conecte-se ao MySQL
CREATE SCHEMA IF NOT EXISTS forms;
USE forms;

-- Tabela de treinamentos (com campos adicionados)
CREATE TABLE treinamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  empresa VARCHAR(255) NOT NULL,
  tipo_treinamento ENUM('completo', 'personalizado') NOT NULL,
  participantes TEXT NOT NULL, -- Armazena os participantes como JSON
  telefones TEXT, -- Armazena os telefones como JSON
  emails TEXT, -- Armazena os emails como JSON
  agendamento DATETIME, -- Renomeado de data_hora para agendamento
  data_criacao DATETIME NOT NULL,
  status ENUM('agendado', 'concluido', 'cancelado') DEFAULT 'agendado'
);

-- Tabela de opções de treinamento (renomeada)
CREATE TABLE tipo_treinamento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  treinamento_id INT NOT NULL,
  opcao VARCHAR(100) NOT NULL,
  valor INT NOT NULL, -- Alterado para INT (0=naoPreciso, 1=breveExplicacao, 2=explicacaoCompleta)
  FOREIGN KEY (treinamento_id) REFERENCES treinamentos(id) ON DELETE CASCADE
);

-- Remover tabelas antigas se existirem
DROP TABLE IF EXISTS opcoes_treinamento;
DROP TABLE IF EXISTS emails;
DROP TABLE IF EXISTS telefones;
DROP TABLE IF EXISTS participantes;
