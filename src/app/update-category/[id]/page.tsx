"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import firebaseConfig from "@/js/firebaseConfig";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { get, getDatabase, ref, set, update } from "firebase/database";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

const UpdateCategory = ({ params }: any) => {
    const [category, setCategory] = useState({});
    const [categoryId, setCategoryId] = useState("");
    const [categoryName, setCategoryName] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { id } = params;

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            const isLoggedInLocalStorage = localStorage.getItem('isLoggedIn');
            if (!user || isLoggedInLocalStorage !== 'true') {
                router.push('/');
            }
        });

        if (id) {
            getProductById(id);
        }
    }, [id]);

    const getProductById = (productId: any) => {
        const categoryRef = ref(database, `categories/${productId}`);
        console.log(categoryRef)
        get(categoryRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const categoryData = snapshot.val();
                    if (categoryData) {
                        setCategoryName(typeof categoryData === 'string' ? categoryData : categoryData.name);
                    }
                    setCategory(categoryData);
                    setCategoryId(productId);
                } else {
                    Swal.fire('Error', `No Category found with ID: ${productId}`, 'error');
                }
            })
            .catch((error) => console.error('Error getting product data:', error));
    };


    const handleUpdateCategory = async (e: any) => {
        e.preventDefault();

        if (!categoryName.trim()) {
            Swal.fire("Error!", 'Category name is required.', "error");
            return;
        }

        setLoading(true);
        try {
            const categoryRef = ref(database, `categories/${categoryId}`);
            await set(categoryRef, categoryName);
            Swal.fire("Success!", "Category updated successfully", "success");
            router.push('/categories');
        } catch (error: any) {
            Swal.fire("Error!", error.message, "error");
        } finally {
            setLoading(false);
        }
    };
    return (
        <DefaultLayout>
            <Breadcrumb pageName="Categories" />
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                    <h3 className="font-medium text-black dark:text-white">
                        Update Category
                    </h3>
                </div>
                <form onSubmit={handleUpdateCategory}>
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
                            Update
                        </button>
                    </div>
                </form>
            </div>
        </DefaultLayout>
    );
};

export default UpdateCategory;
