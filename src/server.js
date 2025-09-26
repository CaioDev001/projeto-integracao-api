require('dotenv').config();
const app = require('./app');
const database = require('./config/database');

const PORT = process.env.PORT || 3000;

// Conectar ao banco de dados e iniciar servidor
database.connect((err) => {
  if (err) {
    console.error('Erro ao conectar com o banco de dados:', err);
    return;
  }
  
  console.log('✅ Conectado ao banco de dados MySQL');
  
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  });
});