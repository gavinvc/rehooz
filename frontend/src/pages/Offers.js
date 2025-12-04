import React, { useEffect, useState } from "react";

export default function Offers() {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.user_id;

  const [sentOffers, setSentOffers] = useState([]);
  const [receivedOffers, setReceivedOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOffers = async () => {
    if (!userId) return;

    setLoading(true);

    const sent = await fetch(
      `https://rehooz-app-491933218528.us-east4.run.app/backend/get_sent_offers.php?user_id=${userId}`
    ).then((r) => r.json());

    const received = await fetch(
      `https://rehooz-app-491933218528.us-east4.run.app/backend/get_received_offers.php?user_id=${userId}`
    ).then((r) => r.json());

    if (sent.status === "success") setSentOffers(sent.offers);
    if (received.status === "success") setReceivedOffers(received.offers);

    setLoading(false);
  };

  useEffect(() => {
    loadOffers();
  }, []);

  // --- RESCIND OFFER ---------------------------------
  const handleRescind = async (offer_id) => {
    const res = await fetch(
      "https://rehooz-app-491933218528.us-east4.run.app/backend/rescind_offer.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offer_id, user_id: userId }),
      }
    );

    const json = await res.json();
    alert(json.message);
    loadOffers();
  };

  // --- ACCEPT OFFER -----------------------------------
  const handleAccept = async (offer_id) => {
    const res = await fetch(
      "https://rehooz-app-491933218528.us-east4.run.app/backend/accept_offer.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offer_id, user_id: userId }),
      }
    );

    const json = await res.json();
    alert(json.message);
    loadOffers();
  };

  return (
    <main className="page-content">
      <h2>Offers</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="Offers-container">

          {/* SENT */}
          <div className="Offers-column">
            <h3>Sent Offers</h3>
            <div className="scroll-box">
              {sentOffers.length === 0 ? (
                <p>No sent offers.</p>
              ) : (
                sentOffers.map((offer) => (
                  <div key={offer.offer_id} className="Offer-item">
                    <strong>{offer.listing_name}</strong>
                    <p>Offer: ${offer.monetary_amount}</p>
                    <p>Date: {offer.date}</p>

                    <button
                      className="Delete-listing"
                      onClick={() => handleRescind(offer.offer_id)}
                    >
                      Rescind Offer
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RECEIVED */}
          <div className="Offers-column">
            <h3>Received Offers</h3>
            <div className="scroll-box">
              {receivedOffers.length === 0 ? (
                <p>No offers received.</p>
              ) : (
                receivedOffers.map((offer) => (
                  <div key={offer.offer_id} className="Offer-item">
                    <strong>{offer.listing_name}</strong>
                    <p>From: {offer.buyer_username}</p>
                    <p>Offer: ${offer.monetary_amount}</p>

                    {!offer.is_accepted && (
                      <button
                        className="Goto-listing"
                        onClick={() => handleAccept(offer.offer_id)}
                      >
                        Accept Offer
                      </button>
                    )}

                    {offer.is_accepted === "1" && (
                      <p style={{ color: "green", fontWeight: "bold" }}>
                        Accepted
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}
    </main>
  );
}
