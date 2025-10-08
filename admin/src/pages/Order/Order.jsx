import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Stack,Skeleton } from '@mui/material';
import { deleteFailedOrder, getAllOrders, updateOrder } from '../../features/actions/order/order';
import OrderViewModal from './OrderViewModal';
import { jsPDF } from "jspdf";
import "jspdf-autotable"; 
import Pagination from '@mui/material/Pagination';
import { useLocation, useSearchParams } from 'react-router-dom';
import axios from 'axios';


const Order = () => {
  const { orderData,isLoading } = useSelector(state => state.order)
  const pageCount = orderData?.totalPages;
  const { search } = useLocation();

  const [searchParams, setSearchParams] = useSearchParams({
    page: 1,
    limit: 10,
  });

  const [page, setPage] = useState(searchParams.get('page') || 1);

  const handlePagination = (e, p) => {
    setPage(p);
    setSearchParams({ page: p, limit: 10 });
  };

    const dispatch = useDispatch()
    const [monthlyData,setMonthlyData] = useState([])
    const [approval, setApproval] = useState({});
const [stopViewModal,setStopViewModal] = useState(false)
    const [showViewModal,setShowViewModal] = useState(false)
    const [viewData,setViewData]= useState()
    const handleViewModal=(itemData)=>{
      setShowViewModal(true)
      setViewData(itemData)
    }
    const handleChange = (event, orderId) => {
      const value = event.target.value;
      setApproval((prevApproval) => ({
        ...prevApproval,
        [orderId]: value === 'Pending' ? null : value === 'Completed' ? "Completed" : "Cancelled",
      }));
    };
  

    const handleSubmit = (event, orderId) => {
      event.preventDefault();
      dispatch(updateOrder({ id:orderId, isCompleted: approval[orderId] }));
    };

    const doc = new jsPDF();
    doc.text("Monthly Orders Report", 14, 10);
  
    const columns = [
      { header: "Order Id", dataKey: "orderId" },
      { header: "Name", dataKey: "name" },
      { header: "Pay Amount", dataKey: "payAmount" },
      { header: "Time", dataKey: "time" },
      { header: "Order Type", dataKey: "orderType" },
      { header: "Payment Method", dataKey: "paymentMethod" },
      { header: "Order Status", dataKey: "orderStatus" },
    ];

    const rows = orderData?.data?.map((item) => ({
      orderId: item?.orderNumber,
      name: item?.orderBy
        ? `${item.orderBy.firstName} ${item.orderBy.lastName}`
        : item?.guestMetaData?.name,
      payAmount: `£${(
        Number(item?.totalAmount?.total) +
        Number(item?.totalAmount?.deliveryCharge) -
        Number(item?.totalAmount?.discountPrice || 0)
      ).toFixed(2)}`,
      time: item?.time,
      orderType: item?.orderType,
      paymentMethod:
        item?.orderType === "collection" && item?.paymentMethode === "Cash on delivery"
          ? "Pay on Collection"
          : item?.orderType === "delivery" && item?.paymentMethode === "Cash on delivery"
          ? "Pay on Delivery"
          : item?.paymentMethode,
      orderStatus: item?.approvalStatus || "Pending",
    }));
  
      // Use autoTable to generate the PDF
      doc.autoTable({
        columns, // Include only selected columns
        body: rows, // Data for rows
        startY: 20,
        theme: "striped",
        styles: {
          fontSize: 10,
          cellPadding: { top: 5, right: 2, bottom: 5, left: 2 },
        },

      });
    
      useEffect(() => {
        dispatch(getAllOrders(search || `?page=1&limit=10`));
        dispatch(deleteFailedOrder());

        async function getMonthlyOrders(){
          const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API_BASE_URL_PRODUCTION}/order/filteredOrders/monthly?year=2024&month=9`)
          setMonthlyData(response?.data?.data)
        }

        getMonthlyOrders()
    }, [search])
      
    useEffect(() => {
      if (Array.isArray(orderData?.data) && orderData?.data.length > 0) {
        const initialApproval = {};
        orderData?.data?.forEach((item) => { console.log(item.orderStatus)
          return initialApproval[item._id] = item.orderStatus == "Pending" ? "Pending" : item.orderStatus ;
        });
        setApproval(initialApproval);
      }

    }, [orderData]);



        
    return (
        <>
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 mt-4">
          <div className="items-start justify-between md:flex">
            <div className="max-w-lg">
              <h3 className="text-gray-800 text-xl font-bold sm:text-2xl">
                Manage Orders 
              </h3>
           
            </div>
        <div className='flex gap-3'>
        <select>Date</select>
        <select>Date</select>
        <button className='text-white bg-blue-700 px-2 py-1 rounded-md hover:bg-blue-600' onClick={()=>doc.save("a4.pdf")}>
          Download PDF
         </button>
        </div>
          </div>
          <div className="mt-6 shadow-xl rounded-lg overflow-x-auto">
            <table className="w-full table-auto text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                <tr>
                  <th className="py-3 px-3">Order Id</th>
                  <th className="py-3 px-3">Name </th>
                  <th className="py-3 px-3">Pay Amount </th>
                  <th className="py-3 px-3">Time </th>
                  <th className="py-3 px-3">Order Type </th>
                  <th className="py-3 px-3">Payment Method </th>
                  <th className="py-3 px-3">Order Status</th>
                  <th className="py-3 px-3">Actions</th>
                
                  
                </tr>
              </thead>
              <tbody className="text-gray-600 divide-y">
              {isLoading ? (
              <tr>
              <td colSpan="8" className="text-center px-6 py-8">
                <Stack spacing={4}>
                  <Skeleton variant="rounded" height={30} />
                  <Skeleton variant="rounded" height={25}/>
                  <Skeleton variant="rounded" height={20}/>
                  <Skeleton variant="rounded" height={20}/>
                  <Skeleton variant="rounded" height={20}/>
                </Stack>
              </td>
            </tr>
            ) : (
              Array.isArray(orderData?.data) && orderData?.data.length > 0 && orderData?.data.map((item, idx) => (
                    <tr key={idx} className='hover:bg-slate-100 cursor-pointer active:bg-slate-100' onClick={() => {
                      stopViewModal ? null : handleViewModal(item)

                    }}>
                      <td className="px-3 py-4 whitespace-nowrap">{item?.orderNumber}</td>
                      <td className="px-3 py-4 whitespace-nowrap ">
                 {  item?.orderBy   ?   `${item?.orderBy?.firstName} ${item?.orderBy?.lastName}` : item?.guestMetaData?.name}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap font-semibold ">
                      £ {(Number(item?.totalAmount?.total) + Number(item?.totalAmount?.deliveryCharge)- Number(item?.totalAmount?.discountPrice || 0)).toFixed(2)}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap ">
                        {item?.time}
                      </td>
                      <td className=" py-4 whitespace-nowrap ">
                      <span className={`rounded-md py-1 px-3 font-semibold capitalize`}>{item?.orderType}</span>
                       
                      </td>
                      <td className=" py-4 whitespace-nowrap ">
                      <span className={`rounded-md py-1 px-3 font-bold capitalize ${item?.paymentMethode === 'Online Payment' ? "text-emerald-600" : "text-yellow-600" }`}>{item?.orderType === "collection" && item?.paymentMethode === "Cash on delivery" ? "Pay on Collection" : item?.orderType === "delivery" && item?.paymentMethode === "Cash on delivery"? "Pay on delivery" : item?.paymentMethode }</span>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap ">
                      <form onSubmit={(e) => handleSubmit(e, item._id)} className="flex items-center">
                          <select
                          onMouseOver={()=>setStopViewModal(true)}
                          onMouseLeave={()=>setStopViewModal(false)}
                            value={approval[item._id] !== undefined ? approval[item._id] === "Completed" ? 'Completed' : approval[item._id] === 'Cancelled' ? 'Cancelled' : "" : ""}
                            onChange={(e) => handleChange(e, item._id) }
                            className="px-3 py-2 text-sm text-gray-600 bg-white border rounded-lg shadow-sm outline-none appearance-none focus:ring-offset-2 focus:ring-indigo-600 focus:ring-2"
                          >
                            <option value="" disabled hidden>
                              Choose Status
                            </option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <button type="submit" className="py-2 px-3 font-semibold text-blue-500 hover:text-blue-600 duration-150 hover:bg-gray-50 rounded-lg">
                            Save
                          </button>
                        </form>
                      
                      </td>
                  
                 
                      
                     
                      <td className=" whitespace-nowrap">
                      <button
                          onClick={() => {
                            handleViewModal(item)
                          }}
                          className="py-2 leading-none px-6 font-semibold text-green-600 hover:text-green-700 duration-150 hover:bg-gray-50 rounded-lg"
                        >
                          View full details
                        </button>
     
                      </td>
                    </tr>
                  ))
                
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex justify-center my-5">
        {' '}
        <Pagination
          count={pageCount}
          page={Number(page)}
          color="primary"
          boundaryCount={2}
          onChange={handlePagination}
        ></Pagination>
      </div>
        {showViewModal && (
        <OrderViewModal setModal={setShowViewModal} viewData={viewData} />
      )}
      </>
    )
}



export default Order

