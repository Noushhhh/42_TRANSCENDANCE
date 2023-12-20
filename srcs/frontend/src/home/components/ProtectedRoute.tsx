import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import SkeletonLoader from "../tools/SkeletonLoader";
import useIsClientRegistered from "../tools/hooks/useIsClientRegistered";
import { hasMessage, checkToken } from "../tools/Api";

// Interface for the component props
interface ProtectedRouteProps {
    children: React.ReactNode;
}

// Minimum time to display the loader
const MIN_LOADING_TIME = 2000;

// ProtectedRoute functional component
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {

    // State to track if the token has expired
    const [tokenExpired, setTokenExpired] = useState<boolean | null | undefined>(null);
    // State to control the visibility of the loading screen
    const [showLoader, setShowLoader] = useState(true);
    // State to check if the client is registered
    const [isClientRegistered, setIsClientRegistered] = useState<boolean | null>(null);

    // Custom hooks for checking token expiration and client registration status
    const checkIsClientRegistered = useIsClientRegistered();

    // ─────────────────────────────────────────────────────────────────────────────

    // useEffect hook for checking token expiration
    useEffect(() => {
        // Function to update the token expiration status
        const updateTokenStatus = async () => {
            try {
                const expired = await checkToken();
                setTokenExpired(expired); // Update the token expiration state
            } catch (error) {
                console.error(`Error checking token in ProtectedRoute: ${hasMessage(error) ? error.message : ""}`);
            }
        };
        updateTokenStatus();
    }, []); // Dependency array with checkToken to rerun if checkToken changes

    // ─────────────────────────────────────────────────────────────────────────────

    // useEffect hook for checking client registration
    useEffect(() => {

        // Function to update the client registration status
        const updateFirstConnectionStatus = async () => {
            try {
                const registered = await checkIsClientRegistered();
                setIsClientRegistered(registered); // Update the client registration state
            } catch (error) {
                console.error(`Error checking user registration in ProtectedRoute: ${hasMessage(error) ? error.message : ""}`);
            }
        };
        updateFirstConnectionStatus();
    }, [isClientRegistered]); // Dependency array with isClientRegistered to rerun if it changes
    // ─────────────────────────────────────────────────────────────────────────────


    // useEffect hook to handle the loading screen timeout
    useEffect(() => {
        const loadingTimeout = setTimeout(() => setShowLoader(false), MIN_LOADING_TIME);
        return () => clearTimeout(loadingTimeout); // Cleanup function to clear the timeout
    }, []);
// ─────────────────────────────────────────────────────────────────────────────


    // Conditional rendering based on the token expiration state
    if (tokenExpired === true) {
        return <Navigate to='/signin' />; // Redirect to the sign-in page if the token has expired
    }

    // Conditional rendering based on the client registration state
    else if (isClientRegistered === false) {
        return <Navigate to='/userprofilesetup' />; // Redirect to the user profile setup if the client is not registered
    }

    // Display the loader while checking token or registration status
    if (showLoader || tokenExpired === null || isClientRegistered === null) {
        return <SkeletonLoader />;
    }

    // Render the children components if all conditions are met
    return <>{children}</>;
}

export default ProtectedRoute;
