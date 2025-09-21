import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";

const useAuthRedirect = (cleanRoutes: string[]) => {
    const location = useLocation();
    const navigate = useNavigate();
    const isCleanRoute = cleanRoutes.includes(location.pathname);

    useEffect(() => {
        const user = localStorage.getItem("user");
        const isLoggedIn = !!user;

        if (!isLoggedIn && !isCleanRoute) {
            navigate("/login", { replace: true });
        } else if (isLoggedIn && isCleanRoute) {
            navigate("/dashboard", { replace: true });
        }
    }, [location, navigate, isCleanRoute]);

    return { isCleanRoute };
};

export default useAuthRedirect;
