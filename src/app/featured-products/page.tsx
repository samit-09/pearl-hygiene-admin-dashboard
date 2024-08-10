import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import FeaturedProducts from "@/components/Tables/FeaturedTable";

export const metadata: Metadata = {
  title: "Featured Products | Pearl Hygiene -  Dashboard",
  description:
    "",
};

const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Featured Products" />
      <div className="flex flex-col gap-10">
        <FeaturedProducts />
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
