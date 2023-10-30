import { useContext } from 'react';
import NextLink from 'next/link'
import {  UiContext } from '../../context';
import { AppBar, Badge, Box, Button, Link, Toolbar, Typography } from '@mui/material';

export const AdminNavbar = () => {

    const { toggleSideMenu } = useContext(UiContext)



    return (
        <AppBar>
            <Toolbar>
                <NextLink href='/' passHref legacyBehavior>
                    <Link display='flex' alignItems='center'>
                        <Typography variant='h6'>Epic |</Typography>
                        <Typography sx={{ ml: 0.5 }}>Shop</Typography>
                    </Link>
                </NextLink>

                <Box flex={1} />

                <Button onClick={toggleSideMenu}>
                    Menú
                </Button>

            </Toolbar>
        </AppBar>
    )
}
