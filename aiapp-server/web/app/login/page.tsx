import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">欢迎回来</h1>
          <p className="mt-2 text-gray-600">请登录您的账户</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}

