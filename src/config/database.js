const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mercado_sao_sebastiao'
});

// Função para conectar ao banco
const connect = (callback) => {
  connection.connect((err) => {
    if (err) {
      console.error('Erro de conexão com o banco:', err);
      return callback(err);
    }
    
    // Criar tabelas se não existirem
    createTables();
    callback(null);
  });
};

// Função para criar tabelas
const createTables = () => {
  const createProducersTable = `
    CREATE TABLE IF NOT EXISTS producers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      product_type VARCHAR(50) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      quantity_available INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  const createOrdersTable = `
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      producer_id INT NOT NULL,
      customer_name VARCHAR(100) NOT NULL,
      customer_email VARCHAR(100) NOT NULL,
      product_name VARCHAR(100) NOT NULL,
      quantity INT NOT NULL,
      total_price DECIMAL(10,2) NOT NULL,
      status ENUM('pending', 'confirmed', 'delivered') DEFAULT 'pending',
      order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (producer_id) REFERENCES producers(id)
    )
  `;
  
  connection.query(createProducersTable, (err) => {
    if (err) console.error('Erro ao criar tabela producers:', err);
    else console.log('✅ Tabela producers verificada/criada');
  });
  
  connection.query(createOrdersTable, (err) => {
    if (err) console.error('Erro ao criar tabela orders:', err);
    else console.log('✅ Tabela orders verificada/criada');
  });
};

module.exports = {
  connection,
  connect
};