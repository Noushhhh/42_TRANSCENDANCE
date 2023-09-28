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
  // const [p1Pos, setP1Pos] = useState<Vector2d>([])
  const stageRef = useRef<Konva.Stage>(null);

  useEffect(() => {
    resizeEvent();
    console.log(
      GameConfigController.getKonvaHeight(),
      GameConfigController.getKonvaWidth()
    );
    window.addEventListener("resize", resizeEvent);

    return () => {
      window.removeEventListener("resize", resizeEvent);
    };
  }, []);

  const resizeEvent = () => {
    GameConfigController.setKonvaWidth(window.innerWidth);
    GameConfigController.setKonvaHeight((window.innerWidth * 6) / 12);
    stageRef.current?.width(window.innerWidth);
    stageRef.current?.height((window.innerWidth * 6) / 12);
    setKonvaSize([window.innerWidth, (window.innerWidth * 6) / 12]);
  };

  const ballPosRef = useRef<Vector2d>({
    x: gameConfig.konvaWidth / 2,
    y: gameConfig.konvaHeight / 2,
  });

  return (
    <Stage
      style={{ backgroundColor: "#201F1F" }}
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
