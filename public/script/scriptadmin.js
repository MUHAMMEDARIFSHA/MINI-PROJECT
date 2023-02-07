$(document).ready(function () {
    $('#datatable').DataTable();
});

function blockUser(id) {
    const data = document.getElementById(id).dataset.url;
    const url = "http://localhost:4000/admin/userdata/" + data;
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
                document.querySelector('#error').innerHTML = "An error has occured please try again"
            }
        }).catch((err) => console.log(err))
}

function deleteCategory(id){
    const data = document.getElementById(id).dataset.url;
    const url = "http://localhost:4000/admin/categories/" +data;
    const body ={
        id:data
    }
    fetch(url,{
        method:'PATCH',
        headers :{
            'Content-Type' : 'application/json'
        },
        body:JSON.stringify({body})
    }).then((response)=> response.json())
    .then((response)=>{
        if(response.successStatus){
            window.location.href=response.redirect
        }
        else{
            document.querySelector('#error').innerHTML = "An error occured please try again"
        }
    }).catch((err) => console.log(err))
}

function deleteProduct(id){
    const data = document.getElementById(id).dataset.url;
    const url = "http://localhost:4000/admin/product/product-details/" +data;
    const body ={
        id:data
    }
    fetch(url,{
        method:'PATCH',
        headers :{
            'Content-Type' : 'application/json'
        },
        body:JSON.stringify({body})
    }).then((response)=> response.json())
    .then((response)=>{
        if(response.successStatus){
            window.location.href=response.redirect
        }
        else{
            document.querySelector('#error').innerHTML = "An error occured please try again"
        }
    }).catch((err) => console.log(err))
}

function addtoCart(id){
    const url = "http://localhost:4000/cart/add";
    const body ={
        id
    }
    console.log(id)
    fetch(url,{
        method:'PATCH',
        headers :{
            'Content-Type' : 'application/json'
        },
        body:JSON.stringify(body)
    }).then((response)=> response.json())
    .then((response)=>{
        if(response.successStatus){
            window.location.reload()
        }
        else{
            document.querySelector('#error').innerHTML = "An error occured please try again"
        }
    }).catch((err) => console.log(err))
}

function removeCartItem(id){
    const url = "http://localhost:4000/cart/remove";
    const body ={
        id
    }
    console.log(id)
    fetch(url,{
        method:'PATCH',
        headers :{
            'Content-Type' : 'application/json'
        },
        body:JSON.stringify(body)
    }).then((response)=> response.json())
    .then((response)=>{
        if(response.successStatus){
            window.location.reload()
        }
        else{
            document.querySelector('#error').innerHTML = "An error occured please try again"
        }
    }).catch((err) => console.log(err))
}

function changeQuantity(id,amount,count){
    const url = "http://localhost:4000/cart/change";
    const body ={
        id,
        amount,
        count
    }

    fetch(url,{
        method:'PATCH',
        headers :{
            'Content-Type' : 'application/json'
        },
        body:JSON.stringify(body)
    }).then((response)=> response.json())
    .then((response)=>{
        if(response.successStatus){
          document.getElementById(id).value  = response.quantity
             window.location.reload()
            
        }
        else{
            document.getElementById(count).innerHTML = response.message
        }
    }).catch((err) => console.log(err))

}
function cancelOrder(id){
    const url = "http://localhost:4000/admin/orders/cancel";
    const body ={
        id
    }
    console.log(id)
    fetch(url,{
        method:'PATCH',
        headers :{
            'Content-Type' : 'application/json'
        },
        body:JSON.stringify(body)
    }).then((response)=> response.json())
    .then((response)=>{
        if(response.successStatus){
            window.location.reload()
        }
        else{
            document.querySelector('#error').innerHTML = "An error occured please try again"
        }
    }).catch((err) => console.log(err))
}

function orderCancel(id){
    const url = "http://localhost:4000/orders/cancel";
    const body ={
        id
    }
    console.log(id)
    fetch(url,{
        method:'PATCH',
        headers :{
            'Content-Type' : 'application/json'
        },
        body:JSON.stringify(body)
    }).then((response)=> response.json())
    .then((response)=>{
        if(response.successStatus){
            window.location.reload()
        }
        else{
            document.querySelector('#error').innerHTML = "An error occured please try again"
        }
    }).catch((err) => console.log(err))
}

function changeStatus(id,count){
       
    const url = "http://localhost:4000/admin/orders/change" ;
    const value = document.getElementById(count).value;
    console.log(id)
    console.log(value);
    const body ={
        id,
        value
    }
    fetch(url,{
        method:'PATCH',
        headers :{
            'Content-Type' : 'application/json'
        },
        body:JSON.stringify(body)
    }).then((response)=> response.json())
    .then((response)=>{
        if(response.successStatus){
            window.location.reload()
        }
        else{
            document.querySelector('#error').innerHTML = "An error occured please try again"
        }
    }).catch((err) => console.log(err))
}
function addtoWishlist(id){
    const url = "http://localhost:4000/wishlist/add";
    const body ={
        id
    }
    console.log(id)
    fetch(url,{
        method:'PATCH',
        headers :{
            'Content-Type' : 'application/json'
        },
        body:JSON.stringify(body)
    }).then((response)=> response.json())
    .then((response)=>{
        if(response.successStatus){
            window.location.reload()
        }
        else{
            document.querySelector('#error').innerHTML = "An error occured please try again"
        }
    }).catch((err) => console.log(err))
}