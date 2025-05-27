/*import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";  // note the import style
import "./App.css";

function App() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [item, setItem] = useState({
    title: "",
    description: "",
    price: "",
    sellerEmail: "",
    contactNo: "",
    imageFile: null,
  });
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [view, setView] = useState(token ? "dashboard" : "login");
  const [listings, setListings] = useState([]);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserEmail(decoded.email);
      } catch {
        setUserEmail("");
      }
      getListings();
      setView("dashboard");
    }
  }, [token]);

  const handleRegister = async () => {
    try {
      if (!form.email.endsWith("@iitp.ac.in")) {
        alert("Only @iitp.ac.in emails allowed");
        return;
      }
      await axios.post("${process.env.REACT_APP_BACKEND_URL}/register", form);
      alert("Registered! Now log in.");
      setView("login");
      setForm({ name: "", email: "", password: "" });
    } catch (err) {
      alert(err.response?.data || "Registration failed");
    }
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post("${process.env.REACT_APP_BACKEND_URL}/login", {
        email: form.email,
        password: form.password,
      });
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setView("dashboard");
      setForm({ name: "", email: "", password: "" });
    } catch (err) {
      alert(err.response?.data || "Login failed");
    }
  };

  const postItem = async () => {
    if (
      !item.title ||
      !item.description ||
      !item.price ||
      !item.sellerEmail ||
      !item.contactNo ||
      !item.imageFile
    ) {
      alert("Please fill all item details and upload an image");
      return;
    }

    try {
      const data = new FormData();
      data.append("file", item.imageFile);
      data.append("upload_preset", "my_unsigned_preset");

      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dnbz0svh2/image/upload",
        data
      );

      const payload = {
        title: item.title,
        description: item.description,
        price: Number(item.price),
        image: res.data.secure_url,
        sellerEmail: item.sellerEmail,
        contactNo: item.contactNo,
        college: "IIT Patna",
      };

      await axios.post("${process.env.REACT_APP_BACKEND_URL}/post", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Item posted");
      setItem({
        title: "",
        description: "",
        price: "",
        sellerEmail: "",
        contactNo: "",
        imageFile: null,
      });
      getListings();
    } catch (error) {
      alert(error.response?.data || "Posting failed");
    }
  };

  const getListings = async () => {
    try {
      const res = await axios.get("${process.env.REACT_APP_BACKEND_URL}/list", {
        params: { college: "IIT Patna" },
        headers: { Authorization: `Bearer ${token}` },
      });
      setListings(res.data);
    } catch (err) {
      alert(err.response?.data || "Could not fetch listings");
    }
  };

  const toggleSoldStatus = async (id, currentStatus) => {
    try {
      if (currentStatus) {
        await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/mark-unsold/${id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/mark-sold/${id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      getListings();
    } catch (err) {
      alert(err.response?.data || "Failed to update status");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUserEmail("");
    setView("login");
  };

  return (
    <div className="container">
      <h2>College Buy & Sell</h2>

      {view === "register" && (
        <>
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button onClick={handleRegister}>Register</button>
          <button onClick={() => setView("login")}>Go to Login</button>
        </>
      )}

      {view === "login" && (
        <>
          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button onClick={handleLogin}>Login</button>
          <button onClick={() => setView("register")}>Create Account</button>
        </>
      )}

      {view === "dashboard" && (
        <>
          <button onClick={logout}>Logout</button>
          <h3>Post a New Item</h3>
          <input
            placeholder="Title"
            value={item.title}
            onChange={(e) => setItem({ ...item, title: e.target.value })}
          />
          <input
            placeholder="Description"
            value={item.description}
            onChange={(e) => setItem({ ...item, description: e.target.value })}
          />
          <input
            placeholder="Price"
            type="number"
            value={item.price}
            onChange={(e) => setItem({ ...item, price: e.target.value })}
          />
          <input
            placeholder="Seller Email"
            value={item.sellerEmail}
            onChange={(e) => setItem({ ...item, sellerEmail: e.target.value })}
          />
          <input
            placeholder="Contact No"
            value={item.contactNo}
            onChange={(e) => setItem({ ...item, contactNo: e.target.value })}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setItem({ ...item, imageFile: e.target.files[0] })}
          />
          <button onClick={postItem}>Post Item</button>

          <h3>Available Listings</h3>
          {listings.length === 0 && <p>No items available</p>}
          {listings.map((p) => {
            const isSold = !!p.sold;
            const isOwner = p.sellerEmail === userEmail;
            return (
              <div className="card" key={p._id}>
                <h4>
                  {p.title} - ₹{p.price}
                </h4>
                <p>{p.description}</p>
                <p>
                  <b>Contact:</b> {p.contactNo} | <b>Email:</b> {p.sellerEmail}
                </p>
                <img src={p.image} alt="item" width="200" />
                {isOwner ? (
                  <button onClick={() => toggleSoldStatus(p._id, isSold)}>
                    {isSold ? "Mark as Available" : "Mark as Sold"}
                  </button>
                ) : isSold ? (
                  <p>
                    <b>Status:</b> Sold
                  </p>
                ) : (
                  <p>
                    <b>Status:</b> Available
                  </p>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

export default App;

*/
import React, { useState, useEffect, useCallback  } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./App.css";

function App() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [item, setItem] = useState({
    title: "",
    description: "",
    price: "",
    sellerEmail: "",
    contactNo: "",
    imageFile: null,
  });
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [view, setView] = useState(token ? "dashboard" : "login");
  const [listings, setListings] = useState([]);
  const [userEmail, setUserEmail] = useState("");

    const getListings = useCallback(async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/list`, {
        params: { college: "IIT Patna" },
        headers: { Authorization: `Bearer ${token}` },
      });
      setListings(res.data);
    } catch (err) {
      alert(err.response?.data || "Could not fetch listings");
    }
  }, [token]);


  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserEmail(decoded.email);
      } catch {
        setUserEmail("");
      }
      getListings();
      setView("dashboard");
    }
  }, [token, getListings]);

  const handleRegister = async () => {
    try {
      if (!form.email.endsWith("@iitp.ac.in")) {
        alert("Only @iitp.ac.in emails allowed");
        return;
      }
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/register`, form);
      alert("Registered! Now log in.");
      setView("login");
      setForm({ name: "", email: "", password: "" });
    } catch (err) {
      alert(err.response?.data || "Registration failed");
    }
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/login`, {
        email: form.email,
        password: form.password,
      });
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setView("dashboard");
      setForm({ name: "", email: "", password: "" });
    } catch (err) {
      alert(err.response?.data || "Login failed");
    }
  };

  const postItem = async () => {
    if (
      !item.title ||
      !item.description ||
      !item.price ||
      !item.sellerEmail ||
      !item.contactNo ||
      !item.imageFile
    ) {
      alert("Please fill all item details and upload an image");
      return;
    }

    try {
      const data = new FormData();
      data.append("file", item.imageFile);
      data.append("upload_preset", "my_unsigned_preset");

      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dnbz0svh2/image/upload",
        data
      );

      const payload = {
        title: item.title,
        description: item.description,
        price: Number(item.price),
        image: res.data.secure_url,
        sellerEmail: item.sellerEmail,
        contactNo: item.contactNo,
        college: "IIT Patna",
      };

      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/post`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Item posted");
      setItem({
        title: "",
        description: "",
        price: "",
        sellerEmail: "",
        contactNo: "",
        imageFile: null,
      });
      getListings();
    } catch (error) {
      alert(error.response?.data || "Posting failed");
    }
  };

  const toggleSoldStatus = async (id, currentStatus) => {
    try {
      const endpoint = currentStatus ? "mark-unsold" : "mark-sold";
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/${endpoint}/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      getListings();
    } catch (err) {
      alert(err.response?.data || "Failed to update status");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUserEmail("");
    setView("login");
  };

  return (
    <div className="container">
      <h2>College Buy & Sell</h2>

      {view === "register" && (
        <>
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button onClick={handleRegister}>Register</button>
          <button onClick={() => setView("login")}>Go to Login</button>
        </>
      )}

      {view === "login" && (
        <>
          <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button onClick={handleLogin}>Login</button>
          <button onClick={() => setView("register")}>Create Account</button>
        </>
      )}

      {view === "dashboard" && (
        <>
          <button className="logout-btn" onClick={logout}>Logout</button>
          <h3>Post a New Item</h3>
          <div className="form-row">
            <input placeholder="Title" value={item.title} onChange={(e) => setItem({ ...item, title: e.target.value })} />
            <input placeholder="Description" value={item.description} onChange={(e) => setItem({ ...item, description: e.target.value })} />
            <input placeholder="Price" type="number" value={item.price} onChange={(e) => setItem({ ...item, price: e.target.value })} />
            <input placeholder="Seller Email" value={item.sellerEmail} onChange={(e) => setItem({ ...item, sellerEmail: e.target.value })} />
            <input placeholder="Contact No" value={item.contactNo} onChange={(e) => setItem({ ...item, contactNo: e.target.value })} />
            <input type="file" accept="image/*" onChange={(e) => setItem({ ...item, imageFile: e.target.files[0] })} />
            <button onClick={postItem}>Post Item</button>
          </div>

          <h3>Available Listings</h3>
          {listings.length === 0 && <p>No items available</p>}
          {listings.map((p) => {
            const isSold = !!p.sold;
            const isOwner = p.sellerEmail === userEmail;
            return (
              <div className="card" key={p._id}>
                <h4>
                  {p.title} - ₹{p.price}
                </h4>
                <p>{p.description}</p>
                <p>
                  <b>Contact:</b> {p.contactNo} | <b>Email:</b> {p.sellerEmail}
                </p>
                <img src={p.image} alt="item" />
                {isOwner ? (
                  <button onClick={() => toggleSoldStatus(p._id, isSold)}>
                    {isSold ? "Mark as Available" : "Mark as Sold"}
                  </button>
                ) : isSold ? (
                  <p><b>Status:</b> Sold</p>
                ) : (
                  <p><b>Status:</b> Available</p>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

export default App;
