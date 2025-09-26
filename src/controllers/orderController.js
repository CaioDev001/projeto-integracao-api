const Order = require('../models/order');
const Producer = require('../models/producer');

const orderController = {
  // POST /api/orders - Criar novo pedido
  createOrder: (req, res) => {
    const { producer_id, customer_name, customer_email, product_name, quantity } = req.body;
    
    // Validação dos campos obrigatórios - CORRIGIDA
    // Verifica se os campos existem (não são undefined/null) mas permite quantity = 0
    if (producer_id === undefined || producer_id === null ||
        customer_name === undefined || customer_name === null ||
        customer_email === undefined || customer_email === null ||
        product_name === undefined || product_name === null ||
        quantity === undefined || quantity === null) {
      return res.status(400).json({
        error: 'Campos obrigatórios faltando',
        message: 'Todos os campos são obrigatórios: producer_id, customer_name, customer_email, product_name, quantity'
      });
    }
    
    // Validação específica para quantidade - CORRIGIDA
    if (quantity <= 0) {
      return res.status(400).json({
        error: 'Quantidade inválida',
        message: 'A quantidade deve ser maior que zero'
      });
    }
    
    // Primeiro verifica se o produtor existe e tem estoque
    Producer.getById(producer_id, (err, producer) => {
      if (err) {
        return res.status(500).json({
          error: 'Erro interno do servidor',
          message: 'Não foi possível verificar o produtor'
        });
      }
      
      if (!producer) {
        return res.status(404).json({
          error: 'Produtor não encontrado',
          message: `Nenhum produtor encontrado com o ID ${producer_id}`
        });
      }
      
      if (producer.quantity_available < quantity) {
        return res.status(400).json({
          error: 'Estoque insuficiente',
          message: `Quantidade solicitada (${quantity}) excede o estoque disponível (${producer.quantity_available})`
        });
      }
      
      // Calcula o preço total
      const total_price = producer.price * quantity;
      
      const orderData = {
        producer_id,
        customer_name,
        customer_email,
        product_name,
        quantity,
        total_price
      };
      
      // Cria o pedido
      Order.create(orderData, (err, newOrder) => {
        if (err) {
          return res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Não foi possível criar o pedido'
          });
        }
        
        // Atualiza o estoque do produtor
        const newQuantity = producer.quantity_available - quantity;
        Producer.updateStock(producer_id, newQuantity, (updateErr) => {
          if (updateErr) {
            console.error('Erro ao atualizar estoque:', updateErr);
          }
        });
        
        res.status(201).json({
          success: true,
          message: 'Pedido criado com sucesso',
          data: newOrder
        });
      });
    });
  },
  
  // GET /api/orders/:id - Buscar pedido por ID
  getOrderById: (req, res) => {
    const orderId = req.params.id;
    
    if (!orderId || isNaN(orderId)) {
      return res.status(400).json({
        error: 'ID inválido',
        message: 'O ID do pedido deve ser um número válido'
      });
    }
    
    Order.getById(orderId, (err, order) => {
      if (err) {
        return res.status(500).json({
          error: 'Erro interno do servidor',
          message: 'Não foi possível buscar o pedido'
        });
      }
      
      if (!order) {
        return res.status(404).json({
          error: 'Pedido não encontrado',
          message: `Nenhum pedido encontrado com o ID ${orderId}`
        });
      }
      
      res.json({
        success: true,
        data: order
      });
    });
  }
};

module.exports = orderController;