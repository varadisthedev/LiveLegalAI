import { SignUp } from '@clerk/clerk-react';

export default function Signup() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0F111A]">
      <SignUp routing="path" path="/signup" signInUrl="/login" forceRedirectUrl="/dashboard" />
    </div>
  );
}
