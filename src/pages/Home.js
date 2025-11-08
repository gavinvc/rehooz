import React from 'react';
import rehooz_square from '../rehooz-square.png';

export default function Home() {
  return (
    <div className="App-body">
      <h1>Welcome to Rehooz</h1>
      <img src={rehooz_square} className="rehooz-square" alt="Rehooz logo" style={{marginTop: "-20px"}}/>
      <h3>Your platform for sustainable selling, purchase, and reuse.</h3>
    </div>
  );
}
