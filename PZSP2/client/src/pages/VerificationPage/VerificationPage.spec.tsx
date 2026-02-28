import { render } from "@testing-library/react";
import { VerificationPage } from "./VerificationPage";
import * as useVerificationPageHook from "./hooks/useVerificationPage";

jest.mock("./hooks/useVerificationPage");

describe("VerificationPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(useVerificationPageHook.useVerificationPage).mockReturnValue({
            isSuccess: false,
            isError: false,
        });
    });

    it("should render spinner", () => {
        const { container } = render(<VerificationPage />);
        const spinner = container.querySelector('[class*="spinner"]');
        expect(spinner).toBeInTheDocument();
    });

    it("should call useVerificationPage hook", () => {
        render(<VerificationPage />);

        expect(useVerificationPageHook.useVerificationPage).toHaveBeenCalledTimes(1);
    });
});
