export const ThemeScript = () => {
  return (
    <script
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}})()`,
      }}
    />
  )
}
