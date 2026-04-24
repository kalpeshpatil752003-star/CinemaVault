fetch("http://localhost:5000/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "test@test.com", password: "password" })
})
.then(res => res.json().then(data => console.log(res.status, data)))
.catch(console.error);
