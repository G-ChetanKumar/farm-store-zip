import React from "react";
import { TagIcon, CheckBadgeIcon, TruckIcon } from "@heroicons/react/24/outline"; // Use CheckBadgeIcon for 'BadgeCheckIcon'

const BenefitsSection = () => {
  const benefits = [
    {
      icon: <TagIcon className="w-8 h-8 text-orange-500" />,
      title: "100% Branded Products",
    },
    {
      icon: <CheckBadgeIcon className="w-8 h-8 text-orange-500" />, // Using CheckBadgeIcon
      title: "100% Original Products",
    },
    {
      icon: <TruckIcon className="w-8 h-8 text-orange-500" />,
      title: "Free Delivery",
    },
  ];

  return (
    <div className="py-6" style={{ backgroundColor: '#EEF7DB' }}>
      <div className="container mx-auto flex justify-around items-center space-x-6">
        {benefits.map((benefit, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center space-y-2"
          >
            <div>{benefit.icon}</div>
            <p className="text-lg font-semibold text-green-800">{benefit.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BenefitsSection;
