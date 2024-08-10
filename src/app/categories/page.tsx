import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import CategoriesTable from "@/components/Tables/CategoriesTable";

export const metadata: Metadata = {
  title: "Categories | Pearl Hygiene -  Dashboard",
  description:
    "",
};

const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Categories" />
      <div className="flex flex-col gap-10">
        <CategoriesTable />
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
