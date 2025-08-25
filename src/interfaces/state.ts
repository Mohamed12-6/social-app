// export interface State{
//     post:any
// }

export interface Root {
    message: string
    paginationInfo: PaginationInfo
    posts: Post[]
  }
  export interface Register {
    name: string
    email: string
    password: string
    rePassword: string
    dateOfBirth: string
    gender: string
  }
  
  export interface PaginationInfo {
    currentPage: number
    numberOfPages: number
    limit: number
    nextPage: number
    total: number
  }
  
  export interface Post {
    _id: string
    body?: string
    image?: string
    user: User
    createdAt: string
    comments: Comment[]
    id: string
  }
  
  export interface User {
    _id: string
    name: string
    photo: string
  }
  
  export interface Comment {
    _id: string
    content?: string
    commentCreator: User
    post: string
    createdAt: string
  }
  
