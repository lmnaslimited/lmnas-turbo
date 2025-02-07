// export default function Header({main,external}:{main:string, external:string})

export default function Header()
 {

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <a href="/" className="text-2xl font-bold">
            LMNAs Cloud
          </a>
          <nav>
            <ul className="flex space-x-4">
              <li>
              {/* <a href={`${main}`} className={`hover:text-primary `}> */}

                <a href="/" className={`hover:text-primary `}>
                  LMNAs
                </a>
              </li>
              <li>
              {/* <a href={`${external}`}className={`hover:text-primary `}> */}

                <a href="/blog" className={`hover:text-primary `}>
                  Blog
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}

// "use client"; // Required for usePathname in App Router

// import { usePathname } from "next/navigation";
// export default function Header({main,external}:{main:string, external:string}){

// // export default function Header() {
//   const pathname = usePathname();

//   return (
//     <header className="border-b">
//       <div className="container mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center py-6">
//           <a href="/site" className="text-2xl font-bold">
//             LMNAs Cloud
//           </a>
//           <nav>
//             <ul className="flex space-x-4">
//               <li>
//                 {pathname.startsWith("/site") ? (
//                   <span className="text-gray-500 cursor-default">Home</span> // Disabled
//                 ) : (
//                   // <a href="/site" className="hover:text-primary text-black">
//                   <a href={`${main}`} className={`hover:text-primary text-black`}>
//                     Home
//                   </a>
//                 )}
//               </li>
//               <li>
//                 {pathname.startsWith("/blog") ? (
//                   <span className="text-gray-500 cursor-default">Blog</span> // Disabled
//                 ) : (
//                   // <a href="/blog" className="hover:text-primary text-black">
//                   <a href={`${ex}`} className={`hover:text-primary text-black`}>

//                     Blog
//                   </a>
//                 )}
//               </li>
//             </ul>
//           </nav>
//         </div>
//       </div>
//     </header>
//   );
// }
