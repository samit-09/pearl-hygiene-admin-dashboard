import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import SliderProducts from "@/components/Tables/SliderTable";

export const metadata: Metadata = {
  title: "Slider Table | Pearl Hygiene -  Dashboard",
  description:
    "",
};

const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Slider" />
      <div className="flex flex-col gap-10">
        <SliderProducts />
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
