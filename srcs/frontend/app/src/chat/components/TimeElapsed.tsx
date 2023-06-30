import React from "react";

interface TimeElapsedProps {
  date: Date;
}

const TimeElapsed: React.FC<TimeElapsedProps> = ({ date }) => {
  const getTimeElapsed = (date: Date): string => {
    const currentDate = new Date();
    const timeDiff = currentDate.getTime() - date.getTime();
    const secondsElapsed = Math.floor(timeDiff / 1000);

    if (secondsElapsed < 60) {
      return "few seconds ago";
    } else if (secondsElapsed < 3600) {
      const minutesElapsed = Math.floor(secondsElapsed / 60);
      return `${minutesElapsed} minute(s)`;
    } else {
      const hoursElapsed = Math.floor(secondsElapsed / 3600);

      if (hoursElapsed < 24) {
        return `${hoursElapsed} heure(s)`;
      } else {
        const daysElapsed = Math.floor(hoursElapsed / 24);
        return `${daysElapsed} jour(s)`;
      }
    }
  };

  const elapsedTime = getTimeElapsed(date);

  return <span>{elapsedTime}</span>;
};


export default TimeElapsed;
