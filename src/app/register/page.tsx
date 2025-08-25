"use client";
import { Register } from '@/interfaces/state';
import { Box, Button, MenuItem, Paper, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import React from 'react';
import * as yup from "yup";

export default function SignUp() {
    const router = useRouter();

    const validationSchema = yup.object({
        name: yup.string().required("Name is required").min(4).max(20),
        email: yup.string().required("Email is required").email("Email is not valid"),
        gender: yup.string().required("Gender is required"),
        dateOfBirth: yup.string().required("Date of birth is required"),
        password: yup.string().required("Password is required").matches(/^[A-Z][a-z0-9]{5,20}/, "Password must start with an uppercase letter and be between 6 and 20 characters long."),
        rePassword: yup.string().required("Repassword is required").oneOf([yup.ref("password")], "Passwords must match")
    });

    async function onSubmit(values: Register) {
        console.log(values);
        const response = await fetch(`https://linked-posts.routemisr.com/users/signup`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(values) 
        });
        const data = await response.json();
        console.log(data);
        if (data.message=="success") {

            router.push("/login");
        } 
        return data;
    }

    const { handleBlur, handleChange, handleSubmit, touched, errors, values } = useFormik({
        initialValues: {
            name: "",
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
        <Box sx={{ mt: 1, width: "85%", mx: "auto", p: 4 }}>
            <Paper elevation={10} sx={{ p: 2 }}>
                <form style={{ display: "flex", flexDirection: "column", gap: "20px" }} onSubmit={handleSubmit}>
                    <TextField
                        id="filled-basic"
                        label="Name"
                        variant="filled"
                        type='text'
                        name='name'
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.name}
                    />
                    {errors.name && touched.name && <Typography sx={{ color: "red" }}>{errors.name}</Typography>}

                    <TextField
                        id="filled-basic"
                        label="Email"
                        variant="filled"
                        type='email'
                        name='email'
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.email}
                    />
                    {errors.email && touched.email && <Typography sx={{ color: "red" }}>{errors.email}</Typography>}

                    <TextField
                        id="filled-basic"
                        variant="filled"
                        type='date'
                        name='dateOfBirth'
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.dateOfBirth}
                    />
                    <TextField
                        id="gender-select"
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

                    <TextField
                        id="filled-basic"
                        label="Password"
                        variant="filled"
                        type='password'
                        name='password'
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.password}
                    />
                    {errors.password && touched.password && <Typography sx={{ color: "red" }}>{errors.password}</Typography>}

                    <TextField
                        id="filled-basic"
                        label="Repassword"
                        variant="filled"
                        type='password'
                        name='rePassword'
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.rePassword}
                    />
                    {errors.rePassword && touched.rePassword && <Typography sx={{ color: "red" }}>{errors.rePassword}</Typography>}

                    <Button variant="contained" type='submit'>Sign Up</Button>
                </form>
            </Paper>
        </Box>
    );
}