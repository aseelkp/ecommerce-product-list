import logo from '../assets/logo.svg';

const Navbar = () => {
  return (
    <nav className="flex items-center gap-4 border-b border-[#D1D1D1] p-5">
      <img src={logo} alt="logo" />
      <p className="font-semibold text-gray-500">Monk Upsell & Cross-sell</p>
    </nav>
  );
};

export default Navbar;
