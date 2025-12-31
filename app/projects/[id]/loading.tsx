export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                {/* Logo with pulse animation */}
                <div className="relative">
                    <img
                        src="/assets/FAV-ICON-2.png"
                        alt="Adigart Stock"
                        className="h-16 w-16 animate-pulse"
                    />
                </div>

                {/* Loading spinner */}
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="h-2 w-2 rounded-full bg-primary animate-bounce"></div>
                </div>

                <p className="text-sm text-muted-foreground">Chargement...</p>
            </div>
        </div>
    )
}
