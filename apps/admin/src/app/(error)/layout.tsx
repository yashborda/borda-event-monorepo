const ErrorLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-6">
      {children}
    </div>
  )
}

export default ErrorLayout
