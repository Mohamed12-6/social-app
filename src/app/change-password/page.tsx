"use client";

import { State } from "@/lib/store";
import { Box, Button, CircularProgress, Paper, TextField, Typography, Alert } from "@mui/material";
import { useFormik } from 'formik';
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setToken } from "@/lib/loginslice";

export default function ChangePassword() {
    const rawToken = useSelector((state: State) => state.login.token);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const dispatch = useDispatch();
    const router = useRouter();

    async function handleChangePassword(values: { password: string; newPassword: string }) {
        setLoading(true);
        setMessage(null);

        // 💡 1. سحب التوكين بالاسم المضبوط ("Token")
        let tokenString = rawToken || "";

        if (!tokenString && typeof window !== "undefined") {
            tokenString = localStorage.getItem("Token") || "";
        }

        console.log("FINAL TOKEN TO SEND:", tokenString);

        try {
            const response = await fetch(`https://route-posts.routemisr.com/users/change-password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'token': tokenString // 👈 التوكين السليم
                },
                body: JSON.stringify(values),
            });

            const data = await response.json();
            console.log("Change Password Response:", data);

            if (response.ok && (data.message === "password changed successfully" || data.token)) {
                setMessage({ type: 'success', text: "تم تغيير كلمة السر بنجاح!" });
                
                // 💡 2. إرسال الـ Payload بالشكل اللي الـ Slice متوقعه { token, message }
                const newToken = data.token;
                if (newToken) {
                    dispatch(setToken({
                        token: newToken,
                        message: "تم تحديث كلمة السر والتوكين بنجاح"
                    }));
                }

                setTimeout(() => {
                    router.push("/profile");
                }, 1500);
            } else {
                setMessage({ type: 'error', text: data.message || data.errors || "حدث خطأ أثناء تغيير كلمة السر" });
            }
        } catch (error) {
            setMessage({ type: 'error', text: "خطأ في الاتصال بالشبكة" });
        } finally {
            setLoading(false);
        }
    }

    const formik = useFormik({
        initialValues: {
            password: "",
            newPassword: "",
        },
        onSubmit: handleChangePassword
    });

    return (
        <Box sx={{ mt: 7, width: { xs: "95%", sm: "80%", md: "50%" }, mx: "auto", p: 2 }}>
            <Paper elevation={10} sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold", textAlign: "center" }}>
                    Change Password
                </Typography>

                {message && (
                    <Alert severity={message.type} sx={{ mb: 2 }}>
                        {message.text}
                    </Alert>
                )}

                <form onSubmit={formik.handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <TextField
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.password}
                        id="password"
                        name="password"
                        label="Current Password"
                        variant="filled"
                        type="password"
                        required
                    />
                    
                    <TextField
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.newPassword}
                        id="newPassword"
                        name="newPassword"
                        label="New Password"
                        variant="filled"
                        type="password"
                        required
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
                        {loading ? (
                            <CircularProgress size="30px" />
                        ) : (
                            <Button variant="contained" type="submit" fullWidth size="large">
                                Update Password
                            </Button>
                        )}
                    </Box>
                </form>
            </Paper>
        </Box>
    );
}