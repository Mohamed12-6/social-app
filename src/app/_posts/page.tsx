"use client";

import * as React from 'react';
import { 
  Card, CardHeader, CardContent, CardActions, Collapse, 
  Avatar, IconButton, Typography, Button, TextField, 
  Box, Divider, Stack, CircularProgress, Dialog, DialogTitle, 
  DialogContent, DialogActions 
} from '@mui/material';
import { red } from '@mui/material/colors';
import ShareIcon from '@mui/icons-material/Share';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CommentIcon from '@mui/icons-material/Comment';
import SendIcon from '@mui/icons-material/Send';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ImageIcon from '@mui/icons-material/Image';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';

import { Comment, Post } from '@/interfaces/state';
import Image from 'next/image';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { State, AppDispatch } from '@/lib/store';
import { 
  getPostComments, 
  createComment, 
  getCommentReplies, 
  createReply 
} from '@/lib/commentslice';
import { 
  toggleLikePost, 
  toggleBookmarkPost, 
  updatePost, 
  sharePost 
} from '@/lib/postslice';

export default function Posts({ posts, isComment = false }: { posts: Post; isComment?: boolean }) {
  const [expanded, setExpanded] = React.useState(isComment);
  const [loggedin, setLoggedin] = React.useState("");

  // Local comments state للتحديث اللحظي
  const [localComments, setLocalComments] = React.useState<Comment[]>(posts.comments || []);

  // States للتعليق الجديد
  const [commentText, setCommentText] = React.useState("");
  const [commentImage, setCommentImage] = React.useState<File | null>(null);

  // States للردود (Replies)
  const [activeReplyId, setActiveReplyId] = React.useState<string | null>(null);
  const [replyText, setReplyText] = React.useState("");
  const [replyImage, setReplyImage] = React.useState<File | null>(null);

  // States للتعديل (Update Post)
  const [openEdit, setOpenEdit] = React.useState(false);
  const [editBody, setEditBody] = React.useState(posts.body || "");
  const [updating, setUpdating] = React.useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: State) => state.login.token);

  // جلب الكومنتات من Redux Store
  const storeComments = useSelector((state: State) => state.comment.commentsByPost[posts._id]);
  const repliesByComment = useSelector((state: State) => state.comment.repliesByComment);
  const { isSubmitting, isLoading: commentsLoading } = useSelector((state: State) => state.comment);

  // تحديث الـ localComments عند تغير بيانات الـ Redux أو الـ Props
  React.useEffect(() => {
    if (storeComments) {
      setLocalComments(storeComments);
    } else if (posts.comments) {
      setLocalComments(posts.comments);
    }
  }, [storeComments, posts.comments]);

  // 1️⃣ Token Decoding لمعرفة المستخدم الحالي
  React.useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode<{ user?: string; id?: string; _id?: string }>(token);
        setLoggedin(decoded._id || decoded.id || decoded.user || "");
      } catch {
        setLoggedin("");
      }
    }
  }, [token]);

  // 2️⃣ Toggle Comments Collapse
  const handleExpandClick = () => {
    const nextState = !expanded;
    setExpanded(nextState);
    if (nextState) {
      dispatch(getPostComments({ postId: posts._id }));
    }
  };

  // 👍 3️⃣ Like / Unlike Action مع Redux
  const handleLike = async () => {
    if (!token) return toast.error("Please login first");
    try {
      await dispatch(toggleLikePost(posts._id)).unwrap();
    } catch (err: any) {
      toast.error(typeof err === "string" ? err : "Failed to toggle like");
    }
  };

  // 🔖 4️⃣ Bookmark Action
  const handleBookmark = async () => {
    if (!token) return toast.error("Please login first");
    try {
      await dispatch(toggleBookmarkPost({ postId: posts._id, userId: loggedin })).unwrap();
    } catch (err: any) {
      toast.error(typeof err === "string" ? err : "Failed to toggle bookmark");
    }
  };

  // 🔄 5️⃣ Share Action مع Redux و Clipboard
// 🔄 Share Action
const handleShare = async () => {
  if (!token) return toast.error("Please login first");
  try {
    // نبعت طلب الشير للباك إند
    await dispatch(sharePost({ postId: posts._id, body: "Sharing this post" })).unwrap();
    
    // اختياري: ننسخ اللينك كمان للحافظة
    const postUrl = `${window.location.origin}/singlepost/${posts._id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(postUrl);
    }
  } catch (err: any) {
    toast.error(typeof err === "string" ? err : "Failed to share post");
  }
};

  // ✏️ 6️⃣ Update Post
  const handleUpdatePost = async () => {
    if (!editBody.trim()) return toast.error("Post text cannot be empty");
    setUpdating(true);

    try {
      const formData = new FormData();
      formData.append("body", editBody);

      await dispatch(updatePost({ postId: posts._id, formData })).unwrap();
      setOpenEdit(false);
    } catch (err: any) {
      toast.error(typeof err === "string" ? err : "Failed to update post");
    } finally {
      setUpdating(false);
    }
  };

  // 💬 7️⃣ إضافة تعليق مع التحديث اللحظي (Instant UI Update)
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return toast.error("Please login first");
    if (!commentText.trim() && !commentImage) return;

    const formData = new FormData();
    if (commentText.trim()) formData.append("content", commentText);
    if (commentImage) formData.append("image", commentImage);

    try {
      await dispatch(createComment({ postId: posts._id, formData })).unwrap();
      setCommentText("");
      setCommentImage(null);
      dispatch(getPostComments({ postId: posts._id }));
    } catch (err: any) {
      toast.error(typeof err === "string" ? err : "Failed to add comment");
    }
  };

  // 🔄 جلب ردود تعليق معين
  const handleFetchReplies = (commentId: string) => {
    dispatch(getCommentReplies({ postId: posts._id, commentId }));
  };

  // ↩️ إضافة رد (Reply)
  const handleAddReply = async (commentId: string) => {
    if (!token) return toast.error("Please login first");
    if (!replyText.trim() && !replyImage) return;

    const formData = new FormData();
    if (replyText.trim()) formData.append("content", replyText);
    if (replyImage) formData.append("image", replyImage);

    try {
      await dispatch(createReply({ postId: posts._id, commentId, formData })).unwrap();
      toast.success("Reply added!");
      setReplyText("");
      setReplyImage(null);
      setActiveReplyId(null);
      dispatch(getCommentReplies({ postId: posts._id, commentId }));
    } catch (err: any) {
      toast.error(typeof err === "string" ? err : "Failed to add reply");
    }
  };

  // 🗑️ حذف تعليق
  const deleteComment = async (id: string) => {
    if (!token) return;

    try {
      const response = await fetch(`https://route-posts.routemisr.com/posts/${posts._id}/comments/${id}`, {
        method: 'DELETE',
        headers: { token }
      });
      const data = await response.json();
      
      if (response.ok || data.message === "success") {
        toast.success("Comment deleted successfully!");
        dispatch(getPostComments({ postId: posts._id }));
      } else {
        toast.error(data.message || "Failed to delete comment.");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const isLiked = posts.likes?.includes(loggedin);
  const isBookmarked = posts.bookmarkedBy?.includes(loggedin);
  const isOwner = loggedin === posts.user?._id;

  const renderAvatarImage = (photoUrl: string | undefined, name: string) => {
    const validUrl = photoUrl && photoUrl.trim() !== "" && !photoUrl.includes("undefined");
    if (validUrl) {
      return (
        <Image 
          src={photoUrl!} 
          alt={name || "user"} 
          width={40} 
          height={40} 
          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} 
        />
      );
    }
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  return (
    <Card sx={{ width: "100%", my: 2, borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
      {/* 👤 Header البوست */}
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: red[500] }}>
            {renderAvatarImage(posts.user?.photo, posts.user?.name || "")}
          </Avatar>
        }
        action={
          isOwner ? (
            <IconButton onClick={() => setOpenEdit(true)} aria-label="edit post">
              <EditIcon />
            </IconButton>
          ) : null
        }
        title={posts.user?.name || "Unknown User"}
        subheader={posts.createdAt ? new Date(posts.createdAt).toLocaleDateString("ar-EG") : ""}
      />

      {/* 📝 محتوى البوست */}
      <CardContent sx={{ py: 1 }}>
        <Typography variant="body1" color="text.primary">
          {posts.body || ""}
        </Typography>
        {/* عرض البوست الأصلي لو ده بوست معملوله Share */}
{posts?.isShare && posts?.sharedPost && (
  <Box sx={{ m: 2, p: 2, border: "1px solid #e0e0e0", borderRadius: 2, bgcolor: "#fafafa" }}>
    <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
      <Avatar sx={{ width: 30, height: 30 }}>
        {renderAvatarImage(posts.sharedPost.user?.photo, posts.sharedPost.user?.name || "")}
      </Avatar>
      <Typography variant="subtitle2" fontWeight="bold">
        {posts.sharedPost.user?.name}
      </Typography>
    </Stack>
    <Typography variant="body2" color="text.secondary">
      {posts.sharedPost.body}
    </Typography>
  </Box>
)}
      </CardContent>

      {/* 🖼️ صورة البوست */}
      {posts.image && (
        <Image 
          src={posts.image} 
          alt={posts.body || "post image"} 
          width={600} 
          height={400} 
          style={{ width: "100%", height: "auto", objectFit: "cover" }} 
        />
      )}

      {/* 🔘 أزرار التفاعل (Like, Comment, Bookmark, Share) */}
      <CardActions sx={{ display: "flex", justifyContent: "space-around", px: 2, pt: 1 }}>
        {/* Like */}
        <IconButton onClick={handleLike} aria-label="like">
          <ThumbUpIcon color={isLiked ? "primary" : "inherit"} />
          {posts.likes && posts.likes.length > 0 && (
            <Typography variant="caption" sx={{ ml: 0.5 }}>
              {posts.likes.length}
            </Typography>
          )}
        </IconButton>

        {/* Comment */}
        <IconButton onClick={handleExpandClick} aria-label="show comments">
          <CommentIcon color={expanded ? "primary" : "inherit"} />
          {localComments.length > 0 && (
            <Typography variant="caption" sx={{ ml: 0.5 }}>
              {localComments.length}
            </Typography>
          )}
        </IconButton>

        {/* Bookmark */}
        <IconButton onClick={handleBookmark} aria-label="bookmark">
          {isBookmarked ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
        </IconButton>

        {/* Share */}
        <IconButton onClick={handleShare} aria-label="share">
          <ShareIcon />
        </IconButton>
      </CardActions>

      {/* 💬 قسم التعليقات والردود */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider sx={{ my: 1 }} />
        
        <Box sx={{ p: 2, backgroundColor: "#fafafa" }}>

          {/* ✏️ Input إضافة تعليق */}
          <Box component="form" onSubmit={handleAddComment} sx={{ mb: 2.5 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField 
                size="small"
                fullWidth
                placeholder="Write a comment..." 
                variant="outlined" 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                sx={{ backgroundColor: "#fff", borderRadius: 1 }}
              />

              <IconButton component="label" color={commentImage ? "primary" : "default"} size="small">
                <input 
                  type="file" 
                  hidden 
                  accept="image/*" 
                  onChange={(e) => setCommentImage(e.target.files?.[0] || null)} 
                />
                <ImageIcon />
              </IconButton>

              <Button 
                type="submit" 
                variant="contained" 
                disabled={isSubmitting || (!commentText.trim() && !commentImage)}
                endIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
              >
                Send
              </Button>
            </Stack>

            {commentImage && (
              <Typography variant="caption" color="primary" sx={{ mt: 0.5, display: "block" }}>
                📷 Image attached: {commentImage.name}
              </Typography>
            )}
          </Box>

          {/* 📄 قائمة التعليقات */}
          <Stack spacing={2}>
            {commentsLoading && localComments.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : localComments.length > 0 ? (
              localComments.map((comment: Comment) => {
                const commentReplies = repliesByComment[comment._id] || [];

                return (
                  <Card key={comment._id} variant="outlined" sx={{ borderRadius: 2, backgroundColor: "#ffffff", p: 0.5 }}>
                    <CardHeader
                      avatar={
                        <Avatar sx={{ bgcolor: red[500], width: 36, height: 36 }}>
                          {renderAvatarImage(comment.commentCreator?.photo, comment.commentCreator?.name || "")}
                        </Avatar>
                      }
                      action={
                        (loggedin === comment.commentCreator?._id || loggedin === comment.commentCreator?.id) ? (
                          <IconButton size="small" onClick={() => deleteComment(comment._id)}>
                            <DeleteOutlineIcon fontSize="small" color="error" />
                          </IconButton>
                        ) : null
                      }
                      title={
                        <Typography variant="subtitle2" fontWeight="bold">
                          {comment.commentCreator?.name || "User"}
                        </Typography>
                      }
                      subheader={
                        <Typography variant="caption" color="text.secondary">
                          {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString("ar-EG") : ""}
                        </Typography>
                      }
                      sx={{ p: 1.5, pb: 0 }}
                    />

                    <CardContent sx={{ pt: 1, pb: 1, px: 2 }}>
                      {comment.content && (
                        <Typography variant="body2" color="text.primary">
                          {comment.content}
                        </Typography>
                      )}

                      {comment.image && (
                        <Box
                          component="img"
                          src={comment.image}
                          alt="comment image"
                          sx={{ maxWidth: "100%", maxHeight: 200, borderRadius: 2, mt: 1, display: "block" }}
                        />
                      )}

                      <Box sx={{ mt: 1, display: "flex", gap: 2, alignItems: "center" }}>
                        <Typography
                          variant="caption"
                          sx={{ cursor: "pointer", fontWeight: 600, color: "primary.main" }}
                          onClick={() => setActiveReplyId(activeReplyId === comment._id ? null : comment._id)}
                        >
                          Reply
                        </Typography>

                        <Typography
                          variant="caption"
                          sx={{ cursor: "pointer", color: "text.secondary", fontWeight: 500 }}
                          onClick={() => handleFetchReplies(comment._id)}
                        >
                          View replies ({commentReplies.length || comment.repliesCount || 0})
                        </Typography>
                      </Box>

                      {/* Input الرد */}
                      {activeReplyId === comment._id && (
                        <Box sx={{ mt: 1.5, display: "flex", gap: 1, alignItems: "center" }}>
                          <SubdirectoryArrowRightIcon color="action" fontSize="small" />
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Write a reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            sx={{ backgroundColor: "#fafafa" }}
                          />
                          <IconButton component="label" color={replyImage ? "primary" : "default"} size="small">
                            <input 
                              type="file" 
                              hidden 
                              accept="image/*" 
                              onChange={(e) => setReplyImage(e.target.files?.[0] || null)} 
                            />
                            <ImageIcon fontSize="small" />
                          </IconButton>
                          <Button size="small" variant="contained" onClick={() => handleAddReply(comment._id)}>
                            Reply
                          </Button>
                        </Box>
                      )}

                      {/* قائمة الردود */}
                      {commentReplies.length > 0 && (
                        <Box sx={{ mt: 1.5, ml: 2, borderLeft: "2px solid", borderColor: "divider", pl: 1.5 }}>
                          {commentReplies.map((reply) => (
                            <Box key={reply._id} sx={{ display: "flex", gap: 1.5, mb: 1.5, alignItems: "flex-start" }}>
                              <Avatar sx={{ width: 26, height: 26, bgcolor: red[400] }}>
                                {renderAvatarImage(reply.commentCreator?.photo, reply.commentCreator?.name || "")}
                              </Avatar>
                              <Box sx={{ backgroundColor: "#f0f2f5", p: 1, borderRadius: 2, flexGrow: 1 }}>
                                <Typography variant="caption" fontWeight={700} display="block">
                                  {reply.commentCreator?.name || "User"}
                                </Typography>
                                {reply.content && (
                                  <Typography variant="body2">{reply.content}</Typography>
                                )}
                                {reply.image && (
                                  <Box
                                    component="img"
                                    src={reply.image}
                                    alt="reply image"
                                    sx={{ maxWidth: "100%", maxHeight: 150, borderRadius: 2, mt: 1, display: "block" }}
                                  />
                                )}
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Typography variant="caption" color="text.secondary" align="center" display="block">
                No comments yet. Be the first to comment!
              </Typography>
            )}
          </Stack>

         {!isComment && localComments.length > 0 && (
  <Box sx={{ mt: 2, textAlign: "center" }}>
    <Button 
      component={Link} 
      href={`/singlepost/${posts._id}`} 
      variant="text" 
      size="small"
      sx={{ textTransform: "none" }}
    >
      View all {localComments.length} comments in details page →
    </Button>
  </Box>
)}
        </Box>
      </Collapse>

      {/* Dialog تعديل البوست */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle>Update Post</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button onClick={handleUpdatePost} variant="contained" disabled={updating}>
            {updating ? "Updating..." : "Update"}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}