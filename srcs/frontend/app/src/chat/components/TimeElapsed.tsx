import React from "react";

interface TimeElapsedProps {
  date: Date;
}

const TimeElapsed: React.FC<TimeElapsedProps> = ({ date }) => {
  const getTimeElapsed = (date: Date): string => {
    const currentDate = new Date();
    const timeDiff = currentDate.getTime() - date.getTime();
    const hoursElapsed = Math.floor(timeDiff / (1000 * 60 * 60));

    if (hoursElapsed < 24) {
      return `${hoursElapsed} heure(s)`;
    } else {
      const daysElapsed = Math.floor(hoursElapsed / 24);
      return `${daysElapsed} jour(s)`;
    }
  };

  const elapsedTime = getTimeElapsed(date);

  return <span>{elapsedTime}</span>;
};

export default TimeElapsed;
