'use client'

import Button from '@/components/UI/Button'
import React, { useState, FC } from 'react'
import Image from 'next/image'
import { signIn } from 'next-auth/react'

import * as GoogleLogo from '../../../../public/google.svg'
import { toast } from 'react-hot-toast'

const Login: FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  async function loginWithGoogle() {
    setIsLoading(true)
    try {
      await signIn('google')
    } catch (error) {
      toast.error('Something went wrong with your login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full flex flex-col items-center max-w-md space-y-8">
          <div className="flex flex-col items-center gap-8">
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Sign in to your account
            </h2>
          </div>
          <Button
            isLoading={isLoading}
            type="button"
            className="max-w-sm mx-auto w-full"
            onClick={loginWithGoogle}
          >
            {isLoading ? null : <Image src={GoogleLogo} alt="Google Logo" />}
            Google
          </Button>
        </div>
      </div>
    </>
  )
}

export default Login
