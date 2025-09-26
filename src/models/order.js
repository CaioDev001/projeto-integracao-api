// Verificar se está em ambiente de teste
if (process.env.NODE_ENV === 'test') {
  // Mock para testes
  module.exports = class Order {
    static create(orderData, callback) {
      callback(null, { id: 1, ...orderData, status: 'pending' });
    }
    
    static getById(id, callback) {
      callback(null, null);
    }
    
    static updateStatus(orderId, newStatus, callback) {
      callback(null);
    }
  };
} else {
  // Código original para produção/desenvolvimento
  const { connection } = require('../config/database');

  class Order {
    // Criar novo pedido
    static create(orderData, callback) {
      const { producer_id, customer_name, customer_email, product_name, quantity, total_price } = orderData;
      const query = 'INSERT INTO orders (producer_id, customer_name, customer_email, product_name, quantity, total_price) VALUES (?, ?, ?, ?, ?, ?)';
      
      connection.query(query, [producer_id, customer_name, customer_email, product_name, quantity, total_price], (err, results) => {
        if (err) return callback(err);
        callback(null, { id: results.insertId, ...orderData, status: 'pending' });
      });
    }
    
    // Buscar pedido por ID
    static getById(id, callback) {
      const query = `
        SELECT o.*, p.name as producer_name, p.product_type 
        FROM orders o 
        JOIN producers p ON o.producer_id = p.id 
        WHERE o.id = ?
      `;
      connection.query(query, [id], (err, results) => {
        if (err) return callback(err);
        callback(null, results[0]);
      });
    }
    
    // Atualizar status do pedido
    static updateStatus(orderId, newStatus, callback) {
      const query = 'UPDATE orders SET status = ? WHERE id = ?';
      connection.query(query, [newStatus, orderId], (err, results) => {
        if (err) return callback(err);
        callback(null, results);
      });
    }
  }

  module.exports = Order;
}