"use client";

import { State, AppDispatch } from "@/lib/store";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFollowSuggestions, followUnfollowUser } from "@/lib/userslice";
import { Box, Avatar, Button, Paper, Typography, List, ListItem, ListItemAvatar, ListItemText, Chip } from "@mui/material";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import Link from "next/link";
import toast from "react-hot-toast"; // 👈 استيراد الـ Toast

export default function FollowSuggestions() {
  const { followSuggestions, isLoading } = useSelector((state: State) => state.user);
  const dispatch = useDispatch<AppDispatch>();

  // 📌 State لمعرفة الحسابات اللي اتعملها Follow محلياً { userId: boolean }
  const [followingMap, setFollowingMap] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    dispatch(getFollowSuggestions());
  }, [dispatch]);

  const handleToggleFollow = async (userId: string, userName: string) => {
    const isCurrentlyFollowing = !!followingMap[userId];

    // 1. التحديث الفوري في الـ State المحلية (Optimistic Update)
    setFollowingMap((prev) => ({
      ...prev,
      [userId]: !isCurrentlyFollowing,
    }));

    // 2. إظهار الـ Toast مباشرةً
    if (isCurrentlyFollowing) {
      toast.success(`Unfollowed ${userName}`);
    } else {
      toast.success(`Followed ${userName}`);
    }

    // 3. إرسال الأكشن للـ Redux / API
    try {
      await dispatch(followUnfollowUser(userId)).unwrap();
    } catch (error) {
      // لو حصل خطأ في الـ API نرجع الـ State لحالتها القديمة ونظهر خطأ
      setFollowingMap((prev) => ({
        ...prev,
        [userId]: isCurrentlyFollowing,
      }));
      toast.error("Failed to update follow status.");
    }
  };

  if (isLoading) return null;

  return (
    <Paper elevation={2} sx={{ p: 2, width: "100%", position: { md: "sticky" }, top: 20, borderRadius: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
        Who to follow
      </Typography>
      
      <List dense>
        {followSuggestions?.map((user) => {
          const isFollowing = !!followingMap[user._id];
          const isPhotoValid = Boolean(user.photo && user.photo.trim() !== "" && !user.photo.includes("undefined"));

          return (
            <ListItem
              key={user._id}
              secondaryAction={
                <Button
                  size="small"
                  variant={isFollowing ? "outlined" : "contained"}
                  color={isFollowing ? "inherit" : "primary"}
                  startIcon={isFollowing ? <PersonRemoveIcon /> : <PersonAddIcon />}
                  onClick={() => handleToggleFollow(user._id, user.name)}
                  sx={{ 
                    textTransform: "none", 
                    borderRadius: 2,
                    minWidth: "95px" 
                  }}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </Button>
              }
            >
              <ListItemAvatar>
                <Avatar src={isPhotoValid ? user.photo : undefined}>
                  {!isPhotoValid && (user.name?.slice(0, 1) || "U")}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Link href={`/user/${user._id}`} style={{ textDecoration: "none", color: "inherit", fontWeight: "bold" }}>
                    {user.name}
                  </Link>
                }
                secondary={
                  <Box component="span" sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    <Chip 
                      label={`${(user.followersCount || 0) + (isFollowing ? 1 : 0)} followers`} 
                      size="small" 
                      variant="outlined" 
                    />
                  </Box>
                }
              />
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
}