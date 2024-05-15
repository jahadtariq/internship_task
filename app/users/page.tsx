"use client";

import { useEffect, useState } from 'react';
import { Client, Databases } from 'appwrite';
import { useAuth } from '@clerk/nextjs';
import type { NextPage } from 'next';
import Link from 'next/link';

const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);

const DATABASE_ID = '6644298300031890517c'
const USER_COLLECTION_ID = '6644298b0031187ebaa5'
const SKILLS_COLLECTION_ID = '66442f78002318a32e0c'

type User = {
  name: string;
  skills: string[];
};

type AppwriteDocument = {
  $id: string;
  name: string;
  skills: string[];
};

const Users: NextPage = () => {
  const { isSignedIn } = useAuth();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID!, USER_COLLECTION_ID!);
        const usersData = (response.documents as AppwriteDocument[]).map((doc) => ({
          name: doc.name,
          skills: doc.skills,
        }));
        setUsers(usersData);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  if (!isSignedIn) {
    return <p>Please sign in to view this page.</p>;
  }

  return (
    <main className='flex flex-col gap-4 px-20 py-10 mx-auto'>
      <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Users and their Skills</h1>
      <ul className="space-y-4">
        {users.map((user, index) => (
          <li key={index} className="p-4 border border-gray-300 rounded-md shadow-sm">
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="mt-2"><span className='font-semibold'>Skills: </span>{user.skills.join(', ')}</p>
          </li>
        ))}
      </ul>
      </div>
      <Link href='/' className='bg-blue-500 rounded-lg px-4 py-6 w-contain max-w-[300px] flex justify-center capitalize text-white font-semibold'>
        Insert new user skills
      </Link>
    </main>
  );
};

export default Users;
