"use client";

import { State, AppDispatch } from "@/lib/store";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getBookmarks } from "@/lib/userslice";
import Loading from "../loading";
import { Typography, Box, Paper } from "@mui/material";
import Posts from "../_posts/page";

export default function BookmarksPage() {
  const { bookmarks, isLoading } = useSelector((state: State) => state.user);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(getBookmarks());
  }, [dispatch]);

  if (isLoading) return <Loading />;

  return (
    <Box sx={{ width: { xs: "95%", sm: "80%", md: "600px" }, mx: "auto", py: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold", textAlign: "left" }}>
        Saved Bookmarks
      </Typography>

      {bookmarks && bookmarks.length > 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {bookmarks.map((post: any) => (
            <Posts key={post._id} posts={post} isComment={false} />
          ))}
        </Box>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: 5,
            textAlign: "center",
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            bgcolor: "#ffffff",
          }}
        >
          <Typography variant="h6" color="text.secondary" fontWeight="500" gutterBottom>
            No bookmarks saved yet 📑
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Posts you save will show up here.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}