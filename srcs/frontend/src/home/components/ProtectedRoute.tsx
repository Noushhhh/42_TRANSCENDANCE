import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import useTokenExpired from "../tools/hooks/useTokenExpired";
import SkeletonLoader from "../tools/SkeletonLoader";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const MIN_LOADING_TIME = 2000;

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const [tokenExpired, setTokenExpired] = useState<boolean | null | undefined>(null);
    const [showLoader, setShowLoader] = useState(true);
    const checkToken = useTokenExpired();

    useEffect(() => {
        const loadingTimeout = setTimeout(() => setShowLoader(false), MIN_LOADING_TIME);

        // Call checkToken and update tokenExpired state based on its result
        const updateTokenStatus = async () => {
            const expired = await checkToken();
            setTokenExpired(expired);
        };

        updateTokenStatus();

        return () => clearTimeout(loadingTimeout);
    }, [checkToken]);

    if (showLoader || tokenExpired === null) {
        return <SkeletonLoader />;
    }

    if (tokenExpired) {
        return <Navigate to='/signin' />;
    }

    return <>{children}</>;
}

export default ProtectedRoute;
