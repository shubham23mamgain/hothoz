"use client";

import { getorderDetails } from "@/app/lib/features/orderDetails/orderDetailsslice";
import { PhoneIcon } from "lucide-react";
import {  useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

const Collections = ({ step }) => {
    const router = useRouter();
    const dispatch = useDispatch()
    const [dayTimeIntervals, setDayTimeIntervals] = useState([]);
    const cart = useSelector((state) => state.cart.cartData);
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
      const selectedDayTime = data.daytime; // This will be in the format "Day - HH:MM"
      const [selectedDay, selectedTime] = selectedDayTime.split("-");
      const validDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
      const validStartTime = "11:00";
      const validEndTime = "17:00";

      const isDayValid = validDays.includes(selectedDay);

      const isTimeValid = selectedTime >= validStartTime && selectedTime <= validEndTime;

      if (cart.some((item)=> item?.isByOneGetPizza === true ) &&  isDayValid && isTimeValid ){
        dispatch(
          getorderDetails({
              time: data?.daytime,
              orderType: step === 1 ? "collection" : "delivery",
          })
      );
      router.push("/order/checkout")
      }
      else if (cart.every((item) => item?.isByOneGetPizza === false || item?.isByOneGetPizza == null)){
        dispatch(
          getorderDetails({
              time: data?.daytime,
              orderType: step === 1 ? "collection" : "delivery",
          })
      );
      router.push("/order/checkout")
      }
      else{
        toast.error("The Buy-One-Get-One deal is valid from Sunday to Thursday, between 11 a.m. and 5 p.m.",{
          duration:3000
        })
      }
      console.log(data?.daytime)


    };
    useEffect(() => {
        const intervals = generateDayTimeIntervals();
        setDayTimeIntervals(intervals);
      }, []);

    const generateDayTimeIntervals = () => {
        const intervals = [];
        const currentTime = new Date();
        const daysOfWeek = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
      
        const addIntervalsForDay = (date) => {
          const day = daysOfWeek[date.getDay()];
          const start = new Date(date);
          start.setHours(11, 0, 0, 0); // Set start time to 11 AM
          const end = new Date(date);
          end.setHours(23, 0, 0, 0); // Set end time to 11 PM
      
          while (start <= end) {
            if (start > currentTime) {
              intervals.push({
                day: day,
                time: start.toTimeString().slice(0, 5),
              });
            }
            start.setMinutes(start.getMinutes() + 15); // Increment by 15 minutes
          }
        };
      
        for (let i = 0; i < 3; i++) { // Loop for today and the next two days
          const date = new Date();
          date.setDate(currentTime.getDate() + i);
          addIntervalsForDay(date);
        }
      
        return intervals;
      };
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="border-t-2 p-2 space-y-6">
                       <div className="space-y-2">
  <h1>Please Select Time & Day</h1>
  <select
    {...register("daytime", { required: true })}
    id="day"
    defaultValue=""
    className="px-4 py-2 border-2 w-full border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
  >
    <option value="" disabled>Select Time & Day</option>
    {dayTimeIntervals.map((interval, index) => (
      <option key={index} value={`${interval.day}-${interval.time}`}>
        {interval.day} - {interval.time}
      </option>
    ))}
  </select>
  {errors.daytime && <span className="text-red-500">Please select the time & day</span>}
</div>

            <div className="bg-red-800 p-6 rounded-md text-white">
                <h2 className="font-bold text-lg mb-4">ORDERING INFORMATION:</h2>
                <p className="mb-4">
                    <strong>Please note:</strong>{" "}
                    <a href="#" className="underline">
                        Orders take a minimum of 45 minutes
                    </a>{" "}
                    to deliver. Whilst we endeavour to get your order to you on
                    time, there may be delays during busier periods.
                </p>
                <p className="mb-4">
                    If you have any issues with your order or experience,
                    in the first instance please contact the store you ordered
                    from directly.
                </p>
                <p className="mb-2">Your order is being placed with:</p>
                <p className="font-bold">91 Joel St, Pinner, Northwood HA6 1LW, UK
<br/>
Hothousenorthwood@gmail.com</p>
                <p className="flex items-center mt-2">
                  <PhoneIcon className="mr-2" />
                  01923510520
                </p>
            </div>
            <button
                className="bg-green-700 hover:bg-green-600  py-2 w-full text-white rounded"
                type="submit"
            >
                Proceed To Checkout
            </button>
        </form>
    )
}

export default Collections