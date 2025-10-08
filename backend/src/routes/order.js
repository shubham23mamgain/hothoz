import express from "express";
import {
  checkTransaction,
  deleteFailedPayment,
  getAllOrders,
  getMonthlyData,
  getOrderFromOrderCode,
  getParticularUserOrders,
  newOrder,
  onlineOrder,
  updateCompleteOrder,
} from "../controllers/order.js";

const router = express.Router({ strict: false });

router.route("/:userId").get(getParticularUserOrders);
router.route("/").post(newOrder).get(getAllOrders).delete(deleteFailedPayment);
router.route("/:id").patch(updateCompleteOrder);
router.route("/create-viva-order").post(onlineOrder);
router.route("/checkTransaction/:transactionId").post(checkTransaction);
router.route("/getFromOrderCode/:orderCode").get(getOrderFromOrderCode);
router.route("/fIlteredOrders/monthly").get(getMonthlyData);



export default router;
