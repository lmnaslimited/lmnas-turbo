export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <p>&copy; 2023 LMNAs Cloud Solutions. All rights reserved.</p>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <a href="#" className="hover:text-primary">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Terms of Service
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  )
}

