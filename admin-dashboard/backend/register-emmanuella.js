require("dotenv").config();
const axios = require("axios");

async function register() {
  try {
    const res = await axios.post("https://queens-website.onrender.com/auth/register", {
      name: "emmanuella",
      email: "emmanuellalodonu@gmail.com",
      password: "0277821073"
    });
    console.log("Success:", res.data);
  } catch (err) {
    console.error("Error:", err.response?.data || err.message);
  }
}

register();
