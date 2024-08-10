"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import firebaseConfig from "@/js/firebaseConfig";
import imgbbAPIKey from "@/js/imgbbConfig";
import { Editor } from "@tinymce/tinymce-react";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { get, getDatabase, ref, set } from "firebase/database";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

const AddProduct = () => {
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productCode, setProductCode] = useState("");
  const [productBrand, setProductBrand] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productSubCategory, setProductSubCategory] = useState("");
  const [cleaningSector, setCleaningSector] = useState("");
  const [specifications, setSpecifications] = useState([]);
  const [primaryIndex, setPrimaryIndex] = useState(0);
  const [files, setFiles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cleaningSectors, setCleaningSectors] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      const isLoggedInLocalStorage = localStorage.getItem("isLoggedIn");
      if (!user || isLoggedInLocalStorage !== "true") {
        window.location.href = "/signin";
      }
    });

    const fetchBrands = async () => {
      const brandsRef = ref(database, "brands");
      const snapshot = await get(brandsRef);
      const brandsData = snapshot.val();
      if (brandsData) {
        // @ts-ignore
        setBrands(Object.keys(brandsData));
      }
    };

    const fetchCleaningSectors = async () => {
      const sectorsRef = ref(database, "cleaning-sectors");
      const snapshot = await get(sectorsRef);
      const sectorsData = snapshot.val();
      if (sectorsData) {
        // @ts-ignore
        const sectorsArray = Object.entries(snapshot.val()).map(
          ([id, data]) => ({
            id,
            // @ts-ignore
            ...data,
          }),
        );

        // @ts-ignore
        setCleaningSectors(sectorsArray);
      }
    };

    const fetchCategories = async () => {
      const categoriesRef = ref(database, "categories");
      const snapshot = await get(categoriesRef);
      const categoriesData = snapshot.val();
      console.log(categoriesData);
      if (categoriesData) {
        setCategories(Object.values(categoriesData));
      }
    };

    fetchBrands();
    fetchCategories();
    fetchCleaningSectors();
  }, []);

  const handleFiles = (files: any) => {
    if (files.length > 0) {
      const imageFiles = Array.from(files);
      // @ts-ignore
      setFiles(imageFiles);

      const previewImages = imageFiles.map((file, index) => (
        <div key={index} className="">
          {/* @ts-ignore */}
          <img
            src={URL.createObjectURL(file)}
            alt="Product Image"
            width="300px"
          />
          <div>
            <input
              type="checkbox"
              id={`select-${index}`}
              name={`select-${index}`}
              value={`select-${index}`}
              onChange={() => setPrimaryIndex(index)}
            />
            <label htmlFor={`select-${index}`}>Primary Image</label>
          </div>
        </div>
      ));
      // @ts-ignore
      document.getElementById("imgPreviewDiv").innerHTML = previewImages;
    }
  };

  const uploadToImgBB = async (file: any) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${imgbbAPIKey}`,
      {
        method: "POST",
        body: formData,
      },
    );

    const data = await response.json();
    return data.data.url;
  };

  const uploadImage = async () => {
    if (files.length > 0) {
      setLoading(true);
      // @ts-ignore
      const imageUrls = [];

      const imageFiles = [...files];
      [imageFiles[0], imageFiles[primaryIndex]] = [
        imageFiles[primaryIndex],
        imageFiles[0],
      ];

      await Promise.all(
        imageFiles.map(async (file) => {
          try {
            const url = await uploadToImgBB(file);
            imageUrls.push(url);
          } catch (error) {
            Swal.fire(
              "Error!",
              "Failed to upload image. Please try again later.",
              "error",
            );
            throw error;
          }
        }),
      );
      // @ts-ignore
      uploadToDatabase(imageUrls);
    } else {
      Swal.fire("Error!", "Please Select an image file", "error");
    }
  };

  const uploadToDatabase = async (imageUrls: any) => {
    const productsRef = ref(database, "products");
    const snapshot = await get(productsRef);
    const productsData = snapshot.val();

    let nextId = 1;
    if (productsData) {
      const ids = Object.keys(productsData).map((key) => parseInt(key, 10));
      nextId = Math.max(...ids) + 1;
    }

    const newProductRef = ref(database, `products/${nextId}`);
    const productData = {
      productName,
      productCategory,
      productSubCategory,
      productDescription,
      productCode,
      productBrand,
      images: imageUrls,
      specifications,
      productCleaningSector: cleaningSector,
    };

    set(newProductRef, productData)
      .then(() => {
        Swal.fire( "Success!", "Product uploaded successfully!", "success");
        setLoading(false);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      })
      .catch((error) => {
        Swal.fire(
          "Error!",
          "Failed to upload product. Please try again later.",
        );
        setLoading(false);
      });
  };

  const addSpecification = () => {
    // @ts-ignore
    const field = document.getElementById("specification_field").value;
    // @ts-ignore
    const value = document.getElementById("specification_value").value;

    if (field && value) {
      // @ts-ignore
      setSpecifications([...specifications, { field, value }]);
      // @ts-ignore
      document.getElementById("specification_field").value = "";
      // @ts-ignore
      document.getElementById("specification_value").value = "";
    } else {
      Swal.fire(
        "Error!",
        "Please enter both specification field and value...",
        "error",
      );
    }
  };
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Products" />

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            Upload Product
          </h3>
        </div>
        <form action="#">
          <div className="p-6.5">
            <div className="mb-4.5 w-full">
              <label className="mb-3 block text-md font-medium text-black dark:text-white">
                Product Name
              </label>
              <input
                type="text"
                id="product_name"
                placeholder="Product Name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>
            <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
              <div className="w-full xl:w-1/2">
                <label className="mb-3 block text-md font-medium text-black dark:text-white">
                  Product Code
                </label>
                <input
                  type="text"
                  id="product_code"
                  placeholder="Product Code"
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                  name="product_code"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              <div className="w-full xl:w-1/2">
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Brand
                  </label>

                  <div className="relative z-20 bg-transparent dark:bg-form-input">
                    <select
                      id="product_brand"
                      value={productBrand}
                      onChange={(e) => setProductBrand(e.target.value)}
                      className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary ${
                        isOptionSelected ? "text-black dark:text-white" : ""
                      }`}
                    >
                      <option
                        value=""
                        disabled
                        className="text-body dark:text-bodydark"
                      >
                        Select Brand
                      </option>
                      {brands.map((brand, index) => (
                        <option key={index} value={brand}>
                          {brand}
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
              </div>
            </div>

            <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
              <div className="w-full xl:w-1/2">
                <label className="mb-3 block text-md font-medium text-black dark:text-white">
                  Product Category
                </label>
                <div className="relative z-20 bg-transparent dark:bg-form-input">
                  <select
                    value={productCategory}
                    onChange={(e) => {
                      const selectedCategory = e.target.value;
                      setProductCategory(e.target.value);

                      const category = categories.find(
                        // @ts-ignore
                        (category) => category?.name === selectedCategory,
                      );

                      if (category) {
                        // @ts-ignore
                        setSubCategories(category?.subCategories || []);
                      } else {
                        setSubCategories([]);
                      }
                    }}
                    className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary ${
                      isOptionSelected ? "text-black dark:text-white" : ""
                    }`}
                  >
                    <option
                      value=""
                      disabled
                      className="text-body dark:text-bodydark"
                    >
                      Select Category
                    </option>
                    {Array.isArray(categories) && categories.length > 0 ? (
                      categories.map((category, index) => (
                        // @ts-ignore
                        <option
                          key={index}
                          value={
                            typeof category === "string"
                              ? category
                              : // @ts-ignore
                                category.name
                          }
                        >
                          {/* @ts-ignore */}
                          {typeof category === "string"
                            ? category
                            : // @ts-ignore
                              category.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>No category</option>
                    )}
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

              <div className="w-full xl:w-1/2">
                <label className="mb-3 block text-md font-medium text-black dark:text-white">
                  Sub-Category
                </label>
                <div className="relative z-20 bg-transparent dark:bg-form-input">
                  <select
                    value={productSubCategory}
                    onChange={(e) => setProductSubCategory(e.target.value)}
                    className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary`}
                  >
                    <option value="" disabled>
                      Select Sub-Category
                    </option>
                    {subCategories.length > 0 ? (
                      subCategories.map((subCategory, index) => (
                        <option key={index} value={subCategory}>
                          {subCategory}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        None
                      </option>
                    )}
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

            <div className="mb-4.5">
              <label className="mb-3 block text-md font-medium text-black dark:text-white">
                Cleaning Sector
              </label>

              <select
                id="cleaning_sector"
                value={cleaningSector}
                onChange={(e) => setCleaningSector(e.target.value)}
                className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary ${
                  isOptionSelected ? "text-black dark:text-white" : ""
                }`}
              >
                <option
                  value=""
                  disabled
                  className="text-black dark:text-bodydark"
                >
                  Select Cleaning Sector
                </option>
                {cleaningSectors.map((sector, index) => (
                  <option
                    key={index}
                    value={sector.id}
                    className="text-black dark:text-bodydark"
                  >
                    {sector.id}
                  </option>
                ))}
              </select>

              <span className="z-300 absolute right-16">
                <svg
                  className="fill-current"
                  width="24"
                  height="30"
                  viewBox="0 0 24 10"
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

            <div className="mb-4.5">
              <label className="mb-3 block text-md font-medium text-black dark:text-white">
                Product Description
              </label>
              <Editor
                apiKey="t8kmg7e4rwudb6di86xfy9jiwwuf7sncd7gl7gms1ct6cj1k" // Replace with your TinyMCE API key
                value={productDescription}
                onEditorChange={(content) => setProductDescription(content)}
                init={{
                  height: 500,
                  plugins: [
                    "anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks linkchecker",
                  ],
                  toolbar:
                    "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat",
                }}
              />
            </div>

            <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
              <div className="w-full xl:w-1/2">
                <label className="mb-3 block text-md font-medium text-black dark:text-white">
                  Specifications
                </label>
                <input
                  type="text"
                  id="specification_field"
                  placeholder="Voltage"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              <div className="w-full xl:w-1/2">
                <label className="mb-3 block text-md font-medium text-black dark:text-white">
                  Specifications
                </label>
                <input
                  type="text"
                  id="specification_value"
                  placeholder="220-240 V"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={addSpecification}
              className="my-3 inline-flex h-12 items-center justify-center rounded border border-stroke bg-primary px-6 py-3 text-base font-medium text-white transition hover:bg-opacity-90 focus:outline-none"
            >
              Add Specification
            </button>
            <div className="my-5">
              {specifications.map((spec, index) => (
                <div key={index} className="">
                  {/* @ts-ignore */}
                  <p className="text-xl">
                    {spec.field}: {spec.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mb-4.5">
              <label className="mb-3 block text-md font-medium text-black dark:text-white">
                Images
              </label>

              <div
                id="FileUpload"
                className="relative mb-5.5 block w-full cursor-pointer appearance-none rounded border border-dashed border-primary bg-gray px-4 py-4 dark:bg-meta-4 sm:py-7.5"
              >
                <input
                  type="file"
                  id="product_images"
                  multiple
                  onChange={(e) => handleFiles(e.target.files)}
                  className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
                />
                <div className="flex flex-col items-center justify-center space-y-3">
                  <span className="mb-10 flex h-30 w-30 items-center justify-center rounded-full border border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
                    <svg
                      width="54"
                      height="54"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M1.99967 9.33337C2.36786 9.33337 2.66634 9.63185 2.66634 10V12.6667C2.66634 12.8435 2.73658 13.0131 2.8616 13.1381C2.98663 13.2631 3.1562 13.3334 3.33301 13.3334H12.6663C12.8431 13.3334 13.0127 13.2631 13.1377 13.1381C13.2628 13.0131 13.333 12.8435 13.333 12.6667V10C13.333 9.63185 13.6315 9.33337 13.9997 9.33337C14.3679 9.33337 14.6663 9.63185 14.6663 10V12.6667C14.6663 13.1971 14.4556 13.7058 14.0806 14.0809C13.7055 14.456 13.1968 14.6667 12.6663 14.6667H3.33301C2.80257 14.6667 2.29387 14.456 1.91879 14.0809C1.54372 13.7058 1.33301 13.1971 1.33301 12.6667V10C1.33301 9.63185 1.63148 9.33337 1.99967 9.33337Z"
                        fill="#581412"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M7.5286 1.52864C7.78894 1.26829 8.21106 1.26829 8.4714 1.52864L11.8047 4.86197C12.0651 5.12232 12.0651 5.54443 11.8047 5.80478C11.5444 6.06513 11.1223 6.06513 10.8619 5.80478L8 2.94285L5.13807 5.80478C4.87772 6.06513 4.45561 6.06513 4.19526 5.80478C3.93491 5.54443 3.93491 5.12232 4.19526 4.86197L7.5286 1.52864Z"
                        fill="#581412"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M7.99967 1.33337C8.36786 1.33337 8.66634 1.63185 8.66634 2.00004V10C8.66634 10.3682 8.36786 10.6667 7.99967 10.6667C7.63148 10.6667 7.33301 10.3682 7.33301 10V2.00004C7.33301 1.63185 7.63148 1.33337 7.99967 1.33337Z"
                        fill="#581412"
                      />
                    </svg>
                  </span>
                  <p>
                    <span className="text-primary">Drag and drop </span>
                    images here or <span className="text-primary">
                      click
                    </span>{" "}
                    to select images
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="mb-3 block text-md font-medium text-black dark:text-white">
                Select Primary Image
              </label>
              <div className="flex flex-wrap gap-4">
                {files.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`preview ${index}`}
                      className={`h-24 w-24 rounded border-2 object-cover ${
                        index === primaryIndex
                          ? "border-primary"
                          : "border-transparent"
                      }`}
                      onClick={() => setPrimaryIndex(index)}
                    />
                    {index === primaryIndex && (
                      <div className="absolute right-0 top-0 rounded-bl bg-primary px-2 py-1 text-xs text-white">
                        Primary
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="mt-5 inline-flex h-12 items-center justify-center rounded border border-stroke bg-primary px-6 py-3 text-base font-medium text-white transition hover:bg-opacity-90 focus:outline-none"
              onClick={uploadImage}
            >
              Upload Product
            </button>
          </div>
        </form>
      </div>
    </DefaultLayout>
  );
};

export default AddProduct;
