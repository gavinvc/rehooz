import React, { useEffect, useState } from "react";
import rehooz_square from "../rehooz-square.png";

export default function Listings() {
  const [myListings, setMyListings] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", description: "", location: "" });
  const [message, setMessage] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  // Fetch my listings
  useEffect(() => {
    if (!user) return;
    fetch(`https://www.cs.virginia.edu/~zha4ub/rehooz/backend/get_my_listings.php?user_id=${user.user_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") setMyListings(data.listings);
      });
  }, [user]);

  // Handle add listing
  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("https://www.cs.virginia.edu/~zha4ub/rehooz/backend/add_listing.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, seller_id: user.user_id }),
    });
    const data = await res.json();
    setMessage(data.message);
    if (data.status === "success") {
      setForm({ name: "", price: "", description: "", location: "" });
      // Refresh listings
      const refreshed = await fetch(`https://www.cs.virginia.edu/~zha4ub/rehooz/backend/get_my_listings.php?user_id=${user.user_id}`);
      const refreshedData = await refreshed.json();
      setMyListings(refreshedData.listings);
    }
  };

  return (
    <main className="page-content">
      <h2>Listings</h2>
      <div className="Listings-container">
        {/* My Listings */}
        <div className="Listings-column">
          <h3 className="column-title">My Listings</h3>
          <div className="scroll-box" aria-label="My listings">
            {myListings.length === 0 ? (
              <p>No listings yet.</p>
            ) : (
              myListings.map((item) => (
                <div key={item.listing_id} className="Listing-component">
                  <div className="Component-column">
                    <h4>{item.name}</h4>
                    <p>{item.description}</p>
                    <p><strong>${parseFloat(item.price).toFixed(2)}</strong></p>
                    <button className="Goto-listing">Go to</button>
                  </div>
                  <div className="Component-column">
                    <img src={`https://www.cs.virginia.edu/~zha4ub/rehooz/photos/${item.photo || "default.jpg"}`} 
                         alt={item.name}
                         className="Listing-image" />
                    <button className="Delete-listing">Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Listing Form */}
          <h4 style={{ marginTop: "20px" }}>Add a New Listing</h4>
          <form onSubmit={handleSubmit}>
            <input
              name="name"
              placeholder="Item Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              name="price"
              placeholder="Price"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
            <input
              name="location"
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              required
            />
            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
            <button type="submit">Add Listing</button>
          </form>
          {message && <p>{message}</p>}
        </div>

        {/* Followed Listings */}
        <div className="Listings-column">
          <h3 className="column-title">Followed Listings</h3>
          <div className="scroll-box" aria-label="Followed listings">
            <p>Coming soon...</p>
          </div>
        </div>
      </div>
    </main>
  );
}
