"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useId, useRef, useState } from "react";
import { FaBagShopping } from "react-icons/fa6";
import { FaUser } from "react-icons/fa6";
import { CiUser } from "react-icons/ci";
import { PiBagLight } from "react-icons/pi";
import { RiRefreshFill } from "react-icons/ri";
import logo from "../../../_assets/images/HOTPIZZALOGO.jpg";
import { categoryEnum } from "@/app/utils/utils";
import { useAppSelector } from "@/app/lib/hooks";
import { SiWhatsapp } from "react-icons/si";
import { BiSolidPizza } from "react-icons/bi";
import { useDispatch } from "react-redux";
import { getCustomizationDetails } from "@/app/lib/features/orderDetails/orderDetailsslice";
import LogoutModal from "../../Modals/LogoutModal";

async function getPizzaData() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/pizza`);
    const data = await res.json();
    return data.data; // Assuming `data` has a `data` property containing the actual deals
  } catch (err) {
    console.log("Error Occurred", err);
    return null;
  }
}
const Header = () => {

  const [isChecked, setIsChecked] = useState(false)


  const [selectedItem, setSelectedItem] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const cart = useAppSelector((state) => state.cart.cartData);
  const { userData, isUserLoggedIn, isGuestLoggedIn } = useAppSelector((state) => state.auth);
  const { orderType } = useAppSelector((state) => state.orderDetails);

  const [pizzaData, setPizzaData] = useState(null);
  const dispatch = useDispatch()
  const randomId = useId()
  const modalRef = useRef(null);
  function handleLogoutAccount() {
    modalRef.current.open();
  }

  const totalPrice = cart?.reduce((acc, item) => acc + Number(item?.totalSum), 0);



  useEffect(() => {
    async function fetchData() {
      const pizzaData = await getPizzaData()
      setPizzaData(pizzaData)
    }
    fetchData();
    setIsMounted(true);
  }, []);


  const handleCheckboxChange = () => {
    setIsChecked(!isChecked)
  }




  if (!isMounted) {
    return null; // Render nothing until the component has mounted
  }





  return (
    <div className="bg-white  z-10 shadow-lg fixed top-0 w-full pt-2  md:pt-4 md:py-4">
      <LogoutModal ref={modalRef} />
      {/* Mobile */}
      <div className="flex justify-between items-center mx-1 md:mx-4">
        <Link href="/" className="flex justify-center">
          <Image src={logo} className="bg-white lg:hidden" alt="Hot House Northwood logo" width={40} />
        </Link>
        <ul className="lg:hidden flex gap-4 items-center">
          {isUserLoggedIn ? (
            <Link href="/profile?tab=1">
              <p className="flex items-center gap-2 text-green-950">
                <FaUser size={20} className="text-slate-700" aria-label="User Profile" />
                <span className="text-red-800 text-sm font-semibold tracking-wide">
                  {userData?.firstName ? userData?.firstName[0] : "Error"}.{userData?.lastName}
                </span>
              </p>
            </Link>
          ) : isGuestLoggedIn ? <li className="px-2 py-1 text-white font-semibold bg-red-800 rounded-md flex items-center text-xs">
            <button onClick={handleLogoutAccount}> Guest Account</button>
          </li> : (
            <li className="px-2 py-1 text-white font-semibold bg-red-800 rounded-md flex items-center text-xs">
              <Link href="/login">Login / Signup</Link>
            </li>
          )}
          <Link href="/order/cart" className="flex items-center text-base">
            <FaBagShopping size={22} className="text-slate-700" aria-label="Cart" />
            <span className="bg-red-800 text-sm text-white rounded-full px-[6px] py-[1px] mx-2">
              {cart?.length}
            </span>
            <span className="text-red-800 font-semibold">
              <span className="text-sm">£ </span>{totalPrice?.toFixed(2)}
            </span>
          </Link>
        </ul>
      </div>

      {/* Desktop */}
      <div className="bg-white flex flex-col lg:flex-row justify-between lg:items-center lg:px-10">
        <Link href="/" className="hidden lg:flex lg:flex-col justify-center h-full">
          <Image src={logo} className="bg-white hidden lg:block" alt="Hot House Northwood" width={80} height={80} />
        </Link>
        <ul className="flex lg:pt-0 flex-wrap items-center justify-around text-base sm:text-lg text-white font-semibold xl:gap-10">
          <Link href="/menu/deals">
            <li
              className={`py-2 px-1 mt-2 lg:mt-0 lg:px-5 lg:h-[56px] flex items-center text-green-800 transition duration-300 font-bold ${selectedItem === -1 ? "bg-red-800 text-white hover:text-white" : "bg-white hover:shadow-[0_4px#991b1b] hover:text-[#991b1b]"
                }`}
              onClick={() => setSelectedItem(-1)}
            >
              Deals
            </li>
          </Link>
          {Array.isArray(categoryEnum) &&
            categoryEnum.map((data, idx) => (
              <Link href={`/menu/${data?.toLowerCase()}`} key={idx}>
                <li
                  className={`px-1  mt-2 lg:mt-0 lg:px-5 py-2 lg:h-[56px] flex items-center text-green-800 transition duration-300 font-bold ${selectedItem === idx ? "bg-red-800 text-white hover:text-white" : "bg-white hover:shadow-[0_4px#991b1b] hover:text-[#991b1b]"
                    }`}
                  onClick={() => setSelectedItem(idx)}
                >
                  {data.slice(0, 1)}
                  {data.slice(1).toLowerCase()}
                </li>
              </Link>
            ))}
        </ul>
        <div className="flex items-center gap-5">
          {/* <div

            className="rounded-full  w-fit  bg-[#f1f1f1] p-1 px-2 relative h-[40px] flex justify-between"
          >
            {['Collection', 'Delivery'].map((item, idx) => {
              return (
                <div className="relative text-xs sm:text-sm md:text-base" key={`tab${idx}`}>
                  <div
                    className={` ${orderType === item ? "flex" : "hidden"
                      }  absolute text-white h-full`}
                  >
                    <span
                      className={` rounded-full h-full w-[4.1rem] sm:w-[7rem]  md:w-[8rem] cursor-pointer  flex flex-col justify-center text-center bg-red-700 z-[10] transition duration-300`}
                    >
                      {item}
                    </span>
                  </div>

                  <span
                    className={` rounded-full h-full w-[4.1rem] sm:w-[7rem]  md:w-[8rem] cursor-pointer  flex flex-col justify-center text-center text-green-700  z-[10] transition duration-300`}
                    onClick={() => {
                      setTabSwitched(true);
                      setTabText(item);
                    }}
                  >
                    {item}
                  </span>
                </div>
              );
            })}
          </div> */}

          {isUserLoggedIn ? (
            <Link href="/profile?tab=1" className="hidden lg:flex items-center gap-2 text-black">
              <CiUser size={25} aria-label="User Profile" />
              <span className="text-base text-red-800 hover:text-red-700 hover:font-bold tracking-wide">
                {userData?.firstName && userData?.lastName ? `${userData?.firstName[0]}.${userData?.lastName}` :
                  userData?.firstName ? userData?.firstName : "No Name"}
              </span>
            </Link>
          ) : isGuestLoggedIn ? (<li className="hidden lg:flex px-2 font-normal hover:bg-white hover:shadow-[0_3px_10px_rgb(0,0,0,0.2)] rounded-md hover:text-red-800 text-white bg-red-800 items-center text-lg">
            <button onClick={handleLogoutAccount}> Guest Account</button>
          </li>) : (
            <li className="hidden lg:flex px-2 font-normal hover:bg-white hover:shadow-[0_3px_10px_rgb(0,0,0,0.2)] rounded-md hover:text-red-800 text-white bg-red-800 items-center text-lg">
              <Link href="/login">Login / Signup</Link>
            </li>
          )}
          <Link href="/order/cart" className="hidden text-black lg:flex items-center text-lg">
            <PiBagLight size={25} aria-label="Cart" />
            <span className="bg-red-800 hover:bg-red-700 text-white rounded-full px-2 mx-2">
              {cart?.length}
            </span>
            <span className="text-red-800 hover:text-red-700 hover:font-bold">£ {totalPrice?.toFixed(2)}</span>
          </Link>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden w-full  md:flex absolute top-full right-0 justify-between">
        <div className="flex gap-2">
          <Link onClick={() => {
            dispatch(
              getCustomizationDetails({
                name: "Create Your Own Pizza",
                img: "https://res.cloudinary.com/dx550y313/image/upload/v1729863237/HotHouse%20after%2025%20OCT/ngo69j5nii68d36x0n0x.png",
                priceSection: pizzaData[0]?.priceSection,
                id: randomId,
                sauceName: [],
                cheeseName: [],
                vegetarianToppingsName: [],
                meatToppingsName: [],
                baseName: pizzaData[0]?.baseName,
                selectedData: pizzaData[0]?.priceSection[0]?.size?._id,
              })
            );
          }
          } href={"/menu/product/customisePizza?calledBy=createYourOwnPizza"}
            className="flex items-center bg-green-800  text-white py-2 px-4 text-base rounded-b-md shadow-[0_3px_10px_rgb(0,0,0,0.2)] hover:bg-white hover:text-green-800"
          >
            <BiSolidPizza size={30} />
            <span className="ml-2">Create Your Own Pizza</span>
          </Link>
          <Link href={"/menu/halfAndHalfPizza?calledBy=half"}
            className="flex items-center bg-red-800  text-white py-2 px-4 text-base rounded-b-md shadow-[0_3px_10px_rgb(0,0,0,0.2)] hover:bg-white hover:text-red-800"
          >
            <BiSolidPizza size={30} />
            <span className="ml-2">Half & Half Pizza</span>
          </Link>
        </div>
        <div className="flex gap-2">
          <a
            href="https://wa.me/+447469367116" target="_blank" rel="noopener noreferrer"
            className="flex items-center bg-green-800  text-white py-2 px-4 text-base rounded-b-md shadow-[0_3px_10px_rgb(0,0,0,0.2)] hover:bg-white hover:text-green-800"
          >
            <SiWhatsapp size={25} />
            <span className="ml-2">Whatsapp</span>
          </a>
          {isUserLoggedIn && <a
            href="/profile?tab=3"
            className="flex items-center bg-red-800  text-white py-2 px-4 text-base rounded-b-md shadow-[0_3px_10px_rgb(0,0,0,0.2)] hover:bg-white hover:text-red-800"
          >
            <RiRefreshFill size={30} />
            <span className="ml-2">Reorder Now</span>
          </a>}
        </div>
      </div>


      {/* Mobile */}
      <div className="md:hidden border-b border-white flex justify-center">
        <Link onClick={() => {
          dispatch(
            getCustomizationDetails({
              name: "Create Your Own Pizza",
              img: "https://res.cloudinary.com/dx550y313/image/upload/v1729863237/HotHouse%20after%2025%20OCT/ngo69j5nii68d36x0n0x.png",
              priceSection: pizzaData[0]?.priceSection,
              id: randomId,
              sauceName: [],
              cheeseName: [],
              vegetarianToppingsName: [],
              meatToppingsName: [],
              baseName: pizzaData[0]?.baseName,
              selectedData: pizzaData[0]?.priceSection[0]?.size?._id,
            })
          );
        }
        } href={"/menu/product/customisePizza?calledBy=createYourOwnPizza"}
          className="w-full border-r border-r-white justify-center inline-flex items-center bg-green-800 text-white py-2  shadow-[0_3px_10px_rgb(0,0,0,0.2)] hover:bg-white hover:text-green-800"
        >

          <span className="text-sm">Create Your Own Pizza</span>
        </Link>
        <Link href={"/menu/halfAndHalfPizza?calledBy=half"}
          className="w-full border-r border-r-white justify-center inline-flex items-center bg-red-800 text-white py-2 shadow-[0_3px_10px_rgb(0,0,0,0.2)] hover:bg-white hover:text-red-800"
        >
          <span className="pl-2 text-sm">Half & Half Pizza</span>
        </Link>
      </div>
      <div className="md:hidden flex justify-center">

        <a
          href="https://wa.me/+447469367116" target="_blank" rel="noopener noreferrer"
          className="w-full border-r border-r-white justify-center inline-flex items-center bg-green-800 text-white py-2 px-4 shadow-[0_3px_10px_rgb(0,0,0,0.2)] hover:bg-white hover:text-red-800"
        >
          <SiWhatsapp size={22} />
          <span className="pl-2 text-sm">Whatsapp</span>
        </a>
        {isUserLoggedIn && <a
          href="/profile?tab=3"
          className="w-full border-r border-r-white justify-center inline-flex items-center bg-red-800 text-white py-2 px-4 shadow-[0_3px_10px_rgb(0,0,0,0.2)] hover:bg-white hover:text-red-800"
        >
          <RiRefreshFill size={25} />
          <span className="pl-2 text-sm">Reorder Now</span>
        </a>}
      </div>

    </div>
  );
};

export default Header;
