import { MdOutlineStarOutline } from "react-icons/md";
import { useState } from "react";
import {
  Button,
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import AddToCartBtn from "./AddToCartBtn";
import FormattedPrice from "./FormattedPrice";
import ProductCardSideNav from "./ProductCardSideNav";

const ProductCard = ({ item, setSearchText }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigation = useNavigate();

  const open = () => {
    setIsOpen(true);
  };
  const close = () => {
    setIsOpen(false);
  };

  // Calculate the percentage saved
  const percentage =
    item?.mrp_price && item?.sell_price
      ? ((item.mrp_price - item.sell_price) / item.mrp_price) * 100
      : 0;

  const handleProduct = () => {
    navigation(`/product/${item?._id}`);
    if (setSearchText) setSearchText("");
  };

  return (
    <div className="border border-gray-200 rounded-lg p-1 overflow-hidden hover:border-black duration-200 cursor-pointer bg-gray-100">
      <div className="w-full h-60 relative p-2 group">
        {percentage > 0 && (
          <span
            onClick={open}
            className="bg-black text-skyText absolute left-0 right-0 w-16 text-xs text-center py-1 rounded-md font-semibold inline-block z-10"
          >
            save {percentage.toFixed(0)}%
          </span>
        )}
        <img
          onClick={handleProduct}
          src={item?.imageUrl || "placeholder-image-url"} // Handle missing images
          alt={item?.title || "product image"}
          className="w-full h-full rounded-md object-cover group-hover:scale-110 duration-300"
        />
        <ProductCardSideNav product={item} />
      </div>
      <div className="flex flex-col gap-2 px-2 pb-2">
        <h3 className="text-xs uppercase font-semibold text-lightText">
          {item?.sub_title || "No Overview"}
        </h3>
        <h2 className="text-lg font-bold line-clamp-2">{item?.title}</h2>
        <div className="text-base text-lightText flex items-center">
          <MdOutlineStarOutline />
          <MdOutlineStarOutline />
          <MdOutlineStarOutline />
          <MdOutlineStarOutline />
          <MdOutlineStarOutline />
        </div>
        <FormattedPrice amount={item?.sell_price} />
        <AddToCartBtn product={item} />
      </div>
      <Transition appear show={isOpen}>
        <Dialog as="div" className="relative z-10 focus:outline-none" onClose={close}>
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <TransitionChild
                enter="ease-out duration-300"
                enterFrom="opacity-0 transform-[scale(95%)]"
                enterTo="opacity-100 transform-[scale(100%)]"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 transform-[scale(100%)]"
                leaveTo="opacity-0 transform-[scale(95%)]"
              >
                <DialogPanel className="w-full max-w-md rounded-xl bg-black backdrop-blur-2xl z-50 p-6">
                  <DialogTitle as="h3" className="text-base font-medium text-whiteText">
                    Hurry up!
                  </DialogTitle>
                  <p className="mt-2 text-sm text-white/50">
                    You are going to save{" "}
                    <span className="text-skyText">
                      <FormattedPrice amount={item?.mrp_price - item?.sell_price} />
                    </span>{" "}
                    on this product.
                  </p>
                  <p className="text-sm text-white/50">
                    Limited time offer. Grab yours now!
                  </p>
                  <div className="mt-4">
                    <Button
                      className="rounded-md bg-gray-700 py-1.5 px-3 text-sm font-semibold text-white shadow-inner shadow-white/10 hover:bg-gray-600 focus:outline-none"
                      onClick={close}
                    >
                      Got it, thanks!
                    </Button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default ProductCard;
