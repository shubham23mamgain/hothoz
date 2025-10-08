import order from "../models/order.js";
import { asyncErrorHandler } from "../utils/errors/asyncErrorHandler.js";
import { CustomError } from "../utils/errors/customError.js";
import { sendOrderMail } from "../utils/sendOrderMail.js";


export const newOrder = asyncErrorHandler(async (req, res, next) => {
const { paymentMethode, time,items, totalAmount,orderType,guestMetaData,mobileNumber,comment } = req?.body;
let address = req?.body?.address;
if(address){
  address = req?.body?.address?.address
}

let name = ""
let email= ""
if(req?.body?.name){
name = req?.body?.name
}
else{
  name= guestMetaData?.name
}
if(req?.body?.email){
  email = req?.body?.email
  }
  else{
    email= guestMetaData?.email
  }
const amount= (Number(totalAmount?.total) + Number(totalAmount?.deliveryCharge) - Number(totalAmount?.discountPrice || 0)).toFixed(2)

  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0'); // Ensure it's 2 digits
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensure it's 2 digits
  const datePart = day + month; // e.g., "1607" for July 16

  // Get the total number of documents in the collection
  const countDocuments = await order.countDocuments();

  // Increment the count and get the last two digits, padded with zeros if necessary
  const incrementedCount = (countDocuments + 1).toString().padStart(2, '0').slice(-2); // Always take the last two digits

  // Generate the final order number
  const orderNumber = `${datePart}${incrementedCount}`;
 
   // Add the order number to the new order object
   const newOrder = new order({ ...req?.body, orderNumber });

  await newOrder.save();

  // mail API

let paymentMode = ""
if(paymentMethode==="Cash on delivery" && orderType==="collection"){
paymentMode= "Pay on Collection"
}
else if(paymentMethode==="Cash on delivery" && orderType==="delivery"){
  paymentMode= "Pay on Delivery"
}
else{
  paymentMode= paymentMethode
}
  
try {
  await sendOrderMail(email, orderNumber, amount, time, paymentMode, orderType, items, name,mobileNumber,comment,address );
} catch (error) {
  console.error("Error sending email: ", error.message); // Log the error
  // You can choose to handle the error here (e.g., notify admin, log to an error monitoring service, etc.)
}

  res
    .status(201)
    .json({ status: true, message: "New Order created successfully",data:newOrder });
});

export const getAllOrders = asyncErrorHandler(async (req, res, next) => {

     // pagination
     const page = req.query.page * 1 || 1;
     const limit = req.query.limit * 1 || 0;
 
     // page 1 : 1-12; page 2 : 13-24; page 3 : 25-36
     const skip = (page - 1) * limit;

      const dataCount = await order.countDocuments();
       
  const data = await order.find({ $or: [
    { paymentStatus: true },
    { paymentMethode: "Cash on delivery" }
  ]}).sort({createdAt:-1}).skip(skip)
  .limit(limit).populate("orderBy");
  
  res.status(200).json({ status: true, message: "All Orders Found successfully", data:{data,totalPages: Math.ceil(dataCount / limit)}  });
});

export const getMonthlyData = asyncErrorHandler(async (req, res, next) => {
const {year,month}= req?.query

  const startDate = new Date(year, month-1 , 2); // First day of the month
  const endDate = new Date(year, month , 2);       // First day of next month

  const data = await order.find({
    $and: [
      { createdAt: { $gte: startDate, $lt: endDate } }, // Filter by date range
      { $or: [ { paymentStatus: true }, { paymentMethode: "Cash on delivery" } ] }
    ]
  }).sort({createdAt:1}).populate("orderBy");
  
  res.status(200).json({ status: true, message: "All Monthly Orders Found successfully",data  });
})

export const deleteFailedPayment= asyncErrorHandler(async (req, res, next) => {
   // Calculate the timestamp for 1 day ago
   const oneDayAgo = new Date();
   oneDayAgo.setDate(oneDayAgo.getDate() - 1);
 
   // Delete orders with paymentStatus: false and createdAt older than 1 day
   await order.deleteMany({
     paymentStatus: false,
     createdAt: { $lt: oneDayAgo },
   });
  res.status(200).json({ status: true, message: "Delete Failed Order Successfully" });
})

export const getParticularUserOrders = asyncErrorHandler(
  async (req, res, next) => {
    const { userId } = req?.params;
    const data = await order.find({ 
      orderBy: userId,
      $or: [
        { paymentStatus: true },
        { paymentMethode: "Cash on delivery" }
      ] }).sort({createdAt:-1});
    if (!data) {
      return res.status(400).json({ status: false, message: "No Order History" });
    }
    res
      .status(200)
      .json({ status: true, message: "User Orders Found successfully", data });
  }
);

export const updateCompleteOrder = asyncErrorHandler(async (req, res, next) => {
  const {id}= req?.params
  const {isCompleted}= req?.body
    const data = await order.findByIdAndUpdate(id,{orderStatus:isCompleted});
    if(!data){
      return next( new errorResponse("Id is not valid to complete the order",400))
    }
    res.status(200).json({
      status: true,
      message:"Order completed successfully!" ,
    });
  });

  export const onlineOrder = asyncErrorHandler(async (req, res, next) => {

    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0'); // Ensure it's 2 digits
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensure it's 2 digits
    const datePart = day + month; // e.g., "1607" for July 16
  
    // Get the total number of documents in the collection
    const countDocuments = await order.countDocuments();
  
    // Increment the count and get the last two digits, padded with zeros if necessary
    const incrementedCount = (countDocuments + 1).toString().padStart(2, '0').slice(-2); // Always take the last two digits
  
    // Generate the final order number
    const orderNumber = `${datePart}${incrementedCount}`;

    const {amount,customer,newData} = req.body
    console.log(req?.body,"ONLINE ORDER NOT PAYMENT SUCCESSFUL!!!!")

    const generateToken = await fetch("https://accounts.vivapayments.com/connect/token", {
    // const generateToken = await fetch("https://demo-accounts.vivapayments.com/connect/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.VIVA_SMARTCHECKOUT_CLIENT_ID,  
        client_secret: process.env.VIVA_SMARTCHECKOUT_SECRET_KEY, 
        // client_id: 'wc37z4tch73nk3amxt162fy8nxa0301wndrxs680ach73.apps.vivapayments.com',  
        // client_secret: 'tyd8a7GJZFQ5Zsb8s3QTJ8X087POaW', 
        scope: 'urn:viva:payments:core:api:redirectcheckout', 
      }),
    });

    const response = await generateToken.json();

    if (!generateToken.ok) {
      return next(new CustomError(response, 400));
    }

    const responseOrder = await fetch("https://api.vivapayments.com/checkout/v2/orders", {
    // const responseOrder = await fetch("https://demo-api.vivapayments.com/checkout/v2/orders", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
    'Authorization': `Bearer ${response.access_token}`
      },

      body: JSON.stringify({
        "amount": amount,
        "customer" : {
          email : customer.email,
          fullName : customer.fullName,
          phone: customer.phone,
        },
        // "sourceCode": "2691",
      
      }),
    });

    const finalResult= await responseOrder.json()

    if (!responseOrder.ok) {
      return next(new CustomError(finalResult, 400));
    }

    await order.create({...newData,
      orderNumber:orderNumber,
      paymentStatus:false,
      orderCode:finalResult.orderCode
    })

     res.status(200).json(finalResult);
     
  })

  export const transactionCreatedWebHook = asyncErrorHandler( async(req,res,next)=>{
    
    const Username = process.env.VIVA_MERCHANT_ID;  
const Password = process.env.VIVA_API_KEY; 
//     const Username = 'ebc52109-c09b-4c9f-a96d-415bafb43aa9';  // Replace with your merchant ID
// const Password = 'GlmfBP'; 

    const generateToken = await fetch("https://www.vivapayments.com/api/messages/config/token",{
    // const generateToken = await fetch("https://demo.vivapayments.com/api/messages/config/token",{
      method:"GET",
      headers:{
             'Content-Type': 'application/json',
    'Authorization': `Basic ${btoa(`${Username}:${Password}`)}`
      },
    })

    const response = await generateToken.json();

    if (!generateToken.ok) {
      return next(new CustomError(response, 400));
    }

    res.status(200).json(response)

  })


  export const webhookResponse = asyncErrorHandler(async (req, res, next) => {
    const data = req.body;
  
    // Validate incoming data
    if (!data || !data.EventData) {
      return res.status(400).json({ message: "Error: Missing data or EventData" });
    }
  
    const transactionId = data.EventData.TransactionId;
    console.log(transactionId);
  
    const generateToken = await fetch("https://accounts.vivapayments.com/connect/token", {
      // const generateToken = await fetch("https://demo-accounts.vivapayments.com/connect/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: process.env.VIVA_SMARTCHECKOUT_CLIENT_ID,  
          client_secret: process.env.VIVA_SMARTCHECKOUT_SECRET_KEY, 
          // client_id: 'wc37z4tch73nk3amxt162fy8nxa0301wndrxs680ach73.apps.vivapayments.com',  
          // client_secret: 'tyd8a7GJZFQ5Zsb8s3QTJ8X087POaW', 
          scope: 'urn:viva:payments:core:api:redirectcheckout', 
        }),
      });
  
      const response = await generateToken.json();
  
      if (!generateToken.ok) {
        return next(new CustomError(response, 400));
      }
  
    const accessToken = response.access_token; // Extract the OAuth2 access token
  
    // Step 2: Use the access token to call the transaction API
    // const transactionResponse = await fetch(`https://demo-api.vivapayments.com/checkout/v2/transactions/${transactionId}`, {
    const transactionResponse = await fetch(`https://api.vivapayments.com/checkout/v2/transactions/${transactionId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      }
    });
  
    const transactionData = await transactionResponse.json();
  
    if (!transactionResponse.ok) {
      return next(new CustomError(transactionData, 400));
    }
  
    console.log(transactionData,"TRANSACTION DATA WEBHOOK"); // Log the transaction data for debugging

    if (transactionData?.statusId === "F") {
      const data = await order.findOneAndUpdate(
        { orderCode: transactionData.orderCode },       // Filter to match the document
        { $set: { paymentStatus: true } },              // Update operation
        { returnDocument: "after" }                     // Returns the updated document
      ).populate("orderBy");                    // Populate specific field(s)
      
      const {paymentMethode, time,items, totalAmount,orderNumber,orderType,orderBy,guestMetaData,mobileNumber,comment,address } = data

let name = ""
let email= ""
if(orderBy){
name = orderBy?.firstName
email= orderBy?.email
}
else{
  name= guestMetaData?.name
  email= guestMetaData?.email
}


      console.log(paymentMethode, time,items, totalAmount,orderNumber,orderType,orderBy, "CONSOLELOG FOR DETAILS FOR MAIL IN ONLINE PAYMENT")
  
      const amount= (Number(totalAmount?.total) + Number(totalAmount?.deliveryCharge) - Number(totalAmount?.discountPrice || 0)).toFixed(2)

      let paymentMode = ""
      if(paymentMethode==="Cash on delivery" && orderType==="collection"){
      paymentMode= "Pay on Collection"
      }
      else if(paymentMethode==="Cash on delivery" && orderType==="delivery"){
        paymentMode= "Pay on Delivery"
      }
      else{
        paymentMode= paymentMethode
      }
        
      try {
        await sendOrderMail(email, orderNumber, amount, time, paymentMode, orderType, items, name,mobileNumber,comment,address);
      } catch (error) {
        console.error("Error sending email: ", error.message); 
      }

    }

    // Return the transaction data in response
    res.status(200).json({ status: true});

  });
  

  export const checkTransaction = asyncErrorHandler(async (req, res, next) => {
    const {transactionId}= req?.params
  
  
    const generateToken = await fetch("https://accounts.vivapayments.com/connect/token", {
      // const generateToken = await fetch("https://demo-accounts.vivapayments.com/connect/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: process.env.VIVA_SMARTCHECKOUT_CLIENT_ID,  
          client_secret: process.env.VIVA_SMARTCHECKOUT_SECRET_KEY, 
          // client_id: 'wc37z4tch73nk3amxt162fy8nxa0301wndrxs680ach73.apps.vivapayments.com',  
          // client_secret: 'tyd8a7GJZFQ5Zsb8s3QTJ8X087POaW', 
          scope: 'urn:viva:payments:core:api:redirectcheckout', 
        }),
      });
  
      const response = await generateToken.json();
  
      if (!generateToken.ok) {
        return next(new CustomError(response, 400));
      }
  
    const accessToken = response.access_token; // Extract the OAuth2 access token
  
    // Step 2: Use the access token to call the transaction API
    // const transactionResponse = await fetch(`https://demo-api.vivapayments.com/checkout/v2/transactions/${transactionId}`, {
    const transactionResponse = await fetch(`https://api.vivapayments.com/checkout/v2/transactions/${transactionId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      }
    });
  
    const transactionData = await transactionResponse.json();
  
    if (!transactionResponse.ok) {
      return next(new CustomError(transactionData, 400));
    }

    
    if (transactionData?.statusId === "F") {
       res.status(200).json({status:true, paymentStatus:true, data:transactionData})
    }else{
      return next(new CustomError("Transaction is pending or failed", 400));
    }
  });
  
  export const getOrderFromOrderCode= asyncErrorHandler(async(req,res,next)=>{
    const {orderCode}= req.params;
    const data = await order.findOne({orderCode:orderCode})
if(!data){
  return next(new CustomError("This Order Code is not exist",400))
}
    res.status(200).json({status:true, message:"Order code data" ,data})
  })















  