import { useContext, useState } from "react";
import NextLink from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { CartContext, UiContext } from "../../context";
import {
    AppBar,
    Badge,
    Box,
    Button,
    IconButton,
    Input,
    InputAdornment,
    Link,
    Toolbar,
    Typography,
} from "@mui/material";
import {
    ClearOutlined,
    SearchOutlined,
    ShoppingCartOutlined,
} from "@mui/icons-material";

export const Navbar = () => {
    const { asPath, push } = useRouter();
    const { toggleSideMenu } = useContext(UiContext);
    const { numberOfItems } = useContext(CartContext);

    const [searchTerm, setSearchTerm] = useState("");
    const [isSearchVisible, setIsSearchVisible] = useState(false);

    const onSearchTerm = () => {
        if (searchTerm.trim().length === 0) return;
        push(`/search/${searchTerm}`);
    };

    return (
        <AppBar>
            <Toolbar sx={{ backgroundColor: "#03624E" }}>
                <NextLink href="/" passHref legacyBehavior>
                    <Link display="flex" alignItems="center">
                        <Image
                            src="/LOGO.webp"
                            width={30}
                            height={30}
                            alt="Picture of the author"
                        />
                        <Typography
                            sx={{ ml: 1, color: "white", fontWeight: "bold" }}
                            variant="h6"
                        >
                            {process.env.NEXT_PUBLIC_APP_NAME}
                        </Typography>
                    </Link>
                </NextLink>

                <Box flex={1} />

                <Box
                    className="fadeIn"
                    sx={{
                        display: isSearchVisible
                            ? "none"
                            : { xs: "none", sm: "block" },
                    }}
                >
                    <NextLink href="/category/clothes" passHref legacyBehavior>
                        <Link sx={{ margin: "2px" }}>
                            <Button
                                sx={{
                                    ":hover": {
                                        bgcolor: "info",
                                        color: "white",
                                        border: "1px solid white",
                                    },
                                    border: "1px solid white",
                                }}
                                color={
                                    asPath === "/category/clothes"
                                        ? "primary"
                                        : "info"
                                }
                            >
                                Ropa
                            </Button>
                        </Link>
                    </NextLink>
                    <NextLink href="/category/clean" passHref legacyBehavior>
                        <Link sx={{ margin: "2px" }}>
                            <Button
                                sx={{
                                    ":hover": {
                                        bgcolor: "info",
                                        color: "white",
                                        border: "1px solid white",
                                    },
                                    border: "1px solid white",
                                }}
                                color={
                                    asPath === "/category/clean"
                                        ? "primary"
                                        : "info"
                                }
                            >
                                Aseo
                            </Button>
                        </Link>
                    </NextLink>
                    <NextLink href="/category/toys" passHref legacyBehavior>
                        <Link sx={{ margin: "2px" }}>
                            <Button
                                sx={{
                                    ":hover": {
                                        bgcolor: "info",
                                        color: "white",
                                        border: "1px solid white",
                                    },
                                    border: "1px solid white",
                                }}
                                color={
                                    asPath === "/category/toys"
                                        ? "primary"
                                        : "info"
                                }
                            >
                                Juguetes
                            </Button>
                        </Link>
                    </NextLink>
                    <NextLink href="/category/furniture" passHref legacyBehavior>
                        <Link sx={{ margin: "2px" }}>
                            <Button
                                sx={{
                                    ":hover": {
                                        bgcolor: "info",
                                        color: "white",
                                        border: "1px solid white",
                                    },
                                    border: "1px solid white",
                                }}
                                color={
                                    asPath === "/category/furniture"
                                        ? "primary"
                                        : "info"
                                }
                            >
                                Mobiliario
                            </Button>
                        </Link>
                    </NextLink>
                    <NextLink href="/category/variety" passHref legacyBehavior>
                        <Link sx={{ margin: "2px" }}>
                            <Button
                                sx={{
                                    ":hover": {
                                        bgcolor: "info",
                                        color: "white",
                                        border: "1px solid white",
                                    },
                                    border: "1px solid white",
                                }}
                                color={
                                    asPath === "/category/variety"
                                        ? "primary"
                                        : "info"
                                }
                            >
                                Accesorios
                            </Button>
                        </Link>
                    </NextLink>
                </Box>

                <Box flex={1} />

                {/**Desktop */}
                {isSearchVisible ? (
                    <Input
                        className="fadeIn"
                        autoFocus
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) =>
                            e.key === "Enter" ? onSearchTerm() : null
                        }
                        type="text"
                        placeholder="Buscar..."
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => setIsSearchVisible(false)}
                                    color="info"
                                >
                                    <ClearOutlined />
                                </IconButton>
                            </InputAdornment>
                        }
                    />
                ) : (
                    <IconButton
                        sx={{ display: { xs: "none", sm: "flex" } }}
                        onClick={() => setIsSearchVisible(true)}
                        className="fadeIn"
                        color="info"
                    >
                        <SearchOutlined />
                    </IconButton>
                )}

                {/**Mobile */}
                <IconButton
                    sx={{ display: { xs: "flex", sm: "none" } }}
                    onClick={toggleSideMenu}
                    color="info"
                >
                    <SearchOutlined />
                </IconButton>

                <NextLink href="/cart" passHref legacyBehavior>
                    <Link>
                        <IconButton color="info">
                            <Badge
                                badgeContent={
                                    numberOfItems > 9 ? "+9" : numberOfItems
                                }
                                color="secondary"
                            >
                                <ShoppingCartOutlined />
                            </Badge>
                        </IconButton>
                    </Link>
                </NextLink>

                <Button onClick={toggleSideMenu} className="btn-menu">
                    Menú
                </Button>
            </Toolbar>
        </AppBar>
    );
};
