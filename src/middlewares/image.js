const multer = require('multer')
const cloudinary = require('cloudinary').v2
const { get } = require('../configuration')
const { InternalServerError } = require('../utils/errors')

cloudinary.config({
  cloud_name: get('CLOUDINARY_CLOUD_NAME'),
  api_key: get('CLOUDINARY_API_KEY'),
  api_secret: 'CLOUDINARY_API_SECRET'
})

const upload = multer({ storage: multer.memoryStorage() }).any()

module.exports = async (req, _, next) => {
  upload(req, _, () => {
    if (!req.files.length) return next()
    const [{ buffer: file }] = req.files[0]
    cloudinary.uploader
      .unsigned_upload_stream(
        get('CLOUDINARY_UPLOAD_PRESET'),
        { resource_type: 'image', folder: 'backend-api-starter' },
        (err, { secure_url }) => {
          if (err) {
            throw new InternalServerError('Error uploading image!')
          } else {
            const imageURL = { image_url: secure_url }
            req.body = { ...req.body, ...imageURL }
            next()
          }
        }
      )
      .end(file)
  })
}
