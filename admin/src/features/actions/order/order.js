import { createAsyncThunk } from "@reduxjs/toolkit";
import { instance } from "../../../services/axiosInterceptor";


export const getAllOrders = createAsyncThunk("getDrink",    
  async (payload, { rejectWithValue }) => {
  try {
    const {data} = await instance.get(`/order${payload}`, {
      withCredentials: true,
    });
    return data;

  } catch (e) {
    return rejectWithValue(e);
  }
}
);

export const updateOrder = createAsyncThunk("updateOrder",    
  async (payload, { rejectWithValue }) => {
  try {
    const {data} = await instance.patch(`/order/${payload.id}`, payload ,{
      withCredentials: true,
    });
    return data;

  } catch (e) {
    return rejectWithValue(e);
  }
}
);

export const deleteFailedOrder = createAsyncThunk(
  "deleteFailedOrder",    
  async (_, { rejectWithValue }) => {
  try {
    const {data} = await instance.delete(`/order` ,{
      withCredentials: true,
    });
    return data;

  } catch (e) {
    return rejectWithValue(e);
  }
}
);



