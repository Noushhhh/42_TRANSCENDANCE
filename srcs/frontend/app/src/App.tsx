import React from "react";
import "./App.css";
import GameContainer from "./game/components/GameContainer";
import Navbar from "./navbar/navbar";
import ChatBoxContainer from "./chat/components/ChatBoxContainer";
import { createTheme } from "@mui/material";
import { ThemeProvider } from "@emotion/react";

const theme = createTheme({
  palette: {
    primary: {
      main: "#999999",
    },
    secondary: {
      main: "#5A5E51",
    },
  },
  typography: {
    h2: {
      main: "#C7C7C7",
    },
    h3:{
      main: "#5A5E51",
    },
    body1:{
      main: "#C7C7C7",
    },
    body2:{
      main: "#5A5E51",
    },
  },
})

function App() {
  return (
    <div className="App">
      <Navbar />
      <ThemeProvider theme={theme}>
        <ChatBoxContainer />
      </ThemeProvider>
      {/* <GameContainer /> */}
    </div>
  );
}

export default App; 
