"use client";

//@ts-ignore

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import firebaseConfig from "@/js/firebaseConfig";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get } from "firebase/database";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const AddCategory = () => {
    const [categoryName, setCategoryName] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const handleAddCategory = async (e: any) => {
        e.preventDefault();

        if (!categoryName.trim()) {
            Swal.fire("Error!", 'Category name is required.', "error");
            return;
        }

        setLoading(true);
        try {
            const categoriesRef = ref(database, 'categories');
            const snapshot = await get(categoriesRef);
            const categoriesData = snapshot.val();

            const nextIndex = categoriesData
                ? Math.max(...Object.keys(categoriesData).map(key => parseInt(key))) + 1
                : 0;

            const newCategoryRef = ref(database, `categories/${nextIndex}`);
            await set(newCategoryRef, categoryName);

            Swal.fire("Success!", "Category added successfully", "success");
            setCategoryName("");
            router.push('/categories');
        } catch (error: any) {
            Swal.fire("Error!", error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DefaultLayout>
            <Breadcrumb pageName="Add Category" />
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                    <h3 className="font-medium text-black dark:text-white text-xl">
                        Add Category
                    </h3>
                </div>
                <form onSubmit={handleAddCategory}>
                    <div className="p-6.5">
                        <div className="mb-4.5">
                            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                                Category Name
                            </label>
                            <input
                                type="text"
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                                placeholder="Category Name"
                                required
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            />
                        </div>

                        <button type="submit" className="mt-5 inline-flex h-12 items-center justify-center rounded border border-stroke bg-primary py-3 px-6 text-base font-medium text-white transition hover:bg-opacity-90 focus:outline-none">
                            Add Category
                        </button>
                    </div>
                </form>
            </div>
        </DefaultLayout>
    );
};

export default AddCategory;
