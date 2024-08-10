import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ProductTable from "@/components/Tables/ProductTable";

export const metadata: Metadata = {
  title: "Products | Pearl Hygiene -  Dashboard",
  description:
    "",
};

{/* @ts-ignore */}
const TablesPage = ({searchParams}) => {

  return (
    // @ts-ignore
    <DefaultLayout searchQuery={searchParams.q || ""}>
      <Breadcrumb pageName="Products" />
      <div className="flex flex-col gap-10">
        {/* @ts-ignore */}
        <ProductTable searchQuery={searchParams.q || ""}/>
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
