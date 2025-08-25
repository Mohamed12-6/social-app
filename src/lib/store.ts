
import { configureStore } from "@reduxjs/toolkit";

import { postReducer } from "./postslice";
import { loginslice } from "./loginslice";

export const store=configureStore({
    reducer:{

        post:postReducer,
        login:loginslice,
    }
})
export type State =ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch;