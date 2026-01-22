import React from 'react'
import EmedsHeader from './EmedsHeader'
import ClaimMedDeals from './ClaimMedDeals';
import CategoriesEmeds from './CategoriesEmeds';
import ShopbyProducts from './ShopbyProducts';
import ElderCare from './ElderCare';
import MotherCare from './MotherCare';
import WomenCare from './WomenCare';
import SexualWellness from './SexualWellness';
import SkinCare from './SkinCare';
import HealthCare from './HealthCare';
import SurgicalAccessories from './SurgicalAccessories';
import FirstAid from './FirstAid';

const EmedsLanding = () => {
  return (
    <div>
      <>
      <EmedsHeader/>
      <ClaimMedDeals/>
      <CategoriesEmeds/>
      <ShopbyProducts/>
      <ElderCare/>
      <MotherCare/>
      <WomenCare/>
      <SexualWellness/>
      <SkinCare/>
      <HealthCare/>
      <SurgicalAccessories/>
      <FirstAid/>
      </>
    </div>
  )
}

export default EmedsLanding;
