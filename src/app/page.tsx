
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getAllPost } from "@/lib/postslice";
import { setToken } from "@/lib/loginslice";
import Loading from "./loading";
import Posts from "./_posts/page";
import { Post } from "@/interfaces/state";
import { AppDispatch, State } from "@/lib/store";

export default function Home() {
    const router = useRouter();
    // const dispatch = useDispatch();
      const dispatch = useDispatch<AppDispatch>(); 
    const { posts, isLoading, error } = useSelector((state: State) => state.post);

    useEffect(() => {
        const token = localStorage.getItem("Token");
        if (!token) {
            router.push("/login");
        } else {
            dispatch(setToken({ token }));
            dispatch(getAllPost());
        }
    }, [dispatch, router]);

    if (isLoading) return <Loading />;
    if (error) return <div>Error: {error}</div>;

    return (

        <>
        { posts.length > 0 && posts.map((post:Post)=><Posts isComment={false} key={post._id} posts={post}/>)}

        </>
    );
}



