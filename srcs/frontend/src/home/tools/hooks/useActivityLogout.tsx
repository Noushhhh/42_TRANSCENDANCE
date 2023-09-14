// Importing necessary hooks and components from "react-router-dom".
import { useNavigate } from "react-router-dom";
import { useSignOut } from "./useSignOut";

// Hook to handle automatic logout after a period of inactivity.
const useActivityLogout = () => {

    // Utilize the `useNavigate` hook from react-router to programmatically change routes.
    const navigate = useNavigate();
    const handleSignOut = useSignOut();

    // Variable to store the inactivity timer.
    let inicativityTimer: any;

    // Function to remove the user token and navigate to the signin page.
    const logoutAndNavigate = () => {
        handleSignOut();
        navigate('signin'); // Navigate to signin page.
    };

    // Reset the inactivity timer whenever there's user activity.
    const resetTimer = () => {
        clearTimeout(inicativityTimer); // Clear any existing timers.

        // Set a new timeout for automatic logout after 10 minutes of inactivity.
        inicativityTimer = setTimeout(logoutAndNavigate, 60000);
    };

    // Adding event listeners for various user activities to reset the inactivity timer.

    // Reset timer on page load.
    window.addEventListener('load', resetTimer);

    // Reset timer on mouse movement.
    window.addEventListener('mousemove', resetTimer);

    // Reset timer on key press.
    window.addEventListener('keypress', resetTimer);

    // Cleanup function: Remove the event listeners when the hook is no longer in use.
    return () => {
        window.removeEventListener('load', resetTimer);
        window.removeEventListener('mousemove', resetTimer);
        window.removeEventListener('keypress', resetTimer);
    };
};

// Export the hook for use in other components.
export default useActivityLogout;