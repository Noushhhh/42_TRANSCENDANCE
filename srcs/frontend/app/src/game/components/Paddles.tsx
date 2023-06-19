import React, { FC, useRef, useEffect } from "react";
import Konva from "konva";
import { Rect } from "react-konva";
import * as data from "../assets/data";
import { Vector2d } from "konva/lib/types";

const Paddles: FC<data.PaddleProps> = ({
  socket,
  isPaused = false,
  p1Pos,
  p2Pos,
}) => {
  const rect1Ref = useRef<Konva.Rect>(null);
  const rect2Ref = useRef<Konva.Rect>(null);
  const keyState = useRef<{ [key: string]: boolean }>({});

  console.log("lu");

  useEffect(() => {
    socket.on("updateP1Pos", (res: Vector2d) => {
      updateP1Pos(res);
    });
    socket.on("updateP2Pos", (res: Vector2d) => {
      updateP2Pos(res);
    });
    return () => {
      socket.off("updateP1Pos");
      socket.off("updateP2Pos");
    };
  }, []);

  const sendP1Pos = () => {
    socket.emit("getP1Pos", p1Pos.current);
  };

  const updateP1Pos = (pos: Vector2d) => {
    const rect1 = rect1Ref.current;
    if (!rect1) return;

    rect1.position({ x: pos.x, y: pos.y });
    p1Pos.current = rect1.position();
  };

  const sendP2Pos = () => {
    socket.emit("getP2Pos", p2Pos.current);
  };

  const updateP2Pos = (pos: Vector2d) => {
    const rect2 = rect2Ref.current;
    if (!rect2) return;

    rect2.position({ x: pos.x, y: pos.y });
    p2Pos.current = rect2.position();
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

      const rect1 = rect1Ref.current;
      if (!rect1) return;

      const rect2 = rect2Ref.current;
      if (!rect2) return;

      const position1 = rect1.position();
      const position2 = rect2.position();
      const moveAmount = 6;

      if (keyState.current["w"]) {
        if (position1.y > 0) {
          rect1.position({ x: position1.x, y: position1.y - moveAmount });
          p1Pos.current = rect1.position();
          sendP1Pos();
        }
      }
      if (keyState.current["s"]) {
        if (position1.y < data.KONVA_HEIGHT - data.PADDLE_HEIGHT) {
          rect1.position({ x: position1.x, y: position1.y + moveAmount });
          p1Pos.current = rect1.position();
          sendP1Pos();
        }
      }
      if (keyState.current["ArrowUp"]) {
        if (position2.y > 0) {
          rect2.position({ x: position2.x, y: position2.y - moveAmount });
          p2Pos.current = rect2.position();
          sendP2Pos();
        }
      }
      if (keyState.current["ArrowDown"]) {
        if (position2.y < data.KONVA_HEIGHT - data.PADDLE_HEIGHT) {
          rect2.position({ x: position2.x, y: position2.y + moveAmount });
          p2Pos.current = rect2.position();
          sendP2Pos();
        }
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
