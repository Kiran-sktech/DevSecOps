import request from 'supertest'
import app from '../server.js'

describe('Backend API', () => {
    test('GET / should return API Working', async () => {
        const response = await request(app).get('/')

        expect(response.statusCode).toBe(200)
        expect(response.text).toBe('API Working')
    })
})