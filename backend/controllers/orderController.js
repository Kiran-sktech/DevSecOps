import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import razorpay from "../config/razorpay.js";
import crypto from "crypto";


// =====================================================
// COD ORDER
// =====================================================

const placeOrder = async (req, res) => {
  try {

    const { userId, items, amount, address } = req.body;

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: 'Cash On Delivery',
      payment: false,
      date: Date.now()
    };

    const newOrder = new orderModel(orderData);

    await newOrder.save();

    await userModel.findByIdAndUpdate(
      userId,
      { cartData: {} }
    );

    res.json({
      success: true,
      message: 'Order Placed'
    });

  } catch (error) {

    console.log(error);

    res.json({
      success: false,
      message: error.message
    });
  }
};


// =====================================================
// CREATE RAZORPAY ORDER
// =====================================================

const createRazorpayOrder = async (req, res) => {

  try {

    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.json({
        success: false,
        message: "Invalid order amount"
      });
    }

    // Razorpay amount is in paise.
    // ₹100 = 10000 paise
    const amountInPaise = Math.round(amount * 100);

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.json({
      success: true,
      order: razorpayOrder
    });

  } catch (error) {

    console.log("Razorpay order creation error:", error);

    res.json({
      success: false,
      message: error.message
    });
  }
};


// =====================================================
// VERIFY RAZORPAY PAYMENT
// =====================================================

const verifyRazorpayPayment = async (req, res) => {

  try {

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      amount,
      address
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.json({
        success: false,
        message: "Missing Razorpay payment details"
      });
    }


    // Create signature using:
    // razorpay_order_id + "|" + razorpay_payment_id

    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        razorpay_order_id + "|" + razorpay_payment_id
      )
      .digest("hex");


    // Compare generated signature with Razorpay signature

    if (generatedSignature !== razorpay_signature) {

      return res.json({
        success: false,
        message: "Payment verification failed"
      });

    }


    // Payment is genuine

    const userId = req.body.userId;

    const orderData = {

      userId,

      items,

      address,

      amount,

      paymentMethod: "Razorpay",

      payment: true,

      razorpayOrderId: razorpay_order_id,

      razorpayPaymentId: razorpay_payment_id,

      date: Date.now()
    };


    const newOrder = new orderModel(orderData);

    await newOrder.save();


    // Clear user's cart

    await userModel.findByIdAndUpdate(
      userId,
      { cartData: {} }
    );


    res.json({

      success: true,

      message: "Payment successful and order placed",

      orderId: newOrder._id

    });


  } catch (error) {

    console.log("Payment verification error:", error);

    res.json({

      success: false,

      message: error.message

    });
  }
};


// =====================================================
// ALL ORDERS - ADMIN
// =====================================================

const allOrders = async (req, res) => {

  try {

    const orders = await orderModel.find({});

    res.json({
      success: true,
      orders
    });

  } catch (error) {

    console.log(error);

    res.json({
      success: false,
      message: error.message
    });
  }
};


// =====================================================
// USER ORDERS
// =====================================================

const userOrders = async (req, res) => {

  try {

    const { userId } = req.body;

    const orders = await orderModel.find({ userId });

    res.json({
      success: true,
      orders
    });

  } catch (error) {

    console.log(error);

    res.json({
      success: false,
      message: error.message
    });
  }
};


// =====================================================
// UPDATE ORDER STATUS
// =====================================================

const updateStatus = async (req, res) => {

  try {

    const { orderId, status } = req.body;

    await orderModel.findByIdAndUpdate(
      orderId,
      { status }
    );

    res.json({
      success: true,
      message: "Order Status Updated"
    });

  } catch (error) {

    console.log(error);

    res.json({
      success: false,
      message: error.message
    });
  }
};


export {
  placeOrder,
  createRazorpayOrder,
  verifyRazorpayPayment,
  allOrders,
  userOrders,
  updateStatus
};