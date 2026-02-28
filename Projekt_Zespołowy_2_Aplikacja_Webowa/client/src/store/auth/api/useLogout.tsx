import { useLogoutMutation } from "../api";
import { useNavigate } from "react-router-dom";

export const useLogout = () => {
    const [logoutMutation, { isLoading }] = useLogoutMutation();
    const navigate = useNavigate();

    const logout = async () => {
        await logoutMutation();
        navigate("/login");
    };

    return { logout, isLoading };
};
