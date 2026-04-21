import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "success" | "danger" | "outline-primary" | "outline-secondary";
  fullWidth?: boolean;
};

const Button = ({
  variant = "primary",
  fullWidth = false,
  className = "",
  type = "button",
  children,
  ...props
}: ButtonProps) => {
  const buttonClassName = [
    "btn",
    `btn-${variant}`,
    fullWidth ? "w-100" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={buttonClassName} {...props}>
      {children}
    </button>
  );
};

export default Button;
