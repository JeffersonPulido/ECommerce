import { ShopLayout } from '@/components/layouts'
import { Box, Typography } from '@mui/material'
import React from 'react'

const Custom404 = () => {
  return (
    <ShopLayout title='Error 404' pageDescription='No hay nada que mostrar aqui'>
        <Box 
            sx={{flexDirection: {xs: 'column', sm: 'row'}}} 
            display='flex' 
            justifyContent='center' 
            alignItems='center' 
            height='calc(100vh - 200px)'
        >
            <Typography variant='h1' component='h1' fontSize={80} fontWeight={200}>404 | </Typography>
            <Typography marginLeft={2}>No encontramos ninguna página </Typography>
        </Box>
    </ShopLayout>
  )
}

export default Custom404