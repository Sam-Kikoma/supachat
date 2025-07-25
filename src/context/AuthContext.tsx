import type { User } from "@supabase/supabase-js";
import { createContext, useContext, useState, useEffect } from "react";
import supabase from "../utils/supabase";

export interface AuthContextType {
	user: User | null;
	signInWithGithub: () => void;
	signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			setUser(session?.user ?? null);
		});
		const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
			setUser(session?.user ?? null);
		});
		// Clean up the listener when component unmounts
		return () => {
			listener.subscription?.unsubscribe();
		};
	}, []);
	const signInWithGithub = () => {
		supabase.auth.signInWithOAuth({ provider: "github" });
	};
	const signOut = () => {
		supabase.auth.signOut();
	};
	return <AuthContext.Provider value={{ user, signInWithGithub, signOut }}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within the AuthProvider");
	}
	return context;
};
