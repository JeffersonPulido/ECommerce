import { useContext } from 'react';
import Image from 'next/image'
import NextLink from 'next/link'
import { UiContext } from '../../context';
import { AppBar, Box, Button, Link, Toolbar, Typography } from '@mui/material';

export const AuthNavbar = () => {

    return (
        <AppBar>
            <Toolbar>
                <NextLink href='/' passHref legacyBehavior>
                    <Link display='flex' alignItems='center'>
                        <Image
                            src="/LOGO.webp"
                            width={30}
                            height={30}
                            alt="Picture of the author"
                        />
                        <Typography sx={{ ml: 1 }} variant='h6'>{process.env.NEXT_PUBLIC_APP_NAME}</Typography>
                    </Link>
                </NextLink>

                <Box flex={1} />


            </Toolbar>
        </AppBar>
    )
}
