import { useContext , useEffect} from "react";
import { AuthContext } from "../auth.context";
import { login , register , logout , getMe } from "../services/auth.api";

export  const useAuth = () => {
    const context = useContext(AuthContext);
    const {user, setUser, loading, setLoading} = context;
    

    const handleLogin = async({email, password}) => {
        setLoading(true);
        try {
            const data = await login({email, password});
            setUser(data.user);
        } catch (error) {
            console.error("Login failed:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleRegister = async({username, email, password}) => {
        setLoading(true);
        try {
            const data = await register({username, email, password});
            setUser(data.user);
        } catch (error) {
            console.error("Registration failed:", error);
        } finally {
            setLoading(false);
        }
    }


    const handleLogout = async () => {
        setLoading(true);
        try {
            await logout();
            setUser(null);
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            setLoading(false);
        }
    }

  useEffect(() => {
 
    const getAndSetUser = async () => {
        try {
            const data = await getMe();
            setUser(data.user);
        } catch (error) {
            // Ignore 401s as they are expected for unauthenticated users
            if (error.response && error.response.status !== 401) {
                console.error("Auth check failed:", error);
            }
        } finally {
            setLoading(false);
        }
    };
    getAndSetUser();
  }, [setLoading, setUser]);


    return { user, loading, handleLogin, handleRegister, handleLogout };
} 