

// import { createSlice } from "@reduxjs/toolkit";
// import toast from "react-hot-toast";
// const initialState={ token:null as null|string ,  isloading: false , isError: null as null|string }
// if (typeof window !== "undefined") {
//     initialState.token = localStorage.getItem("Token") || null;
// }

// const loginSlice = createSlice({
//     name: "loginslice",
//     initialState,
//     reducers: {
//         setLoading: (state) => {
//             state.isloading = true;
//         },
//         setError: (state, action) => {
//             state.isloading = false;
//             state.isError = action.payload;
//             toast.error(action.payload, {
//                 duration: 2000,
//                 position: 'top-center',
//             });
//         },
//         setToken: (state, action) => {
//             state.isloading = false;
//             state.token = action.payload.token;
//             localStorage.setItem("Token", action.payload.token); 
//             toast.success(action.payload.message, {
//                 position: 'top-center',
//             });
//         },
//         removeToken: (state) => {
//             state.isloading = false;
//             state.token = null;
//             localStorage.removeItem("Token");
//         },
//     },
// });
// export const { setLoading, setError, setToken, removeToken } = loginSlice.actions;

// export  const loginslice = loginSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

const initialState = { 
    token: null as null | string,  
    isloading: false, 
    isError: null as null | string 
};

// ✅ قراءة آمنة من localStorage عند التهيئة
if (typeof window !== "undefined") {
    const savedToken = localStorage.getItem("Token");
    // ❌ نرفض القيم الفاسدة: "undefined", "null", أو string فاضي
    if (savedToken && savedToken !== "undefined" && savedToken !== "null") {
        initialState.token = savedToken;
    }
}

const loginSlice = createSlice({
    name: "loginslice",
    initialState,
    reducers: {
        setLoading: (state) => {
            state.isloading = true;
            state.isError = null;
        },
        setError: (state, action) => {
            state.isloading = false;
            state.isError = action.payload;
            toast.error(action.payload, { duration: 2000, position: 'top-center' });
        },
        setToken: (state, action) => {
            state.isloading = false;
            
            let token: string | null = null;
            let message: string = "Welcome back!";

            // ✅ نتعامل مع كل أشكال الـ payload
            if (typeof action.payload === 'string') {
                token = action.payload;
            } else if (action.payload && typeof action.payload === 'object') {
                // API ممكن يرجع token في data.token أو data.data.token
                token = action.payload.token || action.payload.data?.token || null;
                message = action.payload.message || action.payload.msg || "Welcome back!";
            }

            // ❌ لو التوكن مش موجود أو بـ "undefined"، نوقف
            if (!token || token === "undefined" || token === "null") {
                state.isError = "Invalid token received";
                return;
            }

            state.token = token;
            localStorage.setItem("Token", token);
            
            toast.success(message, { position: 'top-center' });
        },
        removeToken: (state) => {
            state.isloading = false;
            state.token = null;
            localStorage.removeItem("Token");
            localStorage.removeItem("userPhoto"); // 👈 امسح الصورة كمان
        },
    },
});

export const { setLoading, setError, setToken, removeToken } = loginSlice.actions;
export const loginslice = loginSlice.reducer;