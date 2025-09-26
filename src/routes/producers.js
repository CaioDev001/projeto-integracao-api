const express = require('express');
const router = express.Router();
const producerController = require('../controllers/producerController');

// GET /api/producers - Listar todos os produtores
router.get('/', producerController.getAllProducers);

// GET /api/producers/:id - Buscar produtor por ID
router.get('/:id', producerController.getProducerById);

// POST /api/producers - Criar novo produtor
router.post('/', producerController.createProducer);

module.exports = router;