"use client";
import { Register } from '@/interfaces/state';
import { Box, Button, MenuItem, Paper, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import React from 'react';
import * as yup from "yup";
import { useDispatch } from 'react-redux';
import { setError } from '@/lib/loginslice';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function SignUp() {
    const router = useRouter();
    const [photoFile, setPhotoFile] = React.useState<File | null>(null);
    const dispatch = useDispatch();

    // 💡 تعديل الـ Validation Schema لإضافة شرط الـ username المظبوط
    const validationSchema = yup.object({
        name: yup.string().required("Name is required").min(4).max(20),
        username: yup
            .string()
            .required("Username is required")
            .matches(
                /^[a-z0-9_]{3,30}$/,
                "Username must be lowercase letters, numbers, or underscores without spaces (3-30 chars)."
            ),
        email: yup.string().required("Email is required").email("Email is not valid"),
        gender: yup.string().required("Gender is required"),
        dateOfBirth: yup.string().required("Date of birth is required"),
        password: yup
            .string()
            .required("Password is required")
            .matches(
                /^[A-Z][a-z0-9]{5,20}/,
                "Password must start with an uppercase letter and be between 6 and 20 characters long."
            ),
        rePassword: yup
            .string()
            .required("Repassword is required")
            .oneOf([yup.ref("password")], "Passwords must match")
    });

    async function onSubmit(values: Register) {
        try {
            // تنظيف المسافات من الأطراف احتياطياً
            const sanitizedValues = {
                ...values,
                username: values.username.trim()
            };

            const response = await fetch(`https://route-posts.routemisr.com/users/signup`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sanitizedValues) 
            });
            const data = await response.json();

            if (response.ok || data.message === "account created" || data.message === "success" || data.success) {
                const token = data.token || data.data?.token;

                if (token && photoFile) {
                    const formData = new FormData();
                    formData.append("photo", photoFile);

                    const uploadRes = await fetch(`https://route-posts.routemisr.com/users/upload-photo`, {
                        method: "PUT",
                        headers: { "token": token },
                        body: formData
                    });

                    const uploadData = await uploadRes.json();
                    if (uploadData.data?.photo) {
                        localStorage.setItem("userPhoto", uploadData.data.photo);
                    }
                }
toast.success("Account created successfully! 🎉");
                router.push("/login");
            } else {
                const errorMsg = data.message || data.errors || "Signup failed";
                dispatch(setError(errorMsg));
            }
        } catch (error: any) {
            dispatch(setError("Network error, please try again."));
        }
    }

    const { handleBlur, handleChange, handleSubmit, touched, errors, values } = useFormik({
        initialValues: {
            name: "",
            username: "",
            email: "",
            password: "",
            rePassword: "",
            dateOfBirth: "",
            gender: ""
        },
        onSubmit: onSubmit,
        validationSchema: validationSchema 
    });

    return (
        <Box sx={{ mt: 3, mb: 5, width: { xs: "95%", md: "50%" }, mx: "auto", p: 2 }}>
            <Paper elevation={10} sx={{ p: 3 }}>
                <Typography variant="h5" align="center" fontWeight="bold" sx={{ mb: 2 }}>
                    Sign Up
                </Typography>

                <form style={{ display: "flex", flexDirection: "column", gap: "18px" }} onSubmit={handleSubmit}>
                    
                    {/* 📸 Upload Photo */}
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <Button variant="outlined" component="label" color="primary">
                            {photoFile ? photoFile.name : "Upload Profile Photo (Optional)"}
                            <input 
                                type="file" 
                                hidden 
                                accept="image/*" 
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setPhotoFile(e.target.files[0]);
                                    }
                                }} 
                            />
                        </Button>
                    </Box>

                    {/* Name */}
                    <TextField
                        label="Name"
                        variant="filled"
                        type='text'
                        name='name'
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.name}
                    />
                    {errors.name && touched.name && (
                        <Typography sx={{ color: "red", fontSize: "0.85rem" }}>{errors.name}</Typography>
                    )}

                    {/* Username مع الإيرور تحته مباشرة */}
                    <TextField
                        label="Username (e.g. mohamed_osama)"
                        variant="filled"
                        type='text'
                        name='username'
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.username}
                    />
                    {errors.username && touched.username && (
                        <Typography sx={{ color: "red", fontSize: "0.85rem" }}>
                            {errors.username}
                        </Typography>
                    )}

                    {/* Email */}
                    <TextField
                        label="Email"
                        variant="filled"
                        type='email'
                        name='email'
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.email}
                    />
                    {errors.email && touched.email && (
                        <Typography sx={{ color: "red", fontSize: "0.85rem" }}>{errors.email}</Typography>
                    )}

                    {/* Date of Birth */}
                    <TextField
                        variant="filled"
                        type='date'
                        name='dateOfBirth'
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.dateOfBirth}
                    />
                    {errors.dateOfBirth && touched.dateOfBirth && (
                        <Typography sx={{ color: "red", fontSize: "0.85rem" }}>{errors.dateOfBirth}</Typography>
                    )}

                    {/* Gender */}
                    <TextField
                        select
                        label="Gender"
                        variant="filled"
                        name="gender"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.gender}
                    >
                        <MenuItem value="male">Male</MenuItem>
                        <MenuItem value="female">Female</MenuItem>
                    </TextField>
                    {errors.gender && touched.gender && (
                        <Typography sx={{ color: "red", fontSize: "0.85rem" }}>{errors.gender}</Typography>
                    )}

                    {/* Password */}
                    <TextField
                        label="Password"
                        variant="filled"
                        type='password'
                        name='password'
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.password}
                    />
                    {errors.password && touched.password && (
                        <Typography sx={{ color: "red", fontSize: "0.85rem" }}>{errors.password}</Typography>
                    )}

                    {/* Repassword */}
                    <TextField
                        label="Repassword"
                        variant="filled"
                        type='password'
                        name='rePassword'
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.rePassword}
                    />
                    {errors.rePassword && touched.rePassword && (
                        <Typography sx={{ color: "red", fontSize: "0.85rem" }}>{errors.rePassword}</Typography>
                    )}

                    <Button fullWidth size="large" variant="contained" type='submit'>
                        Sign Up
                    </Button>

                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                        Already have an account?{" "}
                        <Typography
                            component={Link}
                            href="/login"
                            variant="body2"
                            sx={{ color: "primary.main", fontWeight: "bold", textDecoration: "none" }}
                        >
                            Login
                        </Typography>
                    </Typography>

                </form>
            </Paper>
        </Box>
    );
}