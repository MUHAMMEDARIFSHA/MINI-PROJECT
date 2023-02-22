<!DOCTYPE html>
<html lang="en">
<%-include('../partials/head') %>
<body>
    <%-include('../partials/user/user-navbar') %>

    
<section class="h-100 gradient-custom">
    <div class="container py-5 h-100">
      <div class="row d-flex justify-content-center align-items-center h-100">
        <div class="col-lg-10 col-xl-8">
          <div class="card" style="border-radius: 10px;">
            <div class="card-header px-4 py-5">
              <h5 class="text-muted mb-0">Thanks for your Order, <span ><%= user.username %></span>!</h5>
            </div>
            <% let count =1 %>
            <% if(orders.length >0){ %>
              <% orders.forEach(orders=>{ %>
               <% orders.items.forEach(item =>{ %>

          <div class="card-body p-4">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <p class="lead fw-bold mb-0" >Receipt</p>
                <p class="small text-muted mb-0"></p>
              </div>
              <div class="card shadow-0 border mb-4">
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-1 text-center d-flex justify-content-center align-items-center">
                      <p class="text-muted mb-0 fw-bold"><%=count++ %></p>
                    </div>
                    <div class="col-md-2">
                      <img src="/<%= item.image %>"
                        class="img-fluid" alt="Phone">
                    </div>
                    <div class="col-md-2 text-center d-flex justify-content-center align-items-center">
                      <p class="text-muted mb-0 fw-bold"><%= item.productName %></p>
                    </div>
                    <div class="col-md-2 text-center d-flex justify-content-center align-items-center">
                      <p class="text-muted mb-0 small fw-bold"><%=item.color %></p>
                    </div>
                    <div class="col-md-1 text-center d-flex justify-content-center align-items-center">
                      <p class="text-muted mb-0 small fw-bold"><%=item.size %></p>
                    </div>
                    <div class="col-md-1 text-center d-flex justify-content-center align-items-center">
                      <p class="text-muted mb-0 small fw-bold">Qty:<%=item.quantity %> </p>
                    </div>
                    <div class="col-md-2 text-center d-flex justify-content-center align-items-center">
                      <p class="text-muted mb-0 small fw-bold">₹ <%=item.price * item.quantity %></p>
                    </div>
                    <% if(orders.cancelled){ %>
                    <div class="col-md-1 text-center text-danger d-flex justify-content-center align-items-center">
                      <p class="text-danger mb-0 small fw-bold">Cancelled</p>
                    </div>
                  <% } else{ %>
                    <div class="col-md-1 text-center text-danger d-flex justify-content-center align-items-center">
                    <button class="btn btn-danger border-2 fw-bold" data-bs-toggle="modal"
                    data-bs-target="#staticBackdrop<%= count %>">Cancel</button>
                   </div>
                 <% } %>

                 <div class="modal fade" id="staticBackdrop<%= count %>" data-bs-backdrop="static"
                  data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel"
                  aria-hidden="true">
                  <div class="modal-dialog">
                    <div class="modal-content">
                      <div class="modal-header">
                        <h1 class="modal-title fs-5" id="staticBackdropLabel">Cancel Order</h1>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"
                          aria-label="Close"></button>
                      </div>
                      <div class="modal-body">
                        The order will be Cancelled !!!
                      </div>
                      <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">NO</button>
                        <button type="button" class="btn btn-danger" id="delete<%= count %>"
                          onclick="orderCancel('<%=orders.id%>')" data-url="">Cancel</button>
                      </div>
                    </div>
                  </div>
                </div>


                    <div class="col-md- text-center d-flex justify-content-center align-items-center">
                      <p class="text-muted mb-0 small fw-bold">Ordered On : <%=orders.createdAt.toLocaleString()%></p>
                    </div>
                    
                  </div>
                  <hr class="mb-4" style="background-color: #e0e0e0; opacity: 1;">
                  <div class="row d-flex align-items-center">
                    <div class="col-md-2">
                      <p class="text-muted mb-0 small">Track Order</p>
                    </div>
                    <div class="col-md-10">
                      <div class="progress" style="height: 6px; border-radius: 16px;">
                        <div class="progress-bar" role="progressbar"
                          style="width: 65%; border-radius: 16px; background-color: #3269a4;" aria-valuenow="65"
                          aria-valuemin="0" aria-valuemax="100"></div>
                      </div>
                      <div class="d-flex justify-content-around mb-1">
                        <p class="text-muted mt-1 mb-0 small ms-xl-5">Out for delivary</p>
                        <p class="text-muted mt-1 mb-0 small ms-xl-5">Delivered</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
              <%   }) %>
              <%  }) %>
              <% } %>
  
               <!-- <div class="d-flex justify-content-between pt-2">
                <p class="fw-bold mb-0">Order Details</p>
                 <p class="text-muted mb-0"><span class="fw-bold me-4">Total</span></p> 
              </div>
  
              <div class="d-flex justify-content-between pt-2">
                <p class="text-muted mb-0">Invoice Number </p> 
                 <p class="text-muted mb-0"><span class="fw-bold me-4">Discount</span> $19.00</p> 
              </div>
  
              <div class="d-flex justify-content-between">
                 <p class="text-muted mb-0">Invoice Date : 22 Dec,2019</p>
                <p class="text-muted mb-0"><span class="fw-bold me-4">GST 18%</span> 123</p> 
              </div>--->
  
               <!-- <div class="d-flex justify-content-between mb-5">
                <p class="text-muted mb-0">Recepits Voucher : 18KU-62IIK</p> 
                <p class="text-muted mb-0"><span class="fw-bold me-4">Delivery Charges</span> Free</p>
              </div>  -->
          
           
           <div class="card-footer border-0 px-4 py-5"
              style="background-color: #215ea8; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">
              <h5 class="d-flex align-items-center justify-content-end text-white text-uppercase mb-0">Total
                paid: <span class="h2 mb-0 ms-2">₹ <%=user.totalSpent %></span></h5>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  
  <%-include('../partials/bottom-navbar') %>
  <script src="/script/scriptadmin.js"></script>

</body>
</html>





<% orders.items.forEach(item=>{ %>
  <div class="col- coloum fw-bold   text-center d-flex justify-content-center align-items-center ">
   
      <p>
        <%=item.productName %>
      </p><br><br><br><br><br><br>
  
  </div>
  <% })%>

  


  <div class="container">
      <h2 class="mt-3">ALL PRODUCTS</h2>
      <br>
      
      <div class="row">
        <% if(products.length >0){ %>
             <% products.forEach(item=>{  %>
     
       <div class="col-md-3">
         <a href="/product/details/<%=item._id %>">
         <div class="dress-card">
         <div class="dress-card-head">
            <img class="dress-card-img-top" src="/<%= item.images[0] %>"alt="">
                  <div class=" surprise-bubble"><span class="dress-card-heart">
              <i class="fas fa-heart"></i>
            </span><a href="#"> <span>More</span></a>
          </div>
        </div>
        <div class="dress-card-body">
          <h4 class="dress-card-title mt-1"><%= item.productname %></h4>
          <p class="dress-card-para"></p>
          <% if (item.offer>0){ %>
            
            <p class="dress-card-para mt-1"><span class="fw-bold fs-4">  <Del class="text-danger"> ₹ <%= item.price%></Del></span><span class="dress-card-price fs-4"> ₹ <%= Math.round (item.price-(item.price *(item.offer/100))) %>&ensp;</span><span
              class="dress-card-crossed mt-1"></span><span class="dress-card-off text-primary">&ensp;(<%= item.offer %>% OFF)</span></p>
         <% } else{ %>
            <p class="dress-card-para mt-1"><span class="dress-card-price fs-5"> ₹ <%=item.price %>&ensp;</span><span
              class="dress-card-crossed mt-1"></span></p>
          <% }%>
          
           <p class="fs-6 fw-bold mt-1 text-primary">Best Selling.  Certified seller.</p>
        </div>
      </div>
     </a>
    </div>
     
   <%   }) %>
     <%  }  %>
   </div>
    </div>