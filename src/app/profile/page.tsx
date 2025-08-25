"use client"

import { State, AppDispatch } from "@/lib/store";
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { getUserPost } from "@/lib/postslice";
import Loading from "../loading";
import Posts from "../_posts/page";
import { Post } from "@/interfaces/state";

interface DecodedToken {
  user: string;   
  exp?: number;   
}

export default function Profile() {
  const { isLoading, posts } = useSelector((state: State) => state.post);
  const dispatch = useDispatch<AppDispatch>(); 

  useEffect(() => {
    const token = localStorage.getItem("Token");
    if (!token) return; 

    try {
      const decoded = jwtDecode<DecodedToken>(token); 
      console.log("Decoded token:", decoded);

      if (decoded.user) {
        dispatch(getUserPost(decoded.user));
      }
    } catch (error) {
      console.error("Invalid token:", error);
    }
  }, [dispatch]);

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        posts.length > 0 &&
        posts.map((post: Post) => (
          <Posts key={post._id} posts={post} isComment={true} />
        ))
      )}
    </>
  );
}
