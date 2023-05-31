import React from 'react';
import ReactDOM from 'react-dom';
import styled, { keyframes } from 'styled-components';

// Create a keyframes animation
const rainbow = keyframes`
  0% {color: red;}
  14% {color: orange;}
  28% {color: yellow;}
  42% {color: green;}
  57% {color: blue;}
  71% {color: indigo;}
  85% {color: violet;}
  100% {color: red;}
`

// Style your h1 component
const StyledH1 = styled.h1`
  font-size: 2.5em;
  text-align: center;
  color: purple;
  text-shadow: 2px 2px 4px #000000;
  animation: ${rainbow} 5s linear infinite;
`;

ReactDOM.render(
  <React.StrictMode>
    <StyledH1>ft_transcendance</StyledH1>
  </React.StrictMode>,
  document.getElementById('root')
);