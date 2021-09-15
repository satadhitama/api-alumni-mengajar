const jwt = require('jsonwebtoken')
const luxon = require('luxon')
const moment = require('moment-timezone')

const service = require('../../../../service')
const helper = require('../../../../helper')

module.exports = async function create(req, res) {
  const token = req.headers.authorization.split(' ')[1]
  const userId = jwt.decode(token).id

  const time = moment.tz(luxon.DateTime.now().toString(), "Asia/Jakarta");
  const engDay = time.format('dddd')
  const engMonth = time.format('MMMM')
  const day = helper.converter.toIndonesiaDay(engDay)
  const month = helper.converter.toIndonesiaMonth(engMonth)
  let dateTime = {
    date: req.body.date,
    day,
    month,
    start: req.body.start,
    end: req.body.end,
  }
  req.body.enrolled = 0
  req.body.date = dateTime
  delete req.body.start
  delete req.body.end 
  const _event = helper.objectManipulation.renameKey(req.body, 'date', 'dateTime')
  _event.userId = userId

  try {
    const newEvent = await service._event.create(_event)
    const imageId = newEvent.imageId
    const allowedFileType = [
      'image/png',
      'image/jpeg',
      'image/jpg'
    ]
    const file = req.files[0]
    const splitNameFile = file.originalname.split('.')
    const formatFile = splitNameFile[splitNameFile.length - 1]
  
    if(allowedFileType.includes(file.mimetype)) {
      const image = await service._event.upload(file.buffer, `event/${imageId}.${formatFile}`)
      
      return res.status(201).json({
        statusCode: 201,
        status: 'Created',
        result: {
          id: newEvent.id,
          userId: newEvent.userId,
          image: {
            id: newEvent.imageId,
            url: image.publicUrl,
          },
        },
        message: 'Successfully uploaded file'
      })
    }
  } catch(error) {
    res.status(400).json({
      statusCode: 400,
      status:"Bad Request",
      message: 'Failed to create event',
    })
  }
}