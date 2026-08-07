
// import { configureStore } from "@reduxjs/toolkit";

// import { postReducer } from "./postslice";
// import { loginslice } from "./loginslice";

// export const store=configureStore({
//     reducer:{

//         post:postReducer,
//         login:loginslice,
//     }
// })
// export type State =ReturnType<typeof store.getState>

// export type AppDispatch = typeof store.dispatch;

import { configureStore } from "@reduxjs/toolkit";
import { postReducer } from "./postslice";
import { loginslice } from "./loginslice";
import { userReducer } from "./userslice";
import { notificationReducer } from "./notificationslice";
import { commentReducer } from "./commentslice";
export const store = configureStore({
    reducer: {
        post: postReducer,
        login: loginslice,
        user: userReducer, // 👈 تسجيله هنا
        notification: notificationReducer, // 👈 جديد
comment: commentReducer, // 👈 وأضف ده
    }
});

export type State = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;