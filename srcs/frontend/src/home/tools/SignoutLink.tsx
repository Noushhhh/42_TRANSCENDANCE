// SignOutLink.tsx
import React from 'react';
import { useSignOut } from './hooks/useSignOut';
import '../styles/signOutLink.css';

/**
 * SignOutLink component provides an interactive link for users to sign out.
 * 
 * When the link is clicked, an API call is made to sign out the user.
 * If successful, the user is redirected to the sign-in page.
 * 
 * This component utilizes React Router's `useNavigate` hook to programmatically
 * redirect users upon successful sign out.
 */
const SignOutLink: React.FC = () => {

    const handleSignOut = useSignOut();

    // Rendering the "Sign Out" link. Upon being clicked, it triggers the handleSignOut function.
    return (
        <button onClick={handleSignOut} className='button-as-link' >Sign Out</button>
    );
};

export default SignOutLink;