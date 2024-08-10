"use client";

import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";
import firebaseConfig from "@/js/firebaseConfig";
import Image from "next/image";
import logo from "../../../public/images/logo/logo.png"

// Initialize Firebase app with the provided configuration
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

const SignIn: React.FC = () => {
    const [loginError, setLoginError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const username = (form.username as HTMLInputElement).value;
        const password = (form.password as HTMLInputElement).value;

        try {
            // Check the Firebase Realtime Database for user credentials
            const usersRef = ref(database, 'admin_users');
            const snapshot = await get(usersRef);
            const usersData = snapshot.val();

            console.log('Fetched users data:', usersData);

            if (usersData) {

                if (usersData && usersData[username] && usersData[username].password == password) {
                    // Sign in with Firebase Authentication
                    try {
                        const email = usersData[username].email;
                        const userCredential = await signInWithEmailAndPassword(auth, email, password);

                        console.log(userCredential);

                        if (userCredential) {
                            // Store login state and user data in local storage
                            localStorage.setItem('isLoggedIn', 'true');
                            localStorage.setItem('currentUser', JSON.stringify({ username: username, password: usersData[username]["password"] }));

                            // Redirect to the dashboard after a delay
                            setTimeout(() => {
                                router.push('/');
                            }, 1200);
                        }

                        localStorage.setItem('isLoggedIn', 'true');
                        localStorage.setItem('currentUser', JSON.stringify({ username, password }));


                    } catch (authError) {
                        console.error('Error signing in:', authError);
                        setLoginError("Login failed. Please check your email and password.");
                    }
                } else {
                    console.log("Invalid password.");
                    setLoginError("Invalid username or password.");
                }

            } else {
                console.log("No user data found.");
                setLoginError("Login failed. Please check your username and password.");
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            setLoginError("Login failed. Please try again later.");
        }
    };


    return (
        <div className="lg:mt-14 mt-6 lg:w-1/3 bg-white my-auto mx-auto border-stroke dark:border-strokedark">
            <div className="mx-auto items-center w-full p-4 sm:p-12.5 xl:p-17.5">
                <div className="h-20 w-20 mb-5 mx-auto rounded-full">
                    <Image
                        width={250}
                        height={250}
                        src={logo}
                        style={{
                            margin: "auto",
                        }}
                        alt="logo"
                    />
                </div>
                <h2 className="mb-9 text-center text-2xl font-bold text-black dark:text-white">
                    Sign In to Pearl Hygiene

                </h2>
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="mb-2.5 block font-medium text-black dark:text-white">
                            Username
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                name="username"
                                placeholder="Enter your username"
                                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="mb-2.5 block font-medium text-black dark:text-white">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter your Password"
                                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-5">
                        <input
                            type="submit"
                            value="Sign In"
                            className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 font-medium text-white transition hover:bg-opacity-90"
                        />
                    </div>

                    {loginError && (
                        <p className="mb-4 text-red-500">{loginError}</p>
                    )}
                </form>
            </div>
        </div>

    );
};

export default SignIn;
