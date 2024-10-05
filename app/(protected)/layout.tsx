// import Header from '@/components/Header'
// import Sidebar from '@/components/Sidebar'

export default function ProtectedLayout({
                                            children,
                                        }: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen">
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
            {/*<Sidebar />*/}
            {/*<div className="flex flex-col flex-1">*/}
            {/*    <Header />*/}
            {/*    <main className="flex-1 overflow-y-auto p-4">*/}
            {/*        {children}*/}
            {/*    </main>*/}
            {/*</div>*/}
        </div>
    )
}
