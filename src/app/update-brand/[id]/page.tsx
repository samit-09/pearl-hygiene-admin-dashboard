"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import firebaseConfig from "@/js/firebaseConfig";
import imgbbAPIKey from "@/js/imgbbConfig";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { get, getDatabase, ref, update } from "firebase/database";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

const UpdateBrand = ({ params }: any) => {
    const [brand, setBrand] = useState({});
    const [brandId, setBrandId] = useState("");
    const [brandName, setBrandName] = useState("");
    const [brandDetails, setBrandDetails] = useState("");
    const [brandUrl, setBrandUrl] = useState("");
    const [image, setImage] = useState(null);
    const [imageUrl, setImageUrl] = useState("");
    const router = useRouter();
    const { id } = params;

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            const isLoggedInLocalStorage = localStorage.getItem('isLoggedIn');
            if (!user || isLoggedInLocalStorage !== 'true') {
                router.push('/signin');
            }
        });

        if (id) {
            const modifiedId = id.replace(/%20/g, " "); 
            getBrandById(modifiedId);
        }
    }, [id]);

    const getBrandById = (brandId: any) => {
        const modifiedId = brandId.replace(/%20/g, " "); 
        const brandRef = ref(database, `brands/${modifiedId}`);
        get(brandRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const brandData = snapshot.val();
                    setBrand(brandData);
                    setBrandId(modifiedId);
                    setBrandDetails(brandData.details);
                    setBrandUrl(brandData.url);
                    setImageUrl(brandData.image);
                } else {
                    Swal.fire('Error', `No brand found with ID: ${modifiedId}`, 'error');
                }
            })
            .catch((error) => console.error('Error getting product data:', error));
    };

    const handleFileChange = (e: any) => {
        const file = e.target.files[0];
        if (file && ["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
            setImage(file);
        } else {
            Swal.fire("Error!", "Please select a PNG, JPG, or JPEG image...", "error");
        }
    };

    const uploadImage = async () => {
        const formData = new FormData();
         // @ts-ignore
        formData.append("image", image);
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbAPIKey}`, {
            method: "POST",
            body: formData,
        });
        const data = await response.json();
        return data.data.url;
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        let uploadedImageUrl = imageUrl;

        if (image) {
            uploadedImageUrl = await uploadImage();
            setImageUrl(uploadedImageUrl);
        }

        const updatedBrand = {
            name: brandName,
            details: brandDetails,
            url: brandUrl,
            image: uploadedImageUrl,
        };

        const modifiedId = id.replace(/%20/g, " ");
        const brandsRef = ref(database, `brands/${modifiedId}`);
        update(brandsRef, updatedBrand)
            .then(() => {
                Swal.fire("Success!", "Brand updated successfully", "success");
                router.push('/brands');
            })
            .catch((error) => {
                Swal.fire("Error!", error.message, "error");
            });
    };

    return (
        <DefaultLayout>
            <Breadcrumb pageName="Brands" />
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                    <h3 className="font-medium text-black dark:text-white">
                        Update Brand
                    </h3>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6.5">
                        <div className="mb-4.5">
                            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                                Brand Description
                            </label>
                            <textarea
                                value={brandDetails}
                                onChange={(e) => setBrandDetails(e.target.value)}
                                placeholder="Brand Description"
                                required
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary resize-none h-45"
                            />
                        </div>

                        <div className="mb-4.5">
                            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                                Brand Website URL
                            </label>
                            <input
                                type="text"
                                value={brandUrl}
                                onChange={(e) => setBrandUrl(e.target.value)}
                                placeholder="Brand Website URL"
                                required
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            />
                        </div>

                        <div className="mb-4.5">
                            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                                Images
                            </label>
                            <input type="file" onChange={handleFileChange} />
                        </div>

                        {imageUrl && (
                            <div>
                                <label htmlFor="image">Brand Image</label>
                                <div className="flex gap-2">
                                    <div className="relative">
                                        <img src={imageUrl} alt="brand image" className="w-[200px] object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setImageUrl("")}
                                            className="absolute top-0 right-0 p-1 text-white bg-red-600 rounded-full"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button type="submit" className="mt-5 inline-flex h-12 items-center justify-center rounded border border-stroke bg-primary py-3 px-6 text-base font-medium text-white transition hover:bg-opacity-90 focus:outline-none">
                            Update
                        </button>
                    </div>
                </form>
            </div>
        </DefaultLayout>
    );
};

export default UpdateBrand;
