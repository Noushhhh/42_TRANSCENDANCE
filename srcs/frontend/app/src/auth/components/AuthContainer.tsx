import React from "react";
import axios from "axios";
import Popup from 'reactjs-popup';
import "../styles/AuthContainer.css";

const authorizeUrl = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-18a39bac72b776af2fd5f62fa678fe5a734e9e5d8c4fe99f2ff1c7041a1d990a&redirect_uri=http%3A%2F%2Flocalhost%3A4000%2Fapi%2Fauth%2Ftoken&response_type=code';

function AuthContainer() {

  async function signin42() {
    window.location.href = authorizeUrl;
  }

  async function signin() {
    try {
      // Replace 'YOUR_API_URL/signin' with your backend API endpoint for sign-in
      const response = await axios.post('localhost:8081/api/auth/signin', {
        username: 'example_username',
        password: 'example_password',
      });
      // Handle the response here, such as storing the token in local storage
      console.log(response.data);
    } catch (error) {
      console.error('Sign-in failed:', error);
      // Handle the error here
    }
  }

  async function signup() {
    try {
      // Replace 'YOUR_API_URL/signin' with your backend API endpoint for sign-in
      const response = await axios.post('localhost:8081/api/auth/signup', {
        email: 'example_email',
        username: 'example_username',
        password: 'example_password',
      });
      // Handle the response here, such as storing the token in local storage
      console.log(response.data);
    } catch (error) {
      console.error('Sign-in failed:', error);
      // Handle the error here
    }
  }

  return (
      <div className="AuthContainer">
        <div className="card">
          <span className="font-link">
              Pong Game
          </span>
        </div>
        {/* <form method="post" onSubmit={handleSubmit}>
        <label>
        Text input: <input name="myInput" defaultValue="Some initial value" />
      </label> */}
        <button onClick={signin}>Sign In</button>

        <button onClick={signup}>Sign Up</button>
        <button onClick={signin42}>Sign In with 42</button>
        {/* <Popup trigger={<button> Sign In</button>} position="right center">
            <div> Popup content here !!</div>
        </Popup> */}
      </div>
  );
}

<div> </div>

export default AuthContainer;

