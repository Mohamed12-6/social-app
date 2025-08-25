"use client"
import Posts from "@/app/_posts/page";
import Loading from "@/app/loading";
import { getSinglePost } from "@/lib/postslice";
import { AppDispatch, State } from "@/lib/store";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function SinglePost() {
  const params = useParams();
  const postid = params?.postid as string ; 

  const { isLoading, post } = useSelector((state: State) => state.post);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (postid) {
      dispatch(getSinglePost(postid)); 
    }
  }, [postid, dispatch]);

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        post && <Posts isComment={true} posts={post} />
      )}
    </>
  );
}
