import React, { Suspense } from "react";
import Header from "../components/SignUpAndLogin/Header";
import LoginForm from "../components/SignUpAndLogin/Login/LoginForm";
import Terms from "../components/SignUpAndLogin/Terms";

const page = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Header isLogin={true} />

        <Suspense fallback={<>Loading...</>}>
          <LoginForm />
        </Suspense>

        <Terms />

        <div className="mt-6 text-center">
          <p className="text-sm font-bold text-gray-600 underline">
            To demo - login with email: test@test.com, password: test
          </p>
        </div>
      </div>
    </div>
  );
};

export default page;
