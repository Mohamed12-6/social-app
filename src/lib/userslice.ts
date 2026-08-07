import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const BASE_URL = "https://route-posts.routemisr.com";

const getToken = () => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token") || localStorage.getItem("Token");
    return token && token !== "undefined" && token !== "null" ? token : "";
  }
  return "";
};

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  photo: string;
  cover?: string;
  bio?: string;
  username?: string;
  followersCount?: number;
  followingCount?: number;
  bookmarksCount?: number;
  isFollowed?: boolean;
}

export interface FollowSuggestion {
  _id: string;
  name: string;
  username: string;
  photo: string;
  mutualFollowersCount: number;
  followersCount: number;
}

interface UserState {
  myProfile: UserProfile | null;
  userProfile: UserProfile | null;
  bookmarks: any[];
  followSuggestions: FollowSuggestion[];
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  myProfile: null,
  userProfile: null,
  bookmarks: [],
  followSuggestions: [],
  isLoading: false,
  error: null,
};

// 1️⃣ Get My Profile
export const getMyProfile = createAsyncThunk<UserProfile>(
  'user/getMyProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/users/profile-data`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'token': getToken() }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data.data?.user as UserProfile;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// 2️⃣ Get User Profile (by ID)
export const getUserProfile = createAsyncThunk<UserProfile, string>(
  'user/getUserProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/users/${userId}/profile`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'token': getToken() }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      const user = data.data?.user as UserProfile;
      if (data.data?.isFollowing !== undefined) {
        user.isFollowed = data.data.isFollowing;
      }
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// 3️⃣ Get Bookmarks
export const getBookmarks = createAsyncThunk<any[]>(
  'user/getBookmarks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/users/bookmarks`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'token': getToken() }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data.data?.bookmarks || [];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// 4️⃣ Get Follow Suggestions
export const getFollowSuggestions = createAsyncThunk<FollowSuggestion[]>(
  'user/getFollowSuggestions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/users/suggestions?limit=10`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'token': getToken() }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data.data?.suggestions || [];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// 5️⃣ Follow / Unfollow User
export const followUnfollowUser = createAsyncThunk<
  { userId: string; following: boolean; followersCount: number }, 
  string
>(
  'user/followUnfollowUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/users/${userId}/follow`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'token': getToken() }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return { 
        userId, 
        following: data.data?.following, 
        followersCount: data.data?.followersCount 
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// 6️⃣ Bookmark / Unbookmark Post (تمت الإضافة)
export const bookmarkPost = createAsyncThunk<
  { postId: string; isBookmarked: boolean },
  string
>(
  'user/bookmarkPost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/posts/${postId}/bookmark`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'token': getToken() }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to bookmark");
      return { postId, isBookmarked: data.isBookmarked ?? true };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserProfile: (state) => {
      state.userProfile = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMyProfile.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(getMyProfile.fulfilled, (state, action) => { state.isLoading = false; state.myProfile = action.payload; })
      .addCase(getMyProfile.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })

      .addCase(getUserProfile.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(getUserProfile.fulfilled, (state, action) => { state.isLoading = false; state.userProfile = action.payload; })
      .addCase(getUserProfile.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })

      .addCase(getBookmarks.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(getBookmarks.fulfilled, (state, action) => { state.isLoading = false; state.bookmarks = action.payload; })
      .addCase(getBookmarks.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })

      .addCase(getFollowSuggestions.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(getFollowSuggestions.fulfilled, (state, action) => { state.isLoading = false; state.followSuggestions = action.payload; })
      .addCase(getFollowSuggestions.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })

      .addCase(followUnfollowUser.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(followUnfollowUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const { userId, following, followersCount } = action.payload;
        
        if (state.userProfile && state.userProfile._id === userId) {
          state.userProfile.isFollowed = following;
          state.userProfile.followersCount = followersCount;
        }
      })
      .addCase(followUnfollowUser.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; });
  }
});

export const { clearUserProfile } = userSlice.actions;
export const userReducer = userSlice.reducer;

















