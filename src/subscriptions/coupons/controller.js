const stripe = require('../../services/stripe')

exports.list = () => stripe.getCoupons()
exports.findOne = code => stripe.getCoupon(code)
