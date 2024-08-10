"use client";
import React, { useEffect, useState } from "react";
import CardDataStats from "../CardDataStats";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { initializeApp } from "firebase/app";
import firebaseConfig from "@/js/firebaseConfig";
import { get, getDatabase, ref } from "firebase/database";
import { Product } from "@/types/product";
import Link from "next/link";

// Initialize Firebase app with the provided configuration
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const Dashboard: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      const isLoggedInLocalStorage = localStorage.getItem('isLoggedIn');
      if (!user || isLoggedInLocalStorage !== 'true') {
        window.location.href = '/signin';
      }
    });

    const fetchUsers = async () => {
      try {
        const usersRef = ref(database, 'admin_users');
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
          const usersArray = Object.entries(snapshot.val()).map(([id, data]) => ({
            id,
             // @ts-ignore
            ...data,
          }));
          setUsers(usersArray as any[]);
        } else {
          setError("No Users found.");
        }
      } catch (error) {
        setError("Failed to fetch users. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    const fetchProducts = async () => {
      try {
        const productsRef = ref(database, 'products');
        const snapshot = await get(productsRef);
        if (snapshot.exists()) {
          const productsArray = Object.entries(snapshot.val()).map(([id, data]) => ({
            id,
             // @ts-ignore
            ...data,
          }));
          console.log(productsArray)
          setProducts(productsArray as Product[]);
        } else {
          setError("No products found.");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to fetch products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    const fetchFeaturedProducts = async () => {
      try {
        const productsRef = ref(database, 'featuredProducts');
        const snapshot = await get(productsRef);
        if (snapshot.exists()) {
          const productsArray = Object.entries(snapshot.val()).map(([id, data]) => ({
            id,
             // @ts-ignore
            ...data,
          }));
          console.log(productsArray)
          setFeaturedProducts(productsArray as Product[]);
        } else {
          setError("No products found.");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to fetch products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    const fetchBrands = async () => {
      try {
        const brandsRef = ref(database, 'brands');
        const snapshot = await get(brandsRef);
        console.log(snapshot)
        if (snapshot.exists()) {
          const brandsArray = Object.entries(snapshot.val()).map(([id, data]) => ({
            id,
             // @ts-ignore
            ...data,
          }));
          setBrands(brandsArray as any[]);
        } else {
          setError("No brands found.");
        }
      } catch (error) {
        console.error("Error fetching brands:", error);
        setError("Failed to fetch brands. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    const fetchSectors = async () => {
      try {
        const sectorsRef = ref(database, 'cleaning-sectors');
        const snapshot = await get(sectorsRef);
        if (snapshot.exists()) {
          const sectorsArray = Object.entries(snapshot.val()).map(([id, data]) => ({
            id,
             // @ts-ignore
            ...data,
          }));
          console.log(sectorsArray)
          setSectors(sectorsArray as any[]);
        } else {
          setError("No sectors found.");
        }
      } catch (error) {
        console.error("Error fetching sectors:", error);
        setError("Failed to fetch sectors. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const snapshot = await get(ref(database, "categories"));
        const categoriesData = snapshot.val() || {};

        const categoriesArray = Object.entries(categoriesData).map(([key, value]) => ({
          id: key,
          //@ts-ignore
          ...value,
        }));
        
        //@ts-ignore
        setCategories(categoriesArray);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
    fetchSectors();
    fetchBrands();

    fetchFeaturedProducts();
    fetchProducts();
    fetchUsers();
  }, []);
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        
        <Link href="/products">

        <CardDataStats title="Total Products" total={products?.length} rate="">
          <svg
            className="fill-primary dark:fill-white"
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21.1063 18.0469L19.3875 3.23126C19.2157 1.71876 17.9438 0.584381 16.3969 0.584381H5.56878C4.05628 0.584381 2.78441 1.71876 2.57816 3.23126L0.859406 18.0469C0.756281 18.9063 1.03128 19.7313 1.61566 20.3844C2.20003 21.0375 2.99066 21.3813 3.85003 21.3813H18.1157C18.975 21.3813 19.8 21.0031 20.35 20.3844C20.9 19.7656 21.2094 18.9063 21.1063 18.0469ZM19.2157 19.3531C18.9407 19.6625 18.5625 19.8344 18.15 19.8344H3.85003C3.43753 19.8344 3.05941 19.6625 2.78441 19.3531C2.50941 19.0438 2.37191 18.6313 2.44066 18.2188L4.12503 3.43751C4.19378 2.71563 4.81253 2.16563 5.56878 2.16563H16.4313C17.1532 2.16563 17.7719 2.71563 17.875 3.43751L19.5938 18.2531C19.6282 18.6656 19.4907 19.0438 19.2157 19.3531Z"
              fill=""
            />
            <path
              d="M14.3345 5.29375C13.922 5.39688 13.647 5.80938 13.7501 6.22188C13.7845 6.42813 13.8189 6.63438 13.8189 6.80625C13.8189 8.35313 12.547 9.625 11.0001 9.625C9.45327 9.625 8.1814 8.35313 8.1814 6.80625C8.1814 6.6 8.21577 6.42813 8.25015 6.22188C8.35327 5.80938 8.07827 5.39688 7.66577 5.29375C7.25327 5.19063 6.84077 5.46563 6.73765 5.87813C6.6689 6.1875 6.63452 6.49688 6.63452 6.80625C6.63452 9.2125 8.5939 11.1719 11.0001 11.1719C13.4064 11.1719 15.3658 9.2125 15.3658 6.80625C15.3658 6.49688 15.3314 6.1875 15.2626 5.87813C15.1595 5.46563 14.747 5.225 14.3345 5.29375Z"
              fill=""
            />
          </svg>
        </CardDataStats>
        </Link>


<Link href="/featured-products">
<CardDataStats title="Total Featured Products" total={featuredProducts?.length} rate="">
        <svg className="dark:fill-white dark:stroke-white" width="18px" height="18px" viewBox="0 0 32 32" enable-background="new 0 0 32 32" id="Editable-line" version="1.1"  xmlns="http://www.w3.org/2000/svg" fill="#581412"><g  id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" ></g><g id="SVGRepo_iconCarrier"><path className="dark:fill-white dark:stroke-white" d=" M16.842,3.548l3.29,6.984c0.137,0.29,0.401,0.491,0.707,0.538l7.357,1.12c0.77,0.117,1.077,1.108,0.52,1.677l-5.324,5.436 c-0.221,0.226-0.322,0.551-0.27,0.87l1.257,7.676c0.131,0.803-0.673,1.416-1.362,1.036l-6.58-3.624c-0.273-0.151-0.6-0.151-0.873,0 l-6.58,3.624c-0.688,0.379-1.493-0.233-1.362-1.036l1.257-7.676c0.052-0.319-0.049-0.644-0.27-0.87l-5.324-5.436 c-0.557-0.569-0.25-1.56,0.52-1.677l7.357-1.12c0.306-0.047,0.57-0.248,0.707-0.538l3.29-6.984 C15.503,2.817,16.497,2.817,16.842,3.548z" fill="none" id="XMLID_16_" stroke="#581412" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2"></path></g></svg>
        </CardDataStats>
</Link>


<Link href='/brands'>
<CardDataStats title="Total Brands" total={brands?.length} rate="">
          <svg className="dark:fill-white" fill="#581412" width="18px" height="18px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M4.815,7.8H9.6a1.8,1.8,0,0,1,0,3.6H4.814a1.8,1.8,0,0,1,0-3.6Zm2.993-3a1.8,1.8,0,0,0,1.8,1.8h1.8V4.8a1.8,1.8,0,1,0-3.594,0Zm11.377,3a1.8,1.8,0,0,0-1.8,1.8v1.8h1.8a1.8,1.8,0,0,0,0-3.6ZM16.192,9.6V4.8a1.8,1.8,0,1,0-3.593,0V9.6a1.8,1.8,0,1,0,3.593,0Zm4.79,4.8a1.8,1.8,0,0,0-1.8-1.8H14.4a1.8,1.8,0,0,0,0,3.6h4.79A1.8,1.8,0,0,0,20.982,14.4Zm-8.384,3v1.8a1.8,1.8,0,1,0,1.8-1.8Zm-4.79-3v4.8a1.8,1.8,0,1,0,3.593,0V14.4a1.8,1.8,0,1,0-3.593,0Zm-4.79,0a1.8,1.8,0,1,0,3.593,0V12.6h-1.8A1.8,1.8,0,0,0,3.018,14.4Z"></path></g></svg>
        </CardDataStats>
</Link>

<Link href="/categories">

<CardDataStats title="Total Categories" total={categories?.length} rate="">
        <svg className="dark:fill-white" width="18px" height="18px" viewBox="0 0 24.00 24.00" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#581412"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path className="dark:fill-white dark:stroke-white" d="M3 6C3 4.34315 4.34315 3 6 3H7C8.65685 3 10 4.34315 10 6V7C10 8.65685 8.65685 10 7 10H6C4.34315 10 3 8.65685 3 7V6Z" stroke="#581412" stroke-width="2"></path><path className="dark:fill-white dark:stroke-white" d="M14 6C14 4.34315 15.3431 3 17 3H18C19.6569 3 21 4.34315 21 6V7C21 8.65685 19.6569 10 18 10H17C15.3431 10 14 8.65685 14 7V6Z" stroke="#581412" stroke-width="2"></path> <path className="dark:fill-white dark:stroke-white" d="M14 17C14 15.3431 15.3431 14 17 14H18C19.6569 14 21 15.3431 21 17V18C21 19.6569 19.6569 21 18 21H17C15.3431 21 14 19.6569 14 18V17Z" stroke="#581412" stroke-width="2"></path> <path className="dark:fill-white dark:stroke-white" d="M3 17C3 15.3431 4.34315 14 6 14H7C8.65685 14 10 15.3431 10 17V18C10 19.6569 8.65685 21 7 21H6C4.34315 21 3 19.6569 3 18V17Z" stroke="#581412" stroke-width="2"></path> </g></svg>
        </CardDataStats>
</Link>

<Link href="/cleaning-sectors">

<CardDataStats title="Total Cleaning Sectors" total={sectors?.length} rate="">
         <svg className="dark:fill-white" fill="#581412" width="18px" height="18px" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title></title> <g id="garbage_cleaning_properly"> <path d="M462.08,71.69H420.34a19.2,19.2,0,0,0-19.16,19.2v97.63H327.09c-2.66-1.76-5.4-3.43-8.19-5V90.89a19.2,19.2,0,0,0-19.16-19.2H258a19.2,19.2,0,0,0-19.16,19.2v77.43a129.14,129.14,0,0,0-26.93,6.6A69.16,69.16,0,0,0,198.83,142l-43-58.36v-22h13.62a7,7,0,0,0,7-7v-27A19.35,19.35,0,0,0,157.11,8.3H89.32A19.35,19.35,0,0,0,70,27.63v27a7,7,0,0,0,7,7H89.37V85.71l-42.29,56a70.14,70.14,0,0,0-14.09,42V462.93a39.93,39.93,0,0,0,39.88,39.88h99.69a39.93,39.93,0,0,0,39.88-39.88V418.47a128.23,128.23,0,0,0,26.4,6.42V470.5a32.3,32.3,0,0,0,32.21,32.31H449a32.29,32.29,0,0,0,32.2-32.31V90.89A19.19,19.19,0,0,0,462.08,71.69Zm-61,130.83a15.78,15.78,0,0,1-15.62,14H357.56a130.11,130.11,0,0,0-12.79-14Zm-29.64,94.09A115.42,115.42,0,1,1,256,181.19,115.55,115.55,0,0,1,371.42,296.61Zm-118.58-186h30a7,7,0,0,0,0-14h-30V90.89a5.19,5.19,0,0,1,5.16-5.2h41.74a5.19,5.19,0,0,1,5.16,5.2v85.9a128.62,128.62,0,0,0-48.9-9.6c-1.06,0-2.11,0-3.16,0ZM84,47.65v-20a5.33,5.33,0,0,1,5.33-5.33h67.79a5.33,5.33,0,0,1,5.33,5.33v20H84Zm57.83,14V75.1H103.37V61.65Zm56.62,401.28a25.91,25.91,0,0,1-25.88,25.88H167.5l9.65-16.14a7,7,0,0,0-12-7.19l-14,23.33h-19.6V469.07a7,7,0,0,0-14,0v19.74H98L84,465.48a7,7,0,1,0-12,7.19l9.65,16.14h-8.8A25.91,25.91,0,0,1,47,462.93V349.54h62.56a7,7,0,1,0,0-14H47V281.9h62.56a7,7,0,1,0,0-14H47V183.76a56.11,56.11,0,0,1,11.26-33.6L104.36,89.1h38.11l45.09,61.18a55.32,55.32,0,0,1,10.81,30.47,129.38,129.38,0,0,0,.07,231.75ZM449,488.81h-178a18.26,18.26,0,0,1-18.15-17.13H467.17A18.25,18.25,0,0,1,449,488.81Zm18.2-31.13H252.84V426c1,0,2.1,0,3.16,0A129.37,129.37,0,0,0,367.21,230.48h18.23a29.82,29.82,0,0,0,29.74-29.83v-90h30a7,7,0,1,0,0-14h-30V90.89a5.19,5.19,0,0,1,5.16-5.2h41.74a5.18,5.18,0,0,1,5.15,5.2Z"></path> <path d="M235.92,230.2v44.28h-21.4a16.21,16.21,0,0,0-16.12,14.39l-2.14,19h0l-1.35,12c-.83,7.39-4.48,14.64-10.84,21.57a12.7,12.7,0,0,0,9.33,21.3h107a18,18,0,0,0,18-19.32l-2.56-35.12h0l-1.36-18.74a16.27,16.27,0,0,0-16.17-15H277.21V230.2a20.65,20.65,0,1,0-41.29,0Zm69.46,114.11a5,5,0,0,1-5,5.38h-9.31l-1.24-14.82a6.5,6.5,0,0,0-13,1.09L278,349.69H260.61V335.42a6.5,6.5,0,1,0-13,0v14.27H230.2L231.36,336a6.5,6.5,0,0,0-13-1.09l-1.24,14.82H194.1c8-8.86,12.6-18.41,13.73-28.41l.7-6.2,94.73.13Zm-7.12-56.83a3.22,3.22,0,0,1,3.2,3l.86,11.75L210,302.09l1.32-11.76a3.21,3.21,0,0,1,3.2-2.85ZM248.92,230.2a7.65,7.65,0,1,1,15.29,0v42.13H248.92Z"></path> </g> </g></svg>
        </CardDataStats>
        </Link>


<Link href="/administrator">

<CardDataStats title="Total Users" total={users?.length} rate="">
          <svg
            className="fill-primary dark:fill-white"
            width="22"
            height="18"
            viewBox="0 0 22 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.18418 8.03751C9.31543 8.03751 11.0686 6.35313 11.0686 4.25626C11.0686 2.15938 9.31543 0.475006 7.18418 0.475006C5.05293 0.475006 3.2998 2.15938 3.2998 4.25626C3.2998 6.35313 5.05293 8.03751 7.18418 8.03751ZM7.18418 2.05626C8.45605 2.05626 9.52168 3.05313 9.52168 4.29063C9.52168 5.52813 8.49043 6.52501 7.18418 6.52501C5.87793 6.52501 4.84668 5.52813 4.84668 4.29063C4.84668 3.05313 5.9123 2.05626 7.18418 2.05626Z"
              fill=""
            />
            <path
              d="M15.8124 9.6875C17.6687 9.6875 19.1468 8.24375 19.1468 6.42188C19.1468 4.6 17.6343 3.15625 15.8124 3.15625C13.9905 3.15625 12.478 4.6 12.478 6.42188C12.478 8.24375 13.9905 9.6875 15.8124 9.6875ZM15.8124 4.7375C16.8093 4.7375 17.5999 5.49375 17.5999 6.45625C17.5999 7.41875 16.8093 8.175 15.8124 8.175C14.8155 8.175 14.0249 7.41875 14.0249 6.45625C14.0249 5.49375 14.8155 4.7375 15.8124 4.7375Z"
              fill=""
            />
            <path
              d="M15.9843 10.0313H15.6749C14.6437 10.0313 13.6468 10.3406 12.7874 10.8563C11.8593 9.61876 10.3812 8.79376 8.73115 8.79376H5.67178C2.85303 8.82814 0.618652 11.0625 0.618652 13.8469V16.3219C0.618652 16.975 1.13428 17.4906 1.7874 17.4906H20.2468C20.8999 17.4906 21.4499 16.9406 21.4499 16.2875V15.4625C21.4155 12.4719 18.9749 10.0313 15.9843 10.0313ZM2.16553 15.9438V13.8469C2.16553 11.9219 3.74678 10.3406 5.67178 10.3406H8.73115C10.6562 10.3406 12.2374 11.9219 12.2374 13.8469V15.9438H2.16553V15.9438ZM19.8687 15.9438H13.7499V13.8469C13.7499 13.2969 13.6468 12.7469 13.4749 12.2313C14.0937 11.7844 14.8499 11.5781 15.6405 11.5781H15.9499C18.0812 11.5781 19.8343 13.3313 19.8343 15.4625V15.9438H19.8687Z"
              fill=""
            />
          </svg>
        </CardDataStats>
        </Link>

      </div>
    </>
  );
};

export default Dashboard;
