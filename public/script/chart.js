/* eslint-disable array-callback-return */
/* eslint-disable no-new */
/* eslint-disable no-undef */
/* eslint-disable eqeqeq */

fetch('/admin/order-details', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(response => {
    console.log(response + 'orders')
    const label = response.orders.map(item => {
      const check = new Date(item.date)
      const now = new Date()
      if (check.getFullYear() == now.getFullYear() && check.getMonth() == now.getMonth()) {
        return new Date(item.date).toLocaleDateString('en-GB')
      }
    })
    const data = response.orders.map(item => {
      const check = new Date(item.date)
      const now = new Date()
      if (check.getFullYear() == now.getFullYear() && check.getMonth() == now.getMonth()) {
        return item.totalSpent
      }
    })

    new Chart(
      document.getElementById('saleschart'),
      {
        type: 'line',
        data: {
          labels: label,
          datasets: [
            {
              label: 'Daily Sales ',
              data,
              backgroundColor: 'black',
              borderColor: 'black',
              borderWidth: 3,
              showLine: 2
            }
          ]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          },
          legend: {
            display: false
          }
        }

      }
    )
  })
