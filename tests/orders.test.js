const request = require('supertest');
const app = require('../src/app');

// Mock dos modelos
jest.mock('../src/models/producer');
jest.mock('../src/models/order');

const Producer = require('../src/models/producer');
const Order = require('../src/models/order');

describe('API de Pedidos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/orders', () => {
    it('deve criar um novo pedido com dados válidos', async () => {
      const mockProducer = {
        id: 1,
        name: 'Produtor Teste',
        email: 'produtor@email.com',
        product_type: 'Frutas',
        price: 8.75,
        quantity_available: 50
      };

      const newOrder = {
        producer_id: 1,
        customer_name: 'Cliente Teste',
        customer_email: 'cliente@email.com',
        product_name: 'Maçãs',
        quantity: 10
      };

      const createdOrder = {
        id: 1,
        ...newOrder,
        total_price: 87.50,
        status: 'pending'
      };

      // Mock das funções do banco
      Producer.getById.mockImplementation((id, callback) => callback(null, mockProducer));
      Order.create.mockImplementation((data, callback) => callback(null, createdOrder));
      Producer.updateStock.mockImplementation((id, quantity, callback) => callback(null));

      const response = await request(app)
        .post('/api/orders')
        .send(newOrder)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Pedido criado com sucesso');
      expect(response.body.data.total_price).toBe(87.50);
    });

    it('deve retornar erro 400 para campos faltando', async () => {
      const invalidOrder = {
        producer_id: 1,
        customer_name: 'Cliente Teste',
        // customer_email faltando
        product_name: 'Maçãs',
        quantity: 10
      };

      const response = await request(app)
        .post('/api/orders')
        .send(invalidOrder)
        .expect(400);
      
      expect(response.body.error).toBe('Campos obrigatórios faltando');
    });

    it('deve retornar erro 400 para quantidade inválida', async () => {
      const invalidOrder = {
        producer_id: 1,
        customer_name: 'Cliente Teste',
        customer_email: 'cliente@email.com',
        product_name: 'Maçãs',
        quantity: 0 // Quantidade inválida
      };

      // Mock do produtor para evitar erro 404
      const mockProducer = {
        id: 1,
        name: 'Produtor Teste',
        email: 'produtor@email.com',
        product_type: 'Frutas',
        price: 8.75,
        quantity_available: 50
      };

      Producer.getById.mockImplementation((id, callback) => callback(null, mockProducer));

      const response = await request(app)
        .post('/api/orders')
        .send(invalidOrder)
        .expect(400);
      
      expect(response.body.error).toBe('Quantidade inválida');
    });

    it('deve retornar erro 404 para produtor não encontrado', async () => {
      const orderData = {
        producer_id: 999,
        customer_name: 'Cliente Teste',
        customer_email: 'cliente@email.com',
        product_name: 'Maçãs',
        quantity: 10
      };

      Producer.getById.mockImplementation((id, callback) => callback(null, null));

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(404);
      
      expect(response.body.error).toBe('Produtor não encontrado');
    });

    it('deve retornar erro 400 para estoque insuficiente', async () => {
      const mockProducer = {
        id: 1,
        name: 'Produtor Teste',
        email: 'produtor@email.com',
        product_type: 'Frutas',
        price: 8.75,
        quantity_available: 5 // Estoque baixo
      };

      const orderData = {
        producer_id: 1,
        customer_name: 'Cliente Teste',
        customer_email: 'cliente@email.com',
        product_name: 'Maçãs',
        quantity: 10 // Quantidade maior que estoque
      };

      Producer.getById.mockImplementation((id, callback) => callback(null, mockProducer));

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);
      
      expect(response.body.error).toBe('Estoque insuficiente');
    });
  });

  describe('GET /api/orders/:id', () => {
    it('deve retornar erro 400 para ID inválido', async () => {
      const response = await request(app)
        .get('/api/orders/abc')
        .expect(400);
      
      expect(response.body.error).toBe('ID inválido');
    });

    it('deve retornar erro 404 para pedido não encontrado', async () => {
      Order.getById.mockImplementation((id, callback) => callback(null, null));

      const response = await request(app)
        .get('/api/orders/9999')
        .expect(404);
      
      expect(response.body.error).toBe('Pedido não encontrado');
    });

    it('deve retornar pedido quando encontrado', async () => {
      const mockOrder = {
        id: 1,
        producer_id: 1,
        customer_name: 'Cliente Teste',
        customer_email: 'cliente@email.com',
        product_name: 'Maçãs',
        quantity: 10,
        total_price: 87.50,
        status: 'pending',
        producer_name: 'Produtor Teste',
        product_type: 'Frutas'
      };

      Order.getById.mockImplementation((id, callback) => callback(null, mockOrder));

      const response = await request(app)
        .get('/api/orders/1')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1);
    });
  });
});