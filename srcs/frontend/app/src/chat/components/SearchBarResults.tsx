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

    // const [listUsersSearched, setListUsersSearched] = useState<User[] | null>([]);
    const [error, setError] = useState<string | null>(null);
    
    const userId: number = useUserIdContext();
    const channelId: number = useChannelIdContext();
    
    const displayState = `${displayResults ? "DisplaySearchBarResults" : "HideSearchBarResults"}`;

    useEffect(() => {
        const fetchUsers = async () => {
            console.log("fetch user called\n");
            try {
                if (setListUsersSearched)
                    setListUsersSearched([]);
                let users: User[] | null;
                console.log(`only search in channel == ${onlySearchInChannel}`);
                if (onlySearchInChannel === true)
                {
                    if (action === "admin" && setSearchBarResults){
                        users = null;
                        setSearchBarResults(true);
                    }
                    else{
                        console.log("get new username list");
                        users = await getUsernamesInChannelFromSubstring(channelId, inputValue);
                    }
                }
                else{
                    console.log("search everywhere");
                    users  = await getUsernamesBySubstring(userId, inputValue);
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
        const test = async () => {

            if (action === "admin" && setSearchBarResults){
                console.log(`action ===> ${action}`);
                if (fetchDataAdmins)
                    await fetchDataAdmins();
                console.log("am i here ???");
                setSearchBarResults(true);
                console.log(displayResults);
            }
            if (inputValue.length > 2){
                fetchUsers();
            }
        }
        test();
    }, ([inputValue, displayResults, action]))

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
