"use client";

import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Badge from '@mui/material/Badge';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { State, AppDispatch } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { removeToken } from '@/lib/loginslice';
import { 
  getNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead, 
  NotificationItem 
} from '@/lib/notificationslice';
import { playNotificationSound } from '@/lib/sound';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CircularProgress from '@mui/material/CircularProgress';
import { getMyProfile } from '@/lib/userslice';

function ResponsiveAppBar() {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const [anchorElNotif, setAnchorElNotif] = React.useState<null | HTMLElement>(null);
  const [mounted, setMounted] = React.useState(false);
  const prevUnreadRef = React.useRef(0);

  const token = useSelector((state: State) => state.login.token);
  // 🆕 جيب البروفايل من Redux عشان الصورة تتحدث لحظياً
  const { myProfile } = useSelector((state: State) => state.user);
  const { notifications, unreadCount, isLoading } = useSelector((state: State) => state.notification);
  
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorElNav(event.currentTarget);
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorElUser(event.currentTarget);
  
  const handleOpenNotif = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNotif(event.currentTarget);
    dispatch(getNotifications());
  };

  const handleCloseNavMenu = () => setAnchorElNav(null);
  const handleCloseUserMenu = () => setAnchorElUser(null);
  const handleCloseNotif = () => setAnchorElNotif(null);

  React.useEffect(() => { setMounted(true); }, []);

  // 🆕 لو مفيش بروفايل في Redux، نجيبه
  React.useEffect(() => {
    if (token && !myProfile) {
      dispatch(getMyProfile());
    }
  }, [dispatch, token, myProfile]);

  // Polling كل 30 ثانية
  React.useEffect(() => {
    if (!token) return;
    dispatch(getUnreadCount());
    const interval = setInterval(() => {
      dispatch(getUnreadCount());
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch, token]);

  // صوت لما يجي notification جديد
  React.useEffect(() => {
    if (mounted && unreadCount > prevUnreadRef.current && prevUnreadRef.current > 0) {
      playNotificationSound();
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount, mounted]);

  // عند كليك الإشعار: بيعمل markAsRead وبيفتح صفحة البوست لو موجود
  const handleNotifClick = (notif: NotificationItem) => {
    if (!notif.isRead) {
      dispatch(markAsRead(notif._id));
    }
    handleCloseNotif();
    
    if (notif.entityId || notif.entity?._id) {
      router.push(`/singlepost/${notif.entityId || notif.entity?._id}`);
    }
  };

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead());
  };

  function logout() {
    handleCloseUserMenu();
    localStorage.removeItem("userPhoto");
    dispatch(removeToken());
    router.push("/login");
  }

  // تحويل نوع الإشعار لنص مفهوم
  const getNotificationMessage = (notif: NotificationItem) => {
    const actorName = notif.actor?.name || "Someone";
    switch (notif.type) {
      case "comment_post":
      case "comment":
        return `${actorName} commented on your post`;
      case "like_post":
      case "like":
        return `${actorName} liked your post`;
      case "share_post":
      case "share":
        return `${actorName} shared your post`;
      case "follow":
        return `${actorName} started following you`;
      default:
        return `${actorName} interacted with your content`;
    }
  };

  // 🆕 نستخدم صورة Redux أولاً، لو فاضية نجرب localStorage
  const avatarSrc = myProfile?.photo || (typeof window !== "undefined" ? localStorage.getItem("userPhoto") : null);
  const avatarName = myProfile?.name || "U";

  const safeToken = mounted ? token : null;

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          
          {/* Logo - Desktop */}
          <Typography variant="h6" noWrap sx={{ mr: 2, display: { xs: 'none', md: 'flex' }, fontFamily: 'monospace', fontWeight: 700, letterSpacing: '.3rem', color: 'inherit', textDecoration: 'none' }}>
            {safeToken ? <Link href={"/"} style={{ color: 'inherit', textDecoration: 'none' }}>SocialApp</Link> : "SocialApp"}
          </Typography>

          {/* Mobile Navigation Icon */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            {safeToken && (
              <>
                <IconButton size="large" onClick={handleOpenNavMenu} color="inherit">
                  <MenuIcon />
                </IconButton>
                <Menu 
                  id="menu-appbar" 
                  anchorEl={anchorElNav} 
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} 
                  keepMounted 
                  transformOrigin={{ vertical: 'top', horizontal: 'left' }} 
                  open={Boolean(anchorElNav)} 
                  onClose={handleCloseNavMenu} 
                  sx={{ display: { xs: 'block', md: 'none' } }}
                >
                  <MenuItem onClick={handleCloseNavMenu}>
                    <Typography sx={{ textAlign: 'center' }}><Link href={"/profile"} style={{ textDecoration: 'none', color: 'inherit' }}>Profile</Link></Typography>
                  </MenuItem>
                  <MenuItem onClick={handleCloseNavMenu}>
                    <Typography sx={{ textAlign: 'center' }}><Link href={"/createpost"} style={{ textDecoration: 'none', color: 'inherit' }}>Addpost</Link></Typography>
                  </MenuItem>
                  <MenuItem onClick={handleCloseNavMenu}>
                    <Typography sx={{ textAlign: 'center' }}><Link href={"/bookmarks"} style={{ textDecoration: 'none', color: 'inherit' }}>Bookmarks</Link></Typography>
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>

          {/* Logo - Mobile */}
          <Typography variant="h5" noWrap sx={{ mr: 2, display: { xs: 'flex', md: 'none' }, flexGrow: 1, fontFamily: 'monospace', fontWeight: 700, letterSpacing: '.3rem', color: 'inherit', textDecoration: 'none' }}>
            {safeToken ? <Link href={"/"} style={{ color: 'inherit', textDecoration: 'none' }}>SocialApp</Link> : "SocialApp"}
          </Typography>

          {/* Desktop Links */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {safeToken && (
              <>
                <Button onClick={handleCloseNavMenu} sx={{ my: 2, color: 'white', display: 'block' }}>
                  <Link href={"/profile"} style={{ color: 'inherit', textDecoration: 'none' }}>Profile</Link>
                </Button>
                <Button onClick={handleCloseNavMenu} sx={{ my: 2, color: 'white', display: 'block' }}>
                  <Link href={"/createpost"} style={{ color: 'inherit', textDecoration: 'none' }}>Addpost</Link>
                </Button>
                <Button onClick={handleCloseNavMenu} sx={{ my: 2, color: 'white', display: 'block' }}>
                  <Link href={"/bookmarks"} style={{ color: 'inherit', textDecoration: 'none' }}>Bookmarks</Link>
                </Button>
              </>
            )}
          </Box>

          {/* Notifications Icon */}
          {safeToken && (
            <Box sx={{ flexGrow: 0, mr: 2 }}>
              <Tooltip title="Notifications">
                <IconButton onClick={handleOpenNotif} color="inherit">
                  <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Menu
                sx={{ mt: '45px' }}
                id="notification-menu"
                anchorEl={anchorElNotif}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                keepMounted
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorElNotif)}
                onClose={handleCloseNotif}
                PaperProps={{ sx: { width: 360, maxHeight: 420 } }}
              >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
                  <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Notifications</Typography>
                  {unreadCount > 0 && (
                    <Button size="small" onClick={handleMarkAllRead}>Mark all read</Button>
                  )}
                </Box>
                
                {isLoading && notifications.length === 0 ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : notifications.length === 0 ? (
                  <MenuItem disabled>
                    <Typography sx={{ textAlign: 'center', width: '100%', color: 'text.secondary', py: 1 }}>
                      No notifications
                    </Typography>
                  </MenuItem>
                ) : (
                  notifications.map((notif) => (
                    <MenuItem 
                      key={notif._id} 
                      onClick={() => handleNotifClick(notif)}
                      sx={{ 
                        bgcolor: notif.isRead ? 'inherit' : 'rgba(25, 118, 210, 0.08)', 
                        borderBottom: '1px solid #f0f0f0',
                        display: 'flex',
                        gap: 1.5,
                        alignItems: 'center',
                        py: 1.5
                      }}
                    >
                      <Avatar 
                        src={notif.actor?.photo} 
                        alt={notif.actor?.name || 'User'}
                        sx={{ width: 40, height: 40 }}
                      />
                      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                        <Typography variant="body2" sx={{ fontWeight: notif.isRead ? 'normal' : 'bold' }}>
                          {getNotificationMessage(notif)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString("ar-EG") : ''}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Menu>
            </Box>
          )}

          {/* User Avatar Settings */}
          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                {safeToken && avatarSrc && avatarSrc.trim() !== "" && !avatarSrc.includes("undefined") ? (
                  <Avatar alt={avatarName} src={avatarSrc} />
                ) : (
                  <Avatar alt={avatarName}>
                    {avatarName ? avatarName.charAt(0).toUpperCase() : "U"}
                  </Avatar>
                )}
              </IconButton>
            </Tooltip>
            <Menu 
              sx={{ mt: '45px' }} 
              id="menu-appbar" 
              anchorEl={anchorElUser} 
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }} 
              keepMounted 
              transformOrigin={{ vertical: 'top', horizontal: 'right' }} 
              open={Boolean(anchorElUser)} 
              onClose={handleCloseUserMenu}
            >
              {safeToken ? (
                <Box>
                  <MenuItem onClick={() => { handleCloseUserMenu(); router.push("/profile"); }}>
                    <Typography sx={{ textAlign: 'center', width: '100%' }}>Profile</Typography>
                  </MenuItem>

                  <MenuItem onClick={() => { handleCloseUserMenu(); router.push("/bookmarks"); }}>
                    <Typography sx={{ textAlign: 'center', width: '100%' }}>Bookmarks</Typography>
                  </MenuItem>

                  <MenuItem onClick={() => { handleCloseUserMenu(); router.push("/change-password"); }}>
                    <Typography sx={{ textAlign: 'center', width: '100%' }}>Change Password</Typography>
                  </MenuItem>

                  <MenuItem onClick={logout}>
                    <Typography sx={{ textAlign: 'center', color: 'error.main', width: '100%' }}>Logout</Typography>
                  </MenuItem>
                </Box>
              ) : (
                <Box>
                  <MenuItem onClick={handleCloseUserMenu}>
                    <Typography sx={{ textAlign: 'center' }}>
                      <Link href={"/login"} style={{ textDecoration: 'none', color: 'inherit' }}>Login</Link>
                    </Typography>
                  </MenuItem>
                  <MenuItem onClick={handleCloseUserMenu}>
                    <Typography sx={{ textAlign: 'center' }}>
                      <Link href={"/register"} style={{ textDecoration: 'none', color: 'inherit' }}>Register</Link>
                    </Typography>
                  </MenuItem>
                </Box>
              )}
            </Menu>
          </Box>

        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default ResponsiveAppBar;