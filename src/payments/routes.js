'use strict'

const router = require('express').Router()
const { catchAsync } = require('../utils/errors')
const controller = require('./controller')

router.get('/customers/retrieve_customer', catchAsync(async (req, res) => res.json(await controller.c_retrieve(req.user_object.stripe_id))))

router.post('/customers/update_customer', catchAsync(async (req, res) => res.json(await controller.c_update(req.user_object.stripe_id, req.body))))

router.post('/payment_intent/create_payment_intent', catchAsync(async (req, res) => res.send(await controller.pi_create(req.body, req.user_object))))

router.post('/payment_intent/confirm_payment_intent', catchAsync(async (req, res) => res.json(await controller.pi_confirm(req.body))))

router.post('/payment_intent/update_payment_intent', catchAsync(async (req, res) => res.json(await controller.pi_update(req.body))))

router.post(
  '/payment_methods/create_payment_method',
  catchAsync(async (req, res) => res.json(await controller.pm_create({ parameters: req.body, user: req.user_object })))
)

router.get('/payment_methods/get_payment_methods_list', catchAsync(async (req, res) => res.json(await controller.pms_get(req.user_object))))

router.post('/payment_methods/detach_payment_method', catchAsync(async (req, res) => res.json(await controller.pm_detach(req.body.pm))))

module.exports = router
