import { nanoid } from 'nanoid';
import {URL} from '../models/url.js';


export async function shorturl(req,res){
    const body=req.body;
    if(!body.url) return res.status(400).json({error:"url is required"})
const shortId=nanoid(8);

await URL.create({
    shortId:shortId,
    redirectURL:body.url,
    visitHistory:[]
})
    return res.json({id:shortId,message:"short url created"})
}

export async function redirectUrl(req,res){
    const entry=await URL.findOneAndUpdate(
        {shortId:req.params.shortId},
        {$push:{visitHistory:{timeStamp:Date.now()}}}
    );
    if(!entry) return res.status(404).send("Short link not found");
    return res.redirect(entry.redirectURL);
}

export async function analytics(req,res){
    const entry=await URL.findOne({shortId:req.params.shortId});
    if(!entry) return res.status(404).json({error:"not found"});
    return res.json({totalClicks:entry.visitHistory.length,analytics:entry.visitHistory});
}


export async function listUrls(req,res){
    const docs=await URL.find().sort({createdAt:-1});
    return res.json(docs.map(d=>({
        id:d.shortId,
        url:d.redirectURL,
        clicks:d.visitHistory.length,
        createdAt:d.createdAt
    })));
}

export async function deleteUrl(req,res){
    await URL.deleteOne({shortId:req.params.shortId});
    return res.json({message:"deleted"});
}
