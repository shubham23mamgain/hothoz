"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { ClipLoader } from "react-spinners";
import { toast } from "sonner";
import { successRedirectStatus, trackerStatus } from "@/app/lib/features/orderDetails/orderDetailsslice";
import OrderType from "@/app/_components/Modals/OrderType";


const page = () => {
  const [showViewModal, setShowViewModal] = useState(false)

  const handleViewModal = () => {
    setShowViewModal(true)
  }
  const dispatch = useDispatch();
  const router = useRouter();
  const cart = useSelector((state) => state.cart.cartData);
  const order = useSelector((state) => state.orderDetails?.order);
  const { miles } = useSelector((state) => state.orderDetails);
  const { userData, isGuestLoggedIn, isUserLoggedIn } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false)
  const [codData, setCodData] = useState();
  const [deliveryCharge, setDeliveryCharge] = useState(0.5);

  const [useDifferentAddress, setUseDifferentAddress] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  let discount = 0
  if (order?.orderType === 'collection') {
    discount = cart?.reduce((acc, item) => {
      const calDiscount = Number(item?.discount) || 0;
      return acc + calDiscount;
    }, 0);
  }


  const totalPrice = cart?.reduce((acc, item) => {
    return acc + Number(item?.totalSum);
  }, 0);

  const onSubmit = async (data) => {
    dispatch(trackerStatus(true))
    const newData = {
      orderType: order?.orderType,
      email: userData?.email || null,
      orderBy: userData?._id || null,
      time: order?.time,
      address: order?.orderType === 'collection' || !isUserLoggedIn ? null : order?.address,
      comment: data?.comment || null,
      totalAmount: {
        total: totalPrice?.toFixed(2),
        deliveryCharge: order.orderType === 'collection' ? 0 : deliveryCharge,
        discountPrice: discount || 0
      },
      mobileNumber: userData?.mobileNumber || data?.mobileNumber,
      paymentMethode: data?.paymentMethode,
      items: cart,
      terms: data?.terms,
      name: userData?.firstName || null,
      guestMetaData: isGuestLoggedIn ? { name: data?.name, email: data?.email, mobile: data?.mobile, address: order?.address } : null

    };

    if (data?.paymentMethode === "Cash on delivery") {
      try {
        setIsLoading(true)
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/order`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newData),
          }
        );
        const responsejson = await response.json();
        setCodData(responsejson);
        if (responsejson?.status === true) {
          router.push("/order/tracker");
        }
        else {
          toast.error("Something Wrong Happened")
        }
        setIsLoading(false)
      } catch (error) {
        setIsLoading(false)
        console.log(error);
      }
    }
    else {
      setIsLoading(true)

      try {

        let onlinePrice

        if (order?.orderType === 'collection') {
          onlinePrice = (Number(totalPrice) + 0 - Number(discount || 0)).toFixed(2)
        } else { onlinePrice = (Number(totalPrice?.toFixed(2)) + Number(deliveryCharge)) - Number(discount || 0) }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/order/create-viva-order`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            newData: newData,
            amount: onlinePrice * 100,
            customer: {
              email: isGuestLoggedIn ? data?.email : userData?.email,
              fullName: isGuestLoggedIn ? data?.name : `${userData?.firstName} ${userData?.lastName}`,
              phone: isGuestLoggedIn ? data?.mobile : userData?.mobileNumber,
            }
          }),
        });

        const vivaResponse = await response.json();

        // Check if the response is not okay (e.g., 4xx or 5xx status codes)
        if (!response.ok) {
          throw new Error(vivaResponse.message || 'Something went wrong while creating the Viva order');
        }
        const orderCode = vivaResponse.orderCode
        dispatch(successRedirectStatus(orderCode))

        const checkoutUrl = `https://www.vivapayments.com/web/checkout?ref=${orderCode}`;

        setIsLoading(false)

        // const checkoutUrl = `https://demo.vivapayments.com/web/checkout?ref=${orderCode}`;

        // Redirect to Viva Payments checkout page
        window.location.href = checkoutUrl;





      } catch (error) {
        dispatch(successRedirectStatus(null))
        setIsLoading(false)
        toast.error("Error opening the payment checkout page", { position: "top-center" });
      }
    }


  }





  const [mount, setMount] = useState(false)
  useEffect(() => {
    setMount(true)
    if (mount && cart?.length < 1) {
      router.push("/");
    }

  }, [cart])

  useEffect(() => {
    dispatch(trackerStatus(false))
    setIsLoading(false)
  }, [])

  useEffect(() => {
    const isDealIncluded = cart.some((item) => item.collectionOnlyDeal === false || item.collectionOnlyDeal === true)
    // console.log(isDealIncluded)
    if (totalPrice > 20 && !isDealIncluded && miles <= 3) {
      setDeliveryCharge(0)
    }
    else if ((totalPrice < 20 && totalPrice >= 10) || (isDealIncluded && miles <= 3)) {
      setDeliveryCharge(2.99)
    }
    else {
      setDeliveryCharge(3.99)
    }

  }, [totalPrice])


  return (
    <>
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">


              {isGuestLoggedIn &&
                <div>
                  <h3 className="text-lg font-bold ">PERSONAL DETAILS</h3>
                  <div className="flex gap-3 w-full">
                    <div className="w-full"><input
                      {...register("name", { required: isGuestLoggedIn ? true : false })}
                      name="name"
                      className="w-full border p-2 rounded-md"
                      placeholder="Enter name here"
                    /> {errors.name && <p className="text-red-500">Name is required.</p>}
                    </div>
                    <div className="w-full">
                      <input
                        {...register("mobile", { required: isGuestLoggedIn ? true : false })}
                        name="mobile"
                        className="w-full border p-2 rounded-md"
                        placeholder="Enter mobile number here"
                      />{errors.mobile && <p className="text-red-500">Mobile number is required.</p>}
                    </div></div>

                  <input
                    {...register("email", { required: isGuestLoggedIn ? true : false })}
                    name="email"
                    className="w-full border p-2 mt-2 rounded-md"
                    placeholder="Enter email address here"
                  />
                  {errors.email && <p className="text-red-500">Email address is required.</p>}
                </div>}
              {isUserLoggedIn && <div>  <h3 className="text-lg font-bold ">CONTACT NUMBER</h3>
                <div className="w-full">
                  <input
                    {...register("mobileNumber", { required: true })}
                    name="mobileNumber"
                    defaultValue={userData?.mobileNumber}
                    className="w-full border p-2 rounded-md"
                    placeholder="Enter mobile number here"
                  />{errors.mobileNumber && <p className="text-red-500">Mobile number is required.</p>}
                </div>
              </div>}

              {/* <div className="border p-4 rounded-md bg-white shadow-md w-full max-w-lg">
      <h2 className="text-lg font-semibold text-gray-800">Billing Address</h2> */}

              {/* Radio Options */}
              {/* <div className="mt-3">
        <label className="flex items-center p-3 border rounded-md cursor-pointer">
          <input
            type="radio"
            name="billing"
            value="same"
            checked={!useDifferentAddress}
            onChange={() => setUseDifferentAddress(false)}
            className="mr-2"
          />
          <span className="text-gray-700">Same as shipping address</span>
        </label>

        <label className="flex items-center p-3 border rounded-md cursor-pointer mt-2">
          <input
            type="radio"
            name="billing"
            value="different"
            checked={useDifferentAddress}
            onChange={() => setUseDifferentAddress(true)}
            className="mr-2"
          />
          <span className="text-gray-700">Use a different billing address</span>
        </label>
      </div> */}

              {/* Billing Address Form (Shown only if "Use a different billing address" is selected) */}
              {/* {useDifferentAddress && (
        <div className="mt-4 border rounded-md p-4 bg-gray-50">
          <label className="block text-sm font-medium text-gray-700">Country/Region</label>
          <select className="w-full p-2 border rounded mt-1">
            <option>India</option>
            <option>USA</option>
            <option>UK</option>
          </select>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <input type="text" placeholder="First name" className="p-2 border rounded w-full" />
            <input type="text" placeholder="Last name" className="p-2 border rounded w-full" />
          </div>

          <input type="text" placeholder="Company (optional)" className="p-2 border rounded w-full mt-3" />
          <input type="text" placeholder="Address" className="p-2 border rounded w-full mt-3" />
          <input type="text" placeholder="Apartment, suite, etc. (optional)" className="p-2 border rounded w-full mt-3" />

          <div className="grid grid-cols-3 gap-2 mt-3">
            <input type="text" placeholder="City" className="p-2 border rounded w-full" />
            <select className="p-2 border rounded w-full">
              <option>Uttarakhand</option>
              <option>Delhi</option>
              <option>Maharashtra</option>
            </select>
            <input type="text" placeholder="PIN code" className="p-2 border rounded w-full" />
          </div>

          <input type="text" placeholder="Phone (optional)" className="p-2 border rounded w-full mt-3" />
        </div>
      )} */}
              {/* </div> */}

              {order?.orderType === 'delivery' && <div>
                <h3 className="text-lg font-bold">YOUR ADDRESS :</h3>
                <p>
                  {isGuestLoggedIn ? order?.address : order?.address?.address}


                </p>
              </div>
              }

              <div>
                <h3 className="text-lg font-bold">ANY COMMENTS</h3>
                <textarea
                  {...register("comment")}
                  name="comment"
                  className="w-full border p-2 rounded-md"
                  placeholder="Leave comments for your order here"
                />
              </div>

              <div>
                <h3 className="text-lg font-bold">ORDER TIME & TYPE</h3>
                <p className=""> Order Type : {order?.orderType === 'collection' ? <span className="font-semibold text-red-800">Collection</span> : <span className="font-semibold text-green-800">Delivery</span>}
                  {/* <span onClick={handleViewModal} className="cursor-pointer rounded-md px-1 bg-red-800 text-white  hover:bg-red-700">Change Now</span> */}
                </p>
                <p>
                  Your order is to be placed for {order?.time} ( Please note
                  delivery time is around 45 minutes )
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold">CHOOSE PAYMENT</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="cash"
                    value="Cash on delivery"
                    name="paymentMethode"
                    {...register("paymentMethode")}
                    defaultChecked
                  />
                  <label htmlFor="cash">{order?.orderType === 'collection' ? "Pay on collection" : "Pay on delivery"}</label>
                  <input
                    {...register("paymentMethode")}
                    name="paymentMethode"
                    type="radio"
                    id="card"
                    value="Online Payment"

                  />
                  <label htmlFor="card">Pay Now</label>

                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input   {...register("terms", { required: true })} type="checkbox" id="terms" />
                <label htmlFor="terms" className="text-[15px]">
                  I accept the Terms & Conditions and Privacy Policy
                </label>
              </div>
              {errors.terms && <p className="text-red-500">Please accept the terms & conditions.</p>}
              <div className="flex space-x-4">
                <button
                  type="button"
                  className="px-4 py-2 border rounded-md"
                  onClick={() => router.push("/order/cart")}
                >
                  Edit Order
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-700 hover:bg-green-600  text-white rounded-md flex items-center justify-center"
                >
                  {isLoading ? <ClipLoader color="white" size={22} /> : "Order"}
                </button>
              </div>
            </div>
            <div className="space-y-4">

              <div className="border p-4 rounded-md">
                <div className="">
                  {Array.isArray(cart) &&
                    cart?.length > 0 &&
                    cart?.map((data, idx) => {
                      const size = String(data?.size).includes("-")
                      const price = String(data?.size).includes("-")
                        ? data?.size?.split("-")
                        : data?.size;

                      const allToppings = data?.allToppings || { cheese: [], sauce: [], veg: [], meat: [] };
                      const mergedToppings = [
                        ...allToppings.cheese.map(item => item.cheeseName),
                        ...allToppings.sauce.map(item => item.sauceName),
                        ...allToppings.veg.map(item => item.vegName),
                        ...allToppings.meat.map(item => item.meatName)
                      ].join(', ');

                      return (
                        <div className="p-4 border-b grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                          <div className="flex items-center space-x-4 md:col-span-2">

                            <img src={data?.img} className="h-16 w-14 rounded-md" />

                            <p className="font-semibold">
                              {data?.name}
                              {" "}
                              {size ? `(${price[0]})` : (data?.dealsData ? `(${data?.size})` : data?.allToppings?.size?.name ? `(${data?.allToppings?.size?.name})` : "")}
                              {data?.allToppings && <>{" "}<span className="text-sm bg-red-800 text-white rounded-md px-2"> Customized </span></>}
                              <br />
                              {/* <p className="hidden md:block text-green-800">{mergedToppings}</p> */}
                              {data?.dealsData && (<div className="text-sm text-gray-600"> {data?.dealsData?.map((item, idx) =>
                                item?.label).join(", ")} </div>)
                              }
                            </p>
                          </div>
                          <div className="font-semibold md:col-span-3">
                            <div> <p className="text-sm text-green-800 pb-2">{mergedToppings}</p> </div>
                            <div className="flex justify-between">
                              <div className=" text-right  md:text-left">
                                {order?.orderType === 'collection' && data?.discount ? <>£ {(data?.price - data?.discount).toFixed(2)}
                                  <span className="ps-2 line-through text-sm text-slate-600">{data?.price}</span></> : `£ ${data?.price}`}

                                <span className="text-sm"> x {data?.quantity}</span>
                              </div>
                              {order?.orderType === 'collection' && data?.discount && <div className="text-green-800">20% Discount on Collection</div>}

                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold">GOT A VOUCHER?</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Just enter it here"
                    className="border p-2 rounded-md flex-1"
                  />

                </div>
              </div>
              <div className="space-y-1">
                <p>Total: £ {totalPrice?.toFixed(2)}</p>
                {order?.orderType === 'collection' ? <p>Discount: £ {discount}</p> : <p>Discount: £ 0</p>}
                {order?.orderType === 'collection' ? <p>Delivery Charge: £ 0  (No charges for collection)</p> : <p>Delivery charge: £ {deliveryCharge}</p>}
                <p className="font-bold">
                  You pay: £ {order?.orderType === 'collection' ? (Number(totalPrice) + 0 - discount).toFixed(2) : (Number(totalPrice) + deliveryCharge - 0).toFixed(2)}
                </p>
              </div>
            </div>

          </div>
        </form>
      </div>
      {showViewModal && (
        <OrderType setModal={setShowViewModal} />
      )}
    </>
  );
};

export default page;
