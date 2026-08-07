"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, State } from "@/lib/store";
import { getSinglePost } from "@/lib/postslice";
import Posts from "@/app/_posts/page"; // استدعاء المكون المعدل
import { Box, Container, CircularProgress, Typography } from "@mui/material";

export default function SinglePostPage() {
  const params = useParams();
  const postId = params?.postid as string;

  const dispatch = useDispatch<AppDispatch>();
  const { post, isLoading, error } = useSelector((state: State) => state.post);

  // جلب بيانات البوست والتعليقات أول ما الصفة تفتح باستخدام الـ ID من الـ URL
  useEffect(() => {
    if (postId) {
      dispatch(getSinglePost(postId));
    }
  }, [dispatch, postId]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !post) {
    return (
      <Container maxWidth="sm" sx={{ mt: 5, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          {error || "Post not found!"}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      {/* إرسال البوست كاملاً وتفعيل خيار عرض كل التعليقات isComment={true} */}
      <Posts posts={post} isComment={true} />
    </Container>
  );
}