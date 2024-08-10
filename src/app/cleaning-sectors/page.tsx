import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import CleaningSectors from "@/components/Tables/CleaningSectors";

export const metadata: Metadata = {
  title: "Cleaning Sectors | Pearl Hygiene -  Dashboard",
  description:
    "",
};

const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Cleaning Sectors" />
      <div className="flex flex-col gap-10">
        <CleaningSectors />
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
