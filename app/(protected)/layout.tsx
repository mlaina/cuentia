
import Sidebar from "@/components/ui/sidebar";
import Header from "@/components/ui/header";

export default function ProtectedLayout({
                                            children,
                                        }: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-y-auto  bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-black">
                <Header />
                {children}
            </main>
        </div>
    )
}
