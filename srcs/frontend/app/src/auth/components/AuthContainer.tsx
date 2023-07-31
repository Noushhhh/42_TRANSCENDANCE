import React from "react";
import "../styles/AuthContainer.css";

const user = {
  name: 'Hedy Lamarr',
  imageUrl: 'https://i.imgur.com/yXOvdOSs.jpg',
  imageSize: 90,
};

const authorizeUrl = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-18a39bac72b776af2fd5f62fa678fe5a734e9e5d8c4fe99f2ff1c7041a1d990a&redirect_uri=http%3A%2F%2Flocalhost%3A4000%2Fapi%2Fauth%2Ftoken&response_type=code';

function AuthContainer() {
  function redirectApi42() {
    window.location.href = authorizeUrl;
  }

  return (
    <div>
      <div className="AuthContainer">
        
        <button onClick={redirectApi42}>Sign in</button>
        <h1>{user.name}</h1>
        <img
          className="avatar"
          src={user.imageUrl}
          alt={`Photo of ${user.name}`}
          style={{
            width: user.imageSize,
            height: user.imageSize
          }}
        />
      </div>

        <div className="card">
          <span className="font-link">
              This is with Font Link. We are linking the fonts from the Google Fonts.
          </span>
        </div>
      </div>
    
  );
}

<div> </div>

export default AuthContainer;

