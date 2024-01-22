import { useContext } from "react";
import Image from "next/image";
import NextLink from "next/link";
import { UiContext } from "../../context";
import {
    AppBar,
    Badge,
    Box,
    Button,
    Link,
    Toolbar,
    Typography,
} from "@mui/material";

export const AdminNavbar = () => {
    const { toggleSideMenu } = useContext(UiContext);

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

                <Button onClick={toggleSideMenu} className="btn-menu">
                    Menú
                </Button>
            </Toolbar>
        </AppBar>
    );
};
