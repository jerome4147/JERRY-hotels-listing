import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/hotels';

// This is hotels filter object
export const fetchHotels = createAsyncThunk('hotels/fetchHotels', async (params) => {
  const response = await axios.get(API_URL, { params });
  return response.data;
});

// This is the action for creating a new hotel (FormData is needed because of the image)
export const createHotel = createAsyncThunk('hotels/createHotel', async (formData) => {
  const response = await axios.post(API_URL, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
});

// This is the action for deleting a hotel
export const deleteHotel = createAsyncThunk('hotels/deleteHotel', async (id) => {
  await axios.delete(`${API_URL}/$${id}`);
  return id;
});

const hotelSlice = createSlice({
  name: 'hotels',
  initialState: {
    items: [],
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(updateHotel.fulfilled, (state, action) => {
  const index = state.items.findIndex(h => h.id === action.payload.id);
  if (index !== -1) state.items[index] = action.payload;
})
      .addCase(fetchHotels.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createHotel.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(deleteHotel.fulfilled, (state, action) => {
        state.items = state.items.filter(hotel => hotel.id !== action.payload);
      });

  }
});

export default hotelSlice.reducer;
export const updateHotel = createAsyncThunk('hotels/updateHotel', async ({ id, formData }) => {
  const response = await axios.put(`${API_URL}/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
});