import React, { useEffect, useState } from "react";
import rehooz_square from "../rehooz-square.png";

export default function Offers() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <main className="page-content">
      <h2>Listings</h2>
      <div className="Offers-container">
        {/* Sent offers */}
        <div className="Offers-column">
          <h3 className="column-title">Sent offers</h3>
          <div className="scroll-box" aria-label="Sent offers">
            <p>Coming soon...</p>
          </div>
        </div>

        {/* Followed Listings */}
        <div className="Offers-column">
          <h3 className="column-title">Received Offers</h3>
          <div className="scroll-box" aria-label="Received Offers">
            <p>Coming soon...</p>
          </div>
        </div>
      </div>
    </main>
  );
}
