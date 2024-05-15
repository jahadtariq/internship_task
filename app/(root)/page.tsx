"use client";

import { useState, useEffect } from 'react';
import { Client, Databases, ID, Query } from 'appwrite';
import { useAuth } from '@clerk/nextjs';
import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);

const DATABASE_ID = '6644298300031890517c'
const USER_COLLECTION_ID = '6644298b0031187ebaa5'
const SKILLS_COLLECTION_ID = '66442f78002318a32e0c'


export default function Home() {
  const { isSignedIn } = useAuth();
  const [name, setName] = useState('');
  const [skills, setSkills] = useState('');
  const [checkSkill, setCheckSkill] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleSkillsChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSkills(value);

    if (value.length > 1) {
      const response = await databases.listDocuments(DATABASE_ID!, SKILLS_COLLECTION_ID!, [
        Query.search('skill', value),
      ]);
      console.log("response: ",response);
      setSuggestions(response.documents.map((doc) => doc.skill));
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Get the index of the last comma in the skills input value
    const lastCommaIndex = skills.lastIndexOf(',');
  
    // If lastCommaIndex is -1, it means there are no commas in the input value
    // In this case, setSkills directly to the suggestion
    if (lastCommaIndex === -1) {
      setSkills(suggestion);
    } else {
      // Otherwise, append the suggestion after the last comma
      setSkills(
        skills.substring(0, lastCommaIndex + 1) + ' ' + suggestion
      );
    }
  
    // Clear the suggestions list
    setSuggestions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuggestions([]);
    try {
      // Create user document
      const userId = ID.unique();
      await databases.createDocument(
        DATABASE_ID!,
        USER_COLLECTION_ID!,
        ID.unique(),
        {
          name,
          skills: skills.split(',').map(skill => skill.trim()),
        }
      );

      // Insert each skill into the skills collection individually
      const skillPromises = skills.split(',').map(async (skill) => {
        const skillId = ID.unique();

        return await databases.createDocument(
          DATABASE_ID!,
          SKILLS_COLLECTION_ID!,
          ID.unique(),
          {
            skill: skill.trim(),
          }
        );
      });
      await Promise.all(skillPromises);

      setName('');
      setSkills('');
    } catch (error) {
      console.error(error);
    }
  };


  if (!isSignedIn) {
    return <SignIn />;
  }

  console.log(suggestions);

  return (
    <div className="container mx-auto py-10 px-20">
      <h1 className="text-2xl font-bold mb-4">Enter Your Skills</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
            Skills (comma separated)
          </label>
          <input
            type="text"
            id="skills"
            value={skills}
            onChange={handleSkillsChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            required
          />
          {suggestions.length > 0 && (
            <ul className="mt-2 border border-gray-300 rounded-md shadow-sm">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className='flex items-center justify-start gap-4'>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm"
            onClick={handleSubmit}
          >
            Submit
          </button>
          <Link
            href="/users"
            className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm"
          >
            View users and their skills
          </Link>
        </div>
      </form>
    </div>
  );
}
