import { Instagram, Twitter, YouTube } from '@mui/icons-material'
import Image from 'next/image'
import styles from './Footer.module.css'

export const Footer = () => {

  const links = [
    [
      { label: 'Company', key: 'header-1' },
      { label: 'About us', key: 'item-1-1', url: 'google.com' },
      { label: 'Blog', key: 'item-1-2', url: 'google.com' },
      { label: 'Contact us', key: 'item-1-3', url: 'google.com' },
      { label: 'Pricing', key: 'item-1-4', url: 'google.com' },
      { label: 'Testimonials', key: 'item-1-5', url: 'google.com' },
    ],
    [
      { label: 'Support', key: 'header-2' },
      { label: 'Help Center', key: 'item-2-1', url: 'google.com' },
      { label: 'Terms of service', key: 'item-2-2', url: 'google.com' },
      { label: 'Legal', key: 'item-2-3', url: 'google.com' },
      { label: 'Privacy policy', key: 'item-2-4', url: 'google.com' },
      { label: 'Status', key: 'item-2-5', url: 'google.com' },
    ]
  ]
  const yearData = new Date().getFullYear()

  return (
    <>
      <footer className={styles['footer']}>
        <div className={styles['footer-company-info']}>
          <div className={styles['footer-img']}>
            <Image
              src="/LOGO.webp"
              width={50}
              height={50}
              alt="Picture of the author"
            />
            <span>{process.env.NEXT_PUBLIC_APP_NAME}</span>
          </div>

          <div className={styles['infos']}>
            <span>{`${yearData} © Jefferson Pulido Dev`}</span>
            <span>{`All rights reserved.`}</span>
          </div>

          <div className={styles['footer-icons']}>
            <Instagram />
            <Twitter />
            <YouTube />
          </div>
        </div>

        <div className={styles['footer-links']}>
          {links.map((col, index) => (
            <ul className={`col col-${index + 1}`} key={`col-${index}`}>
              {col.map((link, index) => (
                <li key={`link-${col}-${index}`}>
                  <a href={link.url} target='_blank'>{link.label}</a>
                </li>
              ))}
            </ul>
          ))}
        </div>

        <div className={styles['footer-seal']}>
          <Image
            src="/LOGO.webp"
            width={200}
            height={200}
            alt="Picture of the author"
          />
        </div>
      </footer>
    </>
  )
}