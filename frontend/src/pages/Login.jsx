import { SignIn } from '@clerk/clerk-react';

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0F111A]">
      <SignIn routing="path" path="/login" signUpUrl="/signup" forceRedirectUrl="/dashboard" />
    </div>
  );
}
