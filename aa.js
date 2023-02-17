<% if(item.productId.offer){%>
    <p class="text-start text-md-center fs-3">
  <strong>₹<%= Math.round( item.productId.price-(item.productId.price*item.productId.offer/100))%></strong></p>
<%  } else { %>
  <p class="text-start text-md-center fs-3">
    <strong>₹<%= Math.round(item.productId.price) %></strong></p>
      
<%   }  %>