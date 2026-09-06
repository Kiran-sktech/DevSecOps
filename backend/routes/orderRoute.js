import express from 'express';

import {
    placeOrder,
    createRazorpayOrder,
    verifyRazorpayPayment,
    allOrders,
    userOrders,
    updateStatus
} from '../controllers/orderController.js';

import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';


const orderRouter = express.Router();


// =====================================================
// ADMIN
// =====================================================

orderRouter.post(
    '/list',
    adminAuth,
    allOrders
);

orderRouter.post(
    '/status',
    adminAuth,
    updateStatus
);


// =====================================================
// COD
// =====================================================

orderRouter.post(
    '/place',
    authUser,
    placeOrder
);


// =====================================================
// RAZORPAY
// =====================================================

// Create Razorpay order

orderRouter.post(
    '/razorpay',
    authUser,
    createRazorpayOrder
);


// Verify Razorpay payment

orderRouter.post(
    '/verifyRazorpay',
    authUser,
    verifyRazorpayPayment
);


// =====================================================
// USER ORDERS
// =====================================================

orderRouter.post(
    '/userorders',
    authUser,
    userOrders
);


export default orderRouter;