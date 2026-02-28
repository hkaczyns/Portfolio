import { useEffect } from "react";
import { useGetUserQuery } from "../api";
import { useAlert } from "../../../components/Alert/AlertContext";
import { useTranslation } from "react-i18next";
import { handleError } from "../../helpers";
import { useAppSelector } from "../../store";
import { selectIsAuthenticated } from "../selectors";
import { useAppDispatch } from "../../store";
import { clearUserCredentials } from "../slice";

export const useGetUser = () => {
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const {
        isLoading,
        isSuccess,
        isError,
        data: user,
        error,
        refetch,
    } = useGetUserQuery(undefined, {
        skip: !isAuthenticated,
    });
    const { publish } = useAlert();
    const { t } = useTranslation("errors", { keyPrefix: "common" });

    useEffect(() => {
        if (isError && error) {
            if (error && "status" in error && error.status === 401) {
                dispatch(clearUserCredentials());
                return;
            }
            handleError(error, publish, t, "UNKNOWN_ERROR", t);
        }
    }, [isError, error, publish, t, dispatch]);

    return {
        user,
        isLoading,
        isSuccess,
        isError,
        refetch,
    };
};
