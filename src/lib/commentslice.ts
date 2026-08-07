import { Comment } from "@/interfaces/state";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const BASE_URL = "https://route-posts.routemisr.com";

const getToken = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("Token") : '';
  return token && token !== "undefined" && token !== "null" ? token : "";
};

// ==================== 1. Get Post Comments ====================
export const getPostComments = createAsyncThunk<
  { postId: string; comments: Comment[] },
  { postId: string; page?: number; limit?: number }
>(
  'commentslice/getPostComments',
  async ({ postId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/posts/${postId}/comments?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'token': getToken()
        }
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || data.data?.message);
      return { postId, comments: (data.data?.comments as Comment[]) || [] };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// ==================== 2. Create Comment ====================
export const createComment = createAsyncThunk<
  { postId: string; comment: Comment },
  { postId: string; formData: FormData }
>(
  'commentslice/createComment',
  async ({ postId, formData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'token': getToken() // بلاش Content-Type مع FormData
        },
        body: formData
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || data.data?.message);
      
      const newComment = data.comment || data.data?.comment;
      return { postId, comment: newComment as Comment };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// ==================== 3. Get Comment Replies ====================
export const getCommentReplies = createAsyncThunk<
  { commentId: string; replies: Comment[] },
  { postId: string; commentId: string; page?: number; limit?: number }
>(
  'commentslice/getCommentReplies',
  async ({ postId, commentId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/posts/${postId}/comments/${commentId}/replies?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'token': getToken()
        }
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || data.data?.message);
      return { commentId, replies: (data.data?.replies as Comment[]) || [] };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// ==================== 4. Create Reply ====================
export const createReply = createAsyncThunk<
  { commentId: string; reply: Comment },
  { postId: string; commentId: string; formData: FormData }
>(
  'commentslice/createReply',
  async ({ postId, commentId, formData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/posts/${postId}/comments/${commentId}/replies`, {
        method: 'POST',
        headers: {
          'token': getToken()
        },
        body: formData
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || data.data?.message);
      return { commentId, reply: (data.reply || data.data?.reply) as Comment };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// ==================== 5. Update Comment ====================
export const updateComment = createAsyncThunk<
  Comment,
  { postId: string; commentId: string; formData: FormData }
>(
  'commentslice/updateComment',
  async ({ postId, commentId, formData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/posts/${postId}/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'token': getToken()
        },
        body: formData
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || data.data?.message);
      return (data.comment || data.data?.comment) as Comment;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// ==================== Slice State ====================
interface CommentState {
  commentsByPost: Record<string, Comment[]>;
  repliesByComment: Record<string, Comment[]>;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

const initialState: CommentState = {
  commentsByPost: {},
  repliesByComment: {},
  isLoading: false,
  isSubmitting: false,
  error: null,
};

const commentslice = createSlice({
  name: "commentslice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get Comments
      .addCase(getPostComments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getPostComments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.commentsByPost[action.payload.postId] = action.payload.comments;
      })
      .addCase(getPostComments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create Comment
      .addCase(createComment.pending, (state) => {
        state.isSubmitting = true;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const { postId, comment } = action.payload;
        if (!state.commentsByPost[postId]) {
          state.commentsByPost[postId] = [];
        }
        if (comment) {
          state.commentsByPost[postId].unshift(comment);
        }
      })
      .addCase(createComment.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })

      // Get Replies
      .addCase(getCommentReplies.fulfilled, (state, action) => {
        const { commentId, replies } = action.payload;
        state.repliesByComment[commentId] = replies;
      })

      // Create Reply
      .addCase(createReply.fulfilled, (state, action) => {
        const { commentId, reply } = action.payload;
        if (!state.repliesByComment[commentId]) {
          state.repliesByComment[commentId] = [];
        }
        if (reply) {
          state.repliesByComment[commentId].push(reply);
        }
      })

      // Update Comment
      .addCase(updateComment.fulfilled, (state, action) => {
        const updatedComment = action.payload;
        const postId = updatedComment?.post;

        if (postId && state.commentsByPost[postId]) {
          const index = state.commentsByPost[postId].findIndex((c) => c._id === updatedComment._id);
          if (index !== -1) {
            state.commentsByPost[postId][index] = updatedComment;
          }
        }
      });
  }
});

export const commentReducer = commentslice.reducer;