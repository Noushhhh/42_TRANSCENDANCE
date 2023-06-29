import React, { FC, useRef, useEffect } from "react";
import Konva from "konva";
import { Rect } from "react-konva";
import * as data from "../assets/data";
import { Vector2d } from "konva/lib/types";

const Paddles: FC<data.PaddleProps> = ({
  socket,
  isPaused = false,
}) => {
  const rect1Ref = useRef<Konva.Rect>(null);
  const rect2Ref = useRef<Konva.Rect>(null);
  const keyState = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    socket.on("updateGameState", (gameState: data.GameState) => {
      updateP1pos(gameState.p1pos);
      updateP2pos(gameState.p2pos);
    });

    return () => {
      socket.off("updateGameState");
    };
  }, []);

  const updateP1pos = (pos: Vector2d) => {
    const rect1 = rect1Ref.current;
    if (!rect1) return;

    requestAnimationFrame(() => {
      rect1.position({ x: pos.x, y: pos.y });
    });
  };

  const updateP2pos = (pos: Vector2d) => {
    const rect2 = rect2Ref.current;
    if (!rect2) return;

    requestAnimationFrame(() => {
      rect2.position({ x: pos.x, y: pos.y });
    });
  };

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      keyState.current[event.key] = true;
    };

    const handleKeyUp = (event: globalThis.KeyboardEvent) => {
      keyState.current[event.key] = false;
    };

    let animRequest: number;

    const updateRect = () => {
      if (isPaused) return;

      if (keyState.current["w"]) {
        socket.emit("getP1Pos", "up");
      }
      if (keyState.current["s"]) {
        socket.emit("getP1Pos", "down");
      }
      if (keyState.current["ArrowUp"]) {
        socket.emit("getP2Pos", "up");
      }
      if (keyState.current["ArrowDown"]) {
        socket.emit("getP2Pos", "down");
      }
      animRequest = requestAnimationFrame(updateRect);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    const animRequest2 = requestAnimationFrame(updateRect);

    return () => {
      cancelAnimationFrame(animRequest);
      cancelAnimationFrame(animRequest2);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isPaused]);

  return (
    <>
      <Rect ref={rect1Ref} {...data.p1Props} />
      <Rect ref={rect2Ref} {...data.p2Props} />
    </>
  );
};

export default Paddles;
