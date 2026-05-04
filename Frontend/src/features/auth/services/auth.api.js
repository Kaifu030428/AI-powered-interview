import axios from "axios";


const api = axios.create({
    baseURL: 'http://localhost:8000',
    withCredentials: true
});
export default api; 

export async function register({username, email, password}) {

    try {
      const response  = await  api.post('/api/auth/register', {
            username,
            email,
            password
        })
        return response.data;
        
    } catch (error) {
        console.error("Error registering user:", error);
        throw error;
    }
    
}

export async function login({email, password}) {
    try {
        const response = await api.post('/api/auth/login', {
            email,
            password
        })
        return response.data;
        

    } catch (error) {
        console.error("Error logging in user:", error);
        throw error;
    }
}
console.log(api.defaults.baseURL);

export async function logout() {
    try {
        const response = await api.get('/api/auth/logout')
        return response.data;

    } catch (error) {
        console.error("Error logging out user:", error);
        throw error;
    }
}

export async function getMe(){
    try {
        const response = await api.get('/api/auth/get-me')
        return response.data;

    } catch (error) {
        if (error.response && error.response.status !== 404 && error.response.status !== 401) {
            console.error("Error fetching user data:", error);
        }
        throw error;
    }
}
