import { useEffect} from "react";
import { hasMessage } from "../Api";

// Constants
const API_CHECK_TOKEN_VALIDITY = 'http://localhost:8081/api/auth/checkTokenValidity';
const FETCH_TIMEOUT = 5000;  // Timeout for the fetch call set to 5 seconds

export const useTokenExpired = ()  => {

    const checkToken = async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

        try {
            const response = await fetch(API_CHECK_TOKEN_VALIDITY, {
                method: 'GET',
                credentials: 'include',
                signal: controller.signal
            });

            clearTimeout(timeoutId);
//            console.log(`passing by useTokenExpired response.ok = ${response.ok}`)
            if (response.ok) {
//                console.log(`passing by if condition true withing checkToken response.ok = ${response.ok}`);
                return false;  //
            }
            else {
//                console.log(`passing by if condition false withing checkToken response.ok = ${response.ok}`);
                return true;   // Return the actual result
            }
//            console.log(`after setting tokenExpired withing checkToken ${tokenExpired}`);
        } catch (error) {
            console.error("Token check error:", hasMessage(error) ? error.message : error);
        }
    };

    useEffect(() => {
        checkToken(); // Initial check on mount or when dependencies change
    }, []); // Dependency array - can be adjusted as needed

    return checkToken;
};

export default useTokenExpired;
