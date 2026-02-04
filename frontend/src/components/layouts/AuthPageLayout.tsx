import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row sm:p-0">
        {children}
        <div className="items-center hidden w-full h-full lg:w-1/2 bg-[#fff4ec] lg:grid">
          <div className="relative flex items-center justify-center z-1">
            <div className="flex flex-col items-center max-w-xs">
              <div className="block mb-4">
                <img
                  width={150}
                  height={150}
                  src="/favicon.png"
                  alt="Logo"
                />
              </div>
              <p className="text-center text-gray-800 font-bold text-2xl">
                Conscious Talent Management System
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
