const request = require('supertest');
const app = require('../src/app');

// Mock dos modelos
jest.mock('../src/models/producer');
const Producer = require('../src/models/producer');

describe('API de Produtores', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/producers', () => {
    it('deve retornar todos os produtores com status 200', async () => {
      const mockProducers = [
        { 
          id: 1, 
          name: 'Produtor 1', 
          email: 'prod1@email.com', 
          product_type: 'Frutas', 
          price: 10.0, 
          quantity_available: 50 
        },
        { 
          id: 2, 
          name: 'Produtor 2', 
          email: 'prod2@email.com', 
          product_type: 'Verduras', 
          price: 5.0, 
          quantity_available: 30 
        }
      ];

      Producer.getAll.mockImplementation((callback) => callback(null, mockProducers));

      const response = await request(app)
        .get('/api/producers')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);
    });

    it('deve retornar array vazio quando não há produtores', async () => {
      Producer.getAll.mockImplementation((callback) => callback(null, []));

      const response = await request(app)
        .get('/api/producers')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('deve retornar erro 500 em caso de falha no banco', async () => {
      Producer.getAll.mockImplementation((callback) => callback(new Error('Erro no banco')));

      const response = await request(app)
        .get('/api/producers')
        .expect(500);
      
      expect(response.body.error).toBe('Erro interno do servidor');
    });
  });

  describe('GET /api/producers/:id', () => {
    it('deve retornar erro 400 para ID inválido', async () => {
      const response = await request(app)
        .get('/api/producers/abc')
        .expect(400);
      
      expect(response.body.error).toBe('ID inválido');
    });

    it('deve retornar erro 404 para produtor não encontrado', async () => {
      Producer.getById.mockImplementation((id, callback) => callback(null, null));

      const response = await request(app)
        .get('/api/producers/9999')
        .expect(404);
      
      expect(response.body.error).toBe('Produtor não encontrado');
    });

    it('deve retornar produtor quando encontrado', async () => {
      const mockProducer = { 
        id: 1, 
        name: 'Produtor Teste', 
        email: 'teste@email.com', 
        product_type: 'Frutas', 
        price: 15.0, 
        quantity_available: 100 
      };
      
      Producer.getById.mockImplementation((id, callback) => callback(null, mockProducer));

      const response = await request(app)
        .get('/api/producers/1')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockProducer);
    });
  });

  describe('POST /api/producers', () => {
    it('deve criar um novo produtor com dados válidos', async () => {
      const newProducer = {
        name: 'Produtor Teste',
        email: 'teste@email.com',
        product_type: 'Hortaliças',
        price: 15.50,
        quantity_available: 100
      };

      const createdProducer = { id: 1, ...newProducer };
      
      Producer.create.mockImplementation((data, callback) => callback(null, createdProducer));

      const response = await request(app)
        .post('/api/producers')
        .send(newProducer)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Produtor criado com sucesso');
      expect(response.body.data.id).toBe(1);
    });

    it('deve retornar erro 400 para dados faltando', async () => {
      const invalidProducer = {
        name: 'Produtor Teste',
        // email faltando
        product_type: 'Hortaliças',
        price: 15.50
      };

      const response = await request(app)
        .post('/api/producers')
        .send(invalidProducer)
        .expect(400);
      
      expect(response.body.error).toBe('Campos obrigatórios faltando');
    });

    it('deve retornar erro 400 para preço inválido', async () => {
      const invalidProducer = {
        name: 'Produtor Teste',
        email: 'teste@email.com',
        product_type: 'Hortaliças',
        price: -5.00, // Preço negativo
        quantity_available: 100
      };

      const response = await request(app)
        .post('/api/producers')
        .send(invalidProducer)
        .expect(400);
      
      expect(response.body.error).toBe('Preço inválido');
    });

    it('deve retornar erro 409 para email duplicado', async () => {
      const duplicateProducer = {
        name: 'Produtor Teste',
        email: 'duplicado@email.com',
        product_type: 'Hortaliças',
        price: 15.50,
        quantity_available: 100
      };

      const mysqlError = { code: 'ER_DUP_ENTRY' };
      Producer.create.mockImplementation((data, callback) => callback(mysqlError));

      const response = await request(app)
        .post('/api/producers')
        .send(duplicateProducer)
        .expect(409);
      
      expect(response.body.error).toBe('Email já cadastrado');
    });
  });
});