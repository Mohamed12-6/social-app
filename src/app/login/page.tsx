"use client";
import { Box, Button, CircularProgress, Paper, TextField, Typography } from "@mui/material";
import { useFormik } from 'formik';
import { useDispatch, useSelector } from "react-redux";
import { setError, setLoading, setToken } from "@/lib/loginslice";
import { useRouter } from "next/navigation";
import { State } from "@/lib/store";
import Link from "next/link";

export default function Login() {
    const isloading = useSelector((state: State) => state.login.isloading);
    const dispatch = useDispatch();
    const router = useRouter();

    async function handleLogin(values: { email: string, password: string }) {
        dispatch(setLoading());
        
        try {
            const response = await fetch(`https://route-posts.routemisr.com/users/signin`, {
                method: 'POST',
                body: JSON.stringify(values),
                headers: { 'Content-Type': 'application/json' }
            });
            
            const data = await response.json();
            console.log("Login Response:", data);

            if (response.ok) {
                const token = data.token || data.data?.token;
                const message = data.message || "Login successful";

                if (!token) {
                    dispatch(setError("No token received from server"));
                    return;
                }

                dispatch(setToken({ token, message }));
                router.push("/");
            } else {
                dispatch(setError(data.error || data.message || "Login failed"));
            }
        } catch (err) {
            dispatch(setError("Network error, please try again."));
        }
    }

    const formik = useFormik({
        initialValues: { email: "", password: "" },
        onSubmit: handleLogin
    });

    return (
        <Box sx={{ mt: 7, width: { xs: "95%", md: "50%" }, mx: "auto", p: 2 }}>
            <Paper elevation={10} sx={{ p: 3 }}>
                <Typography variant="h5" align="center" fontWeight="bold" sx={{ mb: 2 }}>
                    Login
                </Typography>
                <form onSubmit={formik.handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <TextField
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.email}
                        id="email"
                        label="Email"
                        variant="filled"
                        type="email"
                        name="email"
                    />
                    <TextField
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.password}
                        id="password"
                        label="Password"
                        variant="filled"
                        type="password"
                        name="password"
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        {isloading ? (
                            <CircularProgress size="30px" />
                        ) : (
                            <Button fullWidth variant="contained" type="submit" size="large">
                                Login
                            </Button>
                        )}

                        {/* 👈 رابط الذهاب إلى صفحة الـ Sign Up */}
                        <Typography variant="body2" color="text.secondary">
                            Don't have an account?{" "}
                            <Typography
                                component={Link}
                                href="/register"
                                variant="body2"
                                sx={{ color: "primary.main", fontWeight: "bold", textDecoration: "none" }}
                            >
                                Sign Up
                            </Typography>
                        </Typography>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
}