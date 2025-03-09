import Navbar from "./components/Navbar"
import ProductManagement from "./pages/ProductManagement"


function App() {


  return (
    <div className="max-w-[1440px] mx-auto">
      <Navbar />
      <main className="p-5">
        <ProductManagement />
      </main>
    </div>
  )
}

export default App
