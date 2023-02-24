/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

//  Razorpay

async function Payment (buttonid, discount, offer) {
  const button = document.getElementById(buttonid)
  const address = document.querySelector('input[name = "address"]:checked').value
  const url = '/payment/razorpay'
  console.log(discount)
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        address,
        discount,
        offer
      })
    })
    const res = await response.json()
    if (res.successStatus) {
      check(res.orderInstance, res.user)
    } else {
      window.location.href = '/checkout'
    }
  } catch (err) {
  }
}

function check (order, user) {
  const options = {
    key: 'rzp_test_bVuwFNHsddTNfM',
    amount: order.amount,
    currency: 'INR',
    name: 'PitBULL',
    description: 'Test Transaction',
    image: '',
    order_id: order.id,
    handler: function (response) {
      verifyPayment(response, order)
    },
    prefill: {
      name: user.username,
      email: user.email,
      contact: user.number
    },
    notes: {
      address: 'Razorpay Corporate Office'
    },
    theme: {
      color: '#000000'
    },
    modal: {
      ondismiss: function () {
        cancelPayment(order)
      }
    }
  }
  const rzp1 = new Razorpay(options)
  rzp1.open()
  rzp1.on('payment.failed', function (response) {
    paymentFail(response, order)
  })
}

async function verifyPayment (payment, order) {
  const response = await fetch('/payment/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      payment,
      order
    })
  })
  const res = await response.json()
  if (res.successStatus) {
    window.location.href = '/payment/cod'
  } else {
    window.location.href = '/paymentfail'
  }
}

async function cancelPayment (order) {
  try {
    const response = await fetch('/payment/cancel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        order
      })
    })
    const res = await response.json()
    if (res.successStatus) {
      window.location.href = '/paymentfail'
    } else {
      window.location.href = '/'
    }
  } catch (error) {
    console.log(error)
  }
}

async function paymentFail (payment, order) {
  const response = await fetch('/paymentfail', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      payment,
      order
    })
  })
  const res = await response.json()
  if (res.successStatus) {
    window.location.href = '/paymentfail'
  } else {
    window.location.href = '/paymentfail'
  }
}

// Paypal  payment method

// async function paymentPaypal(buttonid){
//   console.log("paypal");
//   const button = document.getElementById(buttonid)
//   const address = document.querySelector('input[name = "address"]:checked').value
//   const url = "payment/paypal"
//   button.disabled = true
//   try {
//       const response = await fetch(url, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           address
//         })
//       })
//       const res = await response.json()
//       if(res.successStatus){
//         console.log("sucess");
//         onApprove(id)
//       }else{
//         window.location.href = '/checkout'
//       }
//     } catch (err) {
//           }

//   }

//  function onApprove (data, action) {
//     return actions.order.capture().then(function(orderData) {
//       // Successful capture! For dev/demo purposes:
//       console.log('Capture result', orderData, JSON.stringify(orderData, null, 2));
//       const transaction = orderData.purchase_units[0].payments.captures[0];
//       alert(`Transaction ${transaction.status}: ${transaction.id}\n\nSee console for all available details`);
//           // When ready to go live, remove the alert and show a success message within this page. For example:
//       // const element = document.getElementById('paypal-button-container');
//       // element.innerHTML = '<h3>Thank you for your payment!</h3>';
//       // Or go to another URL:  actions.redirect('thank_you.html');
//     });
//   }

//
//   // Sets up the transaction when a payment button is clicked
//   createOrder: (data, actions) => {
//     return actions.order.create({
//       purchase_units: [{
//         amount: {
//           value: '77.44' // Can also reference a variable or function
//         }
//       }]
//     });
//   },
