import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/generalStyles.css';
const defaultImage: string  = "/assets/defaultProfileImage.jpg";


interface ProfileSetupPropts {
    email: string;
}

const ProfileSetup: React.FC<ProfileSetupPropts> = ({ email }) => {

    const [userName, setUsername] = useState<string>('');
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const navigate = useNavigate();


    //handle useState for userName
    const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(event.target.value);
    };

    //handle userState for profileImage
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files && event.target.files[0];

        if (file)
            setProfileImage(file);
    };

    const handleSubmit = () => {
        /*         here I would have to to send a request to the backend to check if the username is 
                accepted by the database as it should be unique */
        if (userName.trim() === '')
        {
            alert("Please enter a valid user name");
            return;
        }
        navigate('/home');
    };

    return (
        <div className="container">
            <h1>Pong game</h1>
            <h2> Welcome {email} </h2>
            <input
                type="text"
                placeholder="Choose a username"
                value={userName}
                onChange={handleUsernameChange}
            />
            <input
                type="file"
                onChange={handleImageChange}
            />
            <img className="img"  src={defaultImage} alt="Profile preview" />
            <button onClick={handleSubmit}> Continue </button>
        </div>
    );
};

export default ProfileSetup;