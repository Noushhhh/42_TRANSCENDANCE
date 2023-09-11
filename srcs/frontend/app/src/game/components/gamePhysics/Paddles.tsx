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

  const playerPosRef = useRef<Vector2d[]>([]);
  const [render, setRender] = useState<boolean>(true);

  useEffect(() => {
    socket.on("updateGameState", (gameState: data.GameState) => {
      console.log("client receive: ", gameState);
      console.log("gameConfig: ", gameConfig);
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

    // socket.on(
    //   "receivePlayersPos",
    //   (playersPos: [{ x: number; y: number }, { x: number; y: number }]) => {
    //     console.log("je log ici", playersPos);
    //     const playersPosData = [
    //       { x: playersPos[0].x, y: playersPos[0].y },
    //       { x: playersPos[1].x, y: playersPos[1].y },
    //     ];
    //     playerPosRef.current = playersPosData;
    //   }
    // );

    return () => {
      socket.off("updateGameState");
      // socket.off("receivePlayersPos");
    };
  }, [socket]);

  useEffect(() => {
    setRender((current) => !current);
    window.addEventListener("resize", resizeEvent);

    return () => {
      window.removeEventListener("resize", resizeEvent);
    };
  }, []);

  const getPlayerPos = () => {
    socket.emit("sendPlayersPos");
  };

  const resizeEvent = () => {
    getPlayerPos();
    console.log("gameConfig: ", gameConfig);
  };

  const updateP1pos = (pos: Vector2d) => {
    console.log("je log pos: ", pos);
    const rect1 = rect1Ref.current;
    if (!rect1) return;

    requestAnimationFrame(() => {
      rect1.position({ x: pos.x, y: pos.y });
      rect1.size ({
        width: (gameConfig.paddleWidth / 1200.0) * gameConfig.konvaWidth,
        height: (gameConfig.paddleHeight / 800.0) * gameConfig.konvaHeight
      })
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
