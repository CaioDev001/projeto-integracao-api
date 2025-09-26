// Mock global para evitar conexões reais com MySQL durante os testes
jest.mock('../src/config/database', () => ({
  connection: {
    connect: jest.fn((callback) => callback && callback()),
    query: jest.fn((sql, params, callback) => {
      if (typeof params === 'function') {
        callback = params;
        params = [];
      }
      if (callback) {
        callback(null, []);
      }
    }),
    end: jest.fn()
  },
  connect: jest.fn((callback) => callback && callback(null))
}));

// Configurar ambiente de teste
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_USER = 'test';
process.env.DB_PASSWORD = 'test';
process.env.DB_NAME = 'test_db';