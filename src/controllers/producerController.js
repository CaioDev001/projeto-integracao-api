const Producer = require('../models/producer');

const producerController = {
  // GET /api/producers - Listar todos os produtores
  getAllProducers: (req, res) => {
    Producer.getAll((err, producers) => {
      if (err) {
        return res.status(500).json({
          error: 'Erro interno do servidor',
          message: 'Não foi possível buscar os produtores'
        });
      }
      
      res.json({
        success: true,
        count: producers.length,
        data: producers
      });
    });
  },
  
  // GET /api/producers/:id - Buscar produtor por ID
  getProducerById: (req, res) => {
    const producerId = req.params.id;
    
    if (!producerId || isNaN(producerId)) {
      return res.status(400).json({
        error: 'ID inválido',
        message: 'O ID do produtor deve ser um número válido'
      });
    }
    
    Producer.getById(producerId, (err, producer) => {
      if (err) {
        return res.status(500).json({
          error: 'Erro interno do servidor',
          message: 'Não foi possível buscar o produtor'
        });
      }
      
      if (!producer) {
        return res.status(404).json({
          error: 'Produtor não encontrado',
          message: `Nenhum produtor encontrado com o ID ${producerId}`
        });
      }
      
      res.json({
        success: true,
        data: producer
      });
    });
  },
  
  // POST /api/producers - Criar novo produtor
  createProducer: (req, res) => {
    const { name, email, product_type, price, quantity_available } = req.body;
    
    // Validação dos campos obrigatórios
    if (!name || !email || !product_type || !price) {
      return res.status(400).json({
        error: 'Campos obrigatórios faltando',
        message: 'Nome, email, tipo de produto e preço são obrigatórios'
      });
    }
    
    if (price <= 0) {
      return res.status(400).json({
        error: 'Preço inválido',
        message: 'O preço deve ser maior que zero'
      });
    }
    
    const producerData = {
      name,
      email,
      product_type,
      price: parseFloat(price),
      quantity_available: quantity_available || 0
    };
    
    Producer.create(producerData, (err, newProducer) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({
            error: 'Email já cadastrado',
            message: 'Já existe um produtor cadastrado com este email'
          });
        }
        
        return res.status(500).json({
          error: 'Erro interno do servidor',
          message: 'Não foi possível criar o produtor'
        });
      }
      
      res.status(201).json({
        success: true,
        message: 'Produtor criado com sucesso',
        data: newProducer
      });
    });
  }
};

module.exports = producerController;