"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useSendOtp } from "@/lib/api/hooks/use-account";
import { useApiErrorMessage } from "@/lib/api/use-error-toast";

/**
 * Register and password reset both need a code mailed out first. The button
 * sits next to the code field so the order of operations is obvious.
 */
export function OtpRequestButton({
  email,
  type,
}: {
  email: string;
  type: "REGISTER" | "FORGOT_PASSWORD" | "LOGIN" | "DISABLE_2FA";
}) {
  const t = useTranslations("auth");
  const errorMessage = useApiErrorMessage();
  const sendOtp = useSendOtp();

  return (
    <Button
      type="button"
      variant="outline"
      disabled={!email || sendOtp.isPending}
      onClick={async () => {
        try {
          await sendOtp.mutateAsync({ email, type });
          toast.success(t("otpSent"));
        } catch (error) {
          toast.error(errorMessage(error));
        }
      }}
    >
      {t("sendOtp")}
    </Button>
  );
}
