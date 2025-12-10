
import Link from "next/link";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-slate-200 py-6">
            <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
                <p>© {currentYear} Transport Committee. All rights reserved.</p>
                <p className="mt-1">Technical Partner: Developed by Transport Committee</p>
            </div>
      </footer>
    )
}
