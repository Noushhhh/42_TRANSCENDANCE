import { useNavigate } from 'react-router-dom';

export const useSignOut = () => {

    const navigate = useNavigate();

    const handleSignOut = async () => {
        // Using React Router's hook to get the navigate function.
        try {
            const response = await fetch('http://localhost:4000/api/auth/signout', {
                method: 'GET',
                credentials: 'include', // This ensures cookies are sent with the request, important for session-based authentication.
            });

            // If the server responds with a success status, navigate the user to the sign-in page.
            if (response.ok) {
                navigate('/signin');
            } else {
                console.error('Failed to sign out.');
            }
        } catch (error) {
            // Logging any potential errors that might occur during the sign out process.
            console.error('There was an error signing out:', error);
        }
    };
    return handleSignOut;
}