// ----------------------------------------------Imports-----------------------------------------
import { MdOutlineDiscount, MdSpaceDashboard } from "react-icons/md";
import { BiDish } from "react-icons/bi";
import { FaPizzaSlice } from "react-icons/fa6";
import SearchIcon from "@mui/icons-material/Search";
import DarkModeSwitcher from "../Header/DarkModeSwitcher/DarkModeSwitcher";
import { useRef, useState } from "react";
import DropDown from "./DropDown/DropDown";
import { GiPizzaCutter } from "react-icons/gi";
import { RiDrinksFill } from "react-icons/ri";
import { TbBowlFilled } from "react-icons/tb";
import { LuCakeSlice } from "react-icons/lu";
import { MdOutlinePayment } from "react-icons/md";
import { Link } from "react-router-dom";
import logo from "/logo.png"
import { BsFillPeopleFill } from "react-icons/bs";
import { FaImages } from "react-icons/fa";
// -----------------------------------------------------------------------------------------------

export default function Sidebar({ isSideNavOpen, setIsSideNavOpen }) {
  const sideBarItems = [

    {
      label: "Orders",
      path: "/",
      icon: <MdOutlinePayment size={28} />,
      isDropDown: false,
    },
    {
      label: "Pizza Customization",
      path: "/food-customization",
      icon: <GiPizzaCutter size={28} />,
      isDropDown: false,
    },
    {
      label: "Deals Customization",
      path: "/deal",
      icon: <MdOutlineDiscount size={28}/>,
      isDropDown: false,
    },
    {
      label: "Pizzas",
      icon: <FaPizzaSlice size={28} />,
      isDropDown: true,
      subItems: [
        { title: "Pizzas", path: "/pizza" },
        { title: "Pizza Category", path: "/pizzaCategory" },
        { title: "Pizza Filter", path: "/pizzaFilter" },
        // { title: "Create Pizza", path: "/create-pizza" },
      ], // food-items -> table || food-items/create-food-item
    },
  
    {
      label: "Sides",
      icon: <BiDish size={28} />,
      isDropDown: true,
      subItems: [
        { title: "Sides", path: "/sides" },
        { title: "Sides Category", path: "/sidesCategory" },
        { title: "Sides Filter", path: "/sidesFilter" },
      ],
    },
    {
      label: "Desserts",
      icon: <LuCakeSlice size={28} />,
      isDropDown: true,
      subItems: [
        { title: "Dessert", path: "/dessert" },
        { title: "Dessert Category", path: "/dessertCategory" },
        { title: "Dessert Filter", path: "/dessertFilter" },
      ],
    },
    {
      label: "Drinks",
      path: "/drink",
      icon: <RiDrinksFill size={28} />,
      isDropDown: false,
    },
    {
      label: "Dips",
      path: "/dip",
      icon: <TbBowlFilled size={28} />,
      isDropDown: false,
    },
    {
      label: "Users",
      path: "/user",
      icon: <BsFillPeopleFill size={28} />,
      isDropDown: false,
    },
    {
      label: "Banner",
      icon: <FaImages size={28} />,
      isDropDown: false,
      path:"/banner"
    },

  ];

  return (
    <>

      {/*  <!-- Side Navigation --> */}

      <div className="flex  h-screen fixed">
        <aside
          id="nav-menu-4"
          aria-label="Side navigation"
          className={` top-0 bottom-0 left-0 lg:static  z-500 flex w-screen sm:w-72 flex-col  font-medium bg-red-800 transition-transform lg:translate-x-0 ${isSideNavOpen ? "translate-x-0 " : " -translate-x-full"
            }`}
        >
          <div className="hidden md:block items-center border-b   ">
            <div className="min-h-[32px] h-[10vh] w-full min-w-0 flex flex-col  justify-center items-center gap-0 ">
              <img className="h-16 rounded-xl " src={logo} />
            </div>
          </div>

          <nav
            aria-label="side navigation"
            className="flex-1 "
          >
            <div>
              <ul className="flex  border-b-4  md:border-y-4 border-white flex-1 flex-col gap-1 py-3"
              
            style={{ height: "80vh", overflowY: "auto" ,   scrollbarWidth: "none",
              msOverflowStyle: "none" }}>
          
                {sideBarItems?.map((item, index) => {
                  return item.isDropDown ? (
                    <DropDown sideBarOption={item} setIsSideNavOpen={setIsSideNavOpen} />
                  ) : (
                    <li className="px-3 cursor-pointer" key={index}>
                      <Link
                         onClick={() => setIsSideNavOpen(false)}
                        to={item?.path}
                        className="flex items-center gap-3 rounded p-3  transition-colors hover:bg-red-700 hover:font-bold focus:text-black  text-white focus:font-bold  aria-[current=page]:bg-emerald-50 aria-[current=page]:text-emerald-500 "
                      >
                        <div className="flex items-center self-center">
                          {item?.icon}
                        </div>
                        <div className="flex    w-full flex-1 flex-col  items-start justify-center gap-0 overflow-hidden truncate text-sm">
                          {item?.label}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div>
              <ul className="flex flex-1 flex-col gap-1 py-3">
                <li className="px-3 ">
                  <a
                    href="#"
                    className="flex items-center gap-3 rounded p-3 text-white transition-colors  "
                  >
                    <div className="flex items-center self-center ">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="h-6 w-6"
                        aria-label="Dashboard icon"
                        role="graphics-symbol"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.25 9l-3 3m0 0l3 3m-3-3h7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <button
                      type="button"
                      className="flex w-full hover:text-base  flex-1 flex-col items-start justify-center gap-0 overflow-hidden truncate text-sm font-medium"
                      onClick={() => {
                        localStorage.clear()
                        window.location.href = '/'
                      }}
                    >
                      Logout
                    </button>
                  </a>
                </li>
              </ul>
            </div>
          </nav>

        </aside>
      </div>


    </>
  );
}
