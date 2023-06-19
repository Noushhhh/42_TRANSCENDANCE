import React, { FC, useRef, useEffect } from "react";
import Konva from "konva";
import { Circle } from "react-konva";
import { Vector2d } from "konva/lib/types";
import * as data from "../assets/data";

let ballDirection = "left";
let ballDX = 0;
let ballDY = 0;
let ballSpeed = 2;

const Ball: FC<data.BallProps> = ({
  socket,
  isPaused,
  ballPosRef,
  p1Pos,
  p2Pos,
  setP1Score,
  setP2Score,
}) => {
  const circleRef = useRef<Konva.Circle>(null);

  useEffect(() => {
    socket.on("updateBallPos", (res: Vector2d) => {
      updateBallPos(res);
    });

    return () => {
      socket.off("updateBallPos");
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        moveBall();
      }
    }, 1);

    return () => {
      clearInterval(interval);
    };
  }, [isPaused]);

  const updateBallPos = (pos: Vector2d) => {
    const ball = circleRef.current;
    if (!ball) return;

    ball.position(pos);
  };

  const sendBallPos = () => {
    socket.emit("getBallPos", ballPosRef.current);
  };

  const moveBall = () => {
    const ball = circleRef.current;
    if (!ball) return;

    const ballPos = ball.position();

    if (ballDirection === "left") {
      if (!p1Pos.current) return;
      if (
        ballPos.x < 10 + data.PADDLE_WIDTH + 15 &&
        ballPos.x > 5 + data.PADDLE_WIDTH + 15 &&
        ballPos.y > p1Pos.current?.y &&
        ballPos.y < p1Pos.current?.y + data.PADDLE_HEIGHT
      ) {
        const touch = p1Pos.current.y + data.PADDLE_HEIGHT / 2 - ballPos.y;
        const normalizedTouch = touch / (data.PADDLE_HEIGHT / 2);
        const velocity = normalizedTouch * (Math.PI / 4);
        ballDX = Math.cos(velocity);
        ballDY = -Math.sin(velocity);

        ballDirection = "right";
        return;
      } else if (ballPos.y < 0 + 10) {
        ballDY = -ballDY;
      } else if (ballPos.y > data.KONVA_HEIGHT - 10) {
        ballDY = -ballDY;
      }
      if (ballPos.x < 0) {
        setP2Score((curr: number) => curr + 1);
        ball.position({
          x: data.KONVA_WIDTH / 2,
          y: data.KONVA_HEIGHT / 2,
        });
        ballPosRef.current = ball.position();
        sendBallPos();
        ballDX = 0;
        ballDY = 0;
      } else {
        ball.position({ x: ballPos.x - ballSpeed - ballDX, y: ballPos.y - ballDY });
        ballPosRef.current = ball.position();
        sendBallPos();
      }
    } else if (ballDirection === "right") {
      if (!p2Pos.current) return;
      if (
        ballPos.x > data.KONVA_WIDTH - data.PADDLE_WIDTH - 20 &&
        ballPos.x < data.KONVA_WIDTH - data.PADDLE_WIDTH - 15 &&
        ballPos.y > p2Pos.current?.y &&
        ballPos.y < p2Pos.current?.y + data.PADDLE_HEIGHT
      ) {
        const touch = p2Pos.current.y + data.PADDLE_HEIGHT / 2 - ballPos.y;
        const normalizedTouch = touch / (data.PADDLE_HEIGHT / 2);
        const velocity = -(normalizedTouch * (Math.PI / 4));
        ballDX = Math.cos(velocity);
        ballDY = -Math.sin(velocity);

        ballDirection = "left";
        return;
      } else if (ballPos.y < 0 + 10) {
        ballDY = -ballDY;
      } else if (ballPos.y > data.KONVA_HEIGHT - 10) {
        ballDY = -ballDY;
      }
      if (ballPos.x > data.KONVA_WIDTH) {
        setP1Score((curr: number) => curr + 1);
        ball.position({
          x: data.KONVA_WIDTH / 2,
          y: data.KONVA_HEIGHT / 2,
        });
        ballPosRef.current = ball.position();
        sendBallPos();
        ballDX = 0;
        ballDY = 0;
      } else {
        ball.position({ x: ballPos.x + ballSpeed + ballDX, y: ballPos.y + ballDY });
        ballPosRef.current = ball.position();
        sendBallPos();
      }
    }
  };

  return (
    <Circle
      ref={circleRef}
      x={data.KONVA_WIDTH / 2}
      y={data.KONVA_HEIGHT / 2}
      radius={20}
      fill="green"
    />
  );
};

export default Ball;
