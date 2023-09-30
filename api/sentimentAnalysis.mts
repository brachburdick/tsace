import { NowRequest, NowResponse } from '@vercel/node';
const xenova = require('@xenova/transformers'); // Adjust based on actual module name

export default async (req: NowRequest, res: NowResponse) => {
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*'); 
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');
        res.status(200).end();
        return;
    }

    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');
  
    try {
        const text = req.body.text;

        if (!text) {
            return res.status(400).send({ message: 'Text not provided' });
        }

        // Use the xenova library for sentiment analysis here
        const distilbert = xenova.pipeline('text-classification', 'distilbert-base-uncased-emotion');
        const result = await distilbert(text);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: 'Internal Server Error', error });
    }
};
