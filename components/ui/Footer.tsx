import { Grid, Typography } from '@mui/material'

export const Footer = () => {

  const yearData = new Date().getFullYear()

  return (
    <>
      <Grid>
        <a href='https://jeffersonpulido.netlify.app/' target='_blank' >
          <Typography color='primary' variant='caption'>{`${yearData} © Jefferson Pulido Dev - All rights reserved.`}</Typography>
        </a>
      </Grid>
    </>
  )
}