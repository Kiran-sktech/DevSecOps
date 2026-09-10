import client from 'prom-client'
import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connnectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import userRouter from './routes/userRoute.js'
import productRouter from './routes/productRoute.js'
import cartRouter from './routes/cartRoute.js'
import orderRouter from './routes/orderRoute.js'

// App Config

const app = express()
const Port = process.env.PORT || 4000

// Prometheus metrics
client.collectDefaultMetrics()

const httpRequestsTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
})

const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5]
})

const httpErrorsTotal = new client.Counter({
    name: 'http_errors_total',
    help: 'Total number of HTTP error responses',
    labelNames: ['method', 'route', 'status_code']
})

const appStatus = new client.Gauge({
    name: 'application_status',
    help: 'Application status: 1 means running'
})

appStatus.set(1)

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType)
    res.end(await client.register.metrics())
})
connnectDB()
connectCloudinary()

// Middleware
app.use(express.json())
app.use(cors())

// HTTP request metrics
app.use((req, res, next) => {
    const start = process.hrtime()

    res.on('finish', () => {
        const diff = process.hrtime(start)
        const duration = diff[0] + diff[1] / 1e9

        const route = req.route
            ? req.baseUrl + req.route.path
            : req.path

        const labels = {
            method: req.method,
            route: route,
            status_code: res.statusCode.toString()
        }

        httpRequestsTotal.inc(labels)
        httpRequestDuration.observe(labels, duration)

        if (res.statusCode >= 400) {
            httpErrorsTotal.inc(labels)
        }
    })

    next()
})

// API Endpoints
app.use('/api/user', userRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)

app.get('/', (req,res) => {
    res.send('API Working')
})

app.listen(Port,() => console.log('Server is running on port : '+ Port))
