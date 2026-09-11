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

// Middleware
app.use(express.json())
app.use(cors())

// API Endpoints
app.use('/api/user', userRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)

app.get('/', (req, res) => {
    res.send('API Working')
})

// Start server only when this file is run directly
if (process.env.NODE_ENV !== 'test') {
    connnectDB()
    connectCloudinary()

    app.listen(Port, '0.0.0.0', () => {
        console.log('Server is running on port : ' + Port)
    })
}

export default app