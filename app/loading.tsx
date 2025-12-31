export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-6">
                {/* Logo with enhanced animation */}
                <div className="relative">
                    {/* Glow effect */}
                    <div className="absolute inset-0 animate-ping opacity-20">
                        <img
                            src="/assets/FAV-ICON-2.png"
                            alt=""
                            className="h-20 w-20"
                        />
                    </div>
                    {/* Main logo */}
                    <img
                        src="/assets/FAV-ICON-2.png"
                        alt="Adigart Stock"
                        className="h-20 w-20 animate-pulse"
                    />
                </div>

                {/* App name */}
                <h1 className="text-xl font-semibold text-foreground">
                    Adigart Stock
                </h1>

                {/* Loading spinner */}
                <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="h-2.5 w-2.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="h-2.5 w-2.5 rounded-full bg-primary animate-bounce"></div>
                </div>

                {/* Loading bar */}
                <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary animate-loading-bar rounded-full"></div>
                </div>

                <p className="text-sm text-muted-foreground animate-pulse">
                    Loading...
                </p>
            </div>
        </div>
    )
}
