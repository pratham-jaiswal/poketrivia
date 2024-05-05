import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";

const Profile = ({ onUserLoaded }) => {
    const { user, isAuthenticated, isLoading } = useAuth0();
    const account = user?.nickname || null;
    
    useEffect(() => {
        onUserLoaded({ user, account, isAuthenticated, isLoading });
    }, [user, account, isAuthenticated, isLoading, onUserLoaded]);

    return null;
};

export default Profile;