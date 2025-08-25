import * as React from 'react';
import Box from '@mui/material/Box';
import { Skeleton, Stack } from '@mui/material';

export default function Loading() {
  return (
    <>
    <Box sx={{ display: 'flex' ,flexDirection: 'column' , justifyContent : "center", alignItems : "center" }}>
    <Stack spacing={1}         sx={{
          width: '80%', 
          maxWidth: 800, 
          padding: 3
        }}
>
      {/* For variant="text", adjust the height via font-size */}

      {/* For other variants, adjust the size with `width` and `height` */}
      <Skeleton variant="circular" width={80} height={80} />
      <Skeleton variant="rectangular" width={800} height={100} />
      <Skeleton variant="rounded" width={800} height={100} />
    </Stack>
    </Box>
    </>
  )
}
