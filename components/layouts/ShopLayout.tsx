import Head from "next/head";
import { FC } from "react";
import { Footer, Navbar, SideMenu } from "../ui";

interface Props {
    children: any;
    title: string;
    pageDescription: string;
    imageFullUrl?: string;
}

export const ShopLayout: FC<Props> = ({
    children,
    title,
    pageDescription,
    imageFullUrl,
}) => {
    return (
        <>
            <Head>
                <title>{title} | {process.env.NEXT_PUBLIC_APP_NAME}</title>
                <meta name="description" content={pageDescription} />
                <meta name="og:title" content={title} />
                <meta name="og:description" content={pageDescription} />
                {imageFullUrl && (
                    <meta name="og:image" content={imageFullUrl} />
                )}
            </Head>
            <nav>
                <Navbar />
            </nav>
            <SideMenu />
            <main
                suppressHydrationWarning={true}
                style={{
                    margin: "80px auto",
                    maxWidth: "1440px",
                    padding: "0px 30px",
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "80vh",
                }}
            >
                {children}
            </main>
            <footer>
                <Footer />
            </footer>
        </>
    );
};
