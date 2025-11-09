import React from 'react';
import rehooz_square from '../rehooz-square.png';

export default function Listings() {
  return (
    <main className="page-content">
      <h2>Listings</h2>
      <div className="Listings-container"> 
        <div className="Listings-column">
          <h3 className="column-title">My listings</h3>
          <div className="scroll-box" aria-label="My listings">
            {/* example for demonstration, will be replaced with dynamic
            content loaded from the DB */}
            <div className="Listing-component">
              <div className="Component-column">
                <h4>Item A</h4>
                <p>This is a description of a listing is a description of a listing is a description of a listing</p>
                <button className="Goto-listing">Go to</button>
              </div>
              <div className="Component-column">
                <img src={rehooz_square} alt="Item A" className="Listing-image"/>
                <button className="Delete-listing">Delete</button>
              </div>
            </div>
            <div className="Listing-component">
              <div className="Component-column">
                <h4>Item B</h4>
                <p>This is a description of a listing is a description of a listing is a description of a listing</p>
                <button className="Goto-listing">Go to</button>
              </div>
              <div className="Component-column">
                <img src={rehooz_square} alt="Item A" className="Listing-image"/>
                <button className="Delete-listing">Delete</button>
              </div>
            </div>
          </div>
        </div>

        <div className="Listings-column">
          <h3 className="column-title">Followed listings</h3>
          <div className="scroll-box" aria-label="Followed listings">
            <div className="Listing-component">
              <div className="Component-column">
                <h4>Item C</h4>
                <p>This is a description of a listing is a description of a listing is a description of a listing</p>
                <button className="Goto-listing">Go to</button>
              </div>
              <div className="Component-column">
                <img src={rehooz_square} alt="Item A" className="Listing-image"/>
                <button className="Unfollow-listing">Unfollow</button>
              </div>
            </div>
            <div className="Listing-component">
              <div className="Component-column">
                <h4>Item D</h4>
                <p>This is a description of a listing is a description of a listing is a description of a listing</p>
                <button className="Goto-listing">Go to</button>
              </div>
              <div className="Component-column">
                <img src={rehooz_square} alt="Item A" className="Listing-image"/>
                <button className="Unfollow-listing">Unfollow</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
