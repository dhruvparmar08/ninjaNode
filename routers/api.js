var User = require('../models/user');
var jwt = require('jsonwebtoken');
var secret = 'harrypotter';

module.exports = function(router) {
    
    router.get('/', (req, res) => {
        res.send("Hello");
    });

    router.post('/register', (req, res) => {
        console.log("Hellllo ---- body", req.body);
        var user = new User();

        user.fname = req.body.fname;
        user.lname = req.body.lname;
        user.email = req.body.email;
        user.dob = req.body.dob;
        user.address = req.body.city;
        user.password = req.body.password;
        // user.temporarytoken = jwt.sign({ email: user.email }, secret, { expiresIn: '24h' });

        if(req.body.fname == null || req.body.fname == "" || req.body.password == null || req.body.password == "" || req.body.email == null || req.body.email == "" || req.body.lname == null || req.body.lname == ""){
            res.json({ success: false, message: 'Ensure Firstname, Lastname, password and email were provided', data: null});
        } else {
            user.save(function(err) {
                if(err) {
                    console.log("err", err);
                    if (err.errors != null) {
                        if(err.errors.fname) {
                            res.json({ success: false, message: 'Required minimum digits 3 of First Name', data: null });
                        } else if(err.errors.lname) {
                            res.json({ success: false, message: 'Required minimum digits 3 of Last Name', data: null });
                        } else if(err.errors.email) {
                            res.json({ success: false, message: err.errors.email.message, data: null });
                        } else if(err.errors.password) {
                            res.json({ success: false, message: err.errors.password.message, data: null });
                        }
                    } else {
                        res.json({success:false, message:err, data: null});
                    }
                } else {
                    res.json({ success: true, message: 'Successfully Registered !', data: null});
                }
            })
        }
    });

    router.post('/authenticate', function(req, res){
        User.findOne({ email: req.body.email }).select('email password').exec(function(err, user) {
            if (err) throw err;
            else {
                if (!user) {
                    res.json({ success: false, message: 'email and password not provided !!!', data: null });
                } else if (user) {
                    if (!req.body.password) {
                        res.json({ success: false, message: 'No password provided', data: null });
                    } else {
                        var validPassword = user.comparePassword(req.body.password);
                        if (!validPassword) {
                            res.json({ success: false, message: 'Could not authenticate password', data: null });
                        } else{
                            //res.send(user);
                            var token = jwt.sign({ email: user.email, id: user._id }, secret, { expiresIn: '24h' }); 
                            res.json({ success: true, message: 'User authenticated!', token: token, data: null});
                        }             
                    }
                }
            }   
        });
    });

    router.use(function(req, res, next) {

        var token = req.body.token || req.body.query || req.headers['x-access-token'];
        if (token) {
            jwt.verify(token, secret, function(err, decoded) {
                if (err) {
                    res.json({ success: false, message: 'Token invalid' });
                } else {
                    req.decoded = decoded;
                    next();
                }
            });
        } else {
            res.json({ success: false, message: 'No token provided' });
        }
    });

    router.get('/me', function(req, res) {
        User.findOne( {_id: req.decoded.id}, function(err, user) {
            if(err) throw err;
            if(!user) {
                res.json({ success: false, message: 'User not found'});
            } else {
                res.json({success: true, user: user});
            }
        });
    })

    return router;
}