import React, { useEffect, Dispatch, SetStateAction, useState } from "react"
import User from "./User";
import "../styles/SearchBar.css"
import { useUserIdContext } from "../contexts/userIdContext";
import { getUsernamesBySubstring, getUsernamesInChannelFromSubstring } from "./ChannelUtils";
import { useChannelIdContext } from "../contexts/channelIdContext";

interface SearchBarResultsProps {
    inputValue: string;
    displayResults: boolean;
    showUserMenu: boolean;
    addUserToList: (user: User) => void;
    onlySearchInChannel: boolean;
    listUserAdmin?: {
        user: User;
        isAdmin: boolean;
    }[],
    action?: string;
    updateUserAdminList?: (user: User) => void;
    setSearchBarResults?: Dispatch<SetStateAction<boolean>>;
    fetchDataAdmins?: () => Promise<void>;
    listUsersSearched?: User[] | null;
    setListUsersSearched?: React.Dispatch<React.SetStateAction<User[] | null>>;
}

function SearchBarResults({ inputValue, displayResults, showUserMenu, addUserToList, onlySearchInChannel, listUserAdmin, action, updateUserAdminList, setSearchBarResults, fetchDataAdmins, listUsersSearched, setListUsersSearched }: SearchBarResultsProps) {

    const [error, setError] = useState<string | null>(null);
    
    const userId: number = useUserIdContext();
    const channelId: number = useChannelIdContext();
    
    const displayState = `${displayResults ? "DisplaySearchBarResults" : "HideSearchBarResults"}`;

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                if (setListUsersSearched)
                    setListUsersSearched([]);
                let users: User[] | null;
                if (onlySearchInChannel === true)
                {
                    if (action === "admin" && setSearchBarResults){
                        users = null;
                        setSearchBarResults(true);
                    }
                    else{
                        users = await getUsernamesInChannelFromSubstring(channelId, inputValue, userId);
                    }
                }
                else{
                    users = await getUsernamesBySubstring(userId, inputValue);
                }
                if (!users)
                    setError("error while fetching data");
                if (setListUsersSearched)
                    setListUsersSearched(users);
                setError(null);
            } catch (error){
                setError("error fetching data");
            }
        }
        
        const fetch = async () => {

            if (action === "admin" && setSearchBarResults){
                if (fetchDataAdmins)
                    await fetchDataAdmins();
                setSearchBarResults(true);
            }
            if (inputValue.length > 0){
                try {
                    await fetchUsers();
                } catch (error: any){
                    console.log(error.message);
                }
            }
        }
        fetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, ([inputValue, displayResults, action, channelId]))

    return (
        <div className={`SearchBarResults ${displayState}`}>
            <p style={{ color: "red" }}>
                {error}
            </p>
            <ul className="userListSearched">
                {action === "admin" && listUserAdmin ? (
                    // Si listUserAdmin est présent, afficher les utilisateurs administrateurs
                    listUserAdmin.map((userAdmin, index) => (
                        <li key={index}>
                            <User
                                user={userAdmin.user}
                                showUserMenu={showUserMenu}
                                addUserToList={addUserToList}
                                showAdmin={{ show: true, isAdmin: userAdmin.isAdmin }}
                                updateUserAdminList={updateUserAdminList}
                            />
                        </li>
                    ))
                ) : (
                    // Sinon, afficher les utilisateurs recherchés
                    listUsersSearched ? listUsersSearched.map((user, index) => (
                        <li key={index}>
                            <User
                                user={user}
                                showUserMenu={showUserMenu}
                                addUserToList={addUserToList}
                                showAdmin={{ show: false, isAdmin: false }}
                            />
                        </li>
                    )) : null
                )}
            </ul>
        </div>
    )
}
export default SearchBarResults;
