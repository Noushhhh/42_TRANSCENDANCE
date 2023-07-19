import React, { FC, ReactNode, MouseEvent } from "react";
import { styled } from "styled-components";

interface ButtonProps {
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  style?: React.CSSProperties;
}

const StyledButton = styled.button`
  backgroundcolor: "#000";
  color: "#FFF";
`;

const Button: FC<ButtonProps> = ({ children, onClick, className, style }) => {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <StyledButton className={className} onClick={handleClick} style={style}>
      {children}
    </StyledButton>
  );
};

export default Button;
