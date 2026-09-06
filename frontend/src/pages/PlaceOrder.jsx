import React, { useContext, useState } from 'react';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';


const PlaceOrder = () => {

  const [method, setMethod] = useState('Razorpay');

  const {
    navigate,
    backendUrl,
    token,
    cartItems,
    setCartItems,
    getCartAmount,
    delivery_fee,
    products
  } = useContext(ShopContext);


  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    phone: ''
  });


  const [loading, setLoading] = useState(false);


  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const onChangeHandler = (event) => {

    const name = event.target.name;
    const value = event.target.value;

    setFormData(data => ({
      ...data,
      [name]: value
    }));

  };


  // =====================================================
  // LOAD RAZORPAY CHECKOUT SCRIPT
  // =====================================================

  const loadRazorpayScript = () => {

    return new Promise((resolve) => {

      const script = document.createElement('script');

      script.src =
        'https://checkout.razorpay.com/v1/checkout.js';

      script.onload = () => {
        resolve(true);
      };

      script.onerror = () => {
        resolve(false);
      };

      document.body.appendChild(script);

    });

  };


  // =====================================================
  // CREATE ORDER ITEMS
  // =====================================================

  const getOrderItems = () => {

    let orderItems = [];

    for (const items in cartItems) {

      for (const item in cartItems[items]) {

        if (cartItems[items][item] > 0) {

          const itemInfo = structuredClone(
            products.find(
              product => product._id === items
            )
          );

          if (itemInfo) {

            itemInfo.size = item;

            itemInfo.quantity =
              cartItems[items][item];

            orderItems.push(itemInfo);

          }

        }

      }

    }

    return orderItems;
  };


  // =====================================================
  // RAZORPAY PAYMENT
  // =====================================================

  const payWithRazorpay = async (
    orderItems,
    orderAmount
  ) => {

    try {

      // Load Razorpay Checkout

      const scriptLoaded =
        await loadRazorpayScript();

      if (!scriptLoaded) {

        toast.error(
          'Razorpay SDK failed to load'
        );

        return;

      }


      // Create Razorpay order from backend

      const response = await axios.post(

        backendUrl +
        '/api/order/razorpay',

        {
          amount: orderAmount
        },

        {
          headers: {
            token
          }
        }

      );


      if (!response.data.success) {

        toast.error(
          response.data.message
        );

        return;

      }


      const razorpayOrder =
        response.data.order;


      // =================================================
      // RAZORPAY CHECKOUT OPTIONS
      // =================================================

      const options = {

        key:
          import.meta.env
            .VITE_RAZORPAY_KEY_ID,

        amount:
          razorpayOrder.amount,

        currency:
          razorpayOrder.currency,

        name:
          'Forever',

        description:
          'Forever Fashion Order',

        order_id:
          razorpayOrder.id,


        prefill: {

          name:
            `${formData.firstName} ${formData.lastName}`,

          email:
            formData.email,

          contact:
            formData.phone

        },


        notes: {

          address:
            `${formData.street}, ${formData.city}, ${formData.state}`

        },


        theme: {

          color:
            '#000000'

        },


        // =================================================
        // PAYMENT SUCCESS
        // =================================================

        handler: async function (paymentResponse) {

          try {

            toast.info(
              'Verifying payment...'
            );


            // Send payment details to backend

            const verifyResponse =
              await axios.post(

                backendUrl +
                '/api/order/verifyRazorpay',

                {

                  razorpay_order_id:
                    paymentResponse.razorpay_order_id,

                  razorpay_payment_id:
                    paymentResponse.razorpay_payment_id,

                  razorpay_signature:
                    paymentResponse.razorpay_signature,

                  items:
                    orderItems,

                  amount:
                    orderAmount,

                  address:
                    formData

                },

                {

                  headers: {
                    token
                  }

                }

              );


            if (verifyResponse.data.success) {

              toast.success(
                'Payment successful! Order placed.'
              );


              // Clear cart

              setCartItems({});


              // Go to orders page

              navigate('/orders');


            } else {

              toast.error(
                verifyResponse.data.message
              );

            }


          } catch (error) {

            console.log(
              'Payment verification error:',
              error
            );

            toast.error(
              'Payment verification failed'
            );

          }

        },


        // =================================================
        // PAYMENT MODAL CLOSE
        // =================================================

        modal: {

          ondismiss: function () {

            toast.info(
              'Payment cancelled'
            );

          }

        }

      };


      // Open Razorpay

      const razorpay =
        new window.Razorpay(options);


      razorpay.on(
        'payment.failed',
        function (response) {

          console.log(
            'Payment failed:',
            response.error
          );

          toast.error(
            response.error.description ||
            'Payment failed'
          );

        }
      );


      razorpay.open();


    } catch (error) {

      console.log(
        'Razorpay error:',
        error
      );

      toast.error(
        error.response?.data?.message ||
        error.message ||
        'Something went wrong'
      );

    }

  };


  // =====================================================
  // FORM SUBMIT
  // =====================================================

  const onSubmitHandler = async (event) => {

    event.preventDefault();


    if (!token) {

      toast.error(
        'Please login first'
      );

      navigate('/login');

      return;

    }


    try {

      setLoading(true);


      // Create order items

      const orderItems =
        getOrderItems();


      if (orderItems.length === 0) {

        toast.error(
          'Your cart is empty'
        );

        return;

      }


      // Total amount

      const orderAmount =
        getCartAmount() +
        delivery_fee;


      // =================================================
      // RAZORPAY
      // =================================================

      if (method === 'Razorpay') {

        await payWithRazorpay(
          orderItems,
          orderAmount
        );

      }


      // =================================================
      // COD
      // =================================================

      else if (
        method === 'Cash On Delivery'
      ) {

        const response =
          await axios.post(

            backendUrl +
            '/api/order/place',

            {

              address:
                formData,

              items:
                orderItems,

              amount:
                orderAmount

            },

            {

              headers: {
                token
              }

            }

          );


        if (response.data.success) {

          setCartItems({});

          navigate('/orders');

        } else {

          toast.error(
            response.data.message
          );

        }

      }


    } catch (error) {

      console.log(error);

      toast.error(
        error.response?.data?.message ||
        error.message ||
        'Something went wrong'
      );

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // UI
  // =====================================================

  return (

    <form
      onSubmit={onSubmitHandler}
      className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'
    >

      {/* ================= LEFT SIDE ================= */}

      <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>

        <div className='text-xl sm:text-2xl my-3'>

          <Title
            text1='DELIVERY'
            text2='INFORMATION'
          />

        </div>


        <div className='flex gap-3'>

          <input
            required
            onChange={onChangeHandler}
            name='firstName'
            value={formData.firstName}
            className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
            type='text'
            placeholder='First Name'
          />


          <input
            required
            onChange={onChangeHandler}
            name='lastName'
            value={formData.lastName}
            className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
            type='text'
            placeholder='Last Name'
          />

        </div>


        <input
          required
          onChange={onChangeHandler}
          name='email'
          value={formData.email}
          className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
          type='email'
          placeholder='Email Address'
        />


        <input
          required
          onChange={onChangeHandler}
          name='street'
          value={formData.street}
          className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
          type='text'
          placeholder='Street'
        />


        <div className='flex gap-3'>

          <input
            required
            onChange={onChangeHandler}
            name='city'
            value={formData.city}
            className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
            type='text'
            placeholder='City'
          />


          <input
            required
            onChange={onChangeHandler}
            name='state'
            value={formData.state}
            className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
            type='text'
            placeholder='State'
          />

        </div>


        <div className='flex gap-3'>

          <input
            required
            onChange={onChangeHandler}
            name='zipcode'
            value={formData.zipcode}
            className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
            type='number'
            placeholder='Zip Code'
          />


          <input
            required
            onChange={onChangeHandler}
            name='country'
            value={formData.country}
            className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
            type='text'
            placeholder='Country'
          />

        </div>


        <input
          required
          onChange={onChangeHandler}
          name='phone'
          value={formData.phone}
          className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
          type='tel'
          placeholder='Phone'
        />

      </div>


      {/* ================= RIGHT SIDE ================= */}

      <div className='mt-8'>

        <div className='mt-8 min-w-80'>

          <CartTotal />

        </div>


        {/* PAYMENT METHOD */}

        <div className='mt-12'>

          <Title
            text1='PAYMENT'
            text2='METHOD'
          />


          <div className='flex gap-3 flex-col lg:flex-row'>


            {/* RAZORPAY */}

            <div
              onClick={() =>
                setMethod('Razorpay')
              }
              className='flex items-center gap-3 border p-2 px-3 cursor-pointer'
            >

              <p
                className={`
                  min-w-3.5
                  h-3.5
                  border
                  rounded-full
                  ${
                    method === 'Razorpay'
                      ? 'bg-green-400'
                      : ''
                  }
                `}
              />

              <p className='text-gray-500 text-sm font-medium mx-4'>

                RAZORPAY

              </p>

            </div>


            {/* COD */}

            <div
              onClick={() =>
                setMethod(
                  'Cash On Delivery'
                )
              }
              className='flex items-center gap-3 border p-2 px-3 cursor-pointer'
            >

              <p
                className={`
                  min-w-3.5
                  h-3.5
                  border
                  rounded-full
                  ${
                    method ===
                    'Cash On Delivery'
                      ? 'bg-green-400'
                      : ''
                  }
                `}
              />

              <p className='text-gray-500 text-sm font-medium mx-4'>

                CASH ON DELIVERY

              </p>

            </div>


          </div>


          {/* PLACE ORDER */}

          <div className='w-full text-end mt-8'>

            <button
              disabled={loading}
              type='submit'
              className='bg-black text-white px-16 py-3 disabled:opacity-50'
            >

              {loading
                ? 'PROCESSING...'
                : 'PLACE ORDER'}

            </button>

          </div>

        </div>

      </div>

    </form>

  );

};


export default PlaceOrder;