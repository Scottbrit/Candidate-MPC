import AuthLayout from "@/components/layouts/AuthPageLayout";
import SignInForm from "@/features/auth/components/SignInForm";

export default function SignIn() {
  return (
    <>
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
