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

fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
}).then(response => response.json())
.then(data=>{
    console.log('data ',data)
}).catch(e=>{
    console.log('loi ',e)
})