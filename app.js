const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const router = express.Router();
const config = require('./config');
const tokenList = {};
const app = express();
app.use(bodyParser.json());
router.get('/', (req,res) => {
    res.status(200).send({
        message:'successful',
        status:200
    });
});

router.post('/login', (req,res) => {
    const postData = req.body;
    if(postData.email!==undefined && postData.name !== undefined){
        // here you can use either email or userid  as both are unique ,user can be easily identified .
        const user = {
            "email": postData.email,
            "name": postData.name
        }
        // do the database authentication here, with user name and password combination.
        try{

            const token = jwt.sign(user, config.secret, { expiresIn: config.tokenLife});
            const refreshToken = jwt.sign(user, config.refreshTokenSecret, { expiresIn: config.refreshTokenLife});
            const response = {
                "status": "Logged in",
                "token": token,
                "refreshToken": refreshToken,
            }
            tokenList[refreshToken] = response;
            res.status(200).json(response);
        }catch(err){
            res.status(401).json({
                message:'unauthorised access',
                status:401
            });
        }
    }else{
        res.status(401).json({
            status:401,
            message:'unauthorised access'
        });
    }
    
    
});

router.post('/token', (req,res) => {
    // refresh the damn token
    const postData = req.body;
    // if refresh token exists
    if((postData.refreshToken) ) {
        jwt.verify(postData.refreshToken,config.refreshTokenSecret,(err,result)=>{
            if(err){
                res.json({
                    message:'unauthorised access',
                    status:401
                });
            }else{
                let user={
                email : result.email ,
                name : result.name 
            }
            const token = jwt.sign(user, config.secret, { expiresIn: config.tokenLife });
            const response = {
                "token": token
            }
            // console.log('tokenlist',tokenList);
            // update the token in the list
            tokenList[postData.refreshToken].token = token ;
            res.status(200).json(response);
            }
        });
    } else {
        res.status(404).send('Invalid request');
    }
});

router.use(require('./tokenChecker'));
router.get('/secure', (req,res) => {
    // all secured routes goes here
    res.send('I am secured...');
});
router.get('/user/:id',function(req,res){
    console.log(req.params.id,req);
});


app.use(bodyParser.json());
app.use('/api', router)
app.listen(config.port || process.env.port || 3000,()=>{
    console.log('server started');
});
