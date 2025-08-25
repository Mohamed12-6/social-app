

import { createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
const initialState={ token:null as null|string ,  isloading: false , isError: null as null|string }
if (typeof window !== "undefined") {
    initialState.token = localStorage.getItem("Token") || null;
}

const loginSlice = createSlice({
    name: "loginslice",
    initialState,
    reducers: {
        setLoading: (state) => {
            state.isloading = true;
        },
        setError: (state, action) => {
            state.isloading = false;
            state.isError = action.payload;
            toast.error(action.payload, {
                duration: 2000,
                position: 'top-center',
            });
        },
        setToken: (state, action) => {
            state.isloading = false;
            state.token = action.payload.token;
            localStorage.setItem("Token", action.payload.token); 
            toast.success(action.payload.message, {
                position: 'top-center',
            });
        },
        removeToken: (state) => {
            state.isloading = false;
            state.token = null;
            localStorage.removeItem("Token");
        },
    },
});
export const { setLoading, setError, setToken, removeToken } = loginSlice.actions;

export  const loginslice = loginSlice.reducer;
