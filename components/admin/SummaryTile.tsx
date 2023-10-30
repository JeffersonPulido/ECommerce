import React, { FC } from 'react'
import { Grid, Card, CardContent, Typography } from '@mui/material';
import { useRouter } from 'next/router';

interface Props {
    title: string | number;
    subTitle: string;
    icon: JSX.Element;
    urlPage?: string;
}

export const SummaryTile: FC<Props> = ({ title, subTitle, icon, urlPage = ''}) => {
    const router = useRouter()
    
    const navigateTo = (url: string) => {
        router.push(url)
    }

    return (
        <Grid item xs={12} sm={6} md={4}>
            <Card variant='outlined' sx={{ display: 'flex' }} onClick={() => navigateTo(urlPage)}>
                <CardContent sx={{ width: 80, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {icon}
                </CardContent>
                <CardContent sx={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h4" >{title}</Typography>
                    <Typography variant="caption">{subTitle}</Typography>
                </CardContent>
            </Card>
        </Grid>
    )
}
