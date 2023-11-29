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

    /*
        d888
       d8888
        888
        888
        888
        888
        888   d8b
      8888888 Y8P
    
    */
    // State to track if the token has expired
    const [tokenExpired, setTokenExpired] = useState<boolean | null | undefined>(null);
    // State to control the visibility of the loading screen
    const [showLoader, setShowLoader] = useState(true);
    // State to check if the client is registered
    const [isClientRegistered, setIsClientRegistered] = useState<boolean | null>(null);

    // Custom hooks for checking token expiration and client registration status
    const checkToken = useTokenExpired();
    const checkIsClientRegistered = useIsClientRegistered();

    // ─────────────────────────────────────────────────────────────────────

    /*
     .d8888b.
    d88P  Y88b
           888
         .d88P
     .od888P"
    d88P"
    888"
    888888888
    
    
    
    */
    // useEffect hook for checking token expiration
    useEffect(() => {
        const updateTokenStatus = async () => {
            const expired = await checkToken();
            console.log(`passing by hook is checkToken var expired: ${expired}`);
            setTokenExpired(expired); // Update the token expiration state
        };

        updateTokenStatus();
    }, [checkToken]); // Dependency array with checkToken to rerun if checkToken changes
    // ─────────────────────────────────────────────────────────────────────────────
    /*
     .d8888b.
    d88P  Y88b
         .d88P
        8888"
         "Y8b.
    888    888
    Y88b  d88P
     "Y8888P"
    
    
    
    */

    // useEffect hook for checking client registration
    useEffect(() => {
        const updateFirstConnectionStatus = async () => {
            const registered = await checkIsClientRegistered();
            setIsClientRegistered(registered); // Update the client registration state
            console.log(`passing by condition hook is client registered ${registered}`);
        };

        updateFirstConnectionStatus();
    }, [isClientRegistered]); // Dependency array with isClientRegistered to rerun if it changes

    // ─────────────────────────────────────────────────────────────────────

    /*
                             d8888
                            d8P888
                           d8P 888
                          d8P  888
                         d88   888
                         8888888888
                               888
                               888
    
    
    
    */
    // useEffect hook to handle the loading screen timeout
    useEffect(() => {
        const loadingTimeout = setTimeout(() => setShowLoader(false), MIN_LOADING_TIME);
        return () => clearTimeout(loadingTimeout); // Cleanup function to clear the timeout
    }, []);

    // ─────────────────────────────────────────────────────────────────────────────
    /*
    888888888
    888
    888
    8888888b.
         "Y88b
           888
    Y88b  d88P
     "Y8888P"
    
    
    
    */

    // Conditional rendering based on the token expiration state
    if (tokenExpired === true) {
        console.log(`passing by condition tokenExpired ${tokenExpired}`);
        return <Navigate to='/signin' />; // Redirect to the sign-in page if the token has expired
    }
    // ─────────────────────────────────────────────────────────────────────
    /*
     .d8888b.
    d88P  Y88b
    888
    888d888b.
    888P "Y88b
    888    888
    Y88b  d88P
     "Y8888P"
    
    
    
    */

    // Conditional rendering based on the client registration state
    else if (isClientRegistered === false) {
        console.log(`passing by condition isClientRegistered ${isClientRegistered}`);
        return <Navigate to='/userprofilesetup' />; // Redirect to the user profile setup if the client is not registered
    }
    // ─────────────────────────────────────────────────────────────────────────────
    /*
    8888888888
          d88P
         d88P
        d88P
     88888888
      d88P
     d88P
    d88P
    
    
    
    */

    // Display the loader while checking token or registration status
    if (showLoader || tokenExpired === null || isClientRegistered === null) {
        return <SkeletonLoader />;
    }
    // ─────────────────────────────────────────────────────────────────────

    /*
     .d8888b.
    d88P  Y88b
    Y88b. d88P
     "Y88888"
    .d8P""Y8b.
    888    888
    Y88b  d88P
     "Y8888P"
    
    
    
    */
    // Render the children components if all conditions are met
    return <>{children}</>;
}

export default ProtectedRoute;
