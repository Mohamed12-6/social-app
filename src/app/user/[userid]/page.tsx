"use client"

import { State, AppDispatch } from "@/lib/store";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "next/navigation";
import { getUserPost } from "@/lib/postslice";
import { getUserProfile, followUnfollowUser, clearUserProfile } from "@/lib/userslice";
import Loading from "../../loading";
import Posts from "../../_posts/page";
import { Post } from "@/interfaces/state";
import { Box, Avatar, Typography, Paper, Chip, Button, Divider } from "@mui/material";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';

export default function UserProfilePage() {
  const params = useParams();
  const userId = params?.userid as string;

  const { isLoading: postsLoading, userPosts } = useSelector((state: State) => state.post);
  const { isLoading: userLoading, userProfile } = useSelector((state: State) => state.user);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (userId) {
      dispatch(getUserProfile(userId));
      dispatch(getUserPost(userId));
    }
    return () => { dispatch(clearUserProfile()); };
  }, [dispatch, userId]);

  const handleFollow = () => {
    if (userId) dispatch(followUnfollowUser(userId));
  };

  const isLoading = postsLoading || userLoading;

  return (
    <>
      {isLoading ? <Loading /> : (
        <>
          {userProfile && (
            <Paper elevation={3} sx={{ width: { xs: "90%", md: "30%" }, mx: "auto", mt: 3, p: 3, textAlign: "center" }}>
              <Avatar src={userProfile.photo} alt={userProfile.name} sx={{ width: 100, height: 100, mx: "auto", mb: 2 }} />
              
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, mb: 1 }}>
                <Typography variant="h5" fontWeight="bold">{userProfile.name}</Typography>
                
                {/* ✅ زرار Follow/Unfollow جنب الاسم */}
                <Button
                  variant="contained"
                  size="small"
                  color={userProfile.isFollowed ? "error" : "primary"}
                  startIcon={userProfile.isFollowed ? <PersonRemoveIcon /> : <PersonAddIcon />}
                  onClick={handleFollow}
                >
                  {userProfile.isFollowed ? "Unfollow" : "Follow"}
                </Button>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                @{userProfile.username || "user"}
              </Typography>

              <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 2 }}>
                <Chip label={`${userProfile.followersCount || 0} Followers`} color="primary" />
                <Chip label={`${userProfile.followingCount || 0} Following`} color="secondary" />
              </Box>
            </Paper>
          )}

          <Divider sx={{ my: 3, width: "30%", mx: "auto" }} />

          {userPosts?.length > 0 ? (
            userPosts.map((post: Post) => <Posts key={post._id} posts={post} isComment={true} />)
          ) : (
            <Typography sx={{ textAlign: "center", mt: 4, color: "text.secondary" }}>No posts yet</Typography>
          )}
        </>
      )}
    </>
  );
}