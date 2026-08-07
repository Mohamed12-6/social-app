"use client";

import { State, AppDispatch } from "@/lib/store";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserPost } from "@/lib/postslice";
import { getMyProfile } from "@/lib/userslice";
import Loading from "../loading";
import Posts from "../_posts/page";
import { Post } from "@/interfaces/state";
import { 
  Box, 
  Avatar, 
  Typography, 
  Paper, 
  Chip, 
  Container, 
  Divider, 
  IconButton, 
  CircularProgress 
} from "@mui/material";
import PostAddIcon from '@mui/icons-material/PostAdd';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import toast from "react-hot-toast";

export default function Profile() {
  const { isLoading: postsLoading, userPosts } = useSelector((state: State) => state.post);
  const { isLoading: userLoading, myProfile } = useSelector((state: State) => state.user);
  const token = useSelector((state: State) => state.login.token);
  const dispatch = useDispatch<AppDispatch>();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoKey, setPhotoKey] = useState(Date.now());

  useEffect(() => {
    dispatch(getMyProfile());
  }, [dispatch]);

  useEffect(() => {
    if (myProfile?._id) {
      dispatch(getUserPost(myProfile._id));
    }
  }, [dispatch, myProfile?._id]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const authToken = token || localStorage.getItem("token");
    if (!authToken) {
      toast.error("Session expired, please login again");
      return;
    }

    const cleanToken = authToken.replace(/^"(.*)"$/, '$1');
    const formData = new FormData();
    formData.append("photo", file);

    try {
      setIsUploadingPhoto(true);

      const res = await fetch(`https://route-posts.routemisr.com/users/upload-photo`, {
        method: "PUT",
        headers: {
          token: cleanToken,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Profile photo uploaded successfully! 🎉");
        setPhotoKey(Date.now());
        dispatch(getMyProfile());
      } else {
        toast.error(data.message || "Failed to upload photo");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while uploading photo");
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const isLoading = postsLoading || userLoading;

  if (isLoading) return <Loading />;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
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
          <Box sx={{ position: "relative", width: 110, height: 110, mx: "auto", mb: 2 }}>
            <Avatar
              src={myProfile.photo ? `${myProfile.photo}?t=${photoKey}` : undefined}
              alt={myProfile.name}
              sx={{
                width: 110,
                height: 110,
                border: "3px solid",
                borderColor: "primary.main",
                boxShadow: "0 4px 14px rgba(0,0,0,0.12)"
              }}
            />

            <IconButton
              color="primary"
              disabled={isUploadingPhoto}
              onClick={() => fileInputRef.current?.click()}
              sx={{
                position: "absolute",
                bottom: 0,
                right: 0,
                backgroundColor: "background.paper",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                "&:hover": { backgroundColor: "action.hover" },
                p: 0.8
              }}
            >
              {isUploadingPhoto ? (
                <CircularProgress size={20} color="primary" />
              ) : (
                <PhotoCameraIcon fontSize="small" />
              )}
            </IconButton>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              style={{ display: "none" }}
            />
          </Box>

          <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: "-0.5px" }}>
            {myProfile.name}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.5 }}>
            {myProfile.email}
          </Typography>

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