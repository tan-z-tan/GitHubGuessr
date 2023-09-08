import { FC } from 'react'
import Script from 'next/script'

const ANALYTICS_ID = process.env.NEXT_PUBLIC_ANALYTICS_ID

export const Analytics: FC = () => {
  if (process.env.NODE_ENV !== 'production') {
    return <></>
  }

  if (!ANALYTICS_ID) {
    console.log('NEXT_PUBLIC_ANALYTICS_ID not defined')
    return <></>
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${ANALYTICS_ID}');
        `}
      </Script>
    </>
  )
}
