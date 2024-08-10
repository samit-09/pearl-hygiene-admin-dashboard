"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import firebaseConfig from "@/js/firebaseConfig";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get } from "firebase/database";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, updateProfile } from "firebase/auth";

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

const AddUser = () => {
    const router = useRouter()
    useEffect(() => {
        onAuthStateChanged(auth, (user: any) => {
            const isLoggedInLocalStorage = localStorage.getItem('isLoggedIn');
            if (!user || isLoggedInLocalStorage !== 'true') {
                window.location.href = '/signin';
            }
        });
    }, []);


    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const addUserForm = e.target;
        const username = addUserForm['username'].value;
        const password = addUserForm['password'].value;
        const email = addUserForm['email'].value;

        try {
            // Create user with email and password
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, { displayName: username });

            // Add user to the database
            await set(ref(database, 'admin_users/' + username), {
                uid: user.uid,
                displayName: username,
                email: email,
                password: password,
            });

            addUserForm.reset();
            Swal.fire("Success!", "User added successfully", "success");
            router.push("/administrator")
        } catch (error: any) {
            // Show error message
            console.error(error);
            Swal.fire("Error!", error.message, "error");
        }
    };

    return (
        <DefaultLayout>
            <Breadcrumb pageName="Add Administrator" />
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                    <h3 className="font-medium text-black dark:text-white text-2xl">
                        Add Administrator
                    </h3>
                </div>
                <form id="addUserForm" onSubmit={handleSubmit}>
                    <div className="p-6.5">
                        <div className="mb-4.5">
                            <label className="mb-3 block text-lg font-medium text-black dark:text-white">
                                Username
                            </label>
                            <input
                                type="text" name="username" placeholder="Username" required
                                className="text-lg w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            />
                        </div>
                        <div className="mb-4.5">
                            <label className="mb-3 block text-lg font-medium text-black dark:text-white">
                                Email
                            </label>
                            <input
                                type="email" name="email" placeholder="Email" required
                                className="text-lg w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            />
                        </div>
                        <div className="mb-4.5">
                            <label className="mb-3 block text-lg font-medium text-black dark:text-white">
                                Password
                            </label>
                            <input
                                type="password" name="password" placeholder="Password" required
                                className="text-lg w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            />
                        </div>

                        <button type="submit" className="mt-5 inline-flex h-12 items-center justify-center rounded border border-stroke bg-primary py-3 px-6 text-base font-medium text-white transition hover:bg-opacity-90 focus:outline-none">
                            Add
                        </button>
                    </div>
                </form>
            </div>
        </DefaultLayout>
    );
};

export default AddUser;
