const url = new URL(
    "https://88lotte.com/api/login"
);

const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};

let body = {
    "username": "0991455507",
    "password": "111222"
};

fetch('http://worldtimeapi.org/api/timezone/Etc/UTC')
  .then(response => response.json())
  .then(data => {
    console.log("Thời gian hiện tại:", data.datetime);
  })
  .catch(error => console.error("Lỗi:", error));