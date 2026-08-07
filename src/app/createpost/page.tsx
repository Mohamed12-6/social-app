"use client";
import { Box, Button, Paper, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/store";
import { getUserPost } from "@/lib/postslice";
import { getMyProfile } from "@/lib/userslice";

const BASE_URL = "https://route-posts.routemisr.com";

export default function CreatePost() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  async function handleAddPost(e: FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formdata = new FormData();

    const img = form.image.files[0];
    const body = form.body.value;

    if (!body || body.trim() === "") {
      toast.error("Post body is required");
      return;
    }

    formdata.append("body", body);
    if (img) formdata.append("image", img);

    const token = localStorage.getItem("Token");
    if (!token || token === "undefined") {
      toast.error("Please login first");
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/posts`, {
        method: "POST",
        headers: { "token": token },
        body: formdata
      });
      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Post created!");
        
        // ✅ نجيب الـ Profile عشان نعرف الـ user ID
        const profileRes = await fetch(`${BASE_URL}/users/profile-data`, {
          headers: { "token": token }
        });
        const profileData = await profileRes.json();
        const userId = profileData.data?.user?._id;
        
        // ✅ نعمل refresh للبوستات
        if (userId) {
          dispatch(getUserPost(userId));
        }
        
        router.push('/profile');
      } else {
        toast.error(data.message || "Failed to create post");
      }
    } catch (err: any) {
      toast.error("Network error: " + err.message);
    }
  }

  return (
    <Box sx={{ mt: 7, width: "85%", mx: "auto", p: 4 }}>
      <Paper elevation={10} sx={{ p: 2, m: 3 }}>
        <h2 style={{ textAlign: "center" }}>Add your Post</h2>
        <form onSubmit={handleAddPost} style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "1rem" }}>
          <TextField id="body" label="What's on your mind?" variant="filled" type="text" name="body" multiline rows={3} required />
          <TextField id="image" label="Upload Image (Optional)" variant="filled" type="file" name="image" InputLabelProps={{ shrink: true }} />
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40px' }}>
            <Button variant="contained" type="submit">Add Post</Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}