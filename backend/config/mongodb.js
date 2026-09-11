import mongoose from 'mongoose'

const connnectDB = async () => {

    if (process.env.NODE_ENV === 'test') {
        return
    }

    mongoose.connection.on('connected', () => {
        console.log('MongoDB connected')
    })

    await mongoose.connect(process.env.MONGODB_URI)
}

export default connnectDB