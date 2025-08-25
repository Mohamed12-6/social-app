"use client";
import { Box, Button, Paper, TextField } from "@mui/material";

import { useRouter } from "next/navigation";
import { FormEvent } from "react";
import toast from "react-hot-toast";

export default function CreatePost() {

const router=useRouter()

async function handleAddPost(e:FormEvent) {
    e.preventDefault();

    const form=e.target as HTMLFormElement

    const formdata=new FormData();

    const img=form.image.files[0];

    const body= form.body.value

    formdata.append("body",body)
    formdata.append("image",img)

    const response=await fetch(`https://linked-posts.routemisr.com/posts`,{
        method:"POST",
        headers:{
            "token":`${localStorage.getItem("Token")}`
        },
        body:formdata
    })
    const data=await response.json()
    // console.log(data);

    toast.success(data.message)

    router.push('/profile')
}


    return (
        <Box sx={{ mt: 7, width: "85%", mx: "auto", p: 4 }}>
            <Paper elevation={10} sx={{ p: 2, m: 3 }}>
                <h2 style={{textAlign:"center"}}>Add your Post</h2>
                <form onSubmit={(e)=>{handleAddPost(e)}} style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "1rem" }}>
                    <TextField
                        id="body"
                        label="body"
                        variant="filled"
                        type="text"
                        name="body"
                    />
                    <TextField
                       
                        id="image"
                        label="image"
                        variant="filled"
                        type="file"
                        name="image"
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40px' }}>
                         <Button variant="contained" type="submit">ِِِAdd Post</Button>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
}