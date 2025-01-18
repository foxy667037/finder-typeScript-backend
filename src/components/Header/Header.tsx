const Header = () => {
  return (
    <header className="w-full h-20 border-b-2 flex justify-center items-center">
        <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
                <img src="" alt="Logo" className="w-8 h-8 md:w-12 md:h-12" />
                <h1 className="text-xl font-bold md:text-4xl lg:text-5xl">Finder</h1>
            </div>
            <nav className="hidden md:flex">
                <ul className="flex space-x-4">
                    <li><a href="" className="text-gray-600 hover:text-gray-900">Home</a></li>
                    <li><a href="" className="text-gray-600 hover:text-gray-900">About</a></li>
                    <li><a href="" className="text-gray-600 hover:text-gray-900">Contact</a></li>
                    <li><a href="" className="text-gray-600 hover:text-gray-900">Faq</a></li>
                </ul>
            </nav>
            <button className="flex justify-center w-24 rounded-sm items-center h-10 bg-gray-200 hover:bg-gray-300">Login</button>
        </div>
    </header>
  )
}
export default Header;