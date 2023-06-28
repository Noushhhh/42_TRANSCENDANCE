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
  const p1Pos = useRef<Vector2d>({ x: 10, y: 310 });
  const p2Pos = useRef<Vector2d>({
    x: data.KONVA_WIDTH - 10 - data.PADDLE_WIDTH,
    y: 310,
  });
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
          p1Pos={p1Pos}
          p2Pos={p2Pos}
        />
        <Ball
          socket={socket}
          isPaused={isPaused}
          ballPosRef={ballPosRef}
          p1Pos={p1Pos}
          p2Pos={p2Pos}
        />
      </Layer>
    </Stage>
  );
};

export default GamePhysics;
