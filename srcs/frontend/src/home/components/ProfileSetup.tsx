import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/generalStyles.css';

// Path to the default profile image
const defaultImage: string = "/assets/defaultProfileImage.jpg";

// Type definition for component props
interface ProfileSetupProps {
    email: string;
}

/**
 * Fetches the default profile image.
 * 
 * This function makes an asynchronous call to fetch the default profile image.
 * Once fetched, it converts the data into a blob, and then into a File object.
 * The resulting File object is returned for further use.
 */
const fetchDefaultImageAsFile = async (): Promise<File> => {
    const response = await fetch(defaultImage);
    const data = await response.blob();
    return new File([data], "defaultImage.jpg", { type: data.type });
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ email }) => {
    // State variables
    const [profileName, setProfileName] = useState<string>('');
    const [profileImage, setProfileImage] = useState<File | null>(null);

    // Navigation helper for route changes
    const navigate = useNavigate();

    // Ref to keep track of the file input DOM element
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Effect hook to set the default profile image on component mount
    useEffect(() => {
        setDefaultImage();
    }, []);

    // Cleanup effect hook to release memory used by the profile image's URL
    useEffect(() => {
        return () => {
            if (profileImage) {
                URL.revokeObjectURL(URL.createObjectURL(profileImage));
            }
        }
    }, [profileImage]);

    /**
     * Sets the default image to the profileImage state.
     * 
     * This function makes a call to fetchDefaultImageAsFile() and then
     * sets the resulting File object to the profileImage state.
     */
    const setDefaultImage = async () => {
        const defaultProfileImage = await fetchDefaultImageAsFile();
        setProfileImage(defaultProfileImage);
    }

    // Handler function to update the profile name state when the input value changes
    const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setProfileName(event.target.value);
    };

    /**
     * Validates and sets the selected image.
     * 
     * This function checks if the selected file is an image and within the size limit.
     * If either check fails, it alerts the user. Otherwise, it sets the selected file
     * to the profileImage state.
     */
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files && event.target.files[0];

        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please upload a valid image file.');
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';  // Clear the file input
                }
                return;
            }

            if (file.size > 15 * 1024 * 1024) {
                alert('Please upload an image smaller than 15MB.');
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';  // Clear the file input
                }
                return;
            }

            setProfileImage(file);
        }
    };

    /**
     * Sends the profile setup data to the server.
     * 
     * On submit, this function validates the profile name and then
     * sends the profile name and image to the server. If the server responds
     * with a success, the user is redirected to the home page.
     */
    const handleSubmit = async () => {
        if (profileName.trim() === '') {
            alert("Please enter a valid user name");
            return;
        }

        const formData = new FormData();
        formData.append('profileImage', profileImage!);
        formData.append('profileName', profileName);

        const response = await fetch('http://localhost:4000/api/user/update', {
            method: 'POST',
            body: formData,
            credentials: 'include',
        });

        const data = await response.json();
        if (data.success) {
            navigate('/home');
        } else {
            alert(data.message);
        }
    };

    return (
        <div className="container">
            <h1>Pong game</h1>
            <h2>Welcome {email}</h2>
            <input
                type="text"
                placeholder="Choose a username"
                value={profileName}
                onChange={handleUsernameChange}
            />
            <input
                ref={fileInputRef}
                type="file"
                onChange={handleImageChange}
            />
            <img className="img" src={profileImage ? URL.createObjectURL(profileImage) : defaultImage} alt="Profile preview" />
            <button onClick={handleSubmit}>Continue</button>
        </div>
    );
};

export default ProfileSetup;