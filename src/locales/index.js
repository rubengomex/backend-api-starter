const locales = {
  en: {},
  pt: {}
}

exports.get = key => locales[key]
exports.getAll = () => locales
