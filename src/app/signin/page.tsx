import SignIn from "@/components/SignIn/SignIn";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Pearl Hygiene - Admin",
  description:
    "",
};

const page = () => {
  return (
      <div className="flex flex-col gap-10">
        <SignIn />
      </div>
  );
};

export default page;
