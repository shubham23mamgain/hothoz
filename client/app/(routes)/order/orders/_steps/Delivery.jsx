import { getorderDetails, saveMiles } from "@/app/lib/features/orderDetails/orderDetailsslice";
import { getPreviousPath } from "@/app/lib/features/path/pathslice";
import { redirect, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import axios from "axios";
import { debounce } from "lodash";
import { MdModeEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";

const Delivery = ({ step }) => {
    const router = useRouter();
    const [addressData, setAddressData] = useState(null);
    const [alert,setAlert] = useState(null)
    const [miles, setMiles] = useState();
    console.log(miles)
    const { userData,isGuestLoggedIn} = useSelector((state) => state.auth);
    const [dayTimeIntervals, setDayTimeIntervals] = useState([]);
    const dispatch = useDispatch();
    const { previousPath } = useSelector((state) => state.path);

    async function fetchAddress(userId) {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/address/${userId}`)
        setAddressData(response?.data?.data)
    }

    async function handleVerifyMiles(item){
        const responseCoordinates = await axios.get(`https://api.getAddress.io/get/${item?.id}?api-key=${process.env.NEXT_PUBLIC_GET_ADDRESS_API}`)
     

        const responseMiles = await axios.get(`https://distance-calculator.p.rapidapi.com/v1/one_to_one`,
            { params: {
                start_point: `(${responseCoordinates?.data?.latitude},${responseCoordinates?.data?.longitude})`,
                end_point: '(51.5997,-0.409477)',
                unit: 'miles',
                decimal_places: '2'
              },
              headers: {
                'x-rapidapi-key': process.env.NEXT_PUBLIC_RAPID_DISTANCE_API,
                'x-rapidapi-host': 'distance-calculator.p.rapidapi.com',
                'Content-Type': 'application/json'
              }}
        )
        setMiles(responseMiles?.data?.distance)

        if(isGuestLoggedIn){
            if(Number(responseMiles?.data?.distance)<=5.0 ) {
            setSelectedAddress(item.address)
                setPostCodeAddresses([])
                setAlert(null)
                dispatch(saveMiles(Number(responseMiles?.data?.distance)))
            } 
            else{
                toast.error("Sorry ! Out of delivery range")
                setAlert("Orders are accepted within 5 miles only. For longer distances, please contact us.")
              }
            }
        
        else
        { 
            
           if(Number(responseMiles?.data?.distance)<=5.0 ) {
            postAddress(item?.address) 
            setSavedOrSelectedAddress([item.address])
            setAlert(null)
            dispatch(saveMiles(Number(responseMiles?.data?.distance)))
        }
          else{
            toast.error("Sorry ! Out of delivery range")
            setAlert("Orders are accepted within 5 miles only. For longer distances, please contact us.")
          }
    }
    }

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();


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

    const [postCodeAddresses, setPostCodeAddresses] = useState([])
    const [postalCode, setPostalCode] = useState('')
    const [savedOrSelectedAddress, setSavedOrSelectedAddress] = useState([])
    const [selectedAddress, setSelectedAddress] = useState('')
    const [isUpdateAdress, setUpdateAddress] = useState(false)

    const handleSearchDebounce = debounce(async (value) => {
        const addressAPI_KEY = `https://api.getAddress.io/autocomplete/${value}?api-key=${process.env.NEXT_PUBLIC_GET_ADDRESS_API}`
        const response = await axios.get(addressAPI_KEY)

        setPostCodeAddresses(response?.data?.suggestions)
    }, 500);

    const postAddress = async (address) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/address`,
            {
                method: "post",
                body: JSON.stringify({
                    address: address,
                    postCode: postalCode,
                    userId: userData?._id,
                }),
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }
        )
        console.log(response, "response")
        if (response.status) {
            setPostCodeAddresses([])
            fetchAddress(userData?._id)
        }
    }
    const deleteAddress = async (id) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/address/${id}`,
            {
                method: "DELETE",

                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }
        )
        console.log(response, "response")
        if (response.status) {
            toast.success("Deleted")
            setPostCodeAddresses([])
            fetchAddress(userData?._id)
        }
    }

    const onSubmit = async (data) => {
        if (selectedAddress?.address || (selectedAddress && isGuestLoggedIn))
     {   dispatch(
            getorderDetails({
                address: selectedAddress,
                time: data?.daytime,
                orderType: step === 1 ? "collection" : "delivery",
            })
        );
 
        
            dispatch(getPreviousPath("/order/orders"));
            router.push("/order/checkout");}
            else{
                toast.error("Please select the address")
            }

    };

    const handleAddress = async (formData) => {
        const address = formData.get("address")
        const postCode = formData.get("postCode")
        const note = formData.get("note")
        console.log(address, postCode, note)
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/address/${selectedAddress?._id}`,
                {
                    method: "PATCH",
                    body: JSON.stringify({
                        address: address,
                        postCode: selectedAddress?.postCode,
                        userId: userData?._id,
                        note: note
                    }),
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                }
            );
            if (response.status) {
                toast.success("Updated")
                setUpdateAddress(false)
                fetchAddress(userData?._id)
            }


        } catch (error) {
            console.log(error);
        }
        console.log("submitted")
    }

    useEffect(() => {
   
        console.log(selectedAddress, "")
    }, [ selectedAddress])

    useEffect(() => {
        handleSearchDebounce(postalCode)

    }, [postalCode])

    useEffect(() => {
        if(!isGuestLoggedIn)
       { fetchAddress(userData?._id)}
    }, [userData])


    useEffect(() => {
        if (previousPath !== "/order/cart") {
            redirect("/order/cart");
        }
        const intervals = generateDayTimeIntervals();
        setDayTimeIntervals(intervals);
    }, []);


    return (
        <div>

            <div className=" border-t-2 p-2 space-y-6">
                <div className="space-y-2">
                    <label htmlFor="address">Please Enter Your Postal Code</label>{" "}
                    {alert &&   <div className="text-red-800" >{alert} <span className="font-bold">Current Distance: {miles} miles</span></div>}   
                    <div className="relative">
                    <input
    className="border-2 border-gray-300 rounded-md px-4 py-2 outline-none w-full focus:border-red-800"
    type="text"
    name="address"
    id="postalCode"
    placeholder="Enter Your Postal Code"
    value={isGuestLoggedIn ? selectedAddress || postalCode : null } // Display selectedAddress or postalCode
    onFocus={() => {
        setPostalCode(''); // Clear the postal code
        setSelectedAddress(''); // Clear the selected address
    }}
    onChange={(e) => {
        setPostalCode(e.target.value); // Update postalCode
        setSelectedAddress(''); // Clear selectedAddress if the user starts typing
    }}
/>

                        {
                            Array.isArray(postCodeAddresses) && postCodeAddresses.length > 0 && <div className="absolute w-full bg-white top-12 border max-h-[20rem] overflow-y-auto">
                                {
                                    postCodeAddresses?.map(item => {
                                        return <div
                                            onClick={() => {
                                                handleVerifyMiles(item)
                                    
                                            }}
                                            className="px-6 py-2 hover:bg-black/10 cursor-pointer">{item?.address}</div>
                                    })
                                }
                            </div>
                        }
                    </div>
                    {
                        isUpdateAdress && !isGuestLoggedIn ?
                         <form action={handleAddress} className="w-full mx-auto p-4 space-y-6 bg-white shadow-lg rounded-lg">
  <div>
                                <label className="block text-sm font-medium text-gray-700">Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    defaultValue={selectedAddress?.address}
                                    placeholder="Enter address"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Postcode</label>
                                <input
                                    type="text"
                                    placeholder="Enter postcode"
                                    name="postCode"
                                    defaultValue={selectedAddress?.postCode}
                                    value={selectedAddress?.postCode}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    disabled
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Note</label>
                                <textarea
                                    placeholder="Enter your note"
                                    name="note"
                                    defaultValue={selectedAddress?.note}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                ></textarea>
                            </div>

                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    onClick={() => { setUpdateAddress(false) }}
                                    className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                         :
                         isGuestLoggedIn ? <></> :
                           Array.isArray(addressData) && addressData.length > 0 && <div className="space-y-3">
                            <h1 className="">And Select From The List :</h1>
                            {
                                addressData?.map((item, index) => {
                                    return <div onClick={() => { setSelectedAddress(item) }} className={`border p-4 rounded-md ${selectedAddress?._id === item?._id ? '  border-none bg-green-400/30' : "bg-transparent"} cursor-pointer flex justify-between items-center`}>{item?.address}
                                        <div className="flex gap-2 justify-start items-center"><MdModeEdit size={24} onClick={() => {
                                            setUpdateAddress(true)
                                        }} className="text-green-700 hover:text-green-800" />
                                        <MdDelete onClick={() => {
                                            deleteAddress(item?._id)
                                        }} size={24} className="text-red-600 hover:text-red-700" /></div>
                                    </div>
                                })
                            }
                        </div>
                    }



                    {errors.address && <p className="text-red-500">Please fill the address</p>}
                </div>

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

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="bg-red-800 p-6 rounded-md text-white">
                        <h2 className="font-bold text-lg mb-4">
                            ORDERING INFORMATION:
                        </h2>
                        <p className="mb-4">
                            <strong>Please note:</strong>{" "}
                            <a href="#" className="underline">
                                Orders take a minimum of 45 minutes
                            </a>{" "}
                            to deliver. Whilst we endeavour to get your order to you on
                            time, there may be delays during busier periods.
                        </p>
                        <p className="mb-4">
                            If you have any issues with your order or
                            experience, in the first instance please contact the
                            store you ordered from directly.
                        </p>
                        <p className="mb-2">Your order is being placed with:</p>
                        <p className="font-bold">91 Joel St, Pinner, Northwood HA6 1LW, UK
                            <br />
                            Hothousenorthwood@gmail.com</p>
                        <p className="flex items-center mt-2">
                            <PhoneIcon className="mr-2" />
                            01923510520
                        </p>
                    </div>
                    <button
                        className=" mt-5 bg-green-700 hover:bg-green-600  py-2 w-full text-white rounded"
                        type="submit"
                    >
                        Proceed To Checkout
                    </button>
                </form>
            </div>{" "}
        </div>
    )
}

export default Delivery

function PhoneIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
    );
}