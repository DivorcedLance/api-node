export const getReports = (number) => {
  fetch(`https://node-api-ge59.onrender.com/reportes/${number}`).then(response => response.json())
  // fetch(`http://192.168.18.5:3000/reportes/${number}`).then(response => response.json())
    .then(data => {
      console.log(data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
};

export const getReportsAll = () => {
  fetch('https://node-api-ge59.onrender.com/reportes').then(response => response.json())
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.error('Error:', error);
  });
}