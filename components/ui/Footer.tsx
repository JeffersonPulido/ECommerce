import Image from "next/image";
import styles from "./Footer.module.css";

export const Footer = () => {
    const links = [
        [
            { label: "Compañia", key: "header-1" },
            {
                label: "Acerca de nosotros",
                key: "item-1-1",
                url: "https://bestmarkid.netlify.app/",
            },
            {
                label: "Contáctanos",
                key: "item-1-3",
                url: "https://bestmarkid.netlify.app/",
            },
            {
                label: "Legal",
                key: "item-1-5",
                url: "https://bestmarkid.netlify.app/",
            },
        ],
        [
            { label: "Soporte", key: "header-2" },
            {
                label: "Centro de servicios",
                key: "item-2-1",
                url: "https://bestmarkid.netlify.app/",
            },
            {
                label: "Terms Y Condiciones",
                key: "item-2-2",
                url: "https://bestmarkid.netlify.app/policies/T%C3%A9rminos%20y%20Condiciones%20de%20Best%20Markid.pdf",
            },
            {
                label: "Políticas de privacidad",
                key: "item-2-4",
                url: "https://bestmarkid.netlify.app/policies/Pol%C3%ADtica%20de%20Privacidad%20de%20Best%20Markid.pdf",
            },
        ],
    ];
    const socialNetworks = [
        {
            label: "Instagram",
            url: "https://www.instagram.com/bestmarkid/",
            icon: "/icons/InstagramIcon.svg",
        },
        {
            label: "Facebook",
            url: "https://www.facebook.com/profile.php?id=61554796646429&mibextid=ZbWKwL",
            icon: "/icons/FacebookIcon.svg",
        },
        {
            label: "TikTok",
            url: "https://www.tiktok.com/@best.markid",
            icon: "/icons/TikTokIcon.svg",
        },
    ];
    const yearData = new Date().getFullYear();

    return (
        <>
            <footer className={styles["footer"]}>
                <div className={styles["footer-company-info"]}>
                    <div className={styles["footer-img"]}>
                        <Image
                            src="/LOGO.webp"
                            width={50}
                            height={50}
                            alt="Picture of the author"
                        />
                        <span>{process.env.NEXT_PUBLIC_APP_NAME}</span>
                    </div>

                    <div className={styles["infos"]}>
                        <span>{`${yearData} © House Tech Latam`}</span>
                        <span>{`All rights reserved.`}</span>
                    </div>

                    <div className={styles["footer-icons"]}>
                        {socialNetworks.map((red, index) => (
                            <a href={red.url} target="_blank" key={index}>
                                <Image
                                    src={red.icon}
                                    alt={red.label}
                                    width={25}
                                    height={25}
                                />
                            </a>
                        ))}
                    </div>
                </div>

                <div className={styles["footer-links"]}>
                    {links.map((col, index) => (
                        <ul
                            className={`col col-${index + 1}`}
                            key={`col-${index}`}
                        >
                            {col.map((link, index) => (
                                <li key={`link-${col}-${index}`}>
                                    <a href={link.url} target="_blank">
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    ))}
                </div>

                <div className={styles["footer-seal"]}>
                    <Image
                        src="/LOGO.webp"
                        width={200}
                        height={200}
                        alt="Picture of the author"
                    />
                </div>
            </footer>
        </>
    );
};
