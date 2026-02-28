import { Spinner } from "../../components/Spinner/Spinner";
import { SECONDARY_TEXT_COLOR } from "../../constants/constants";
import { useVerificationPage } from "./hooks/useVerificationPage";

export const VerificationPage = () => {
    useVerificationPage();

    return (
        <div>
            <Spinner size={80} color={SECONDARY_TEXT_COLOR} />
        </div>
    );
};
