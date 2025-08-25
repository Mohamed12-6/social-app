"use client"


import * as React from 'react';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { red } from '@mui/material/colors';
import ShareIcon from '@mui/icons-material/Share';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CommentIcon from '@mui/icons-material/Comment';
import { Comment, Post } from '@/interfaces/state';
import Image from 'next/image';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from "next/navigation";
import { Button, TextField } from '@mui/material';
import toast from 'react-hot-toast';

interface ExpandMoreProps extends IconButtonProps {
    expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
    const { ...other } = props;
    return <IconButton {...other} />;
})(({ theme }) => ({
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    }),
    variants: [
        {
            props: ({ expand }) => !expand,
            style: {
                transform: 'rotate(0deg)',
            },
        },
        {
            props: ({ expand }) => !!expand,
            style: {
                transform: 'rotate(180deg)',
            },
        },
    ],
}));


export default function Posts({ posts, isComment = false }: { posts: Post, isComment: boolean }) {
    // console.log("Post data:", posts);

    const [expanded, setExpanded] = React.useState(false);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };


    const [loggedin, setLoggedin] = React.useState("");
    // const [comments, setComments] = React.useState([]);
const [comments, setComments] = React.useState<Comment[]>([]);

    const router=useRouter();

    React.useEffect(() => {
        const token = localStorage.getItem("Token");
        if (token) {
            const decoded = jwtDecode<{ user: string }>(token);
            setLoggedin(decoded.user);
        }
    }, []);

    async function deletePost(id: string) {

            const response = await fetch(`https://linked-posts.routemisr.com/posts/${id}`, {
                method: 'DELETE',
                headers: {
                    'token': `${localStorage.getItem("Token")}`
                }
            });
            const data = await response.json();
            console.log(data);
            router.refresh()
            return data;
        
    }
    async function deleteComment(id: string) {

        const response = await fetch(`https://linked-posts.routemisr.com/comments/${id}`, {
            method: 'DELETE',
            headers: {
                'token': `${localStorage.getItem("Token")}`
            }
        });
        const data = await response.json();
        console.log(data);
        if (data.message==="success") {

            toast.success("Comment deleted successfully!");
            setComments(comments.filter(comment => comment._id !== id));

            router.refresh()

        } else {
            toast.error("Failed to delete comment.");
            router.refresh()

        }
        return data;
    
}





    async function handleComment(e:React.FormEvent) {
        e.preventDefault();

        const form=e.target as HTMLFormElement

        const values={
            content:form.comment.value,
            post:posts.id
        }

        const response=await fetch(`https://linked-posts.routemisr.com/comments`,{
            method:"POST",
            body:JSON.stringify(values),
            headers:{
                'Content-Type': 'application/json',
                'token': `${localStorage.getItem("Token")}`
            },
        })
        const data=await response.json()

        toast.success(data.message)
        console.log(data)
        setComments(data.comments)
        form.comment.value=""
    }
    return (
        <Card sx={{
            width: "30%", mx: "auto", my: 5,
            p: 2,
            // display: 'flex',
            // flexDirection: 'column'
        }}>
            <CardHeader
                avatar={
                    <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
                        <Image src={posts.user.photo} alt={posts.user.name} style={{ width: "100%", height: "auto" }} width={40} height={40} />
                    </Avatar>
                }
                action={
                    loggedin == posts.user._id ? <IconButton onClick={() => deletePost(posts._id)} aria-label="settings">
                        <MoreVertIcon />
                    </IconButton>
                        : ""
                }
                title={posts.user.name}
                subheader={posts.createdAt.split("T", 1)}
            />

            <CardContent>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    This impressive paella is a perfect party dish and a fun meal to cook
                    together with your guests. Add 1 cup of frozen peas along with the mussels,
                    if you like.
                </Typography>
            </CardContent>

            {posts.image && <Image src={posts.image} alt={`${posts.body}`} width={400} height={300} style={{ width: "100%", height: "auto" }} />}
            <CardActions sx={{ width: ":50%", mx: "auto", display: "flex", justifyContent: "space-between" }}>
                <IconButton aria-label="add to favorites">
                    <ThumbUpIcon />
                </IconButton>

                <ExpandMore
                    expand={expanded}
                    onClick={handleExpandClick}
                    aria-expanded={expanded}
                    aria-label="show more"
                >
                    <CommentIcon />
                </ExpandMore>


                <IconButton aria-label="share">
                    <ShareIcon />
                </IconButton>




            </CardActions>

            <Collapse in={expanded} timeout="auto" unmountOnExit>
                {posts.comments.length > 0 && isComment == false ?
                    <CardContent sx={{ backgroundColor: "#eee", my: 2 }}>
                        <CardHeader
                            avatar={
                                <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
                                    {!posts.comments[0].commentCreator.photo.includes("undefined")
                                        ?
                                        <Image src={posts.comments[0].commentCreator.photo} alt={posts.comments[0].commentCreator.name} style={{ width: "100%", height: "auto" }} width={40} height={40} />
                                        :
                                        posts.comments[0].commentCreator.name.slice(0, 1)}

                                </Avatar>
                            }
                            action={
                                loggedin == posts.user._id ? <IconButton onClick={() => deletePost(posts._id)} aria-label="settings">
                                    <MoreVertIcon />
                                </IconButton>
                                    : ""
                            }
                            title={posts.comments[0].commentCreator.name}
                            subheader={posts.comments[0].createdAt.split("T", 1)}
                        />
                        <Typography sx={{ marginBottom: 2, width: "80%", mx: "auto" }}>
                            {posts.comments[0].content}
                        </Typography>
                        <Link href={`/singlepost/${posts.id}`} style={{ color: "#09c", width: "100%", display: "block", textAlign: "right" }}>View all comments</Link>
                    </CardContent> : posts.comments.length > comments.length && isComment == true ? posts.comments.map((comment: Comment) => <>
                        <CardContent key={comment._id} sx={{ backgroundColor: "#eee", my: 2 }}>
                            <CardHeader
                                avatar={
                                    <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
                                        {!comment.commentCreator.photo.includes("undefined")
                                            ?
                                            <Image src={comment.commentCreator.photo} alt={comment.commentCreator.name} style={{ width: "100%", height: "auto" }} width={40} height={40} />
                                            :
                                            comment.commentCreator.name.slice(0, 1)}

                                    </Avatar>
                                }
                                action={
                                    <IconButton aria-label="settings">
                                        <MoreVertIcon />
                                    </IconButton>
                                }
                                title={comment.commentCreator.name}
                                subheader={comment.createdAt.split("T", 1)}
                            />
                            <Typography sx={{ marginBottom: 2, width: "80%", mx: "auto" }}>
                                {comment.content}
                            </Typography>
                        </CardContent>
                    </>):comments.map((comment: Comment) => <>
                        <CardContent key={comment._id} sx={{ backgroundColor: "#eee", my: 2 }}>
                            <CardHeader
                                avatar={
                                    <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
                                        {!comment.commentCreator.photo.includes("undefined")
                                            ?
                                            <Image src={comment.commentCreator.photo} alt={comment.commentCreator.name} style={{ width: "100%", height: "auto" }} width={40} height={40} />
                                            :
                                            comment.commentCreator.name.slice(0, 1)}

                                    </Avatar>
                                }
                               action={
                                loggedin == comment.commentCreator._id ? <IconButton onClick={() => deleteComment(comment._id)} aria-label="settings">
                                    <MoreVertIcon />
                                </IconButton>
                                    : ""
                            }
                                title={comment.commentCreator.name}
                                subheader={comment.createdAt.split("T", 1)}
                            />
                            <Typography sx={{ marginBottom: 2, width: "80%", mx: "auto" }}>
                                {comment.content}
                            </Typography>
                        </CardContent>
                    </>)}
                    <form onSubmit={(e)=>handleComment(e)} style={{padding:"1rem" , display:"flex",gap:"1rem",justifyContent:"space-between"}}>
                        <TextField id='comment' type='text' label="comment" variant='outlined'sx={{flexGrow:1}}/>
                        <Button type='submit' variant='contained'sx={{alignSelf:"center"}}>Add comment</Button>
                    </form>
            </Collapse>
        </Card>
    );
}
