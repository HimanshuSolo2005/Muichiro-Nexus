'use client'
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs"
import { Button } from "../ui/button"
import { LogOut, User, Mail } from "lucide-react"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";


export function LoginButton() {
    const { isSignedIn, user, isLoaded } = useUser()

    if (!isLoaded) {
        return (
            <Button variant="outline" disabled>
                Loading...
            </Button>
        )
    }

    if (isSignedIn) {
        return (
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm">{user.fullName || user.emailAddresses[0]?.emailAddress}</span>
                </div>
                <SignedIn>
                    <UserButton />
                </SignedIn>
                <SignedOut>
                    <SignInButton />
                </SignedOut>
            </div>
        )
    }
    return (
        <SignInButton mode="modal">
            <Button className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Sign In
            </Button>
        </SignInButton>
    )
}