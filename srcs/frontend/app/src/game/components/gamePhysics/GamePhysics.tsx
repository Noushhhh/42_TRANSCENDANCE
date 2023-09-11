import { Stage, Layer } from "react-konva";
import React, { FC, useEffect, useRef, useState } from "react";
import { Vector2d } from "konva/lib/types";
import * as data from "../../assets/data";
import { gameConfig } from "../../assets/gameConfig";
import Paddles from "./Paddles";
import Ball from "./Ball";
import Ray from "./Ray";
import Konva from "konva";

type KonvaSize = [konvaWidth: number, konvaHeight: number];
const GameConfigController = new data.GameConfig();

const GamePhysics: FC<data.GamePhysicsProps> = ({
  isPaused = true,
  socket,
}) => {
  const [konvaSize, setKonvaSize] = useState<KonvaSize>([1200, 800]);
  const stageRef = useRef<Konva.Stage>(null);

  useEffect(() => {
    console.log(
      GameConfigController.getKonvaHeight(),
      GameConfigController.getKonvaWidth()
    );
    setGameData();
    window.addEventListener("resize", resizeEvent);

    return () => {
      window.removeEventListener("resize", resizeEvent);
    };
  }, []);

  const resizeEvent = () => {
    if (window.innerWidth < 2000) {
      console.log("je passe par ici 1");
      GameConfigController.setKonvaWidth(1000);
      GameConfigController.setKonvaHeight(600);
      stageRef.current?.width(1000);
      stageRef.current?.height(600);
      setKonvaSize([1000, 600]);
      setGameData();
    }
    if (window.innerWidth > 2000) {
      console.log("je passe par ici 2");
      GameConfigController.setKonvaWidth(1200);
      GameConfigController.setKonvaHeight(800);
      stageRef.current?.width(1200);
      stageRef.current?.height(800);
      setKonvaSize([1200, 800]);
      setGameData();
    }
  };

  const setGameData = () => {
    console.log("setGameLog: ", gameConfig.konvaHeight, gameConfig.konvaWidth);
    socket.emit(
      "setGameData",
      gameConfig.konvaHeight,
      gameConfig.konvaWidth,
      gameConfig.paddleHeight,
      gameConfig.paddleWidth
    );
  };

  const ballPosRef = useRef<Vector2d>({
    x: gameConfig.konvaWidth / 2,
    y: gameConfig.konvaHeight / 2,
  });

  return (
    <Stage
      style={{ backgroundColor: "white" }}
      className="GamePhysics"
      ref={stageRef}
      width={gameConfig.konvaWidth}
      height={gameConfig.konvaHeight}
    >
      <Layer>
        <Paddles socket={socket} isPaused={isPaused} />
        <Ball socket={socket} ballPosRef={ballPosRef} />
        <Ray socket={socket} />
      </Layer>
    </Stage>
  );
};

export default GamePhysics;
