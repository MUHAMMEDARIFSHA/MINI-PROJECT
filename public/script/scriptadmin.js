/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
$(document).ready(function () {
  $('#datatable').DataTable()
})

function blockUser (id) {
  const data = document.getElementById(id).dataset.url
  const url = '/admin/userdata/' + data
  const body = {
    id: data
  }
  fetch(url, {
    method: 'put',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({ body })
  }).then((response) => response.json())
    .then((response) => {
      if (response.successStatus) {
        window.location.href = response.redirect
      } else {
        document.querySelector('#error').innerHTML = 'An error has occured please try again'
      }
    }).catch((err) => console.log(err))
}

function deleteCategory (id) {
  const data = document.getElementById(id).dataset.url
  const url = '/admin/categories/' + data
  const body = {
    id: data
  }
  fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ body })
  }).then((response) => response.json())
    .then((response) => {
      if (response.successStatus) {
        window.location.href = response.redirect
      } else {
        document.querySelector('#error').innerHTML = 'An error occured please try again'
      }
    }).catch((err) => console.log(err))
}

function deleteProduct (id) {
  const data = document.getElementById(id).dataset.url
  const url = '/admin/product/product-details/' + data
  const body = {
    id: data
  }
  fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ body })
  }).then((response) => response.json())
    .then((response) => {
      if (response.successStatus) {
        window.location.href = response.redirect
      } else {
        document.querySelector('#error').innerHTML = 'An error occured please try again'
      }
    }).catch((err) => console.log(err))
}

function addtoCart (id) {
  const url = '/cart/add'
  const body = {
    id
  }

  fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }).then((response) => response.json())
    .then((response) => {
      if (response.successStatus) {
        window.location.reload()
      } else {
        document.querySelector('#error').innerHTML = 'An error occured please try again'
      }
    }).catch((err) => console.log(err))
}

function removeCartItem (id) {
  const url = '/cart/remove'
  const body = {
    id
  }
  console.log(id)
  fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }).then((response) => response.json())
    .then((response) => {
      if (response.successStatus) {
        window.location.reload()
      } else {
        document.querySelector('#error').innerHTML = 'An error occured please try again'
      }
    }).catch((err) => console.log(err))
}
function removeWishItem (id) {
  const url = '/wish/remove'
  const body = {
    id
  }
  console.log(id)
  fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }).then((response) => response.json())
    .then((response) => {
      if (response.successStatus) {
        window.location.reload()
      } else {
        document.querySelector('#error').innerHTML = 'An error occured please try again'
      }
    }).catch((err) => console.log(err))
}

function changeQuantity (id, amount, count) {
  const url = '/cart/change'
  const body = {
    id,
    amount,
    count
  }

  fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }).then((response) => response.json())
    .then((response) => {
      if (response.successStatus) {
        document.getElementById(id).value = response.count
        const total = document.getElementById('totalamount1')
        total.innerText = response.totalamount
        document.getElementById('productprice').innerText = response.totalamount
        document.getElementById(count).innerHTML = ''
      } else {
        if (response.quantity) {
          if (response.totalStoke === response.quantity) {
            console.log(response.totalStoke, response.quantity)
            // document.getElementById(totalamount).innerHTML  = response.total
            document.getElementById(count).innerHTML = 'Out of stoke'
          }
        }
      }
    }).catch((err) => console.log(err))
}
function cancelOrder (id) {
  const url = '/admin/orders/cancel'
  const body = {
    id
  }
  console.log(id)
  fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }).then((response) => response.json())
    .then((response) => {
      if (response.successStatus) {
        window.location.reload()
      } else {
        document.querySelector('#error').innerHTML = 'An error occured please try again'
      }
    }).catch((err) => console.log(err))
}

function orderCancel (id) {
  const url = '/orders/cancel'
  const body = {
    id
  }
  console.log(id)
  fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }).then((response) => response.json())
    .then((response) => {
      if (response.successStatus) {
        window.location.reload()
      } else {
        document.querySelector('#error').innerHTML = 'An error occured please try again'
      }
    }).catch((err) => console.log(err))
}

function changeStatus (id, count) {
  const url = '/admin/orders/change'
  const value = document.getElementById(count).value
  console.log(id)
  console.log(value)
  const body = {
    id,
    value
  }
  fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }).then((response) => response.json())
    .then((response) => {
      if (response.successStatus) {
        window.location.reload()
      } else {
        document.querySelector('#error').innerHTML = 'An error occured please try again'
      }
    }).catch((err) => console.log(err))
}
function addtoWishlist (id) {
  const url = '/wishlist/add'
  const body = {
    id
  }
  console.log(id)
  fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }).then((response) => response.json())
    .then((response) => {
      if (response.successStatus) {
        window.location.reload()
      } else {
        document.querySelector('#error').innerHTML = 'An error occured please try again'
      }
    }).catch((err) => console.log(err))
}

function addtoCartfromWish (id) {
  const url = '/wishlist/cart/add'
  const body = {
    id
  }

  fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }).then((response) => response.json())
    .then((response) => {
      if (response.successStatus) {
        window.location.reload()
      } else {
        document.querySelector('#error').innerHTML = 'An error occured please try again'
      }
    }).catch((err) => console.log(err))
}

function deleteCoupon (id) {
  const data = document.getElementById(id).dataset.url
  const url = '/admin/coupons/' + data
  const body = {
    id: data
  }
  fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ body })
  }).then((response) => response.json())
    .then((response) => {
      if (response.successStatus) {
        console.log('sucess')
        window.location.reload()
      } else {
        document.querySelector('#error').innerHTML = 'An error occured please try again'
      }
    }).catch((err) => console.log(err))
}

function addCoupons (buttonid) {
  const button = document.getElementById(buttonid)
  const coupon = document.getElementById('coupon').value
  const url = 'checkout/addcoupon'
  console.log(coupon)
  console.log('addcoupon')
  const body = {
    coupon
  }
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }).then((response) => response.json())
    .then((response) => {
      if (response.successStatus) {
        console.log('sucess')
        window.location.reload()
      } else {
        error.innerHTML = response.message
      }
    })
    .catch((err) => console.log(err))
}

function deleteAddress (id, addressId) {
  console.log('delete address')
  const url = '/delete/address'
  const body = {
    id,
    addressId
  }
  fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }).then((response) => response.json())
    .then((response) => {
      if (response.successStatus) {
        window.location.reload()
      } else {
        // document.querySelector('#error').innerHTML = "An error occured please try again"
      }
    }).catch((err) => console.log(err))
}

function viewOrderDetails (id, count) {
  console.log('product details')
  const url = '/orders/product/details'
  const body = {
    id,
    count
  }
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }).then((response) => response.json())
    .then((response) => {
      if (response.successStatus) {
        window.location.href = response.redirect
      } else {
        // document.querySelector('#error').innerHTML = "An error occured please try again"
      }
    }).catch((err) => console.log(err))
}
