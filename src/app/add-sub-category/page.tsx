"use client"

import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import Swal from 'sweetalert2';
import { getDatabase, ref, set, get } from 'firebase/database';
import firebaseConfig from '@/js/firebaseConfig';
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from 'next/navigation';

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const AddSubCategory = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [subCategoryName, setSubCategoryName] = useState<string>('');
    const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false);
    const [catName, setCatName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            const isLoggedInLocalStorage = localStorage.getItem('isLoggedIn');
            if (!user || isLoggedInLocalStorage !== 'true') {
                window.location.href = '../';
            }
        });
        const fetchCategories = async () => {
            try {
                const categoriesRef = ref(database, 'categories');
                const snapshot = await get(categoriesRef);
                const categoriesData = snapshot.val();
                console.log(categoriesData);
                if (categoriesData) {
                    const categoriesList = Object.entries(categoriesData).map(([id, data]) => ({
                        id,
                        data
                    }));
                    setCategories(categoriesList as any[]);
                }
            } catch (error) {
                console.error("Error fetching categories: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);



    const handleAddButtonClick = () => {
        if (!subCategoryName) {
            showToast('Sub Category Name is required.');
            return;
        }

        uploadToDatabase(subCategoryName, catName);
    };

    const uploadToDatabase = async (subCategoryName: string, categoryName: string) => {
        try {
            const categoriesRef = ref(database, 'categories');
            const snapshot = await get(categoriesRef);
            const categoriesData = snapshot.val();
            let categoryKey: string | null = null;

            if (!categoriesData) {
                throw new Error('No categories data found.');
            }

            for (const [key, category] of Object.entries(categoriesData)) {
                let categoryDataName: string;

                if (typeof category === 'string') {
                    categoryDataName = category;
                    // @ts-ignore
                } else if (typeof category === 'object' && category.name) {
                    // @ts-ignore
                    categoryDataName = category.name;
                } else {
                    continue;
                }

                if (categoryDataName === categoryName) {
                    categoryKey = key;
                    break;
                }
            }

            if (categoryKey) {
                const categoryRef = ref(database, `categories/${categoryKey}`);
                const categoryData = (await get(categoryRef)).val();

                let updatedCategoryData;

                if (typeof categoryData === 'string') {
                    updatedCategoryData = {
                        name: categoryData,
                        subCategories: {
                            [0]: subCategoryName
                        }
                    };
                } else {
                    updatedCategoryData = {
                        ...categoryData,
                        subCategories: {
                            ...categoryData.subCategories,
                            [Object.keys(categoryData.subCategories).length]: subCategoryName
                        }
                    };
                }

                await set(categoryRef, updatedCategoryData);
                showToast('Sub Category uploaded successfully!');
                setSubCategoryName('');
                setCatName('');
                router.push('/sub-categories');
            } else {
                showToast('Category not found.');
            }
        } catch (error) {
            console.error('Failed to upload sub category:', error);
            showToast('Failed to upload sub category. Please try again later.');
        }
    };




    const showToast = (message: string) => {
        Swal.fire({
            text: message,
            icon: 'info',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
        });
    };

    if (loading) {
        return (
            <div className="">
                Loading
            </div>
        );
    }

    return (
        <DefaultLayout>
            <Breadcrumb pageName="Add Category" />
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                    <h3 className="font-medium text-black dark:text-white">
                        Upload Sub Category
                    </h3>
                </div>
                <form action="#">
                    <div className="p-6.5">

                        <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                            <div className="w-full">
                                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                                    Category
                                </label>
                                <div className="relative z-20 bg-transparent dark:bg-form-input">
                                    <select
                                        value={catName} onChange={(e) => setCatName(e.target.value)}
                                        className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary ${isOptionSelected ? "text-black dark:text-white" : ""
                                            }`}
                                    >
                                        <option value="" disabled className="text-body dark:text-bodydark">
                                            Select Category
                                        </option>
                                        {categories.map((category, index) => (
                                            <option key={index} value={typeof category.data === 'string' ? category.data : category.data.name}>{typeof category.data === 'string' ? category.data : category.data.name}</option>
                                        ))}
                                    </select>

                                    <span className="absolute right-4 top-1/2 z-30 -translate-y-1/2">
                                        <svg
                                            className="fill-current"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <g opacity="0.8">
                                                <path
                                                    fillRule="evenodd"
                                                    clipRule="evenodd"
                                                    d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                                    fill="#344952"
                                                />
                                            </g>
                                        </svg>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4.5 w-full">
                            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                                Sub Category Name
                            </label>
                            <input
                                type="text" value={subCategoryName}
                                onChange={(e) => setSubCategoryName(e.target.value)}
                                placeholder="Sub Category"
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            />
                        </div>



                        <button
                            type="button"
                            className="mt-5 inline-flex h-12 items-center justify-center rounded border border-stroke bg-primary py-3 px-6 text-base font-medium text-white transition hover:bg-opacity-90 focus:outline-none"
                            onClick={handleAddButtonClick}
                        >
                            Upload Sub Category
                        </button>
                    </div>
                </form>
            </div>
        </DefaultLayout>
    );
};

export default AddSubCategory;
