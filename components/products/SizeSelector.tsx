import { ISize } from "@/interfaces"
import { Box, Button } from "@mui/material"
import { FC } from "react"

interface Props {
    selectedSize?: ISize
    sizes: ISize[]

    // Methods

    onSelectedSize: (size: ISize) => void
}

export const SizeSelector:FC<Props> = ({ selectedSize, sizes, onSelectedSize }) => {
  return (
    <Box >
        {
            sizes.map( size => (
                <Button 
                    key={ size }
                    size="small"
                    color={ selectedSize === size ? 'primary' : 'info' }
                    onClick={ () => onSelectedSize(size) }
                    sx={{
                        ":hover": {
                            bgcolor: "primary",
                            color: "black"
                        }
                    }} 
                >
                    { size }
                </Button>
            ))
        }
    </Box>
  )
}
