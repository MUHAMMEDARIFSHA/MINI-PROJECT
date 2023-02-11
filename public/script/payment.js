

 
  async function Payment(buttonid){
    const button = document.getElementById(buttonid)
    const address = document.querySelector('input[name = "address"]:checked').value
    const url = "payment/razorpay"
    button.disabled = true
    try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            address
          })
        })
        const res = await response.json()
        if(res.successStatus){
          check(res.orderInstance, res.user)
        }else{
          window.location.href = '/checkout'
        }
      } catch (err) {
            }
    
    }

    function check(order, user){
        const options = {
          "key": "rzp_test_bVuwFNHsddTNfM",
          "amount": order.amount,
          "currency": "INR",
          "name": "PitBULL",
          "description": "Test Transaction",
          "image": "",
          "order_id": order.id, 
          "handler": function (response){
            verifyPayment(response, order)
          },
          "prefill": {
              "name": user.username,
              "email": user.email,
              "contact": user.number
          },
          "notes": {
              "address": "Razorpay Corporate Office"
          },
          "theme": {
              "color": "#000000"
          },
          "modal": {
            "ondismiss": function(){
              cancelPayment(order)
            }
          }
        }
        const rzp1 = new Razorpay(options)
        rzp1.open()
        rzp1.on('payment.failed', function (response){
          
          paymentFail(response, order)
        })
      }

      async function verifyPayment(payment, order){
        const response = await fetch('/payment/verify',{
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
        if(res.successStatus){
          window.location.href = '/ordersucces'
        }else{
          window.location.href = '/paymentfail'
        }
      }
      
      async function cancelPayment(order){
        try {
          const response = await fetch('/payment/cancel',{
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              order
            })
          })
          const res = await response.json()
          if(res.successStatus){
            window.location.href = '/paymentfail'
          }else{
            window.location.href = '/'
          }
        } catch (error) {
          console.log(error)
        }
      }
      
      async function paymentFail(payment, order){
        const response = await fetch('/paymentfail',{
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
        if(res.successStatus){
          window.location.href = '/paymentfail'
        }else{
          window.location.href = '/paymentfail'
        }
      }





      // alert(response.error.code);
          // alert(response.error.description);
          // alert(response.error.source);
          // alert(response.error.step);
          // alert(response.error.reason);
          // alert(response.error.metadata.order_id);
          // alert(response.error.metadata.payment_id);
    