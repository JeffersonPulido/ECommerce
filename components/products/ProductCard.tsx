import { IProduct } from "@/interfaces";
import NextLink from "next/link";
import {
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  Box,
  Typography,
  Link,
  Chip,
} from "@mui/material";
import { FC, useMemo, useState } from "react";
import { currency } from "@/utils";

interface Props {
  product: IProduct;
}

export const ProductCard: FC<Props> = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false)

  const productImage = useMemo(() => {
    return isHovered
      ? product.images[1]
      : product.images[0]
  }, [isHovered, product.images]);

  return (
    <Grid
      item
      xs={6}
      sm={4}
      xl={3}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card variant='outlined' sx={{ border: '2px solid #ff5a23' }}>
        <NextLink href={`/product/${product.slug}`} passHref legacyBehavior prefetch={false}>
          <Link>
            <CardActionArea>
              {
                (product.inStock === 0) && (
                  <Chip
                    color="warning"
                    label="Sin Inventario"
                    sx={{ position: 'absolute', zIndex: 99, top: '10px', left: '10px', fontWeight: 700 }}
                  />
                )
              }
              <CardMedia
                className="fadeIn"
                component="img"
                image={productImage}
                alt={product.title}
                onLoad={() => setIsImageLoaded(true)}
              />
            </CardActionArea>
          </Link>
        </NextLink>
      </Card>

      <Box sx={{ mt: 1, display: isImageLoaded ? 'block' : 'none' }} className="fadeIn">
        <Typography fontWeight={700}>{product.title}</Typography>
        <Typography fontWeight={500}>{currency.format(product.price)}</Typography>
      </Box>
    </Grid>
  );
};
