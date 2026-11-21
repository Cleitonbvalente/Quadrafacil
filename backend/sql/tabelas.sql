CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  perfil ENUM('cidadao', 'escola') NOT NULL DEFAULT 'cidadao',
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reservas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  modalidade VARCHAR(60) NOT NULL,
  data_reserva DATE NOT NULL,
  horario VARCHAR(20) NOT NULL,
  status ENUM('ativa', 'cancelada_usuario', 'cancelada_escola') NOT NULL DEFAULT 'ativa',
  motivo_cancelamento VARCHAR(255) NULL,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  cancelado_em DATETIME NULL,
  vaga_ativa VARCHAR(40) GENERATED ALWAYS AS (IF(status = 'ativa', CONCAT(data_reserva, ' ', horario), NULL)) STORED,
  CONSTRAINT fk_reservas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT uq_reservas_vaga_ativa UNIQUE (vaga_ativa),
  INDEX idx_reservas_data (data_reserva),
  INDEX idx_reservas_usuario (usuario_id, status)
);

CREATE TABLE IF NOT EXISTS bloqueios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  data_bloqueio DATE NOT NULL,
  horario VARCHAR(20) NOT NULL,
  motivo VARCHAR(255) NOT NULL,
  criado_por INT NULL,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_bloqueios_usuario FOREIGN KEY (criado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
  CONSTRAINT uq_bloqueios_vaga UNIQUE (data_bloqueio, horario)
);

CREATE TABLE IF NOT EXISTS notificacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  titulo VARCHAR(120) NOT NULL,
  mensagem TEXT NOT NULL,
  reserva_id INT NULL,
  lida TINYINT(1) NOT NULL DEFAULT 0,
  criada_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notificacoes_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_notificacoes_reserva FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE SET NULL,
  INDEX idx_notificacoes_usuario (usuario_id, lida)
);
