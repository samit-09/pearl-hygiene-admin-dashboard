import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import BrandsTable from "@/components/Tables/BrandsTable";

export const metadata: Metadata = {
  title: "Brands | Pearl Hygiene -  Dashboard",
  description: "",
};

const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Brands" />
      <div className="flex flex-col gap-10">
        <BrandsTable />
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
