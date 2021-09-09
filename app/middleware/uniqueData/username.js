const service = require('../../../service')

module.exports = username = async (req, res, next) => { 
    let { username } = req.body
    let user = await service.user.getUserByUsername(username)
    if (user) return res.status(403).json({ message: 'Username has already been taken' })
    else next()
}