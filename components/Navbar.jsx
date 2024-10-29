import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";

const links = [
  { label: "Log in", path: "/login/page" },
  { label: "Services", path: "/services/page" },
];

const Navbar = () => {
  return (
    <nav className="p-4 flex justify-between items-center bg-slate-900">
      <a href="/">
        <div className="relative">
          <img
            src="/logo.svg"
            width="60"
            className="transition-transform duration-200 transform hover:scale-100 hover:cursor-pointer"
            alt="bibaho logo"
          />
        </div>
      </a>

      <div className="flex items-center space-x-4 text-white hover:text-white">
        {links.map((link) => (
          <Link
            key={link.path}
            href={link.path}
            className="text-white hover:text-white transition duration-200"
          >
            {link.label}
          </Link>
        ))}

        <WalletMultiButton className="!bg- hover:!bg-black transition-all duration-200 !rounded-lg" />
      </div>
    </nav>
  );
};

export default Navbar;
