// pages/_app.tsx
import type { AppProps } from 'next/app'
import { useState, useEffect } from 'react'
import Head from 'next/head'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode))
    } else {
      setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <>
      <Head>
        <title>WhatsApp Clone</title>
        <meta name="description" content="WhatsApp Clone built with Next.js" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={darkMode ? 'dark' : ''}>
        <Component {...pageProps} darkMode={darkMode} setDarkMode={setDarkMode} />
      </div>
    </>
  )
}
