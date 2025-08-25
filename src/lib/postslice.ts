import { Post } from "@/interfaces/state";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// Get all posts
export const getAllPost = createAsyncThunk<Post[]>(
  'postslice/getAllPost',
  async () => {
    const response = await fetch(`https://linked-posts.routemisr.com/posts?limit=50`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'token': localStorage.getItem("Token") || ''
      }
    });

    const data = await response.json();
    return data.posts as Post[]; 
  }
);

// Get single post
export const getSinglePost = createAsyncThunk<Post, string>(
  'postslice/getSinglePost',
  async (postid: string) => {
    const response = await fetch(`https://linked-posts.routemisr.com/posts/${postid}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'token': localStorage.getItem("Token") || ''
      }
    });
    
    const data = await response.json();
    console.log(data.post);
    return data.post as Post; 
  }
);

// Get user posts
export const getUserPost = createAsyncThunk<Post[], string>(
  'postslice/getUserPost',
  async (userid: string) => {
    const response = await fetch(`https://linked-posts.routemisr.com/users/${userid}/posts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'token': `${localStorage.getItem("Token")}`
      }
    });
    
    const data = await response.json();
    console.log(data.posts);
    return data.posts as Post[];
  }
);

const postslice = createSlice({
  name: "postslice",
  initialState: { 
    posts: [] as Post[], 
    post: null as Post | null,
    isLoading: false, 
    error: null as string | null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // All Posts
      .addCase(getAllPost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload;
      })
      .addCase(getAllPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load posts';
      })

      // Single Post
      .addCase(getSinglePost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSinglePost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.post = action.payload;
      })
      .addCase(getSinglePost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load post';
      })

      // User Posts
      .addCase(getUserPost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload;
      })
      .addCase(getUserPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load user posts';
      });
  }
});

export const postReducer = postslice.reducer;
