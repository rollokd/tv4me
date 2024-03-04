import Link from "next/link";

function NavBar(props: Readonly<{}>) {
  return (
    <div className="flex flex-row justify-start items-center w-dvh bg-gray-400 gap-10">
      <Link href={"/"} className="text-3xl">
        TV4Me
      </Link>
      <Link href={"/shows"}>My Shows</Link>
      <Link href={"/watch-list"}>To Watch</Link>
      <Link href={"/trending"}>Trending</Link>
      <Link href={"/search"}>Search</Link>
    </div>
  );
}

export default NavBar;
