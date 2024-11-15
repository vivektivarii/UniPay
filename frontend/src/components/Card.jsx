import React from "react";

function Card({ title, subtitle, content, buttonText, onClick, bgColor }) {
  return (
    <div className={`rounded-lg shadow-md p-6 ${bgColor || "bg-white"} text-white`}>
      <h3 className="text-xl font-semibold">{title}</h3>
      {subtitle && <p className="text-sm mb-4 text-gray-300">{subtitle}</p>}
      <div className="text-2xl font-bold mb-4">{content}</div>
      {buttonText && (
        <button
          className="bg-white text-blue-500 px-4 py-2 rounded font-semibold w-full"
          onClick={onClick}
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}

export default Card;
