export default function Footer() {
  return <footer className="w-full bg-gray-900 text-white py-6 mt-10">
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-6">
      <span className="text-sm">© 2026 PeerLink</span>
      <ul className="flex flex-wrap space-x-4 text-sm font-medium">
        <a href="https://ritish.site" className="hover:text-red-400 transition">Developed by Ritish Das</a>
        <a href="https://github.com/ritishDas/peerlink">Github</a>
        {/* <li className="hover:text-red-400 transition">Rohit_Sakharkar</li> */}
        {/* <li className="hover:text-red-400 transition">Tanvi</li> */}
        {/* <li className="hover:text-red-400 transition">Yashika</li> */}
        {/* <li className="hover:text-red-400 transition">Rohan</li> */}
        {/* <li className="hover:text-red-400 transition">Rohit_Parsode</li> */}
      </ul>
    </div>
  </footer>
}
