"use client";

import { useState, useRef, useEffect } from "react";
import posthog from 'posthog-js'

interface UserAvatarProps {
  name: string;
  size?: number;
}

export default function UserAvatar({

  size = 40,
}: UserAvatarProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

    

// useEffect(() => {
//   const getUserData = () => {
//     if (!(posthog as any).__loaded) return false;

//     const userName = posthog.get_property("name");
//     const email = posthog.get_property("email");
//     const sessionId = posthog.get_session_id();
// const storedPersonProperties =
//   (posthog as any).persistence?.props?.$stored_person_properties;
//     console.log("user name email session", { userName, email, sessionId, storedPersonProperties });
//     console.log("Email from persistence props:",
//   (posthog as any).persistence?.props?.$stored_person_properties?.email
// );

//     return true;
//   };

//   if (getUserData()) return;

//   const interval = setInterval(() => {
//     if (getUserData()) {
//       clearInterval(interval);
//     }
//   }, 50);

//   return () => clearInterval(interval);
// }, []);


const [email, setEmail] = useState("");

useEffect(() => {
  const handleUserUpdate = () => {
    const person =
      (posthog as any).persistence?.props?.$stored_person_properties;

    setEmail(person?.email ?? "");

    console.log("User updated:", person);
  };

  const initialize = () => {
    handleUserUpdate();

    window.addEventListener(
      "posthog-user-updated",
      handleUserUpdate
    );
  };

  if ((posthog as any).__loaded) {
    initialize();

    return () =>
      window.removeEventListener(
        "posthog-user-updated",
        handleUserUpdate
      );
  }

  const checkLoaded = setInterval(() => {
    if ((posthog as any).__loaded) {
      clearInterval(checkLoaded);

      initialize();
    }
  }, 50);

  return () => {
    clearInterval(checkLoaded);

    window.removeEventListener(
      "posthog-user-updated",
      handleUserUpdate
    );
  };
}, []);
  useEffect(() => {

    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => 
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return email ?(
    
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center rounded-full bg-blue-600 text-white font-semibold"
        style={{
          width: size,
          height: size,
          fontSize: size * 0.4,
        }}
      >
        {email.charAt(0).toUpperCase()}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 min-w-[180px] rounded-lg border bg-white p-3 shadow-lg">
          <p className="font-medium text-gray-900">{email}</p>
        </div>
      )}
    </div>
  ):null
}