import React, { useEffect, useState } from "react";
import rehooz_square from "../rehooz-square.png";

export default function Listings() {
  const [myListings, setMyListings] = useState([]);
  const [allListings, setAllListings] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", description: "", location: "" });
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  // FETCH MY LISTINGS
  useEffect(() => {
    if (!user) return;

    fetch(
      `https://rehooz-app-491933218528.us-east4.run.app/backend/get_my_listings.php?user_id=${user.user_id}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setMyListings(data.listings);
        }
      })
      .catch((err) => console.error("My listings fetch error:", err));
  }, [user]);

  // FETCH ALL LISTINGS
  useEffect(() => {
    fetch("https://rehooz-app-491933218528.us-east4.run.app/backend/get_all_listings.php")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setAllListings(data.listings);
        }
      })
      .catch((err) => console.error("All listings fetch error:", err));
  }, []);

  // ADD A LISTING
  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(
      "https://rehooz-app-491933218528.us-east4.run.app/backend/add_listing.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, seller_id: user.user_id }),
      }
    );

    const data = await res.json();
    setMessage(data.message);

    if (data.status === "success") {
      setForm({ name: "", price: "", description: "", location: "" });

      // Refresh my listings
      const refreshed = await fetch(
        `https://rehooz-app-491933218528.us-east4.run.app/backend/get_my_listings.php?user_id=${user.user_id}`
      );
      const refreshedData = await refreshed.json();
      setMyListings(refreshedData.listings);

      // Refresh all listings
      const refreshAll = await fetch(
        "https://rehooz-app-491933218528.us-east4.run.app/backend/get_all_listings.php"
      );
      const all = await refreshAll.json();
      setAllListings(all.listings);
    }
  };

  return (
    <main className="page-content">
      {/* HEADER ROW */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
        <h2>Listings</h2>
        <button
          type="button"
          className="Goto-listing add-listing-btn"
          onClick={() => setIsModalOpen(true)}
        >
          Add Listing
        </button>
      </div>

      {/* ADD LISTING MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Add listing form">
          <div className="home-card modal-card">
            <div className="modal-close-row">
              <h4 style={{ margin: 0 }}>Add a New Listing</h4>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close add listing modal"
                className="modal-close-btn"
              >
                ×
              </button>
            </div>

            <img src={rehooz_square} alt="Rehooz" className="home-logo modal-logo" />

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

              <button type="submit" className="modal-submit-btn">Add Listing</button>
            </form>

            {message && <p className="modal-message">{message}</p>}
          </div>
        </div>
      )}

      {/* LISTINGS COLUMNS */}
      <div className="Listings-container">
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
                    <button className="Delete-listing">Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="Listings-column">
          <h3 className="column-title">All Listings</h3>
          <div className="scroll-box" aria-label="All listings">
            {allListings.length === 0 ? (
              <p>No listings found.</p>
            ) : (
              allListings.map((item) => (
                <div key={item.listing_id} className="Listing-component">
                  <div className="Component-column">
                    <h4>{item.name}</h4>
                    <p>{item.description}</p>
                    <p><strong>${parseFloat(item.price).toFixed(2)}</strong></p>
                    <button className="Goto-listing">Go to</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
