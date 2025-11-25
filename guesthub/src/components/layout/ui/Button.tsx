import React from "react";
import clsx from "clsx";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "ghost" | "link";
};

const Button: React.FC<Props> = ({ variant = "solid", className, ...props }) => {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition";
  const styles = {
    solid: "bg-primary text-white hover:bg-primary600",
    ghost: "bg-transparent hover:bg-neutral-200 text-neutral-900",
    link: "bg-transparent underline px-0 py-0 text-primary hover:text-primary600",
  } as const;

  return <button className={clsx(base, styles[variant], className)} {...props} />;
};

export default Button;
