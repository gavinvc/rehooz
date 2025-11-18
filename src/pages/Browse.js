import React, { useEffect, useState } from 'react';

export default function Browse() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch all listings - backend endpoint may be 'get_all_listings.php'
    // If your backend uses a different route, update the URL below.
    const url = '/backend/get_all_listings.php';

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success' && Array.isArray(data.listings)) {
          setListings(data.listings);
        } else {
          // if backend uses a different shape, try common alternatives
          if (Array.isArray(data)) setListings(data);
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch listings', err);
        setError('Failed to load listings.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="page-content">
      <h2>Browse</h2>

      {loading ? (
        <p>Loading listings…</p>
      ) : error ? (
        <p>{error}</p>
      ) : listings.length === 0 ? (
        <p>No listings available.</p>
      ) : (
        <div className="Listings-container">
          <div className="Listings-column" style={{ maxWidth: '820px' }}>
            <h3 className="column-title">All Listings</h3>
            <div className="scroll-box" aria-label="All listings">
              {listings.map((item) => (
                <div key={item.listing_id || item.id} className="Listing-component">
                  <div className="listing-content">
                    <h4>{item.name || item.title}</h4>
                    <p>{item.description}</p>
                    <p style={{ marginTop: '8px' }}>
                      <strong>${item.price ? parseFloat(item.price).toFixed(2) : '0.00'}</strong>
                      {item.location ? ` • ${item.location}` : ''}
                    </p>
                  </div>
                  {/* <img
                    className="listing-image"
                    src={`https://www.cs.virginia.edu/~zha4ub/rehooz/photos/${item.photo || 'default.jpg'}`}
                    alt={item.name || item.title || 'listing'}
                  /> */}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
