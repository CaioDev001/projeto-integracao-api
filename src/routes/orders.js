const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// POST /api/orders - Criar novo pedido
router.post('/', orderController.createOrder);

// GET /api/orders/:id - Buscar pedido por ID
router.get('/:id', orderController.getOrderById);

module.exports = router;