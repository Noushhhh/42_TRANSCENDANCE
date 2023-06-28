import { Stage, Layer } from "react-konva";
import React, { FC, useRef } from "react";
import { Vector2d } from "konva/lib/types";
import * as data from "../assets/data";
import Paddles from "./Paddles";
import Ball from "./Ball";

const GamePhysics: FC<data.GamePhysicsProps> = ({
  isPaused = true,
  socket,
}) => {
  const ballPosRef = useRef<Vector2d>({
    x: data.KONVA_WIDTH / 2,
    y: data.KONVA_HEIGHT / 2,
  });

  return (
    <Stage
      style={{ backgroundColor: "white" }}
      className="GamePhysics"
      width={data.KONVA_WIDTH}
      height={data.KONVA_HEIGHT}
    >
      <Layer>
        <Paddles
          socket={socket}
          isPaused={isPaused}
        />
        <Ball
          socket={socket}
          ballPosRef={ballPosRef}
        />
      </Layer>
    </Stage>
  );
};

export default GamePhysics;
