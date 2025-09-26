const errorHandler = (err, req, res, next) => {
  console.error('Erro não tratado:', err);
  
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: 'Ocorreu um erro inesperado no servidor',
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler;