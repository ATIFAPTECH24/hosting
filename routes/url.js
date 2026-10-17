import express from 'express'
import {shorturl,analytics,listUrls,deleteUrl} from '../controllers/url.js'


 const router=express.Router();

router.post('/',shorturl)
router.get('/',listUrls)
router.delete('/:shortId',deleteUrl)
router.get('/analytics/:shortId',analytics)

 export default router;