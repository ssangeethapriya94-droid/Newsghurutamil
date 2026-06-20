const axios = require('axios');

async function test() {
  try {
    console.log("Logging in...");
    const loginRes = await axios.post("http://localhost:5000/api/login", {
      email: "editor@newsghuru.com",
      password: "editorpassword123",
      role: "editor"
    });
    
    const token = loginRes.data.token;
    console.log("Logged in successfully. User ID:", loginRes.data.user.id);
    
    console.log("\nRequesting paginated notifications...");
    const notifyRes = await axios.get("http://localhost:5000/api/notifications?page=1&limit=10", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log("Response Status:", notifyRes.status);
    console.log("Response Data:");
    console.log(JSON.stringify(notifyRes.data, null, 2));

    console.log("\nRequesting non-paginated notifications (Bell count/polling)...");
    const notifyRes2 = await axios.get("http://localhost:5000/api/notifications", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log("Response 2 (Non-paginated) Status:", notifyRes2.status);
    console.log("Response 2 (Non-paginated) Length:", notifyRes2.data.length);
  } catch (error) {
    console.error("API test failed:", error.response ? error.response.data : error.message);
  }
}

test();
