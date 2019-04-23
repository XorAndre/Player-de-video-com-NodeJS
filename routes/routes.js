const express = require("express")
const router = express.Router()
router.get('/', (req, res) => {
	res.render('aplication/index')
})
router.get('/playListVideos', (req, res) =>{
	res.render('aplication/playListVideos')
})
module.exports = router