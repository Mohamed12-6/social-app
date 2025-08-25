"use client";
import { State } from "@/lib/store";
import { Box, Button, CircularProgress, Paper, TextField } from "@mui/material";
import { useFormik } from 'formik';
import { useDispatch, useSelector } from "react-redux";
import { setError, setLoading, setToken } from "@/lib/loginslice";
import { useRouter } from "next/navigation";

export default function Login() {
    const isloading = useSelector((state: State) => state.login.isloading);
    const dispatch = useDispatch();
const router=useRouter()

    async function handleLogin(values: { email: string, password: string }) {
        dispatch(setLoading())
        const response = await fetch(`https://linked-posts.routemisr.com/users/signin`, {
            method: 'POST',
            body: JSON.stringify(values),
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const data = await response.json();
        console.log(data);
      

        if (response.ok) {
            dispatch(setToken(data))
            router.push("/")
        }else{
            dispatch(setError(data.error))
        }
    }


    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        onSubmit: handleLogin
    });

    return (
        <Box sx={{ mt: 7, width: "85%", mx: "auto", p: 4 }}>
            <Paper elevation={10} sx={{ p: 2, m: 3 }}>
                <form onSubmit={formik.handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "1rem" }}>
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
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40px' }}>
                        {isloading ? <CircularProgress size="30px" /> : <Button variant="contained" type="submit">Login</Button>}
                    </Box>
                </form>
            </Paper>
        </Box>
    );
}