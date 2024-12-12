import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const withAuth = (WrappedComponent) => {
    return (props) => {
        const router = useRouter();
        const [isAuthenticated, setIsAuthenticated] = useState(false);

        useEffect(() => {
            // Check if running on the client side
            if (typeof window !== 'undefined') {
                const token = localStorage.getItem('login_user'); // Replace 'login_user' with your key
                if (!token) {
                    router.push('/'); // Redirect to login if not authenticated
                } else {
                    setIsAuthenticated(true);
                }
            }
        }, [router]);

        // Optionally render a loading spinner until authentication is confirmed
        if (!isAuthenticated) {
            return null; 
        }

        return <WrappedComponent {...props} />;
    };
};

export default withAuth;
