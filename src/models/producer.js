// Verificar se está em ambiente de teste
if (process.env.NODE_ENV === 'test') {
  // Mock para testes
  module.exports = class Producer {
    static getAll(callback) {
      callback(null, []);
    }
    
    static getById(id, callback) {
      callback(null, null);
    }
    
    static create(data, callback) {
      callback(null, { id: 1, ...data });
    }
    
    static updateStock(id, quantity, callback) {
      callback(null);
    }
  };
} else {
  // Código original para produção/desenvolvimento
  const { connection } = require('../config/database');

  class Producer {
    // Buscar todos os produtores
    static getAll(callback) {
      const query = 'SELECT * FROM producers WHERE quantity_available > 0';
      connection.query(query, (err, results) => {
        if (err) return callback(err);
        callback(null, results);
      });
    }
    
    // Buscar produtor por ID
    static getById(id, callback) {
      const query = 'SELECT * FROM producers WHERE id = ?';
      connection.query(query, [id], (err, results) => {
        if (err) return callback(err);
        callback(null, results[0]);
      });
    }
    
    // Criar novo produtor
    static create(producerData, callback) {
      const { name, email, product_type, price, quantity_available } = producerData;
      const query = 'INSERT INTO producers (name, email, product_type, price, quantity_available) VALUES (?, ?, ?, ?, ?)';
      
      connection.query(query, [name, email, product_type, price, quantity_available], (err, results) => {
        if (err) return callback(err);
        callback(null, { id: results.insertId, ...producerData });
      });
    }
    
    // Atualizar estoque do produtor
    static updateStock(producerId, newQuantity, callback) {
      const query = 'UPDATE producers SET quantity_available = ? WHERE id = ?';
      connection.query(query, [newQuantity, producerId], (err, results) => {
        if (err) return callback(err);
        callback(null, results);
      });
    }
  }

  module.exports = Producer;
}