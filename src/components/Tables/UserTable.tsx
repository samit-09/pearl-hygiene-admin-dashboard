"use client"
import { useEffect, useState } from "react";
import { getDatabase, ref, get, remove } from "firebase/database";
import { initializeApp } from "firebase/app";
import firebaseConfig from "@/js/firebaseConfig";
import Link from "next/link";
import Swal from "sweetalert2";
import { getAuth, onAuthStateChanged, deleteUser as deleteAuthUser } from "firebase/auth";
import Loader from "../common/Loader";

// Initialize Firebase app with the provided configuration
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

const UserTable: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
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

        fetchUsers();
    }, []);


    const handleDelete = (username: any, userData: any) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteUser(username, userData);
            } else {
                Swal.fire("Error!", 'Delete Cancelled', "error");
            }
        });
    };

    const deleteUser = async (username: any, userData: any) => {
        if (!userData || !userData.uid) {
            Swal.fire("Error!", 'User data is not available or invalid', "error");
            return;
        }

        try {
            const userRef = ref(database, `admin_users/${username}`);
            await remove(userRef);
            Swal.fire("Success!", 'User deleted successfully', "success");

            setUsers((prevUsers) => prevUsers.filter((user) => user.id !== username));

            if (userData.uid !== auth.currentUser?.uid) {
                 // @ts-ignore
                const userToDelete = await getAuth().getUser(userData.uid);
                await deleteAuthUser(userToDelete);
                Swal.fire('User deleted from Authentication');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            Swal.fire('Failed to delete user. Please try again later.', "error");
        }
    };

    if (loading) {
        return <Loader />;
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    return (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex justify-between px-4 py-6 md:px-6 xl:px-7.5">
                <h4 className="text-xl font-semibold text-black dark:text-white">
                    Administrator
                </h4>
                <div>
                    <Link
                        href="/add-administrator"
                        className="inline-flex items-center justify-center rounded-md bg-primary px-10 py-2 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
                    >
                        Add Administrator
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-6 border-t border-stroke px-4 py-4.5 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
                <div className="col-span-3 flex items-center">
                    <p className="font-medium text-xl">Username</p>
                </div>
                <div className="col-span-2 hidden items-center sm:flex">
                    <p className="font-medium text-xl">Email</p>
                </div>
                <div className="col-span-3 flex items-center">
                    <p className="font-medium text-xl">Action</p>
                </div>
            </div>

            {users.map((user, key) => (
                <div
                    className="grid grid-cols-6 border-t border-stroke px-4 py-4.5 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5"
                    key={key}
                >
                    <div className="col-span-3 flex items-center">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="h-12.5 w-15 rounded-md">
                                <p className="text-lg text-black dark:text-white">{user.id}</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-2 flex items-center">
                        <p className="text-lg text-black dark:text-white">{user.email}</p>
                    </div>
                    <div className="col-span-1 flex items-center">
                        <p className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                            <div className="flex items-center space-x-3.5">
                                <button onClick={() => handleDelete(user.id, user)} className="hover:text-primary">
                                    <svg
                                        className="fill-current"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 18 18"
                                        fill="red"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M13.7535 2.47502H11.5879V1.9969C11.5879 1.15315 10.9129 0.478149 10.0691 0.478149H7.90352C7.05977 0.478149 6.38477 1.15315 6.38477 1.9969V2.47502H4.21914C3.40352 2.47502 2.72852 3.15002 2.72852 3.96565V4.8094C2.72852 5.42815 3.09414 5.9344 3.62852 6.1594L4.07852 15.4688C4.13477 16.6219 5.09102 17.5219 6.24414 17.5219H11.7004C12.8535 17.5219 13.8098 16.6219 13.866 15.4688L14.3441 6.13127C14.8785 5.90627 15.2441 5.3719 15.2441 4.78127V3.93752C15.2441 3.15002 14.5691 2.47502 13.7535 2.47502ZM7.67852 1.9969C7.67852 1.85627 7.79102 1.74377 7.93164 1.74377H10.0973C10.2379 1.74377 10.3504 1.85627 10.3504 1.9969V2.47502H7.70664V1.9969H7.67852ZM4.02227 3.96565C4.02227 3.85315 4.10664 3.74065 4.24727 3.74065H13.7535C13.8941 3.74065 13.9785 3.85315 13.9785 3.96565V4.8094C13.9785 4.9219 13.8941 5.0344 13.7535 5.0344H4.24727C4.10664 5.0344 4.02227 4.9219 4.02227 4.8094V3.96565ZM12.4341 15.4191C12.4191 15.7316 12.166 15.9747 11.8441 15.9747H6.38727C6.07852 15.9747 5.80977 15.7316 5.79477 15.4191L5.34477 6.1594H12.8879L12.4341 15.4191Z"
                                            fill="red"
                                        ></path>
                                        <path
                                            d="M7.21914 14.7937C7.43164 14.7937 7.61914 14.6344 7.63414 14.4219L7.90352 9.7594C7.93164 9.49065 7.73414 9.25315 7.46539 9.22502C7.19727 9.1969 6.95977 9.3944 6.93164 9.66252L6.66227 14.325C6.63414 14.5937 6.83164 14.8313 7.09977 14.8594C7.12852 14.7875 7.17227 14.7937 7.21914 14.7937Z"
                                            fill="red"
                                        ></path>
                                        <path
                                            d="M10.7536 14.4219C10.7691 14.6344 10.9566 14.7937 11.1691 14.7937C11.2159 14.7937 11.2598 14.7875 11.2885 14.775C11.5566 14.7469 11.7536 14.5094 11.7255 14.2413L11.4566 9.57815C11.4285 9.3094 11.191 9.11252 10.9223 9.14065C10.6536 9.16877 10.4566 9.40627 10.4848 9.67502L10.7536 14.4219Z"
                                            fill="red"
                                        ></path>
                                    </svg>
                                </button>
                            </div>
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default UserTable;
