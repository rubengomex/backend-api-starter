// Available email types
exports.EMAIL_TYPES = {
  SUBSCRIBED: 'subscribed',
  UPDATE_SUBSCRIPTION: 'subscription_update',
  CANCEL_SUBSCRIPTION: 'subscription_cancel',
  CANCEL_SUBSCRIPTION_MAX_ATTEMPTS_EXCEEDED: 'subscription_cancel_max_attempts_exceeded'
}

// Available email subjects
exports.EMAIL_SUBJECTS = {
  SUBSCRIBED: 'Subscription for a {0} plan is now active',
  UPDATE_SUBSCRIPTION: 'Subscription updated to a {0} plan',
  CANCEL_SUBSCRIPTION: 'Subscription for a {0} plan is now cancelled'
}
