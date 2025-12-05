import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import rehooz_square from "../rehooz-square.png";

export default function Listings() {
  const [myListings, setMyListings] = useState([]);
  const [followedListings, setFollowedListings] = useState([]);   // NEW COLUMN
  const [form, setForm] = useState({ name: "", price: "", description: "", location: "" });
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState(null);

  const user = useMemo(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  }, []);
  const userId = user?.user_id;

  const fetchMyListings = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(
        `https://rehooz-app-491933218528.us-east4.run.app/backend/get_my_listings.php?user_id=${userId}`
      );
      const data = await res.json();
      if (data.status === "success") setMyListings(data.listings);
    } catch (err) {
      console.error("My listings fetch error:", err);
    }
  }, [userId]);

  const fetchFollowedListings = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(
        `https://rehooz-app-491933218528.us-east4.run.app/backend/get_followed_listings.php?user_id=${userId}`
      );
      const data = await res.json();
      if (data.status === "success") setFollowedListings(data.listings);
    } catch (err) {
      console.error("Followed listings fetch error:", err);
    }
  }, [userId]);

  useEffect(() => {
    fetchMyListings();
  }, [fetchMyListings]);

  useEffect(() => {
    fetchFollowedListings();
  }, [fetchFollowedListings]);

  /* UNFOLLOW */
  const unfollowListing = async (listing_id) => {
    if (!userId) return;

    const res = await fetch(
      `https://rehooz-app-491933218528.us-east4.run.app/backend/unfollow_listing.php`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, listing_id: listing_id }),
      }
    );

    const data = await res.json();
    console.log(data.message);

    await fetchFollowedListings();
  };

  const deleteListing = async (listing_id) => {
    if (!userId) return;

    try {
      const res = await fetch(
        `https://rehooz-app-491933218528.us-east4.run.app/backend/delete_listing.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, listing_id }),
        }
      );

      const data = await res.json();
      setMessage(data.message ?? "");

      if (data.status === "success") {
        await Promise.all([fetchMyListings(), fetchFollowedListings()]);
      }
    } catch (err) {
      console.error("Delete listing error:", err);
      setMessage("Unable to delete listing. Please try again.");
    }
  };

  const openAddModal = () => {
    setEditingListing(null); // Add mode
    setForm({ name: "", price: "", description: "", location: "" });
    setMessage("");
    setIsModalOpen(true);
  };

  const openEditModal = (listing) => {
    // Only allow editing if it belongs to this user
    if (String(listing.seller_id) !== String(userId)) return;

    if (listing.has_accepted_offer) {
      alert("This listing can no longer be edited because an offer has been accepted.");
      return;
    }

    setEditingListing(listing); // Edit mode
    setForm({
      name: listing.name || "",
      price: listing.price || "",
      description: listing.description || "",
      location: listing.location || "",
    });
    setMessage("");
    setIsModalOpen(true);
  };

  /* ---------- ADD LISTING ---------- */
  const createListing = async () => {
    const res = await fetch(
      "https://rehooz-app-491933218528.us-east4.run.app/backend/add_listing.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, seller_id: userId }),
      }
    );

    const data = await res.json();
    setMessage(data.message || "");

    if (data.status === "success") {
      setForm({ name: "", price: "", description: "", location: "" });
      await fetchMyListings(); // show new listing immediately
      setIsModalOpen(false);
    }
  };

  /* ---------- EDIT LISTING ---------- */
  const updateListing = async () => {
    if (!editingListing) return;

    const res = await fetch(
      "https://rehooz-app-491933218528.us-east4.run.app/backend/update_listing.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          listing_id: editingListing.listing_id,
          name: form.name,
          price: form.price,
          description: form.description,
          location: form.location,
        }),
      }
    );

    const data = await res.json();
    setMessage(data.message || "");

    if (data.status === "success") {
      await Promise.all([fetchMyListings(), fetchFollowedListings()]);
      setIsModalOpen(false);
      setEditingListing(null);
    }
  };

  /* ---------- FORM SUBMIT (ADD OR EDIT) ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      setMessage("Please sign in again to add or edit a listing.");
      return;
    }

    if (editingListing) {
      await updateListing();
    } else {
      await createListing();
    }
  };

  // /*  ADD LISTING */
  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (!userId) {
  //     setMessage("Please sign in again to add a listing.");
  //     return;
  //   }

  //   const res = await fetch(
  //     "https://rehooz-app-491933218528.us-east4.run.app/backend/add_listing.php",
  //     {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ ...form, seller_id: userId }),
  //     }
  //   );

  //   const data = await res.json();
  //   setMessage(data.message);

  //   if (data.status === "success") {
  //     setForm({ name: "", price: "", description: "", location: "" });

  //     fetchMyListings();
  //   }
  // };

  return (
    <main className="page-content">
      {/* HEADER ROW */}
      <div className="listings-header">
        <h2>Listings</h2>
        <button
          type="button"
          className="Goto-listing add-listing-btn"
          onClick={openAddModal}
        >
          Add Listing
        </button>
      </div>

      {/* ADD / EDIT LISTING MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="home-card modal-card">
            <div className="modal-close-row">
              <h4 style={{ margin: 0 }}>
                {editingListing ? "Edit Listing" : "Add a New Listing"}
              </h4>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingListing(null);
                }}
                className="modal-close-btn"
              >
                ×
              </button>
            </div>

            <img
              src={rehooz_square}
              alt="Rehooz"
              className="home-logo modal-logo"
            />

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
                onChange={(e) =>
                  setForm({ ...form, location: e.target.value })
                }
                required
              />
              <textarea
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                required
              />

              <button type="submit" className="modal-submit-btn">
                {editingListing ? "Save Changes" : "Add Listing"}
              </button>
            </form>

            {message && <p className="modal-message">{message}</p>}
          </div>
        </div>
      )}

      {/* LISTINGS COLUMNS */}
      <div className="Listings-container">
        {/* My Listings */}
        <div className="Listings-column">
          <h3 className="column-title">My Listings</h3>
          <div className="scroll-box" aria-label="My listings">
            {myListings.length === 0 ? (
              <p>No listings yet.</p>
            ) : (
              // Extra safety: only render listings that belong to this user
              myListings
                .filter(
                  (item) => String(item.seller_id) === String(userId)
                )
                .map((item) => (
                  <div key={item.listing_id} className="Listing-component">
                    <div className="listing-content">
                      <h4>{item.name}</h4>
                      <p>{item.description}</p>
                      <p>
                        <strong>
                          ${parseFloat(item.price).toFixed(2)}
                        </strong>
                      </p>
                      <Link
                        className="view-listing-link"
                        to={`/listing/${item.listing_id}`}
                      >
                        View listing
                      </Link>
                    </div>
                    <div className="Component-column listing-actions">
                      {/* Edit button – same place as Delete */}
                      <button
                        className="Edit-listing"
                        onClick={() => openEditModal(item)}
                        disabled={Boolean(item.has_accepted_offer)}
                        title={
                          item.has_accepted_offer
                            ? "This listing cannot be edited after accepting an offer"
                            : undefined
                        }
                      >
                        {item.has_accepted_offer ? "Locked" : "Edit"}
                      </button>
                      <button
                        className="Delete-listing"
                        onClick={() => deleteListing(item.listing_id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Followed Listings */}
        <div className="Listings-column">
          <h3 className="column-title">Followed Listings</h3>
          <div className="scroll-box" aria-label="Followed listings">
            {followedListings.length === 0 ? (
              <p>No followed listings.</p>
            ) : (
              followedListings.map((item) => (
                <div key={item.listing_id} className="Listing-component">
                  <div className="listing-content">
                    <h4>{item.name}</h4>
                    <p>{item.description}</p>
                    <p>
                      <strong>
                        ${parseFloat(item.price).toFixed(2)}
                      </strong>
                    </p>
                    <Link
                      className="view-listing-link"
                      to={`/listing/${item.listing_id}`}
                    >
                      View listing
                    </Link>
                  </div>

                  <div className="Component-column listing-actions">
                    <button
                      className="Delete-listing"
                      onClick={() => unfollowListing(item.listing_id)}
                    >
                      Unfollow
                    </button>
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

//   return (
//     <main className="page-content">
//       {/* HEADER ROW */}
//       <div className="listings-header">
//         <h2>Listings</h2>
//         <button
//           type="button"
//           className="Goto-listing add-listing-btn"
//           onClick={() => setIsModalOpen(true)}
//         >
//           Add Listing
//         </button>
//       </div>

//       {/* ADD LISTING MODAL */}
//       {isModalOpen && (
//         <div className="modal-overlay" role="dialog" aria-modal="true">
//           <div className="home-card modal-card">
//             <div className="modal-close-row">
//               <h4 style={{ margin: 0 }}>Add a New Listing</h4>
//               <button
//                 type="button"
//                 onClick={() => setIsModalOpen(false)}
//                 className="modal-close-btn"
//               >
//                 ×
//               </button>
//             </div>

//             <img src={rehooz_square} alt="Rehooz" className="home-logo modal-logo" />

//             <form onSubmit={handleSubmit}>
//               <input
//                 name="name"
//                 placeholder="Item Name"
//                 value={form.name}
//                 onChange={(e) => setForm({ ...form, name: e.target.value })}
//                 required
//               />
//               <input
//                 name="price"
//                 placeholder="Price"
//                 type="number"
//                 value={form.price}
//                 onChange={(e) => setForm({ ...form, price: e.target.value })}
//                 required
//               />
//               <input
//                 name="location"
//                 placeholder="Location"
//                 value={form.location}
//                 onChange={(e) => setForm({ ...form, location: e.target.value })}
//                 required
//               />
//               <textarea
//                 name="description"
//                 placeholder="Description"
//                 value={form.description}
//                 onChange={(e) => setForm({ ...form, description: e.target.value })}
//                 required
//               />

//               <button type="submit" className="modal-submit-btn">Add Listing</button>
//             </form>

//             {message && <p className="modal-message">{message}</p>}
//           </div>
//         </div>
//       )}

//       {/* LISTINGS COLUMNS */}
//       <div className="Listings-container">

//         {/* My Listings */}
//         <div className="Listings-column">
//           <h3 className="column-title">My Listings</h3>
//           <div className="scroll-box" aria-label="My listings">
//             {myListings.length === 0 ? (
//               <p>No listings yet.</p>
//             ) : (
//               myListings.map((item) => (
//                 <div key={item.listing_id} className="Listing-component">
//                   <div className="listing-content">
//                     <h4>{item.name}</h4>
//                     <p>{item.description}</p>
//                     <p><strong>${parseFloat(item.price).toFixed(2)}</strong></p>
//                     <Link
//                       className="view-listing-link"
//                       to={`/listing/${item.listing_id}`}
//                     >
//                       View listing
//                     </Link>
//                   </div>
//                   <div className="Component-column listing-actions">
//                     <button
//                       className="Delete-listing"
//                       onClick={() => deleteListing(item.listing_id)}
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>

//         {/* Followed Listings */}
//         <div className="Listings-column">
//           <h3 className="column-title">Followed Listings</h3>
//           <div className="scroll-box" aria-label="Followed listings">
//             {followedListings.length === 0 ? (
//               <p>No followed listings.</p>
//             ) : (
//               followedListings.map((item) => (
//                 <div key={item.listing_id} className="Listing-component">
//                   <div className="listing-content">
//                     <h4>{item.name}</h4>
//                     <p>{item.description}</p>
//                     <p><strong>${parseFloat(item.price).toFixed(2)}</strong></p>
//                     <Link
//                       className="view-listing-link"
//                       to={`/listing/${item.listing_id}`}
//                     >
//                       View listing
//                     </Link>
//                   </div>

//                   <div className="Component-column listing-actions">
//                     <button
//                       className="Delete-listing"
//                       onClick={() => unfollowListing(item.listing_id)}
//                     >
//                       Unfollow
//                     </button>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>

//       </div>
//     </main>
//   );
// }
