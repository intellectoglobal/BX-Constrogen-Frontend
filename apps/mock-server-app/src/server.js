const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('./src/db.json')
const middlewares = jsonServer.defaults()

server.use(middlewares);

server.use(jsonServer.bodyParser)


server.get('/api/auth/otp', (req, res) => {
    res.status(200).jsonp({
        msg: 'OTP sent success',
        sessionId: 'sessionId'
    })
})

server.post('/api/auth/otp', (req, res) => {
    console.log(req.body);
    if (req.body) {
        const { otp, phone, session_id } = req.body;
        if (otp === 12345 && !!phone && !!session_id) {
            res.status(200).jsonp({
                token: 'testtoken'
            })
            return;
        }
    }

    res.sendStatus(401)
})

function isAuthorized(req) {
    return req.headers.authorization === 'testtoken';
}

server.use((req, res, next) => {
    next();
    // if (isAuthorized(req)) { // add your authorization logic here
    //     next() // continue to JSON Server router
    // } else {
    //     res.sendStatus(401)
    // }
})

server.use(jsonServer.rewriter({
    '/api/*': '/$1',
    '/project/:resource': '/api/:resource',
    '/client/:resource': '/api/:resource'
}))

server.use('/api', router);
server.listen(8000, () => {
    console.log('JSON Server is running')
})