import { Post } from "@/interfaces/state";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast"; // تم إضافة الـ Toast
import { createComment } from "./commentslice"; // ربط الـ Comment مع الـ Post

const BASE_URL = "https://route-posts.routemisr.com";

const getToken = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("Token") : '';
  return token && token !== "undefined" && token !== "null" ? token : "";
};

// ==================== Get All Posts ====================
export const getAllPost = createAsyncThunk<Post[]>(
  'postslice/getAllPost',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/posts?limit=50`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'token': getToken()
        }
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || data.data?.message);
      return (data.data?.posts || data.posts as Post[]) || [];
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// ==================== Get Home Feed ====================
export const getHomeFeed = createAsyncThunk<Post[]>(
  'postslice/getHomeFeed',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/posts/feed?only=following&limit=20`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'token': getToken()
        }
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || data.data?.message);
      return (data.data?.posts || data.posts as Post[]) || [];
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// ==================== Get Single Post ====================
export const getSinglePost = createAsyncThunk<Post, string>(
  'postslice/getSinglePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/posts/${postId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'token': getToken()
        }
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || data.data?.message);
      return (data.data?.post || data.post) as Post;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// ==================== Get User Posts ====================
export const getUserPost = createAsyncThunk<Post[], string>(
  'postslice/getUserPost',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/users/${userId}/posts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'token': getToken()
        }
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || data.data?.message);
      return (data.data?.posts || data.posts as Post[]) || [];
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// ==================== Create Post ====================
export const createPost = createAsyncThunk<Post, FormData>(
  'postslice/createPost',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/posts`, {
        method: 'POST',
        headers: {
          'token': getToken()
        },
        body: formData
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || data.data?.message);
      toast.success("تم نشر البوست بنجاح 🚀");
      return (data.data?.post || data.post) as Post;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// ==================== Update Post ====================
export const updatePost = createAsyncThunk<Post, { postId: string; formData: FormData }>(
  'postslice/updatePost',
  async ({ postId, formData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'token': getToken()
        },
        body: formData
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || data.data?.message);
      toast.success("تم تعديل البوست بنجاح");
      return (data.data?.post || data.post) as Post;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// ==================== Delete Post ====================
export const deletePost = createAsyncThunk<string, string>(
  'postslice/deletePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'token': getToken()
        }
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || data.data?.message);
      toast.success("تم حذف البوست");
      return postId;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// ==================== Like / Unlike Post ====================
export const toggleLikePost = createAsyncThunk<Post, string>(
  'postslice/toggleLikePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/posts/${postId}/like`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'token': getToken()
        }
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || data.data?.message);
      
      const updatedPost = (data.data?.post || data.post) as Post;
      return updatedPost;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// ==================== Bookmark Post ====================
export const toggleBookmarkPost = createAsyncThunk<
  { postId: string; updatedPost?: Post },
  { postId: string; userId: string }
>(
  'postslice/toggleBookmarkPost',
  async ({ postId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/posts/${postId}/bookmark`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'token': getToken()
        }
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || data.data?.message || "Failed to bookmark");
      
      toast.success("Saved to bookmarks!");
      return {
        postId,
        updatedPost: data.data?.post || data.post,
      };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// ==================== Share Post ====================
// ==================== Share Post ====================
export const sharePost = createAsyncThunk<Post, { postId: string; body?: string }>(
  'postslice/sharePost',
  async ({ postId, body }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/posts/${postId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': getToken()
        },
        body: JSON.stringify({ body: body || "" })
      });
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        return rejectWithValue(data.message || "Failed to share post");
      }

      toast.success("Post shared successfully! 🔄");
      return (data.data?.post || data.post) as Post;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// ==================== Slice ====================
interface PostState {
  posts: Post[];
  post: Post | null;
  userPosts: Post[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

const initialState: PostState = {
  posts: [],
  post: null,
  userPosts: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
};

const postslice = createSlice({
  name: "postslice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    const updatePostInState = (state: PostState, updatedPost: Post) => {
      if (!updatedPost) return;
      const id = updatedPost._id || updatedPost.id;
      
      const postIdx = state.posts.findIndex((p) => (p._id || p.id) === id);
      if (postIdx !== -1) state.posts[postIdx] = updatedPost;

      const userPostIdx = state.userPosts.findIndex((p) => (p._id || p.id) === id);
      if (userPostIdx !== -1) state.userPosts[userPostIdx] = updatedPost;

      if (state.post && (state.post._id || state.post.id) === id) {
        state.post = updatedPost;
      }
    };

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
        state.error = (action.payload as string) || 'Failed to load posts';
      })

      // Home Feed
      .addCase(getHomeFeed.fulfilled, (state, action) => {
        state.posts = action.payload;
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

      // User Posts
      .addCase(getUserPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userPosts = action.payload;
      })

      // Create Post
      .addCase(createPost.fulfilled, (state, action) => {
        state.isSubmitting = false;
        if (action.payload) {
          state.posts.unshift(action.payload);
          state.userPosts.unshift(action.payload);
        }
      })

      // Update Post
      .addCase(updatePost.fulfilled, (state, action) => {
        updatePostInState(state, action.payload);
      })

      // Delete Post
      .addCase(deletePost.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.posts = state.posts.filter((p) => p._id !== deletedId && p.id !== deletedId);
        state.userPosts = state.userPosts.filter((p) => p._id !== deletedId && p.id !== deletedId);
      })

      // Like / Unlike Post (مع إضافة Toast)
      .addCase(toggleLikePost.fulfilled, (state, action) => {
        updatePostInState(state, action.payload);
        toast.success("", { duration: 2000, id: "like-toast" });
      })

      // Bookmark
      .addCase(toggleBookmarkPost.fulfilled, (state, action) => {
        const { postId, updatedPost } = action.payload;
        if (updatedPost) {
          updatePostInState(state, updatedPost);
        }
      })

      // Share Post
     .addCase(sharePost.fulfilled, (state, action) => {
  if (action.payload) {
    state.posts.unshift(action.payload); // ينزل فوراً أعلى الصفحة
  }
})

      // 🔴 الاستماع لإضافة تعليق جديد لتحديث الـ UI فوراً
      .addCase(createComment.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        const targetPost = state.posts.find((p) => (p._id || p.id) === postId);
        if (targetPost) {
          if (!targetPost.comments) targetPost.comments = [];
          targetPost.comments.unshift(comment); // تسميع الكومنت جوة البوست فوراً
        }
        toast.success("تم إضافة التعليق بنجاح 💬");
      });
  }
});

export const postReducer = postslice.reducer;