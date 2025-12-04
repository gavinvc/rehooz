import React, { useEffect, useState } from "react";
import rehooz_square from "../rehooz-square.png";

export default function Offers() {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.user_id;

  const [sentOffers, setSentOffers] = useState([]);
  const [receivedOffers, setReceivedOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchOffers = async () => {
      setLoading(true);

      try {
        const sentRes = await fetch(
          `https://rehooz-app-491933218528.us-east4.run.app/backend/get_sent_offers.php?user_id=${userId}`
        );
        const sentData = await sentRes.json();

        const receivedRes = await fetch(
          `https://rehooz-app-491933218528.us-east4.run.app/backend/get_received_offers.php?user_id=${userId}`
        );
        const receivedData = await receivedRes.json();

        if (sentData.status === "success") setSentOffers(sentData.offers);
        if (receivedData.status === "success") setReceivedOffers(receivedData.offers);

      } catch (err) {
        console.error("Failed to load offers", err);
      }

      setLoading(false);
    };

    fetchOffers();
  }, [userId]);

  return (
    <main className="page-content">
      <h2>Offers</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="Offers-container">
          {/* Sent Offers */}
          <div className="Offers-column">
            <h3 className="column-title">Sent Offers</h3>
            <div className="scroll-box">

              {sentOffers.length === 0 ? (
                <p>No offers sent yet.</p>
              ) : (
                sentOffers.map((offer) => (
                  <div key={offer.offer_id} className="Offer-item">
                    <strong>{offer.listing_name}</strong>
                    <p>Offer: ${offer.monetary_amount}</p>
                    <p>Date: {offer.date}</p>
                  </div>
                ))
              )}

            </div>
          </div>

          {/* Received Offers */}
          <div className="Offers-column">
            <h3 className="column-title">Received Offers</h3>
            <div className="scroll-box">

              {receivedOffers.length === 0 ? (
                <p>No offers received yet.</p>
              ) : (
                receivedOffers.map((offer) => (
                  <div key={offer.offer_id} className="Offer-item">
                    <strong>{offer.listing_name}</strong>
                    <p>Buyer: {offer.buyer_username}</p>
                    <p>Offer: ${offer.monetary_amount}</p>
                    <p>Date: {offer.date}</p>
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
