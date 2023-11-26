import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import useTokenExpired from "../tools/hooks/useTokenExpired";
import SkeletonLoader from "../tools/SkeletonLoader";
import useIsClientRegistered from "../tools/hooks/useIsClientRegistered";

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
    const checkToken = useTokenExpired();
    const checkIsClientRegistered = useIsClientRegistered();

    // useEffect hook for checking token expiration
    useEffect(() => {
        const updateTokenStatus = async () => {
            const expired = await checkToken();
            console.log(`passing by hook is checkToken var expired: ${expired}`);
            setTokenExpired(expired); // Update the token expiration state
        };

        updateTokenStatus();
    }, [checkToken]); // Dependency array with checkToken to rerun if checkToken changes

    // useEffect hook for checking client registration
    useEffect(() => {
        const updateFirstConnectionStatus = async () => {
            const registered = await checkIsClientRegistered();
            setIsClientRegistered(registered); // Update the client registration state
            console.log(`passing by condition hook is client registered ${registered}`);
        };

        updateFirstConnectionStatus();
    }, [isClientRegistered]); // Dependency array with isClientRegistered to rerun if it changes

    // useEffect hook to handle the loading screen timeout
    useEffect(() => {
        const loadingTimeout = setTimeout(() => setShowLoader(false), MIN_LOADING_TIME);
        return () => clearTimeout(loadingTimeout); // Cleanup function to clear the timeout
    }, []);

    // Conditional rendering based on the token expiration state
    if (tokenExpired === true) {
        console.log(`passing by condition tokenExpired ${tokenExpired}`);
        return <Navigate to='/signin' />; // Redirect to the sign-in page if the token has expired
    }
    // Conditional rendering based on the client registration state
    else if (isClientRegistered === false) {
        console.log(`passing by condition isClientRegistered ${isClientRegistered}`);
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
