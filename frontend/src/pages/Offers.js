import React, { useEffect, useState } from "react";

export default function Offers() {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.user_id;

  const [sentOffers, setSentOffers] = useState([]);
  const [receivedOffers, setReceivedOffers] = useState([]);
  const [acceptedOffers, setAcceptedOffers] = useState([]);
  const [purchases, setPurchases] = useState([]);   // 👈 NEW
  //const [loading, setLoading] = useState(true);

  const loadOffers = async () => {
    if (!userId) return;
    //setLoading(true);

    const sent = await fetch(
      `https://rehooz-app-491933218528.us-east4.run.app/backend/get_sent_offers.php?user_id=${userId}`
    ).then((r) => r.json());

    const received = await fetch(
      `https://rehooz-app-491933218528.us-east4.run.app/backend/get_received_offers.php?user_id=${userId}`
    ).then((r) => r.json());

    const myPurchases = await fetch(
      `https://rehooz-app-491933218528.us-east4.run.app/backend/get_my_purchases.php?user_id=${userId}`
    ).then((r) => r.json());

    if (sent.status === "success") setSentOffers(sent.offers);

    if (received.status === "success") {
      setReceivedOffers(received.offers.filter((o) => o.is_accepted !== "1"));
      setAcceptedOffers(received.offers.filter((o) => o.is_accepted === "1"));
    }

    if (myPurchases.status === "success") {
      setPurchases(myPurchases.purchases);   // 👈 LOAD PURCHASES
    }

    //setLoading(false);
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const handleRescind = async (offer_id) => {
    const res = await fetch(
      "https://rehooz-app-491933218528.us-east4.run.app/backend/rescind_offer.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offer_id, user_id: userId }),
      }
    );

    alert((await res.json()).message);
    loadOffers();
  };

  const handleAccept = async (offer_id) => {
    const res = await fetch(
      "https://rehooz-app-491933218528.us-east4.run.app/backend/accept_offer.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offer_id, user_id: userId }),
      }
    );

    alert((await res.json()).message);
    loadOffers();
  };

  return (
    <main className="page-content">
      <h2>Offers</h2>

        <div className="Listings-container">

          {/* SENT OFFERS */}
          <div className="Listings-column">
            <h3 className="column-title">Sent Offers</h3>
            <div className="scroll-box">
              {sentOffers.length === 0 ? (
                <p>No sent offers.</p>
              ) : (
                sentOffers.map((offer) => (
                  <div key={offer.offer_id} className="Listing-component">
                    <div className="listing-content">
                      <h4>{offer.listing_name}</h4>
                      <p><strong>Your Offer:</strong> ${offer.monetary_amount}</p>
                      <p>Date: {offer.date}</p>
                    </div>

                    <div className="Component-column listing-actions">
                      <button className="Delete-listing" onClick={() => handleRescind(offer.offer_id)}>
                        Rescind Offer
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RECEIVED OFFERS */}
          <div className="Listings-column">
            <h3 className="column-title">Received Offers</h3>
            <div className="scroll-box">
              {receivedOffers.length === 0 ? (
                <p>No offers received.</p>
              ) : (
                receivedOffers.map((offer) => (
                  <div key={offer.offer_id} className="Listing-component">
                    <div className="listing-content">
                      <h4>{offer.listing_name}</h4>
                      <p><strong>From:</strong> {offer.buyer_username}</p>
                      <p><strong>Offer:</strong> ${offer.monetary_amount}</p>

                      {offer.is_accepted === "1"||offer.is_accepted===1?(
                        <p style={{color:"green",frontWeight: "bold"}}>
                          Accepted
                          </p>
                      ) : null}
                    </div>

                    <div className="Component-column listing-actions">
                      {offer.is_accepted ==="0"||offer.is_accepted===0?(
                        
                      <button
                        className="Goto-listing"
                        onClick={() => handleAccept(offer.offer_id)}
                      >
                        Accept Offer
                      </button>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* MY PURCHASES */}
          <div className="Listings-column">
            <h3 className="column-title">My Purchases</h3>
            <div className="scroll-box">
              {purchases.length === 0 ? (
                <p>You haven't purchased anything yet.</p>
              ) : (
                purchases.map((item) => (
                  <div key={item.offer_id} className="Listing-component">
                    <div className="listing-content">
                      <h4>{item.listing_name}</h4>
                      <p>{item.description}</p>
                      <p>
                        <strong>Final Price:</strong> ${item.monetary_amount}
                      </p>
                      <p>Location: {item.location}</p>
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
