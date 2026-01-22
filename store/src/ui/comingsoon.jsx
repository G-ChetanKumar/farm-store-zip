import React from "react";
import comingsoon from "../assets/coming-soon.gif";
import EfreshHeader from "./efresh/EfreshHeader";
import ClaimFreshDeals from "./efresh/ClaimFreshDeals";
import EfreshCategories from "./efresh/EfreshbyCategories";
import EfreshProducts from "./efresh/EFreshProducts";
import DairyEfresh from "./efresh/DairyEfresh";
import BeveragesEfresh from "./efresh/BeveragesEfresh";
import SpicesEfresh from "./efresh/SpicesEfresh";
import OilsEfresh from "./efresh/OilsEfresh";
import OralCare from "./efresh/OralCare";
import SkinCare from "./efresh/SkinCare";
import HairCare from "./efresh/HairCare";
import NoodlesPasta from "./efresh/NoodlesPasta";
import AttaRice from "./efresh/AttaRice";
import DalsPulses from "./efresh/DalsPulses";
import Breakfast from "./efresh/Breakfast";
import Chocolates from "./efresh/Chocolates";
import LaundryCare from "./efresh/LaundryCare";
import DishWash from "./efresh/DishWash";
import HouseholdCleaning from "./efresh/Household";
import PoojaNeeds from "./efresh/PoojaNeeds";

const ComingSoonPage = () => {
  return (
    <>
<EfreshHeader/>
<ClaimFreshDeals/>
<EfreshCategories/>
<EfreshProducts/>
<DairyEfresh/>
<BeveragesEfresh/>
<SpicesEfresh/>
<OilsEfresh/>
<OralCare/>
<SkinCare/>
<HairCare/>
<NoodlesPasta/>
<AttaRice/>
<DalsPulses/>
<Breakfast/>
<Chocolates/>
<LaundryCare/>
<DishWash/>
<HouseholdCleaning/>
<PoojaNeeds/>
    {/* <div className="flex items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
      <div className="bg-white shadow-lg rounded-lg p-5 sm:p-8 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg text-center">
        <img
          src={comingsoon}
          alt="Coming Soon"
          className="w-40 sm:w-48 md:w-56 lg:w-64 h-auto object-contain mx-auto"
        />
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800 mt-3 sm:mt-4 md:mt-6">
          We're working on something amazing!
        </h1>
        <p className="text-gray-600 mt-2 sm:mt-3 text-sm sm:text-base md:text-lg px-2 sm:px-6">
          Please wait for further updates. Thank you for your patience!
        </p>
      </div>
    </div> */}
    </>
  );
};

export default ComingSoonPage;