import { useAuthStore } from "@/shared/stores/authStore";

const isConsultantWorkspace = () => {
  const userType = useAuthStore.getState().userType;
  if (userType === "CONSULTANT" || userType === "CONSULTANT360") {
    return true;
  }

  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.location.pathname.startsWith("/consultant/") ||
    window.location.pathname.startsWith("/consultant360/")
  );
};

export const getJobTeamEndpoint = (jobId: string) =>
  isConsultantWorkspace()
    ? `/api/consultant/jobs/${jobId}/team`
    : `/api/jobs/${jobId}/team`;
