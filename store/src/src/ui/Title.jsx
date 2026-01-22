import React from "react";
import { twMerge } from "tailwind-merge";

const Title = ({ text, className }) => {
  const newClassName = twMerge("text-4xl font-bold", className);
  return <h2 className={newClassName}>{text}</h2>;
};

export default Title;
