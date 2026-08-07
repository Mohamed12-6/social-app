import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const BASE_URL = "https://route-posts.routemisr.com";

const getToken = () => {
  if (typeof window === "undefined") return "";
  const token = localStorage.getItem("Token");
  return token && token !== "undefined" && token !== "null" ? token : "";
};

// ================= Interface المظبوطة حسب الـ API Response =================
export interface NotificationUser {
  _id: string;
  name: string;
  photo?: string;
  username?: string;
}

export interface NotificationItem {
  _id: string;
  recipient: NotificationUser;
  actor: NotificationUser;
  type: string; // comment_post | like_post | follow | share_post ... إلخ
  entityType?: string;
  entityId?: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  entity?: {
    _id: string;
    body?: string;
    image?: string;
  };
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

// 1️⃣ Get Notifications List
export const getNotifications = createAsyncThunk<NotificationItem[]>(
  'notification/getNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/notifications?unread=false&page=1&limit=15`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json', 
          'token': getToken() 
        }
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || "Failed to load notifications");
      return (data.data?.notifications || []) as NotificationItem[];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// 2️⃣ Get Unread Count
export const getUnreadCount = createAsyncThunk<number>(
  'notification/getUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/notifications/unread-count`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json', 
          'token': getToken() 
        }
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message);
      return typeof data.data?.unreadCount === "number" ? data.data.unreadCount : 0;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// 3️⃣ Mark Single Notification As Read
export const markAsRead = createAsyncThunk<string, string>(
  'notification/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json', 
          'token': getToken() 
        }
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message);
      return notificationId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// 4️⃣ Mark All Notifications As Read
export const markAllAsRead = createAsyncThunk(
  'notification/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json', 
          'token': getToken() 
        }
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message);
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get Notifications
      .addCase(getNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload;
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Get Unread Count
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })

      // Mark Single As Read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notif = state.notifications.find(n => n._id === action.payload);
        if (notif && !notif.isRead) {
          notif.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })

      // Mark All As Read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach(n => { n.isRead = true; });
        state.unreadCount = 0;
      });
  }
});

export const notificationReducer = notificationSlice.reducer;