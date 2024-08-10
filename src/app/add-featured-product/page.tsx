"use client"

//@ts-ignore

import { useState, useEffect } from 'react';
import { getDatabase, ref, set, get } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Swal from 'sweetalert2';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '@/js/firebaseConfig';
import { useRouter } from 'next/navigation';
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

export default function FeaturedProducts() {
    const [productsData, setProductsData] = useState({});
    const [selectedProductId, setSelectedProductId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = onAuthStateChanged(auth, (user) => {
            const isLoggedIn = localStorage.getItem('isLoggedIn');
            if (!user || isLoggedIn !== 'true') {
                router.push('/signin');
            }
        });

        // Fetch products data
        fetchProducts();

        return () => checkAuth();
    }, []);

    const fetchProducts = async () => {
        try {
            const productsRef = ref(database, 'products');
            const snapshot = await get(productsRef);
            const products = snapshot.val();
            setProductsData(products);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            setIsLoading(false);
        }
    };

    const handleAddFeaturedProduct = async () => {
        if (!selectedProductId) {
            Swal.fire('Error', 'Please select a product.', 'error');
            return;
        }

        try {
            // @ts-ignore
            const product = productsData[selectedProductId];
            const newFeaturedProductRef = ref(database, 'featuredProducts/' + selectedProductId);

            await set(newFeaturedProductRef, {
                name: product.productName,
                image: product.images[0],
            });

            Swal.fire('Success', 'Featured product added successfully!', 'success');
            router.push("/featured-products");
        } catch (error) {
            console.error('Error adding featured product:', error);
            Swal.fire('Error', 'Failed to add featured product. Please try again later.', 'error');
        }
    };


    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <DefaultLayout>
            <Breadcrumb pageName="Add Feature Products" />
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                    <h3 className="font-medium text-black dark:text-white">
                        Add Feature Product
                    </h3>
                </div>
                <form action="#">
                    <div className="p-6.5">


                        <div className="w-full xl:w-1/2">
                            <label className="mb-3 block text-lg font-medium text-black dark:text-white">
                            Select A Product
                            </label>
                            <div className="relative z-20 bg-transparent dark:bg-form-input">
                                <select
                                    onChange={(e) => setSelectedProductId(e.target.value)} value={selectedProductId}
                                    className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary ${isOptionSelected ? "text-black dark:text-white" : ""
                                        }`}> <option value="">Select a product</option>
                                    {Object.keys(productsData).map((productId) => (
                                        <option key={productId} value={productId}>
                                            {/* @ts-ignore */}
                                            {productsData[productId].productName}
                                        </option>
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

                        <button
                            type="button"
                            className="mt-5 inline-flex h-12 items-center justify-center rounded border border-stroke bg-primary py-3 px-6 text-base font-medium text-white transition hover:bg-opacity-90 focus:outline-none"
                            onClick={handleAddFeaturedProduct}
                        >
                            Upload Featured Product
                        </button>
                    </div>
                </form>
            </div>
        </DefaultLayout>
    );
}
