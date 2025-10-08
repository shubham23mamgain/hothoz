"use client";

import { redirect,useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Collections from "./_steps/Collections";
import { toast } from "sonner";
import Delivery from "./_steps/Delivery";

const page = () => {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const {isUserLoggedIn,isGuestLoggedIn } = useSelector((state) => state.auth);
  const cart = useSelector((state) => state.cart.cartData);

  const { previousPath } = useSelector((state) => state.path);

  
  const totalPrice = cart?.reduce((acc, item) => acc + Number(item?.totalSum), 0);
  const orderTypeArray = [
    { name: `Collection`, no: 1 },
    { name: `Delivery`, no: 2 },
  ]
  if(totalPrice < 20){
    orderTypeArray.pop()
  }

  useEffect(() => {
    if (previousPath !== "/order/cart") {
      redirect("/order/cart");
    }
  }, []);


  useEffect(() => {
    if (!isUserLoggedIn && !isGuestLoggedIn) {
      toast.error("Please Login...")
      router.push("/login");
    }
  }, [isUserLoggedIn,isGuestLoggedIn]);




  return (
    <div className="min-h-screen space-y-5 container mx-auto p-4">
      <div className=" flex items-center gap-2">
        {orderTypeArray.map((item) => {
          return (
            <button
              onClick={() => {
                if(item?.no == 2){
                  if (cart.some((item)=> item?.collectionOnlyDeal === true )){
                    toast.error("Delivery is unavailable as your cart contains a collection-only deal.",{
                      duration:2000
                    })
                  }
                  else{
                    setStep(item?.no);
                  }
                }
                else{ setStep(item?.no) }
               
              }}
              type="button"
              className={`px-6 py-2 border-2 ${step === item?.no ? "text-white bg-[#DC2626]" : "text-[#DC2626]"
                }  border-[#DC2626]  rounded font-medium`}
            >
              {item?.name}
            </button>
          );
        })}
      {totalPrice < 20 && <div className="text-red-800 ">No delivery in order less than 20 Pounds</div>}
      </div>
      <div>
        {step === 1 && (
          <Collections step={step} />
        )}
        {step === 2 && (
          <Delivery step={step} />
        )}
      </div>
    </div>
  );
};

export default page;


