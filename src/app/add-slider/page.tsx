"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import firebaseConfig from "@/js/firebaseConfig";
import imgbbAPIKey from "@/js/imgbbConfig";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, push, ref, set } from "firebase/database";
import { useState } from "react";
import Swal from "sweetalert2";

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

const AddSliderProduct = () => {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [productId, setProductId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  // Function to upload image to ImgBB
  const uploadToImgBB = async (file: any) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${imgbbAPIKey}`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error(`ImgBB upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        console.log("ImgBB response:", data);
        return data.data.url;
      } else {
        throw new Error("ImgBB response indicates failure.");
      }
    } catch (error) {
      console.error("Error uploading to ImgBB:", error);
      throw error;
    }
  };

  // Function to handle form submission
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      let url = imageUrl;
      if (file) {
        url = await uploadToImgBB(file);
        console.log("Uploaded image URL:", url);
        setImageUrl(url);
      }

      const newSliderRef = ref(database, "sliders/");
      await push(newSliderRef, {
        title,
        subtitle,
        id: productId,
        image: url, // Ensure this is the updated URL
      });

      Swal.fire("Success!", "Slider uploaded successfully!", "success");
      setTitle("");
      setSubtitle("");
      setProductId("");
      setFile(null);
      setImageUrl("");
    } catch (error) {
      console.error("Failed to upload slider:", error);
      Swal.fire("Error!", "Failed to upload slider", "error");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle file input change
  const handleFileChange = (e: any) => {
    const selectedFile = e.target.files[0];
    console.log("Selected file:", selectedFile);
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Products" />

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
          <h3 className="text-xl font-medium text-black dark:text-white">
            Add A Slider
          </h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6.5">
            <div className="mb-4.5 w-full">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>
            <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
              <div className="w-full xl:w-1/2">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Sub Title
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  required
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              <div className="w-full xl:w-1/2">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Product Id
                </label>
                <input
                  type="number"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  required
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
            </div>

            <div className="mb-4.5">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Images
              </label>
              <input
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleFileChange}
                required
              />
            </div>
            <div className="mb-6">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Preview Image
              </label>
              <div className="flex flex-wrap gap-4">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="h-32 w-32 object-cover"
                  />
                ) : (
                  <p>No image uploaded</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="mt-5 inline-flex h-12 items-center justify-center rounded border border-stroke bg-primary px-6 py-3 text-base font-medium text-white transition hover:bg-opacity-90 focus:outline-none"
            >
              Upload Slider
            </button>
          </div>
        </form>
      </div>
    </DefaultLayout>
  );
};

export default AddSliderProduct;
