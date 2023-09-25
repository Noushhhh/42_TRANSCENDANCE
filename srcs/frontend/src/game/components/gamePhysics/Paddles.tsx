import React, { FC, useRef, useEffect, useState } from "react";
import Konva from "konva";
import { Rect } from "react-konva";
import * as data from "../../assets/data";
import { Vector2d } from "konva/lib/types";
import { gameConfig } from "../../assets/gameConfig";

interface PlayerPos {
  x: number;
  y: number;
}

const Paddles: FC<data.PaddleProps> = ({ socket, isPaused = false }) => {
  const rect1Ref = useRef<Konva.Rect>(null);
  const rect2Ref = useRef<Konva.Rect>(null);
  const keyState = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    initPlayersSize();
    socket.on("updateGameState", (gameState: data.GameState) => {
      const normP1Pos: Vector2d = {
        x: gameState.p1pos.x * gameConfig.konvaWidth,
        y: gameState.p1pos.y * gameConfig.konvaHeight,
      };

      const normP2Pos: Vector2d = {
        x: gameState.p2pos.x * gameConfig.konvaWidth,
        y: gameState.p2pos.y * gameConfig.konvaHeight,
      };
      updateP1pos(normP1Pos);
      updateP2pos(normP2Pos);
    });

    return () => {
      socket.off("updateGameState");
    };
  }, [socket]);

  useEffect(() => {
    window.addEventListener("resize", resizeEvent);

    return () => {
      window.removeEventListener("resize", resizeEvent);
    };
  });

  const resizeEvent = () => {
    socket.emit("requestGameState");
  };

  const initPlayersSize = () => {
    const initP1Pos: Vector2d = {
      x: 10,
      y: gameConfig.konvaHeight / 2 - gameConfig.paddleHeight / 2,
    };
    const initP2Pos: Vector2d = {
      x: gameConfig.konvaWidth - 10 - gameConfig.paddleWidth,
      y: gameConfig.konvaHeight / 2 - gameConfig.paddleHeight / 2,
    };
    updateP1pos(initP1Pos);
    updateP2pos(initP2Pos);
  };

  const updateP1pos = (pos: Vector2d) => {
    const rect1 = rect1Ref.current;
    if (!rect1) return;

    requestAnimationFrame(() => {
      rect1.position({ x: pos.x, y: pos.y });
      rect1.size({
        width: (gameConfig.paddleWidth / 1200.0) * gameConfig.konvaWidth,
        height: (gameConfig.paddleHeight / 800.0) * gameConfig.konvaHeight,
      });
    });
  };

  const updateP2pos = (pos: Vector2d) => {
    const rect2 = rect2Ref.current;
    if (!rect2) return;

    requestAnimationFrame(() => {
      rect2.position({ x: pos.x, y: pos.y });
      rect2.size({
        width: (gameConfig.paddleWidth / 1200.0) * gameConfig.konvaWidth,
        height: (gameConfig.paddleHeight / 800.0) * gameConfig.konvaHeight,
      });
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
        socket.emit("getPlayerPos", "up");
      }
      if (keyState.current["s"]) {
        socket.emit("getPlayerPos", "down");
      }
      if (keyState.current["ArrowUp"]) {
        socket.emit("getPlayerPos", "up");
      }
      if (keyState.current["ArrowDown"]) {
        socket.emit("getPlayerPos", "down");
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
  }, [isPaused, socket]);

  return (
    <>
      <Rect ref={rect1Ref} {...data.p1Props} />
      <Rect ref={rect2Ref} {...data.p2Props} />
    </>
  );
};

export default Paddles;
