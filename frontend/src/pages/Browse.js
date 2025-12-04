import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import rehooz_square from "../rehooz-square.png";

export default function Browse() {
  const [listings, setListings] = useState([]);
  const [followed, setFollowed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationSearch, setLocationSearch] = useState("");
  const [submittedLocation, setSubmittedLocation] = useState("");
  const [descriptionSearch, setDescriptionSearch] = useState("");
  const [submittedDescription, setSubmittedDescription] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [priceMin, setPriceMin] = useState(null);
  const [priceMax, setPriceMax] = useState(null);
  const [isPriceFilterOpen, setIsPriceFilterOpen] = useState(false);

  const [form, setForm] = useState({ name: "", price: "", description: "", location: "" });
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  //offer states: 
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [currentListingId, setCurrentListingId] = useState(null);
  const [offerMessage, setOfferMessage] = useState("");

  const user = useMemo(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  }, []);
  const userId = user?.user_id;
  const priceBounds = useMemo(() => {
    if (!listings.length) {
      return { min: 0, max: 0 };
    }

    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    listings.forEach((item) => {
      const value = parseFloat(item.price);
      if (Number.isFinite(value)) {
        min = Math.min(min, value);
        max = Math.max(max, value);
      }
    });

    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      return { min: 0, max: 0 };
    }

    return {
      min: Math.floor(min),
      max: Math.ceil(max),
    };
  }, [listings]);

  const fetchListings = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(
        "https://rehooz-app-491933218528.us-east4.run.app/backend/get_all_listings.php"
      );
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const data = await res.json();

      if (data.status === "success" && Array.isArray(data.listings)) {
        setListings(data.listings);
      } else if (Array.isArray(data)) {
        setListings(data);
      } else {
        setError("Unexpected response format from server.");
      }
    } catch (err) {
      console.warn("Failed to fetch listings", err);
      setError("Failed to load listings.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFollowed = useCallback(async () => {
    if (!userId) return;

    try {
      const res = await fetch(
        `https://rehooz-app-491933218528.us-east4.run.app/backend/get_followed_listings.php?user_id=${userId}`
      );
      const data = await res.json();
      if (data.status === "success" && Array.isArray(data.listings)) {
        setFollowed(data.listings.map((item) => item.listing_id));
      }
    } catch (err) {
      console.error("Failed to fetch followed listings:", err);
    }
  }, [userId]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  useEffect(() => {
    fetchFollowed();
  }, [fetchFollowed]);

  useEffect(() => {
    if (!listings.length) {
      setPriceMin(null);
      setPriceMax(null);
      return;
    }

    setPriceMin((prev) => (prev === null ? priceBounds.min : prev));
    setPriceMax((prev) => (prev === null ? priceBounds.max : prev));
  }, [listings.length, priceBounds.min, priceBounds.max]);

  const handleFollow = async (id) => {
    if (!userId) return alert("You must be logged in.");

    try {
      const res = await fetch(
        "https://rehooz-app-491933218528.us-east4.run.app/backend/follow_listing.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, listing_id: id }),
        }
      );

      const data = await res.json();
      console.log(data.message);

      await fetchFollowed();
    } catch (err) {
      console.error("Failed to follow listing:", err);
    }
  };

  const handleLocationSearch = (e) => {
    e.preventDefault();
    setSearchLoading(true);
    setSubmittedLocation(locationSearch.trim());
    setTimeout(() => setSearchLoading(false), 120);
  };

  const handleDescriptionSearch = (e) => {
    e.preventDefault();
    setSearchLoading(true);
    setSubmittedDescription(descriptionSearch.trim());
    setTimeout(() => setSearchLoading(false), 120);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      setMessage("Please sign in again to add a listing.");
      return;
    }

    try {
      const res = await fetch(
        "https://rehooz-app-491933218528.us-east4.run.app/backend/add_listing.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, seller_id: userId }),
        }
      );

      const data = await res.json();
      setMessage(data.message ?? "");

      if (data.status === "success") {
        setForm({ name: "", price: "", description: "", location: "" });
        await Promise.all([fetchListings(), fetchFollowed()]);
      }
    } catch (err) {
      console.error("Failed to add listing:", err);
      setMessage("Unable to add listing. Please try again.");
    }
  };

  /* --------------------------- UNFOLLOW A LISTING --------------------------- */
  const handleUnfollow = async (id) => {
    if (!userId) return alert("You must be logged in.");

    try {
      const res = await fetch(
        "https://rehooz-app-491933218528.us-east4.run.app/backend/unfollow_listing.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, listing_id: id }),
        }
      );

      const data = await res.json();
      console.log(data.message);

      await fetchFollowed();
    } catch (err) {
      console.error("Failed to unfollow listing:", err);
    }
  };

  const renderListingCard = (item) => {
    const id = item.listing_id;
    const isFollowed = followed.includes(id);

    return (
      <div key={id} className="Listing-component">
        <div className="listing-content">
          <h4>{item.name}</h4>
          <p>{item.description}</p>

          <p style={{ marginTop: "8px" }}>
            <strong>${parseFloat(item.price).toFixed(2)}</strong>
            {item.location ? ` • ${item.location}` : ""}
          </p>
        </div>

        <div className="Component-column listing-actions">
          <Link className="view-listing-link" to={`/listing/${id}`}>
            View listing
          </Link>
          {user &&(
            <button
              className="Goto-listing"
              onClick={() => {
                setCurrentListingId(id);
                setIsOfferModalOpen(true);
                setOfferMessage("");
                setOfferAmount("");
              }}
              >
              Make Offer  
              </button>
          )}
          {user ? (
            isFollowed ? (
              <button
                className="Delete-listing"
                onClick={() => handleUnfollow(id)}
              >
                Unfollow
              </button>
            ) : (
              <button
                className="Goto-listing"
                onClick={() => handleFollow(id)}
              >
                Follow
              </button>
            )
          ) : (
            <p style={{ fontSize: "0.9rem", marginTop: "10px" }}>
              Log in to follow
            </p>
          )}
        </div>
      </div>
    );
  };

  const effectivePriceRange = useMemo(() => {
    if (!listings.length) {
      return { min: 0, max: 0 };
    }

    const resolvedMin = priceMin ?? priceBounds.min;
    const resolvedMax = priceMax ?? priceBounds.max;

    return {
      min: Math.min(resolvedMin, resolvedMax),
      max: Math.max(resolvedMin, resolvedMax),
    };
  }, [listings.length, priceMin, priceMax, priceBounds.min, priceBounds.max]);

  const visibleListings = useMemo(() => {
    if (!listings.length) return [];
    if (!isPriceFilterOpen) return listings;
    return listings.filter((item) => {
      const value = parseFloat(item.price);
      return (
        Number.isFinite(value) &&
        value >= effectivePriceRange.min &&
        value <= effectivePriceRange.max
      );
    });
  }, [listings, isPriceFilterOpen, effectivePriceRange.min, effectivePriceRange.max]);

  const filteredSearchResults = useMemo(() => {
    const locationTerm = submittedLocation.trim().toLowerCase();
    const descriptionTerm = submittedDescription.trim().toLowerCase();
    if (!locationTerm && !descriptionTerm) return [];

    return listings.filter((item) => {
      const matchesLocation = locationTerm
        ? item.location?.toLowerCase().includes(locationTerm)
        : true;
      const matchesDescription = descriptionTerm
        ? item.description?.toLowerCase().includes(descriptionTerm)
        : true;
      const value = parseFloat(item.price);
      const withinPrice =
        !isPriceFilterOpen ||
        (Number.isFinite(value) &&
          value >= effectivePriceRange.min &&
          value <= effectivePriceRange.max);

      return matchesLocation && matchesDescription && withinPrice;
    });
  }, [
    listings,
    submittedLocation,
    submittedDescription,
    isPriceFilterOpen,
    effectivePriceRange.min,
    effectivePriceRange.max,
  ]);

  const priceFilterDisabled = priceBounds.min === priceBounds.max;

  const resetPriceFilters = () => {
    setPriceMin(null);
    setPriceMax(null);
  };

  //offer handlers
  const handleMakeOffer = async()=>{
    if(!userId){
      setOfferMessage("You must be logged in to make an offer.");
      return;
    }
    if(!offerAmount || isNaN(offerAmount) || offerAmount <= 0){
      setOfferMessage("Please enter a valid offer amount.");
      return;
    }

    try{
      const res = await fetch(
        "https://rehooz-app-491933218528.us-east4.run.app/backend/make_offer.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            listing_id: currentListingId,
            monetary_amount: parseFloat(offerAmount)
          }),
        }
      );
      const data = await res.json();
      setOfferMessage(data.message);
      if(data.status === "success"){
        setOfferAmount("");
        setTimeout(() => {
          setIsOfferModalOpen(false);
          setOfferMessage("");
        }, 800);
      }
    } catch(err){
      console.error("Failed to make offer:", err);
      setOfferMessage("Unable to make offer. Please try again.");
    }
  }

  return (
    <main className="page-content browse-page">
      <div className="browse-inner">
        <div className="browse-header-row">
          <h2>Browse</h2>
          <button
            type="button"
            className="Goto-listing add-listing-btn"
            onClick={() => {
              setIsModalOpen(true);
              setMessage("");
            }}
          >
            Add Listing
          </button>
        </div>

        <section className="browse-filters-section">
          <div className="browse-filters-row">
            <div className="browse-price-filter-wrapper">
              <button
                type="button"
                className="browse-filter-toggle"
                onClick={() => {
                  const next = !isPriceFilterOpen;
                  setIsPriceFilterOpen(next);
                  if (!next) {
                    resetPriceFilters();
                  } else {
                    setPriceMin((prev) => prev ?? priceBounds.min);
                    setPriceMax((prev) => prev ?? priceBounds.max);
                  }
                }}
              >
                {isPriceFilterOpen ? "Hide Price Filter" : "Show Price Filter"}
              </button>

              {isPriceFilterOpen && (
                <div className="browse-price-filter">
                  <div className="browse-price-header">
                    <span>Price range</span>
                    {listings.length > 0 && (
                      <span>
                        ${effectivePriceRange.min.toFixed(2)} – ${
                          effectivePriceRange.max.toFixed(2)
                        }
                      </span>
                    )}
                  </div>

                  <div className="browse-price-inputs">
                    <label>
                      <span>Min</span>
                      <input
                        type="number"
                        step="0.01"
                        min={priceBounds.min}
                        max={priceBounds.max}
                        disabled={priceFilterDisabled || !listings.length}
                        value={priceMin ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "") {
                            setPriceMin(null);
                            return;
                          }
                          const num = Number(value);
                          if (Number.isNaN(num)) return;
                          const upper = priceMax ?? priceBounds.max;
                          const clamped = Math.min(
                            Math.max(num, priceBounds.min),
                            upper
                          );
                          setPriceMin(clamped);
                        }}
                      />
                    </label>

                    <label>
                      <span>Max</span>
                      <input
                        type="number"
                        step="0.01"
                        min={priceBounds.min}
                        max={priceBounds.max}
                        disabled={priceFilterDisabled || !listings.length}
                        value={priceMax ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "") {
                            setPriceMax(null);
                            return;
                          }
                          const num = Number(value);
                          if (Number.isNaN(num)) return;
                          const lower = priceMin ?? priceBounds.min;
                          const clamped = Math.max(
                            Math.min(num, priceBounds.max),
                            lower
                          );
                          setPriceMax(clamped);
                        }}
                      />
                    </label>
                  </div>

                  <div className="browse-price-sliders">
                    <input
                      type="range"
                      min={priceBounds.min}
                      max={priceBounds.max}
                      step="0.5"
                      disabled={priceFilterDisabled || !listings.length}
                      value={
                        priceMin === null
                          ? priceBounds.min
                          : Math.min(priceMin, priceBounds.max)
                      }
                      onChange={(e) => {
                        const num = Number(e.target.value);
                        if (Number.isNaN(num)) return;
                        const upper = priceMax ?? priceBounds.max;
                        setPriceMin(Math.min(num, upper));
                      }}
                    />
                    <input
                      type="range"
                      min={priceBounds.min}
                      max={priceBounds.max}
                      step="0.5"
                      disabled={priceFilterDisabled || !listings.length}
                      value={
                        priceMax === null
                          ? priceBounds.max
                          : Math.max(priceMax, priceBounds.min)
                      }
                      onChange={(e) => {
                        const num = Number(e.target.value);
                        if (Number.isNaN(num)) return;
                        const lower = priceMin ?? priceBounds.min;
                        setPriceMax(Math.max(num, lower));
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    className="browse-clear-btn"
                    onClick={resetPriceFilters}
                  >
                    Reset price filter
                  </button>
                </div>
              )}
            </div>
            <form className="browse-inline-form" onSubmit={handleDescriptionSearch}>
              <label>
                <span>Description</span>
                <div className="browse-inline-input">
                  <input
                    type="text"
                    placeholder="Search by description"
                    value={descriptionSearch}
                    onChange={(e) => setDescriptionSearch(e.target.value)}
                  />
                  <button type="submit">Search</button>
                </div>
              </label>
            </form>

            <form className="browse-inline-form" onSubmit={handleLocationSearch}>
              <label>
                <span>City</span>
                <div className="browse-inline-input">
                  <input
                    type="text"
                    placeholder="Search by city"
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                  />
                  <button type="submit">Search</button>
                </div>
              </label>
            </form>
          </div>

          {searchLoading && <p className="connect-loading">Loading…</p>}

          {(submittedLocation || submittedDescription) && (
            <div className="connect-search-results">
              <h3>Search Results</h3>
              {filteredSearchResults.length === 0 ? (
                <p className="browse-search-empty">
                  No listings match those filters.
                </p>
              ) : (
                <div className="scroll-box" aria-label="Search results">
                  {filteredSearchResults.map(renderListingCard)}
                </div>
              )}
            </div>
          )}
        </section>

        {isModalOpen && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="home-card modal-card">
              <div className="modal-close-row">
                <h4 style={{ margin: 0 }}>Add a New Listing</h4>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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

        {isOfferModalOpen && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="home-card modal-card">
              <div className="modal-close-row">
                <h4 style={{ margin: 0 }}>Make an Offer</h4>
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(false)}
                  className="modal-close-btn"
                >
              ×
            </button>
          </div>
          <img src={rehooz_square} alt="Rehooz" className="home-logo modal-logo" />
          <div style={{ textAlign: "center" }}>
            <input
              type="number"
              placeholder="Offer Amount ($)"
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
              required
            />

            <button
              className="modal-submit-btn"
              onClick={handleMakeOffer}
              style={{ marginTop: "12px" }}
            >
              Submit Offer
            </button>

            {offerMessage && (
              <p className="modal-message" style={{ marginTop: "10px" }}>
                {offerMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    )}

        {loading ? (
          <p>Loading listings…</p>
        ) : error ? (
          <p>{error}</p>
        ) : listings.length === 0 ? (
          <p>No listings available.</p>
        ) : (
          <div className="Listings-column browse-listings-card">
            <h3 className="column-title">All Listings</h3>

            <div className="scroll-box" aria-label="All listings">
              {visibleListings.length === 0 ? (
                <p>No listings in this price range.</p>
              ) : (
                visibleListings.map(renderListingCard)
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
