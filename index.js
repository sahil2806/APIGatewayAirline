const express = require('express');
const app = express();
var morgan = require('morgan')
const { createProxyMiddleware } = require('http-proxy-middleware');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const axios = require('axios');

const limiter = rateLimit({
    window:2*60*1000,
    max:5,
})




const PORT = 3004;

app.use(morgan('combined'));
app.use(limiter);


 const  authorisation = async  (req,res,next) => {
    try {
        const response = await axios.get('http://localhost:3000/api/v1/isauthenticated', {
            headers: {
                'x-access-token': req.headers['x-access-token']
            }
        });
        if(response.data.success) {
            next();
        } else {
            return res.status(401).json({
                message: 'Unauthorised'
            })
        }
    } catch (error) {
        return res.status(401).json({
            message: 'Unauthorised'
        })
    }
}



app.use('/authservice',  createProxyMiddleware({target: 'http://localhost:3000/',changeOrigin: true,}));

app.use('/flightsearchservice',authorisation,  createProxyMiddleware({target: 'http://localhost:3001/', changeOrigin: true, }));

app.use('/bookingservice' ,  authorisation, createProxyMiddleware({ target: 'http://localhost:3002/',changeOrigin: true,}))

app.use('/reminderservice', authorisation ,createProxyMiddleware({ target: 'http://localhost:3003/', changeOrigin: true,}));



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.listen(PORT,()=>{
    console.log(`Server is start on port:${PORT}`);
})




