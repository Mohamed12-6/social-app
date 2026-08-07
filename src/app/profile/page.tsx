"use client";

import { State, AppDispatch } from "@/lib/store";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserPost } from "@/lib/postslice";
import { getMyProfile } from "@/lib/userslice";
import Loading from "../loading";
import Posts from "../_posts/page";
import { Post } from "@/interfaces/state";
import { Box, Avatar, Typography, Paper, Chip, Container, Divider } from "@mui/material";
import PostAddIcon from '@mui/icons-material/PostAdd';

export default function Profile() {
  const { isLoading: postsLoading, userPosts } = useSelector((state: State) => state.post);
  const { isLoading: userLoading, myProfile } = useSelector((state: State) => state.user);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(getMyProfile());
  }, [dispatch]);

  useEffect(() => {
    if (myProfile?._id) {
      dispatch(getUserPost(myProfile._id));
    }
  }, [dispatch, myProfile?._id]);

  const isLoading = postsLoading || userLoading;

  if (isLoading) return <Loading />;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* 👤 كارت البروفايل */}
      {myProfile && (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            textAlign: "center",
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
            boxShadow: "0 8px 24px rgba(0,0,0,0.04)"
          }}
        >
          {/* الصورة الشخصية */}
          <Avatar
            src={myProfile.photo}
            alt={myProfile.name}
            sx={{
              width: 110,
              height: 110,
              mx: "auto",
              mb: 2,
              border: "3px solid",
              borderColor: "primary.main",
              boxShadow: "0 4px 14px rgba(0,0,0,0.12)"
            }}
          />

          {/* اسم المستخدم والإيميل */}
          <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: "-0.5px" }}>
            {myProfile.name}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.5 }}>
            {myProfile.email}
          </Typography>

          {/* البايو (Bio) */}
          {myProfile.bio && (
            <Typography
              variant="body2"
              color="text.primary"
              sx={{
                maxWidth: 500,
                mx: "auto",
                my: 2,
                p: 1.5,
                borderRadius: 2,
                backgroundColor: "action.hover",
                fontStyle: "italic"
              }}
            >
              "{myProfile.bio}"
            </Typography>
          )}

          {/* المتابعين و المتابِعين */}
          <Box sx={{ display: "flex", justifyContent: "center", gap: 1.5, mt: 3 }}>
            <Chip
              label={`${myProfile.followersCount || 0} Followers`}
              variant="outlined"
              color="primary"
              sx={{ fontWeight: 600, px: 1 }}
            />
            <Chip
              label={`${myProfile.followingCount || 0} Following`}
              variant="outlined"
              color="primary"
              sx={{ fontWeight: 600, px: 1 }}
            />
          </Box>
        </Paper>
      )}

      <Divider sx={{ mb: 4 }}>
        <Typography variant="caption" color="text.secondary" sx={{ px: 1, fontWeight: 600 }}>
          MY POSTS ({userPosts?.length || 0})
        </Typography>
      </Divider>

      {/* 📝 قائمة البوستات */}
      <Box sx={{ maxWidth: 650, mx: "auto" }}>
        {userPosts?.length > 0 ? (
          userPosts.map((post: Post) => (
            <Posts key={post._id} posts={post} isComment={true} />
          ))
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 5,
              textAlign: "center",
              borderRadius: 3,
              border: "1px dashed",
              borderColor: "divider",
              backgroundColor: "transparent"
            }}
          >
            <PostAddIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1, opacity: 0.6 }} />
            <Typography variant="h6" color="text.secondary" fontWeight={500}>
              No posts created yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Share your thoughts with the world!
            </Typography>
          </Paper>
        )}
      </Box>
    </Container>
  );
}