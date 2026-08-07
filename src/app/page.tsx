"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getAllPost } from "@/lib/postslice";
import { setToken } from "@/lib/loginslice";
import Loading from "./loading";
import Posts from "./_posts/page";
import FollowSuggestions from "./_components/follow-suggestions/page";
import { Post } from "@/interfaces/state";
import { AppDispatch, State } from "@/lib/store";
import { Box, Pagination, Stack } from "@mui/material";

export default function Home() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { posts, isLoading, error } = useSelector((state: State) => state.post);
    const token = useSelector((state: State) => state.login.token);

    // --- State للـ Pagination ---
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 10; // عدد البوستات في كل صفحة

    useEffect(() => {
        const storedToken = localStorage.getItem("Token");
        if (!storedToken || storedToken === "undefined" || storedToken === "null") {
            router.push("/login");
            return;
        }
        if (!token) {
            dispatch(setToken({ token: storedToken, message: "Session restored" }));
        }
        dispatch(getAllPost());
    }, [dispatch, router, token]);

    // حساب البوستات المعروضة في الصفحة الحالية
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = posts?.slice(indexOfFirstPost, indexOfLastPost) || [];
    const totalPages = Math.ceil((posts?.length || 0) / postsPerPage);

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setCurrentPage(value);
        // التمرير لأعلى الصفحة عند تغيير رقم الصفحة
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (isLoading) return <Loading />;
    if (error) return (
        <div style={{ textAlign: "center", marginTop: "2rem", color: "red" }}>
            <h3>Error: {error}</h3>
            <button onClick={() => dispatch(getAllPost())}>Retry</button>
        </div>
    );

    return (
        // كبرنا maxWidth لـ 1500px وعرض البوستات لـ 72% عشان الصندوق يكبر أكتر زي ما طلبت
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4, maxWidth: "1500px", mx: "auto", mt: 2, px: 2 }}>
            {/* Left Sidebar: Follow Suggestions */}
            <Box sx={{ width: { xs: "100%", md: "28%", lg: "25%" }, order: { xs: 2, md: 1 } }}>
                <FollowSuggestions />
            </Box>
            
            {/* Center: Posts Feed */}
            <Box sx={{ width: { xs: "100%", md: "72%", lg: "75%" }, order: { xs: 1, md: 2 } }}>
                {currentPosts?.length > 0 ? (
                    <Stack spacing={3}>
                        {/* عرض الـ 10 بوستات فقط الخواص بالصفحة الحالية */}
                        {currentPosts.map((post: Post) => (
                            <Posts isComment={false} key={post._id} posts={post} />
                        ))}

                        {/* أرقام الصفحات (1, 2, 3...) */}
                        {totalPages > 1 && (
                            <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
                                <Pagination
                                    count={totalPages}
                                    page={currentPage}
                                    onChange={handlePageChange}
                                    color="primary"
                                    size="large"
                                    shape="rounded"
                                />
                            </Box>
                        )}
                    </Stack>
                ) : (
                    <div style={{ textAlign: "center", marginTop: "2rem" }}>No posts found</div>
                )}
            </Box>
        </Box>
    );
}