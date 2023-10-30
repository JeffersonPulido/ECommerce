import { Box } from "@mui/material";
import Head from "next/head"
import { FC, Children } from 'react';

interface Props {
    title: string;
    children: any
}

export const AuthLayout: FC<Props> = ({children, title}) => {
  return (
    <>
        <Head>
            <title>{title}</title>
        </Head>
        <main suppressHydrationWarning={true}>
            <Box display='flex' justifyContent='center' alignItems='center' height='calc(100vh - 200px)'>
                {children}
            </Box>
        </main>
    </>
  )
}
