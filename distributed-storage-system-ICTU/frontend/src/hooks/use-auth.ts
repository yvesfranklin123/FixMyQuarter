import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/use-auth-store"; // À créer ou utiliser via un provider
import { authService } from "@/services/auth.service";

export const useAuth = () => {
  const router = useRouter();
  
  const logout = async () => {
    try {
      authService.logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return {
    logout,
    // Vous pouvez étendre ceci pour inclure l'état de l'utilisateur depuis Zustand
  };
};